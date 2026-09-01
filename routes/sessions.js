const express = require("express");
const router = express.Router();

const db = require("../db/db");
const { randomUUID: uuidv4 } = require("crypto");

const {
  extractFeatures
} = require("../lib/featureExtraction");

const {
  calculateBaseline
} = require("../lib/baseline");

const {
  calculateDeviation
} = require("../lib/deviation");


router.post("/", (req, res) => {
  try {

    const {
      user_id,
      start_ts,
      end_ts,
      keystroke_events
    } = req.body;


    // =====================================
    // VALIDATION
    // =====================================

    if (
      !user_id ||
      !start_ts ||
      !end_ts ||
      !Array.isArray(keystroke_events)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing or invalid required fields."
      });
    }


    // =====================================
    // USER CHECK
    // =====================================

    const user =
      db.prepare(`
        SELECT *
        FROM users
        WHERE id = ?
      `).get(user_id);


    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found."
      });
    }


    // =====================================
    // FEATURE EXTRACTION
    // =====================================

    const features =
      extractFeatures(
        keystroke_events,
        start_ts,
        end_ts
      );


    // =====================================
    // SESSION ID
    // =====================================

    const sessionId =
      uuidv4();


    // =====================================
    // STORE METADATA ONLY
    // =====================================
    //
    // IMPORTANT:
    //
    // Actual journal text is NEVER stored.
    //
    // We only store calculated metrics.
    //
    // =====================================

    db.prepare(`
      INSERT INTO sessions (

        id,
        user_id,
        start_ts,
        end_ts,

        avg_inter_keystroke_interval,
        pause_frequency,
        backspace_rate,
        wpm,
        typing_speed_variance,

        total_keystrokes,
        pause_count,
        average_pause_duration,
        longest_pause,
        backspace_count,
        session_duration,
        active_typing_duration,
        time_of_day

      )

      VALUES (
        ?,
        ?,
        ?,
        ?,

        ?,
        ?,
        ?,
        ?,
        ?,

        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
      )
    `).run(

      sessionId,
      user_id,

      start_ts,
      end_ts,

      features.avg_inter_keystroke_interval,
      features.pause_frequency,
      features.backspace_rate,
      features.wpm,
      features.typing_speed_variance,

      features.total_keystrokes,
      features.pause_count,
      features.average_pause_duration,
      features.longest_pause,
      features.backspace_count,
      features.session_duration,
      features.active_typing_duration,
      features.time_of_day
    );


    // =====================================
    // PERSONAL BASELINE
    // =====================================

    const baseline =
      calculateBaseline(
        user_id
      );


    // =====================================
    // DEVIATION
    // =====================================

    const deviation =
      calculateDeviation(
        features,
        baseline
      );


    // =====================================
    // STORE COMBINED Z
    // =====================================

    if (
      deviation.combined_z !== null
    ) {

      db.prepare(`
        UPDATE sessions

        SET combined_z = ?

        WHERE id = ?
      `).run(
        deviation.combined_z,
        sessionId
      );
    }


    // =====================================
    // SUPPORT DECISION
    // =====================================

    const triggerIntervention =
      deviation.level === "high" &&
      user.support_level >= 2;


    let intervention = null;


    if (triggerIntervention) {

      intervention = {

        title:
          "Your rhythm seems a little different today.",

        message:
          "You do not need to figure anything out right now. A short pause might help.",

        action:
          "Take a breathing pause"
      };
    }


    // =====================================
    // RESPONSE
    // =====================================

    return res.status(201).json({

      success: true,

      session_id:
        sessionId,

      features,

      combined_z:
        deviation.combined_z,

      deviation_level:
        deviation.level,

      intervention
    });

  }

  catch (error) {

    console.error(
      "Session error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        error.message
    });
  }
});


module.exports = router;