const express = require("express");
const router = express.Router();

const db = require("../db/db");

function getWeekStart(date = new Date()) {

  const d = new Date(date);

  const day = d.getUTCDay();

  const diff = day === 0 ? -6 : 1 - day;

  d.setUTCDate(d.getUTCDate() + diff);

  return d.toISOString().split("T")[0];
}


function getPreviousWeekStart() {

  const current = new Date();

  current.setUTCDate(
    current.getUTCDate() - 7
  );

  return getWeekStart(current);
}


router.get("/aggregate", (req, res) => {

  try {

    const currentWeek =
      getWeekStart();

    const previousWeek =
      getPreviousWeekStart();


    // Minimum number of users required
    // before returning aggregate information.
    const MIN_USERS = 10;


    /*
      We calculate aggregate deviation
      from session behavior.

      IMPORTANT:
      No user IDs are returned.
    */

    const currentData = db.prepare(`
      SELECT
        AVG(
          ABS(
            COALESCE(wpm, 0)
          )
        ) AS average_score,
        COUNT(DISTINCT user_id) AS user_count

      FROM sessions

      WHERE start_ts >= ?
    `).get(
      new Date(`${currentWeek}T00:00:00Z`).getTime()
    );


    const previousData = db.prepare(`
      SELECT
        AVG(
          ABS(
            COALESCE(wpm, 0)
          )
        ) AS average_score,
        COUNT(DISTINCT user_id) AS user_count

      FROM sessions

      WHERE start_ts >= ?
      AND start_ts < ?
    `).get(
      new Date(`${previousWeek}T00:00:00Z`).getTime(),

      new Date(`${currentWeek}T00:00:00Z`).getTime()
    );


    const optedInUsers =
      currentData.user_count || 0;


    // k-anonymity protection
    if (optedInUsers < MIN_USERS) {

      return res.json({
        insufficient_data: true
      });

    }


    let changePct = null;


    if (
      previousData.average_score &&
      previousData.average_score !== 0
    ) {

      changePct =
        (
          (
            currentData.average_score -
            previousData.average_score
          )
          /
          previousData.average_score
        ) * 100;

    }


    res.json({

      week_over_week_change_pct:
        changePct === null
          ? null
          : Number(changePct.toFixed(2)),

      opted_in_users:
        optedInUsers,

      week_start:
        currentWeek

    });

  } catch (error) {

    console.error(
      "Campus Pulse error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


module.exports = router;