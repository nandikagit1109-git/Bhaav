const express = require("express");
const router = express.Router();

const db = require("../db/db");


// =========================================
// GET FULL PERSONAL ANALYSIS
// =========================================

router.get("/:userId", (req, res) => {

  try {

    const { userId } = req.params;


    // ---------------------------------------
    // USER
    // ---------------------------------------

    const user = db.prepare(`
      SELECT id, created_at
      FROM users
      WHERE id = ?
    `).get(userId);


    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found."
      });

    }


    // ---------------------------------------
    // RECENT SESSIONS
    // ---------------------------------------

    const sessions = db.prepare(`
      SELECT
        id,
        start_ts,
        end_ts,
        avg_inter_keystroke_interval,
        pause_frequency,
        backspace_rate,
        wpm,
        typing_speed_variance,
        combined_z
      FROM sessions
      WHERE user_id = ?
      ORDER BY start_ts DESC
      LIMIT 14
    `).all(userId);


    // ---------------------------------------
    // BASELINE
    // ---------------------------------------

    const baseline = db.prepare(`
      SELECT
        avg_inter_keystroke_interval_mean,
        avg_inter_keystroke_interval_std,
        pause_frequency_mean,
        pause_frequency_std,
        backspace_rate_mean,
        backspace_rate_std,
        wpm_mean,
        wpm_std,
        typing_speed_variance_mean,
        typing_speed_variance_std,
        session_count,
        last_updated
      FROM baselines
      WHERE user_id = ?
    `).get(userId);


    // ---------------------------------------
    // LATEST SESSION
    // ---------------------------------------

    const latestSession =
      sessions.length > 0
        ? sessions[0]
        : null;


    // ---------------------------------------
    // SESSION FORMATTER
    // ---------------------------------------

    const formattedSessions =
      sessions.map(session => {

        const durationMs =
          session.end_ts -
          session.start_ts;


        return {

          id: session.id,

          start_ts:
            session.start_ts,

          end_ts:
            session.end_ts,

          duration_seconds:
            Math.round(
              durationMs / 1000
            ),

          avg_inter_keystroke_interval:
            session.avg_inter_keystroke_interval,

          pause_frequency:
            session.pause_frequency,

          backspace_rate:
            session.backspace_rate,

          wpm:
            session.wpm,

          typing_speed_variance:
            session.typing_speed_variance,

          combined_z:
            session.combined_z

        };

      });


    // ---------------------------------------
    // TREND DATA
    // ---------------------------------------

    const chronological =
      [...formattedSessions]
        .reverse();


    const trend = {

      labels:
        chronological.map(
          (_, index) =>
            `Session ${index + 1}`
        ),

      wpm:
        chronological.map(
          session =>
            Number(
              session.wpm || 0
            )
        ),

      pause_frequency:
        chronological.map(
          session =>
            Number(
              session.pause_frequency || 0
            )
        ),

      backspace_rate:
        chronological.map(
          session =>
            Number(
              session.backspace_rate || 0
            )
        ),

      deviation:
        chronological.map(
          session =>
            Number(
              session.combined_z || 0
            )
        )

    };


    // ---------------------------------------
    // CURRENT VS BASELINE
    // ---------------------------------------

    let comparison = null;


    if (
      latestSession &&
      baseline
    ) {

      comparison = {

        wpm: {

          current:
            latestSession.wpm,

          baseline:
            baseline.wpm_mean,

          difference:
            latestSession.wpm -
            baseline.wpm_mean

        },


        pause_frequency: {

          current:
            latestSession.pause_frequency,

          baseline:
            baseline.pause_frequency_mean,

          difference:
            latestSession.pause_frequency -
            baseline.pause_frequency_mean

        },


        backspace_rate: {

          current:
            latestSession.backspace_rate,

          baseline:
            baseline.backspace_rate_mean,

          difference:
            latestSession.backspace_rate -
            baseline.backspace_rate_mean

        },


        typing_speed_variance: {

          current:
            latestSession.typing_speed_variance,

          baseline:
            baseline.typing_speed_variance_mean,

          difference:
            latestSession.typing_speed_variance -
            baseline.typing_speed_variance_mean

        },


        combined_z:
          latestSession.combined_z

      };

    }


    // ---------------------------------------
    // RESPONSE
    // ---------------------------------------

    return res.json({

      success: true,

      user: {
        id: user.id,
        created_at: user.created_at
      },

      session_count:
        sessions.length,

      latest_session:
        latestSession,

      sessions:
        formattedSessions,

      baseline:
        baseline || null,

      comparison,

      trend

    });


  } catch (error) {

    console.error(
      "Analysis error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Unable to generate analysis."

    });

  }

});


module.exports = router;