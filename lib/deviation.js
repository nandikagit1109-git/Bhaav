const MODERATE_Z =
  Number(process.env.MODERATE_DEVIATION_Z) || 1.5;

const HIGH_Z =
  Number(process.env.HIGH_DEVIATION_Z) || 2.0;


// =========================================
// FEATURES USED FOR DEVIATION ANALYSIS
// =========================================

const FEATURES = [
  "avg_inter_keystroke_interval",
  "pause_frequency",
  "backspace_rate",
  "wpm",
  "typing_speed_variance",
  "average_pause_duration",
  "longest_pause",
  "session_duration",
  "active_typing_duration"
];


// =========================================
// SAFE NUMBER
// =========================================

function safeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


// =========================================
// CALCULATE DEVIATION
// =========================================

function calculateDeviation(
  features,
  baseline
) {

  // =======================================
  // NO BASELINE YET
  // =======================================

  if (!baseline) {
    return {
      combined_z: null,
      has_baseline: false,
      level: "learning",
      signals: {}
    };
  }


  const zScores = [];

  const signals = {};


  // =======================================
  // CALCULATE Z-SCORE FOR EACH FEATURE
  // =======================================

  for (
    const feature of FEATURES
  ) {

    const mean =
      safeNumber(
        baseline[
          `${feature}_mean`
        ]
      );

    const std =
      safeNumber(
        baseline[
          `${feature}_std`
        ]
      );

    const value =
      safeNumber(
        features[feature]
      );


    // ---------------------------------------
    // If baseline has no variation,
    // don't produce an unreliable z-score.
    // ---------------------------------------

    if (
      std === 0
    ) {

      signals[feature] = {
        value,
        baseline_mean: mean,
        baseline_std: std,
        z_score: 0
      };

      continue;
    }


    const z =
      (value - mean) /
      std;


    const absoluteZ =
      Math.abs(z);


    zScores.push(
      absoluteZ
    );


    signals[feature] = {
      value,

      baseline_mean:
        Number(
          mean.toFixed(3)
        ),

      baseline_std:
        Number(
          std.toFixed(3)
        ),

      z_score:
        Number(
          z.toFixed(3)
        ),

      absolute_z:
        Number(
          absoluteZ.toFixed(3)
        )
    };
  }


  // =======================================
  // NO USABLE SIGNALS
  // =======================================

  if (
    zScores.length === 0
  ) {

    return {
      combined_z: 0,

      has_baseline: true,

      level: "normal",

      signals
    };
  }


  // =======================================
  // COMBINED DEVIATION
  // =======================================

  const combinedZ =
    zScores.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / zScores.length;


  // =======================================
  // CLASSIFICATION
  // =======================================

  let level =
    "normal";


  if (
    combinedZ >= HIGH_Z
  ) {

    level =
      "high";

  } else if (
    combinedZ >= MODERATE_Z
  ) {

    level =
      "moderate";
  }


  // =======================================
  // STRONGEST SIGNALS
  // =======================================

  const strongestSignals =
    Object.entries(
      signals
    )
      .filter(
        ([, signal]) =>
          signal.absolute_z !== undefined
      )
      .sort(
        ([, a], [, b]) =>
          b.absolute_z -
          a.absolute_z
      )
      .slice(0, 3)
      .map(
        ([feature, signal]) => ({
          feature,

          z_score:
            signal.z_score,

          absolute_z:
            signal.absolute_z
        })
      );


  // =======================================
  // FINAL RESULT
  // =======================================

  return {

    combined_z:
      Number(
        combinedZ.toFixed(3)
      ),

    has_baseline:
      true,

    level,

    signals,

    strongest_signals:
      strongestSignals
  };
}


module.exports = {
  calculateDeviation
};