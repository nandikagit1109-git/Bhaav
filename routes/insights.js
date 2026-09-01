const express = require("express");
const router = express.Router();

const db = require("../db/db");
const { randomUUID: uuidv4 } = require("crypto");

const { generateInsight } = require("../lib/llm");

function getWeekStart() {
  const date = new Date();

  const day = date.getUTCDay();

  const diff = day === 0 ? -6 : 1 - day;

  date.setUTCDate(date.getUTCDate() + diff);

  return date.toISOString().split("T")[0];
}


// =====================================================
// GET WEEKLY INSIGHT
// GET /api/insight/:user_id
// =====================================================

router.get("/:user_id", async (req, res) => {

  try {

    const userId = req.params.user_id;

    // -------------------------------------------------
    // Check user
    // -------------------------------------------------

    const user = db.prepare(`
      SELECT *
      FROM users
      WHERE id = ?
    `).get(userId);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found."
      });

    }


    const weekStart = getWeekStart();


    // -------------------------------------------------
    // Check whether this week's insight already exists
    // -------------------------------------------------

    const existing = db.prepare(`
      SELECT *
      FROM insights
      WHERE user_id = ?
      AND week_start = ?
    `).get(
      userId,
      weekStart
    );


if (existing) {
  return res.json({
    insight_id: existing.id,
    week_start: existing.week_start,
    observation: existing.observation,
    suggestion: existing.suggestion,
    followup_check: existing.followup_check
  });
}


    // -------------------------------------------------
    // Get recent sessions
    // -------------------------------------------------

    const sessions = db.prepare(`
      SELECT *
      FROM sessions
      WHERE user_id = ?
      ORDER BY start_ts DESC
      LIMIT 7
    `).all(userId);


    if (sessions.length === 0) {
      return res.json({
        week_start: weekStart,
        observation: "Bhaav is still learning your writing pattern.",
        suggestion: "Complete a few more writing sessions to build your personal rhythm.",
        followup_check: null
      });
    }


    // -------------------------------------------------
    // Get baseline
    // -------------------------------------------------

    const baseline = db.prepare(`
      SELECT *
      FROM baselines
      WHERE user_id = ?
    `).get(userId);


    if (!baseline) {

      return res.json({

        week_start:
          weekStart,

        observation:
          "Bhaav is still learning your writing pattern.",

        suggestion:
          "Complete a few more writing sessions.",

        followup_check:
          null

      });

    }


    // -------------------------------------------------
    // Calculate weekly averages
    // -------------------------------------------------

    const currentWpm =
      sessions.reduce(
        (sum, session) =>
          sum + session.wpm,
        0
      ) / sessions.length;


    const currentPause =
      sessions.reduce(
        (sum, session) =>
          sum + session.pause_frequency,
        0
      ) / sessions.length;


    const currentBackspace =
      sessions.reduce(
        (sum, session) =>
          sum + session.backspace_rate,
        0
      ) / sessions.length;


    // -------------------------------------------------
    // REAL COMBINED Z-SCORE
    // -------------------------------------------------

    const sessionsWithDeviation =
      sessions.filter(
        session =>
          session.combined_z !== null &&
          session.combined_z !== undefined
      );

let combinedZ =
  (
    Math.abs(
      (currentWpm - baseline.wpm_mean) /
      (baseline.wpm_std || 1)
    ) +
    Math.abs(
      (currentPause - baseline.pause_frequency_mean) /
      (baseline.pause_frequency_std || 1)
    ) +
    Math.abs(
      (currentBackspace - baseline.backspace_rate_mean) /
      (baseline.backspace_rate_std || 1)
    )
  ) / 3;


    if (sessionsWithDeviation.length > 0) {

      combinedZ =
        sessionsWithDeviation.reduce(
          (sum, session) =>
            sum + session.combined_z,
          0
        ) /
        sessionsWithDeviation.length;

    }


    // -------------------------------------------------
    // Get previous suggestion
    // -------------------------------------------------

    const previous = db.prepare(`
      SELECT *
      FROM insights
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(userId);


    // -------------------------------------------------
    // Ask Featherless AI
    // -------------------------------------------------

    const aiResult =
      await generateInsight({

        baselineWpm:
          baseline.wpm_mean,

        currentWpm,

        baselinePause:
          baseline.pause_frequency_mean,

        currentPause,

        baselineBackspace:
          baseline.backspace_rate_mean,

        currentBackspace,

        combinedZ,

        previousSuggestion:
          previous?.suggestion || null

      });


    // -------------------------------------------------
    // Store insight
    // -------------------------------------------------

    const insightId =
      uuidv4();


    db.prepare(`
      INSERT INTO insights (
        id,
        user_id,
        week_start,
        observation,
        suggestion,
        followup_check,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(

      insightId,

      userId,

      weekStart,

      aiResult.observation,

      aiResult.suggestion,

      aiResult.followup_check,

      new Date().toISOString()

    );


    // -------------------------------------------------
    // Return insight
    // -------------------------------------------------

    res.json({

      week_start:
        weekStart,

      observation:
        aiResult.observation,

      suggestion:
        aiResult.suggestion,

      followup_check:
        aiResult.followup_check

    });

  }

  catch (error) {

    console.error(
      "Insight error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

});


// =====================================================
// POST FEEDBACK
// POST /api/insight/:user_id/feedback
// =====================================================

router.post(
  "/:user_id/feedback",
  (req, res) => {

    try {

      const userId =
        req.params.user_id;

      const {
        insight_id,
        feedback
      } = req.body;


      if (
        !insight_id ||
        !feedback
      ) {

        return res.status(400).json({

          success: false,

          message:
            "insight_id and feedback are required."

        });

      }


      const allowedFeedback = [
        "helpful",
        "not_helpful",
        "tried_it"
      ];


      if (
        !allowedFeedback.includes(
          feedback
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "feedback must be helpful, not_helpful, or tried_it."

        });

      }


      // Check that insight belongs to user
      const insight = db.prepare(`
        SELECT *
        FROM insights
        WHERE id = ?
        AND user_id = ?
      `).get(
        insight_id,
        userId
      );


      if (!insight) {

        return res.status(404).json({

          success: false,

          message:
            "Insight not found."

        });

      }


      const followup =
        JSON.stringify({

          feedback,

          recorded_at:
            new Date().toISOString()

        });


      db.prepare(`
        UPDATE insights
        SET followup_check = ?
        WHERE id = ?
        AND user_id = ?
      `).run(

        followup,

        insight_id,

        userId

      );


      res.json({

        success: true,

        feedback

      });

    }

    catch (error) {

      console.error(
        "Feedback error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  }
);


module.exports = router;