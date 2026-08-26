/**
 * Synthetic Demo Data Generator for Bhaav.
 *
 * Generates 14 days of typing sessions for "demo-user" with a believable pattern:
 *   Days 1-7:  Normal typing (consistent pace)
 *   Days 8-10: Slower, more pauses, more backspaces, greater speed variation
 *   Days 11-14: Gradual recovery toward normal
 *
 * Usage: npm run generate-demo
 */

require('dotenv').config({ override: true });

const { getDb, saveDb } = require('../src/db');
const { extractFeatures } = require('../src/features');

const USER_ID = 'demo-user';
const BASE_TS = 1787400000000;
const DAY_MS = 86400000;

/**
 * Configuration for each day's typing behavior.
 */
function getDayConfig(day) {
  if (day <= 7) {
    // Days 1-7: Normal, consistent typing
    return {
      avgGap: 120,
      pauseChance: 0.02,
      backspaceRate: 0.03,
      eventCount: 300 + Math.floor(Math.random() * 100),
      gapVariance: 0.2,
    };
  } else if (day <= 10) {
    // Days 8-10: Slower, erratic, more corrections
    const severity = (day - 7) / 3;
    return {
      avgGap: 150 + severity * 150,
      pauseChance: 0.06 + severity * 0.10,
      backspaceRate: 0.05 + severity * 0.06,
      eventCount: 250 + Math.floor(Math.random() * 80),
      gapVariance: 0.6 + severity * 0.5,
      // During slow period, alternate between fast bursts and very slow sections
      erratic: true,
      slowSectionChance: 0.3 + severity * 0.2,
    };
  } else {
    // Days 11-14: Recovery toward normal
    const recovery = (day - 10) / 4;
    const remaining = 1 - recovery;
    return {
      avgGap: 120 + remaining * 100,
      pauseChance: 0.02 + remaining * 0.06,
      backspaceRate: 0.03 + remaining * 0.04,
      eventCount: 280 + Math.floor(Math.random() * 90),
      gapVariance: 0.3 + remaining * 0.2,
      erratic: remaining > 0.5,
      slowSectionChance: remaining * 0.15,
    };
  }
}

/**
 * Generate keystroke events for a single session.
 */
function generateEvents(config, startTs) {
  const events = [];
  let ts = startTs;
  let inSlowSection = false;

  for (let i = 0; i < config.eventCount; i++) {
    // Determine key type
    let keyType;
    if (Math.random() < config.backspaceRate) {
      keyType = 'backspace';
    } else if (Math.random() < 0.15) {
      keyType = 'space';
    } else {
      keyType = 'character';
    }

    events.push({
      key_type: keyType,
      timestamp: ts,
    });

    // Calculate next timestamp
    let gap;

    if (config.erratic) {
      // Alternate between normal and slow sections for variety
      if (!inSlowSection && Math.random() < (config.slowSectionChance || 0)) {
        inSlowSection = true;
      } else if (inSlowSection && Math.random() < 0.3) {
        inSlowSection = false;
      }

      if (inSlowSection) {
        // Very slow section: large gaps, lots of variation
        gap = config.avgGap * 3 + (Math.random() - 0.3) * config.avgGap * 4;
      } else {
        // Normal burst
        gap = config.avgGap * 0.8 + (Math.random() - 0.5) * config.avgGap * config.gapVariance;
      }
    } else {
      gap = config.avgGap + (Math.random() - 0.5) * config.avgGap * config.gapVariance;
    }

    // Occasional long pause
    if (Math.random() < config.pauseChance) {
      gap += 2500 + Math.random() * 5000;
    }

    gap = Math.max(20, gap);
    ts += gap;
  }

  return events;
}

async function main() {
  console.log('Generating synthetic demo data for Bhaav...\n');

  const db = await getDb();

  // Clear existing demo data
  db.run('DELETE FROM features WHERE user_id = ?', [USER_ID]);
  db.run('DELETE FROM sessions WHERE user_id = ?', [USER_ID]);
  saveDb();

  const days = 14;

  for (let day = 1; day <= days; day++) {
    const config = getDayConfig(day);
    const startTs = BASE_TS + (day - 1) * DAY_MS;
    const events = generateEvents(config, startTs);
    const endTs = events[events.length - 1].timestamp + 1000;

    const sessionId = `demo-${String(day).padStart(3, '0')}`;

    // Store session
    db.run(
      'INSERT INTO sessions (user_id, session_id, start_ts, end_ts, keystroke_events) VALUES (?, ?, ?, ?, ?)',
      [USER_ID, sessionId, startTs, endTs, JSON.stringify(events)]
    );

    // Extract and store features
    const features = extractFeatures(events);
    db.run(
      'INSERT INTO features (session_id, user_id, avg_inter_keystroke_interval, pause_frequency, backspace_rate, words_per_minute, typing_speed_variance) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        sessionId,
        USER_ID,
        features.avg_inter_keystroke_interval,
        features.pause_frequency,
        features.backspace_rate,
        features.words_per_minute,
        features.typing_speed_variance,
      ]
    );

    const phase = day <= 7 ? 'normal' : day <= 10 ? 'slower' : 'recovering';
    console.log(
      `Day ${String(day).padStart(2)} | ${phase.padEnd(10)} | ` +
      `WPM: ${features.words_per_minute.toFixed(1).padStart(5)} | ` +
      `Pause: ${features.pause_frequency.toFixed(3)} | ` +
      `Back: ${features.backspace_rate.toFixed(3)} | ` +
      `Var: ${features.typing_speed_variance.toFixed(2).padStart(8)} | ` +
      `Events: ${events.length}`
    );
  }

  saveDb();

  console.log(`\n✓ Generated ${days} sessions for "${USER_ID}"`);
  console.log('  Run "npm run dev" to start the server');
  console.log('  Then call GET /insight/demo-user');
}

main().catch((err) => {
  console.error('Error generating synthetic data:', err);
  process.exit(1);
});
