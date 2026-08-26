/**
 * AI Insight module.
 * Uses Anthropic Claude to generate non-clinical, gentle observations
 * about a user's typing pattern changes.
 *
 * Returns structured JSON: { observation, suggestion, followup_check }
 *
 * SAFETY: Never sends user's written content. Only behavioral metrics.
 */



const SYSTEM_PROMPT = `You are a gentle, non-clinical writing-pattern observer for a wellbeing app called Bhaav.

You will be given typing metrics for the past 7 days vs the user's own baseline.

You may also receive a PREVIOUS SUGGESTION that was made last week, and this week's metrics to compare against it.

Respond with ONLY valid JSON — no markdown, no code fences, no extra text. The JSON must have exactly these three keys:

{
  "observation": "A 2-3 sentence plain-language observation about the user's typing pattern this week. Never use clinical language. Describe the pattern, not a judgment. Vary your opening — don't always start with 'Your typing this week...'. Use natural, warm language.",
  "suggestion": "ONE small, specific, testable suggestion tied to the ACTUAL detected pattern. Not generic advice like 'take a break'. Example: if pauses spike, suggest trying to write for 10 minutes without backspacing. If speed drops, suggest writing about something that excites them. Make it actionable and concrete.",
  "followup_check": "A short sentence describing what to look for next week to see if the suggestion helped. Example: 'Next week, notice if your writing felt a little easier to start.'"
}

If a previous suggestion was provided and this week's data is available, incorporate a gentle follow-up reference into the observation (e.g. 'Last time we explored X — this week feels...').

Never claim that typing behavior proves or diagnoses an emotional or mental-health condition.
Never use words like depression, anxiety, stressed, mentally ill, sad, or clinical.
If deviation is high, gently suggest talking to someone they trust, without alarming phrasing.`;

/**
 * Format metrics into a user message for the AI.
 */
function formatUserMessage(metrics, deviation, previousSuggestion) {
  const lines = [];

  if (metrics.baseline) {
    lines.push('--- Baseline (your normal pattern) ---');
    if (metrics.baseline.words_per_minute) {
      lines.push(`Baseline WPM: ${metrics.baseline.words_per_minute.mean.toFixed(1)}`);
    }
    if (metrics.baseline.pause_frequency) {
      lines.push(`Baseline pause rate: ${metrics.baseline.pause_frequency.mean.toFixed(3)}`);
    }
    if (metrics.baseline.backspace_rate) {
      lines.push(`Baseline backspace rate: ${metrics.baseline.backspace_rate.mean.toFixed(3)}`);
    }
    if (metrics.baseline.avg_inter_keystroke_interval) {
      lines.push(`Baseline avg keystroke interval: ${metrics.baseline.avg_inter_keystroke_interval.mean.toFixed(0)}ms`);
    }
    if (metrics.baseline.typing_speed_variance) {
      lines.push(`Baseline typing speed variance: ${metrics.baseline.typing_speed_variance.mean.toFixed(2)}`);
    }
  }

  if (metrics.recent) {
    lines.push('');
    lines.push('--- Recent session (this week) ---');
    lines.push(`Current WPM: ${metrics.recent.words_per_minute.toFixed(1)}`);
    lines.push(`Current pause rate: ${metrics.recent.pause_frequency.toFixed(3)}`);
    lines.push(`Current backspace rate: ${metrics.recent.backspace_rate.toFixed(3)}`);
    lines.push(`Current avg keystroke interval: ${metrics.recent.avg_inter_keystroke_interval.toFixed(0)}ms`);
    lines.push(`Current typing speed variance: ${metrics.recent.typing_speed_variance.toFixed(2)}`);
  }

  if (deviation) {
    lines.push('');
    lines.push(`Deviation score: ${deviation.combined_score.toFixed(2)}`);
    if (deviation.combined_score > 1.5) {
      lines.push('Note: This is a notable deviation from the user\'s normal pattern.');
    }
  }

  if (previousSuggestion) {
    lines.push('');
    lines.push('--- Previous week\'s suggestion ---');
    lines.push(`Suggestion given: "${previousSuggestion.suggestion}"`);
    lines.push(`Suggestion date: ${previousSuggestion.created_at}`);
    if (previousSuggestion.checked_at) {
      lines.push(`This follow-up was generated after the suggestion period.`);
    }
  }

  return lines.join('\n');
}

/**
 * Generate an AI insight — returns structured JSON.
 */
