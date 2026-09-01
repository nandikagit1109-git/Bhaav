const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { randomUUID: uuidv4 } = require('crypto');

router.post('/', (req, res) => {
  const id = uuidv4();

  db.prepare(`
    INSERT INTO users (
      id,
      created_at,
      support_level
    ) VALUES (?, ?, ?)
  `).run(
    id,
    new Date().toISOString(),
    1
  );

  res.status(201).json({
    success: true,
    user_id: id
  });
});

module.exports = router;