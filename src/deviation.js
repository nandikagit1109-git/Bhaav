/**
 * Deviation scoring.
 * Calculates z-scores for each feature comparing current session to personal baseline.
 * Combined score is the average absolute z-score.
 */

const { FEATURE_KEYS } = require('./baseline');

/**
 * Calculate z-score for a single feature.
 * Returns 0 if baseline standard deviation is 0 (to avoid division by zero).
 */
function zScore(current, mean, std) {
  if (std === 0) return 0;
  return (current - mean) / std;
}

/**
 * Calculate deviation of a session's features from the personal baseline.
 * Returns per-feature z-scores and a combined score.
 */
function calculateDeviation(currentFeatures, baseline) {
  const features = {};

  for (const key of FEATURE_KEYS) {
    const current = currentFeatures[key] || 0;
    const baselineMean = baseline[key]?.mean || 0;
    const baselineStd = baseline[key]?.std || 0;

    features[key] = zScore(current, baselineMean, baselineStd);
  }

  // Combined score: average of absolute z-scores
  const zValues = Object.values(features);
  const combinedScore = zValues.reduce((sum, z) => sum + Math.abs(z), 0) / zValues.length;

  return {
    features,
    combined_score: combinedScore,
  };
}

module.exports = { calculateDeviation, zScore };
