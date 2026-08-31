const express = require("express");
const router = express.Router();

const db = require("../db/db");

// Change support level
router.post("/support-level", (req, res) => {

  const {
    user_id,
    support_level
  } = req.body;

  if (!user_id || ![1, 2, 3].includes(support_level)) {

    return res.status(400).json({
      success: false,
      message: "support_level must be 1, 2, or 3."
    });

  }

  const result = db.prepare(`
    UPDATE users
    SET support_level = ?
    WHERE id = ?
  `).run(
    support_level,
    user_id
  );

  if (result.changes === 0) {

    return res.status(404).json({
      success: false,
      message: "User not found."
    });

  }

  res.json({
    success: true,
    support_level
  });

});


// Save trusted contact
router.post("/trusted-contact", (req, res) => {

  const {
    user_id,
    name,
    phone
  } = req.body;

  if (!user_id || !name || !phone) {

    return res.status(400).json({
      success: false,
      message: "user_id, name and phone are required."
    });

  }

  const result = db.prepare(`
    UPDATE users
    SET
      trusted_contact_name = ?,
      trusted_contact_phone = ?
    WHERE id = ?
  `).run(
    name,
    phone,
    user_id
  );

  if (result.changes === 0) {

    return res.status(404).json({
      success: false,
      message: "User not found."
    });

  }

  res.json({
    success: true
  });

});

module.exports = router;