require('dotenv').config({ override: true });

const express = require('express');
const cors = require('cors');
const { getDb, saveDb } = require('./db');
const { extractFeatures } = require('./features');
const { calculateBaseline, MIN_SESSIONS } = require('./baseline');
const { calculateDeviation } = require('./deviation');
const { generateInsight } = require('./insight');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── Helpers ────────────────────────────────────────────
function getSupportLevel(db, user_id) {
  const rows = db.exec('SELECT support_level FROM preferences WHERE user_id = ?', [user_id]);
  if (rows.length > 0 && rows[0].values.length > 0) {
    return rows[0].values[0][0];
  }
  return 1; // default to "just awareness"
}

function isOnboardingComplete(db, user_id) {
  const rows = db.exec('SELECT onboarding_complete FROM preferences WHERE user_id = ?', [user_id]);
  if (rows.length > 0 && rows[0].values.length > 0) {
    return rows[0].values[0][0] === 1;
  }
  return false;
}

// ─── Health ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'Bhaav' });
});

// ─── GET /preferences/:user_id ──────────────────────────
app.get('/preferences/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const db = await getDb();

    const rows = db.exec(
      'SELECT support_level, onboarding_complete FROM preferences WHERE user_id = ?',
      [user_id]
    );

    if (rows.length === 0 || rows[0].values.length === 0) {
      return res.json({ support_level: 1, onboarding_complete: false });
    }

    return res.json({
      support_level: rows[0].values[0][0],
      onboarding_complete: rows[0].values[0][1] === 1,
    });
  } catch (err) {
    console.error('GET /preferences error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PUT /preferences/:user_id ──────────────────────────
app.put('/preferences/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { support_level, onboarding_complete } = req.body;

    if (support_level != null && (support_level < 1 || support_level > 4)) {
      return res.status(400).json({ error: 'support_level must be 1, 2, 3, or 4' });
    }

    const db = await getDb();

    const existing = db.exec('SELECT id FROM preferences WHERE user_id = ?', [user_id]);
    if (existing.length > 0 && existing[0].values.length > 0) {
      // Update
      if (support_level != null) {
        db.run('UPDATE preferences SET support_level = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', [support_level, user_id]);
      }
      if (onboarding_complete != null) {
        db.run('UPDATE preferences SET onboarding_complete = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', [onboarding_complete ? 1 : 0, user_id]);
      }
    } else {
      // Insert
      db.run(
        'INSERT INTO preferences (user_id, support_level, onboarding_complete) VALUES (?, ?, ?)',
        [user_id, support_level || 1, onboarding_complete ? 1 : 0]
      );
    }

    saveDb();
    return res.json({ success: true });
  } catch (err) {
    console.error('PUT /preferences error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /session ─────────────────────────────────────
app.post('/session', async (req, res) => {
  try {
    const { user_id, session_id, start_ts, end_ts, keystroke_events } = req.body;

    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ error: 'user_id is required and must be a string' });
    }
    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ error: 'session_id is required and must be a string' });
    }
    if (start_ts == null || typeof start_ts !== 'number') {
      return res.status(400).json({ error: 'start_ts is required and must be a number (epoch ms)' });
    }
    if (end_ts == null || typeof end_ts !== 'number') {
      return res.status(400).json({ error: 'end_ts is required and must be a number (epoch ms)' });
    }
    if (!Array.isArray(keystroke_events)) {
      return res.status(400).json({ error: 'keystroke_events must be an array' });
    }
    if (keystroke_events.length < 2) {
      return res.status(400).json({ error: 'keystroke_events must contain at least 2 events' });
    }

    for (let i = 0; i < keystroke_events.length; i++) {
      const event = keystroke_events[i];
      if (!event.key_type || typeof event.key_type !== 'string') {
        return res.status(400).json({ error: `keystroke_events[${i}].key_type is required` });
      }
      if (event.timestamp == null || typeof event.timestamp !== 'number') {
        return res.status(400).json({ error: `keystroke_events[${i}].timestamp is required` });
      }
    }

    const db = await getDb();

    const existing = db.exec('SELECT session_id FROM sessions WHERE session_id = ?', [session_id]);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return res.status(409).json({ error: 'Session with this session_id already exists' });
    }

    db.run(
      'INSERT INTO sessions (user_id, session_id, start_ts, end_ts, keystroke_events) VALUES (?, ?, ?, ?, ?)',
      [user_id, session_id, start_ts, end_ts, JSON.stringify(keystroke_events)]
    );

    const features = extractFeatures(keystroke_events);

    db.run(
      'INSERT INTO features (session_id, user_id, avg_inter_keystroke_interval, pause_frequency, backspace_rate, words_per_minute, typing_speed_variance) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [session_id, user_id, features.avg_inter_keystroke_interval, features.pause_frequency, features.backspace_rate, features.words_per_minute, features.typing_speed_variance]
    );

    saveDb();

    // Get support level for gating
    const supportLevel = getSupportLevel(db, user_id);

    let baselineAvailable = false;
    let deviation = null;

    const featureRows = db.exec(
      'SELECT avg_inter_keystroke_interval, pause_frequency, backspace_rate, words_per_minute, typing_speed_variance FROM features WHERE user_id = ?',
      [user_id]
    );

    if (featureRows.length > 0 && featureRows[0].values.length >= MIN_SESSIONS) {
      baselineAvailable = true;
      const rows = featureRows[0].values.map((row) => ({
        avg_inter_keystroke_interval: row[0],
        pause_frequency: row[1],
        backspace_rate: row[2],
        words_per_minute: row[3],
        typing_speed_variance: row[4],
      }));
      const baseline = calculateBaseline(rows);
      if (baseline) {
        deviation = calculateDeviation(features, baseline);
      }
    }

    // GATED: Micro-intervention only if support_level >= 2
    let showMicroIntervention = false;
    if (supportLevel >= 2 && deviation && deviation.combined_score > 2.0) {
      const dismissed = db.exec(
        `SELECT id FROM dismissals WHERE user_id = ? AND type = 'micro_intervention' AND dismissed_at > datetime('now', '-1 hour')`,
        [user_id]
      );
      const notDismissed = dismissed.length === 0 || dismissed[0].values.length === 0;
      if (notDismissed) {
        showMicroIntervention = true;
      }
    }

    // GATED: Reach-out only if support_level >= 3
    let showReachOut = false;
    let contact = null;
    if (supportLevel >= 3 && baselineAvailable) {
      const reachOutResult = checkConsecutiveHighDeviation(db, user_id);
      if (reachOutResult >= 3) {
        const contactRows = db.exec('SELECT contact_name, contact_value, contact_type FROM contacts WHERE user_id = ?', [user_id]);
        if (contactRows.length > 0 && contactRows[0].values.length > 0) {
          contact = {
            name: contactRows[0].values[0][0],
            value: contactRows[0].values[0][1],
            type: contactRows[0].values[0][2],
          };
          const dismissed = db.exec(
            `SELECT id FROM dismissals WHERE user_id = ? AND type = 'reach_out' AND dismissed_at > datetime('now', '-24 hours')`,
            [user_id]
          );
          const notDismissed = dismissed.length === 0 || dismissed[0].values.length === 0;
          if (notDismissed) {
            showReachOut = true;
          }
        }
      }
    }

    return res.status(201).json({
      success: true,
      session_id,
      features,
      baseline_available: baselineAvailable,
      support_level: supportLevel,
      ...(deviation && { deviation }),
      micro_intervention: showMicroIntervention,
      reach_out: showReachOut,
      ...(contact && { contact }),
    });
  } catch (err) {
    console.error('POST /session error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /sessions/:user_id ─────────────────────────────
app.get('/sessions/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const db = await getDb();

    const result = db.exec(
      `SELECT s.session_id, s.start_ts, s.end_ts,
             f.avg_inter_keystroke_interval, f.pause_frequency,
             f.backspace_rate, f.words_per_minute, f.typing_speed_variance
       FROM sessions s
       JOIN features f ON s.session_id = f.session_id
       WHERE s.user_id = ?
       ORDER BY s.start_ts ASC`,
      [user_id]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return res.json({ sessions: [] });
    }

    const sessions = result[0].values.map((row) => ({
      session_id: row[0],
      start_ts: row[1],
      end_ts: row[2],
      features: {
        avg_inter_keystroke_interval: row[3],
        pause_frequency: row[4],
        backspace_rate: row[5],
        words_per_minute: row[6],
        typing_speed_variance: row[7],
      },
    }));

    return res.json({ sessions });
  } catch (err) {
    console.error('GET /sessions error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /insight/:user_id ──────────────────────────────
app.get('/insight/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const db = await getDb();

    const supportLevel = getSupportLevel(db, user_id);

    const featureRows = db.exec(
      'SELECT avg_inter_keystroke_interval, pause_frequency, backspace_rate, words_per_minute, typing_speed_variance FROM features WHERE user_id = ?',
      [user_id]
    );

    if (featureRows.length === 0 || featureRows[0].values.length < MIN_SESSIONS) {
      return res.status(400).json({
        error: `Not enough sessions to establish a personal baseline. At least ${MIN_SESSIONS} sessions are required.`,
        sessions_found: featureRows.length > 0 ? featureRows[0].values.length : 0,
      });
    }

    const rows = featureRows[0].values.map((row) => ({
      avg_inter_keystroke_interval: row[0],
      pause_frequency: row[1],
      backspace_rate: row[2],
      words_per_minute: row[3],
      typing_speed_variance: row[4],
    }));

    const baseline = calculateBaseline(rows);
    const currentFeatures = rows[rows.length - 1];
    const deviation = calculateDeviation(currentFeatures, baseline);

    const metrics = { baseline, recent: currentFeatures };

    // Get previous suggestion for follow-up (only relevant if support_level >= 2)
    let previousSuggestion = null;
    if (supportLevel >= 2) {
      const prevRows = db.exec(
        'SELECT observation, suggestion, followup_check, created_at, checked_at FROM suggestions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [user_id]
      );
      if (prevRows.length > 0 && prevRows[0].values.length > 0) {
        previousSuggestion = {
          observation: prevRows[0].values[0][0],
          suggestion: prevRows[0].values[0][1],
          followup_check: prevRows[0].values[0][2],
          created_at: prevRows[0].values[0][3],
          checked_at: prevRows[0].values[0][4],
        };
      }
    }

    // Generate insight
    const result = await generateInsight(metrics, deviation, previousSuggestion);

    // GATED: Only store suggestion if support_level >= 2
    if (supportLevel >= 2) {
      db.run(
        'INSERT INTO suggestions (user_id, observation, suggestion, followup_check) VALUES (?, ?, ?, ?)',
        [user_id, result.observation, result.suggestion, result.followup_check]
      );

      if (previousSuggestion) {
        db.run(
          'UPDATE suggestions SET checked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND checked_at IS NULL',
          [user_id]
        );
      }
    }

    saveDb();

    // GATED: Strip suggestion/followup if support_level < 2
    const response = {
      user_id,
      observation: result.observation,
      support_level: supportLevel,
      metrics: result.metrics,
      deviation: result.deviation,
    };

    if (supportLevel >= 2) {
      response.suggestion = result.suggestion;
      response.followup_check = result.followup_check;
    }

    return res.json(response);
  } catch (err) {
    console.error('GET /insight error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /contact ──────────────────────────────────────
app.post('/contact', async (req, res) => {
  try {
    const { user_id, contact_name, contact_value, contact_type } = req.body;

    if (!user_id || !contact_name || !contact_value) {
      return res.status(400).json({ error: 'user_id, contact_name, and contact_value are required' });
    }

    const db = await getDb();

    const existing = db.exec('SELECT id FROM contacts WHERE user_id = ?', [user_id]);
    if (existing.length > 0 && existing[0].values.length > 0) {
      db.run(
        'UPDATE contacts SET contact_name = ?, contact_value = ?, contact_type = ? WHERE user_id = ?',
        [contact_name, contact_value, contact_type || 'phone', user_id]
      );
    } else {
      db.run(
        'INSERT INTO contacts (user_id, contact_name, contact_value, contact_type) VALUES (?, ?, ?, ?)',
        [user_id, contact_name, contact_value, contact_type || 'phone']
      );
    }

    saveDb();
    return res.json({ success: true });
  } catch (err) {
    console.error('POST /contact error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /contact/:user_id ──────────────────────────────
app.get('/contact/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const db = await getDb();

    const result = db.exec(
      'SELECT contact_name, contact_value, contact_type FROM contacts WHERE user_id = ?',
      [user_id]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return res.json({ contact: null });
    }

    return res.json({
      contact: {
        name: result[0].values[0][0],
        value: result[0].values[0][1],
        type: result[0].values[0][2],
      },
    });
  } catch (err) {
    console.error('GET /contact error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /dismiss ──────────────────────────────────────
app.post('/dismiss', async (req, res) => {
  try {
    const { user_id, type } = req.body;

    if (!user_id || !type) {
      return res.status(400).json({ error: 'user_id and type are required' });
    }

    const db = await getDb();
    db.run(
      'INSERT INTO dismissals (user_id, type) VALUES (?, ?)',
      [user_id, type]
    );
    saveDb();

    return res.json({ success: true });
  } catch (err) {
    console.error('POST /dismiss error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /chat ─────────────────────────────────────────
app.post('/chat', async (req, res) => {
  try {
    const { user_id, messages } = req.body;

    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ error: 'user_id is required' });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const Anthropic = require('@anthropic-ai/sdk');
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return res.json({ reply: generateCompanionFallback(messages) });
    }

    const client = new Anthropic({ apiKey });

    const COMPANION_PROMPT = `You are a warm, reflective companion inside a wellbeing app called Bhaav. You are NOT a therapist, counselor, or medical professional, and must never imply otherwise.

When someone shares how they're feeling:
- Reflect back what they said in your own words first, before anything else — show you understood, don't jump to advice
- Use gentle, open questions in the style of real reflective-listening and CBT techniques (e.g. 'What's the evidence for and against that thought?' or 'Is there a kinder way to look at this?') — never diagnose, never label their state with a clinical term
- Never claim to know what's wrong with them or offer a diagnosis
- Keep responses short — 2-4 sentences, this is a conversation, not a lecture
- If the person expresses thoughts of self-harm, suicide, or being in crisis, STOP the reflective conversation immediately and respond only with warmth plus these resources, without trying to counsel them yourself: 'iCall: 9152987821, Vandrevala Foundation: 1860-2662-345, or KIRAN: 1800-599-0019. You don't have to go through this alone — please reach out to one of these right now.'
- For anything beyond everyday stress, gently suggest a real counselor or doctor — never position yourself as sufficient on its own

Remember: You are a companion, not a therapist.`;

    const conversationMessages = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      system: COMPANION_PROMPT,
      messages: conversationMessages,
    });

    const reply = response.content[0]?.text || 'I hear you. Could you tell me more about that?';

    return res.json({ reply });
  } catch (err) {
    console.error('POST /chat error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

function generateCompanionFallback(messages) {
  const last = messages[messages.length - 1]?.content?.toLowerCase() || '';

  const crisisWords = ['suicide', 'kill myself', 'end my life', 'self harm', 'hurt myself', 'want to die', 'no reason to live', 'cant go on'];
  if (crisisWords.some((w) => last.includes(w))) {
    return "I hear you, and I'm really glad you told me. You don't have to go through this alone — please reach out to one of these right now: iCall: 9152987821, Vandrevala Foundation: 1860-2662-345, or KIRAN: 1800-599-0019.";
  }

  if (last.includes('stressed') || last.includes('overwhelmed')) {
    return 'It sounds like things have been feeling really heavy right now. What feels like the biggest weight at the moment?';
  }
  if (last.includes('sad') || last.includes('unhappy') || last.includes('down')) {
    return "I hear that you're feeling low. That takes courage to say. What do you think has been contributing to that feeling?";
  }
  if (last.includes('anxious') || last.includes('worried') || last.includes('nervous')) {
    return 'It sounds like worry has been on your mind a lot. What does the anxiety feel like when it shows up?';
  }
  if (last.includes('lonely') || last.includes('alone')) {
    return 'Feeling disconnected from others can be really hard. When was the last time you felt genuinely seen by someone?';
  }
  if (last.includes('tired') || last.includes('exhausted') || last.includes('burnout')) {
    return 'You sound like you have been running on empty. What would it feel like to give yourself permission to rest without guilt?';
  }

  const defaults = [
    "Thank you for sharing that with me. Can you tell me more about what that feels like for you?\n\nRemember, I'm a companion — not a therapist. If this feels like something bigger, talking to a real person who cares about you might help.",
    "I appreciate you being open. What do you think is at the heart of what you're feeling?\n\nAnd just so you know — if this ever feels like more than everyday stress, talking to a counselor or someone you trust is always a good step.",
    "That sounds like a lot to sit with. What would you tell a friend who was feeling the same way?\n\nI'm here to listen, but I'm not a professional — if things feel heavy, reaching out to someone real can make a real difference.",
  ];

  return defaults[Math.floor(Math.random() * defaults.length)];
}

// ─── Helper: Check consecutive high deviation ───────────
function checkConsecutiveHighDeviation(db, user_id) {
  const result = db.exec(
    `SELECT f.words_per_minute, f.pause_frequency, f.backspace_rate,
            f.avg_inter_keystroke_interval, f.typing_speed_variance
     FROM features f
     JOIN sessions s ON f.session_id = s.session_id
     WHERE f.user_id = ?
     ORDER BY s.start_ts DESC
     LIMIT 10`,
    [user_id]
  );

  if (result.length === 0 || result[0].values.length < MIN_SESSIONS) return 0;

  const allRows = result[0].values.map((row) => ({
    avg_inter_keystroke_interval: row[0],
    pause_frequency: row[1],
    backspace_rate: row[2],
    words_per_minute: row[3],
    typing_speed_variance: row[4],
  }));

  let consecutiveCount = 0;

  for (let i = 1; i < allRows.length; i++) {
    const historicalRows = allRows.slice(i);
    if (historicalRows.length < MIN_SESSIONS) break;

    const baseline = calculateBaseline(historicalRows);
    if (!baseline) break;

    const deviation = calculateDeviation(allRows[i - 1], baseline);
    if (deviation && deviation.combined_score > 2.0) {
      consecutiveCount++;
    } else {
      break;
    }
  }

  return consecutiveCount;
}

// ─── Start ─────────────────────────────────────────────
async function start() {
  await getDb();
  console.log('Database initialized');

  app.listen(PORT, () => {
    console.log(`Bhaav server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
