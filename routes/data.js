const express = require("express");
const router = express.Router();

const db = require("../db/db");

// Export all data belonging to a user
router.get("/export/:user_id", (req, res) => {

  try {

    const userId = req.params.user_id;

    const user = db.prepare(`
      SELECT id, created_at, support_level,
             trusted_contact_name,
             trusted_contact_phone
      FROM users
      WHERE id = ?
    `).get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const sessions = db.prepare(`
      SELECT *
      FROM sessions
      WHERE user_id = ?
      ORDER BY start_ts DESC
    `).all(userId);

    const baseline = db.prepare(`
      SELECT *
      FROM baselines
      WHERE user_id = ?
    `).get(userId);

    const insights = db.prepare(`
      SELECT *
      FROM insights
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId);

    res.json({
      user,
      sessions,
      baseline: baseline || null,
      insights
    });

  } catch (error) {

    console.error("Export error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


// Delete all user data
router.delete("/:user_id", (req, res) => {

  try {

    const userId = req.params.user_id;

    const deleteTransaction = db.transaction(() => {

      db.prepare(`
        DELETE FROM insights
        WHERE user_id = ?
      `).run(userId);

      db.prepare(`
        DELETE FROM sessions
        WHERE user_id = ?
      `).run(userId);

      db.prepare(`
        DELETE FROM baselines
        WHERE user_id = ?
      `).run(userId);

      const result = db.prepare(`
        DELETE FROM users
        WHERE id = ?
      `).run(userId);

      return result.changes;

    });

    const deleted = deleteTransaction();

    if (deleted === 0) {

      return res.status(404).json({
        success: false,
        message: "User not found."
      });

    }

    res.json({
      deleted: true
    });

  } catch (error) {

    console.error("Delete error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

module.exports = router;