async function generateInsight(metrics, deviation, previousSuggestion = null) {
  const AI_API_KEY = process.env.FEATHERLESS_API_KEY || process.env.AI_API_KEY;
  const AI_BASE_URL = process.env.FEATHERLESS_BASE_URL || process.env.AI_BASE_URL || 'https://api.featherless.ai/v1';
  const AI_MODEL = process.env.AI_MODEL || 'meta-llama/Meta-Llama-3.1-8B-Instruct';

  if (!AI_API_KEY || AI_API_KEY === 'YOUR_API_KEY_HERE') {
    return generateFallbackInsight(metrics, deviation, previousSuggestion);
  }

  const userMessage = formatUserMessage(metrics, deviation, previousSuggestion);

  try {
    const aiRes = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('AI API error:', aiRes.status, errText);
      return generateFallbackInsight(metrics, deviation, previousSuggestion);
    }

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content || '{}';

    // Parse JSON from the response
    let parsed;
    try {
      // Strip any markdown code fences if present
      const cleaned = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If JSON parsing fails, wrap the raw text as observation
      parsed = {
        observation: raw,
        suggestion: 'Try writing for 10 minutes tomorrow and notice how it feels.',
        followup_check: 'Next week, see if starting felt any different.',
      };
    }

    return {
      observation: parsed.observation || 'No observation available.',
      suggestion: parsed.suggestion || null,
      followup_check: parsed.followup_check || null,
      metrics,
      deviation,
    };
  } catch (err) {
    console.error('AI API error:', err.message);
    return generateFallbackInsight(metrics, deviation, previousSuggestion);
  }
}

/**
 * Rule-based fallback insight when API is unavailable.
 */
function generateFallbackInsight(metrics, deviation, previousSuggestion = null) {
  if (!deviation) {
    return {
      observation: 'Keep writing! Your patterns are still being established. At least 5 sessions are needed to see meaningful insights.',
      suggestion: null,
      followup_check: null,
      metrics,
      deviation,
    };
  }

  const score = deviation.combined_score;
  const features = deviation.features || {};

  // Rotate opening phrases
  const openers = [
    'Looking at your week...',
    'Your rhythm this week tells a story —',
    'Here\'s what your hands have been saying:',
    'This week, your pattern shifted a little.',
    'Taking a step back, here\'s what stands out:',
  ];
  const opener = openers[Math.floor(Math.random() * openers.length)];

  let observation = opener + ' ';

  if (score < 0.5) {
    observation += 'Your typing rhythm looks steady and consistent. Nothing unusual detected — your pattern is holding firm.';
  } else if (score < 1.0) {
    observation += 'There\'s some variation from your usual rhythm today. Nothing alarming, just a gentle ripple in your normal flow.';
  } else if (score < 1.5) {
    observation += 'Your rhythm has been a little more paused and varied than usual. It\'s worth noticing, even if it doesn\'t need action.';
  } else {
    observation += 'Your typing pattern shows a notable shift this week. Your rhythm has been quite different from what\'s normal for you.';
  }

  // Feature-specific observations
  const observations = [];
  if (features.pause_frequency > 1) {
    observations.push('You\'ve been pausing more between keystrokes than usual');
  }
  if (features.words_per_minute < -1) {
    observations.push('your typing has been slower than your normal pace');
  }
  if (features.backspace_rate > 1) {
    observations.push('there have been more corrections than typical');
  }
  if (observations.length > 0) {
    observation += ' Specifically, ' + observations.join(', and ') + '.';
  }

  // Suggestion based on actual pattern
  let suggestion = null;
  if (features.pause_frequency > 1) {
    suggestion = 'Tomorrow, try writing for 5 minutes without stopping — even if it feels rough. See if the flow comes back once the pressure to be perfect drops.';
  } else if (features.words_per_minute < -1) {
    suggestion = 'Try writing about something that genuinely excites you for just 10 minutes — a hobby, a trip, anything. Notice if your pace feels different when the topic is easy.';
  } else if (features.backspace_rate > 1) {
    suggestion = 'In your next session, try not hitting backspace at all — let every word stay as it is. See how it feels to just keep moving forward.';
  } else if (score >= 1.0) {
    suggestion = 'Take a 5-minute walk or stretch before your next writing session. Sometimes a small physical reset changes the rhythm.';
  }

  let followup_check = null;
  if (suggestion) {
    followup_check = 'Next week, notice if your writing felt a little easier to start, or if the rhythm felt different.';
  }

  // Follow-up from previous suggestion
  if (previousSuggestion && previousSuggestion.suggestion) {
    observation = `Last time we explored: "${previousSuggestion.suggestion.substring(0, 60)}..." — ` + observation.toLowerCase();
  }

  return {
    observation,
    suggestion,
    followup_check,
    metrics,
    deviation,
  };
}

module.exports = { generateInsight, formatUserMessage };
