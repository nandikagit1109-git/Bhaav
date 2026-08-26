/**
 * Personal baseline calculation.
 * Computes mean and standard deviation for each feature from a user's historical sessions.
 * Available after 5+ sessions.
 */

const MIN_SESSIONS = 5;

const FEATURE_KEYS = [
  'avg_inter_keystroke_interval',
  'pause_frequency',
  'backspace_rate',
  'words_per_minute',
  'typing_speed_variance',
];

/**
 * Calculate the mean of an array of numbers.
 */
function mean(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate the population standard deviation of an array of numbers.
 * Returns 0 if there's only one value (no variance).
 */
function standardDeviation(values) {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map((v) => Math.pow(v - avg, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Build a personal baseline from a user's historical feature rows.
 * Each row should have the feature columns.
 *
 * Returns null if fewer than MIN_SESSIONS rows are provided.
 * Otherwise returns an object with mean, std, and count per feature.
 */
function calculateBaseline(featureRows) {
  if (!featureRows || featureRows.length < MIN_SESSIONS) {
    return null;
  }

  const baseline = {};

  for (const key of FEATURE_KEYS) {
    const values = featureRows
      .map((row) => row[key])
      .filter((v) => v != null && !isNaN(v));

    baseline[key] = {
      mean: mean(values),
      std: standardDeviation(values),
      count: values.length,
    };
  }

  return baseline;
}

module.exports = { calculateBaseline, MIN_SESSIONS, FEATURE_KEYS };
