const express = require("express");
const router = express.Router();

const db = require("../db/db");

router.get("/trends", (req, res) => {
  try {
    const PRIVACY_FLOOR = 5;

    const totalUsers = db.prepare(`
      SELECT COUNT(*) AS count
      FROM users
    `).get().count;

    const totalSessions = db.prepare(`
      SELECT COUNT(*) AS count
      FROM sessions
    `).get().count;

    const highDeviationSessions = db.prepare(`
      SELECT COUNT(*) AS count
      FROM sessions
      WHERE combined_z >= 2
    `).get().count;

    const recentSessions = db.prepare(`
      SELECT
        COUNT(*) AS session_count,
        AVG(wpm) AS avg_wpm,
        AVG(pause_frequency) AS avg_pause_frequency,
        AVG(backspace_rate) AS avg_backspace_rate,
        AVG(combined_z) AS avg_combined_z
      FROM sessions
      WHERE start_ts >= ?
    `).get(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    );

    /*
      Privacy floor:
      Do not expose population-level metrics
      when fewer than 5 users exist.
    */

    if (totalUsers < PRIVACY_FLOOR) {
      return res.json({
        success: true,
        privacy_limited: true,
        message:
          "Not enough participants to display campus trends.",
        participant_count: totalUsers
      });
    }

    res.json({
      success: true,
      privacy_limited: false,
      participant_count: totalUsers,
      total_sessions: totalSessions,
      high_deviation_sessions: highDeviationSessions,
      last_7_days: {
        session_count:
          recentSessions.session_count || 0,
        average_wpm:
          recentSessions.avg_wpm || 0,
        average_pause_frequency:
          recentSessions.avg_pause_frequency || 0,
        average_backspace_rate:
          recentSessions.avg_backspace_rate || 0,
        average_combined_z:
          recentSessions.avg_combined_z || 0
      }
    });

  } catch (error) {
    console.error("Admin trends error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;