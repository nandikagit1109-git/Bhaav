/**
 * Feature extraction from keystroke events.
 * Each feature analyzes a different aspect of typing behavior.
 */

/**
 * Average inter-keystroke interval (ms).
 * Time between consecutive key events, averaged.
 */
function avgInterKeystrokeInterval(events) {
  if (!events || events.length < 2) return 0;

  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
  let totalInterval = 0;
  let count = 0;

  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i].timestamp - sorted[i - 1].timestamp;
    if (diff > 0) {
      totalInterval += diff;
      count++;
    }
  }

  return count > 0 ? totalInterval / count : 0;
}

/**
 * Pause frequency — fraction of inter-keystroke gaps that exceed 2000ms.
 * A "pause" is defined as a gap > 2 seconds between consecutive keystrokes.
 */
function pauseFrequency(events) {
  if (!events || events.length < 2) return 0;

  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
  let pauses = 0;
  let validGaps = 0;

  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i].timestamp - sorted[i - 1].timestamp;
    if (diff > 0) {
      validGaps++;
      if (diff > 2000) pauses++;
    }
  }

  return validGaps > 0 ? pauses / validGaps : 0;
}

/**
 * Backspace rate — fraction of all keystrokes that are backspaces.
 */
function backspaceRate(events) {
  if (!events || events.length === 0) return 0;

  const total = events.length;
  const backspaces = events.filter((e) => e.key_type === 'backspace').length;

  return total > 0 ? backspaces / total : 0;
}

/**
 * Words per minute — estimated from character-like events over session duration.
 * Assumes ~5 characters per word.
 */
function wordsPerMinute(events) {
  if (!events || events.length < 2) return 0;

  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
  const startTime = sorted[0].timestamp;
  const endTime = sorted[sorted.length - 1].timestamp;
  const durationMs = endTime - startTime;

  if (durationMs <= 0) return 0;

  const durationMinutes = durationMs / 60000;

  // Count character-like events (character, space, punctuation)
  const characterEvents = events.filter((e) =>
    ['character', 'space', 'punctuation'].includes(e.key_type)
  ).length;

  const estimatedWords = characterEvents / 5;

  return estimatedWords / durationMinutes;
}

/**
 * Typing speed variance — variance in WPM across chunks of the session.
 * Splits the session into ~5-second chunks and measures WPM in each.
 */
function typingSpeedVariance(events) {
  if (!events || events.length < 2) return 0;

  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
  const startTime = sorted[0].timestamp;
  const endTime = sorted[sorted.length - 1].timestamp;
  const totalDuration = endTime - startTime;

  if (totalDuration <= 0) return 0;

  // Split into chunks of ~5 seconds
  const chunkDuration = 5000;
  const numChunks = Math.max(1, Math.floor(totalDuration / chunkDuration));

  const chunkWPMs = [];

  for (let i = 0; i < numChunks; i++) {
    const chunkStart = startTime + i * chunkDuration;
    const chunkEnd = chunkStart + chunkDuration;

    const chunkEvents = sorted.filter(
      (e) => e.timestamp >= chunkStart && e.timestamp < chunkEnd
    );

    // Count character-like events in this chunk
    const charEvents = chunkEvents.filter((e) =>
      ['character', 'space', 'punctuation'].includes(e.key_type)
    ).length;

    const chunkMinutes = chunkDuration / 60000;
    const wpm = (charEvents / 5) / chunkMinutes;
    chunkWPMs.push(wpm);
  }

  if (chunkWPMs.length < 2) return 0;

  // Calculate variance
  const mean = chunkWPMs.reduce((a, b) => a + b, 0) / chunkWPMs.length;
  const variance = chunkWPMs.reduce((sum, wpm) => sum + Math.pow(wpm - mean, 2), 0) / chunkWPMs.length;

  return variance;
}

/**
 * Extract all five features from a set of keystroke events.
 */
function extractFeatures(events) {
  return {
    avg_inter_keystroke_interval: avgInterKeystrokeInterval(events),
    pause_frequency: pauseFrequency(events),
    backspace_rate: backspaceRate(events),
    words_per_minute: wordsPerMinute(events),
    typing_speed_variance: typingSpeedVariance(events),
  };
}

module.exports = {
  avgInterKeystrokeInterval,
  pauseFrequency,
  backspaceRate,
  wordsPerMinute,
  typingSpeedVariance,
  extractFeatures,
};
