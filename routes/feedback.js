const express = require("express");
const router = express.Router();

const db = require("../db/db");
const { v4: uuidv4 } = require("uuid");

router.post("/:user_id/feedback", (req, res) => {
  try {
    const userId = req.params.user_id;

    const {
      insight_id,
      feedback
    } = req.body;

    // Check required fields
    if (!insight_id || !feedback) {
      return res.status(400).json({
        success: false,
        message: "Missing insight_id or feedback."
      });
    }

    // Only allow these feedback values
    const allowedFeedback = [
      "helpful",
      "tried_it",
      "not_helpful"
    ];

    if (!allowedFeedback.includes(feedback)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback value."
      });
    }

    // Make sure the insight belongs to this user
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
        message: "Insight not found."
      });
    }

    const feedbackId = uuidv4();

    db.prepare(`
      INSERT INTO insight_feedback (
        id,
        insight_id,
        user_id,
        feedback,
        created_at
      )
      VALUES (?, ?, ?, ?, ?)
    `).run(
      feedbackId,
      insight_id,
      userId,
      feedback,
      new Date().toISOString()
    );

    res.status(201).json({
      success: true,
      feedback_id: feedbackId
    });

  } catch (error) {
    console.error(
      "Feedback error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;