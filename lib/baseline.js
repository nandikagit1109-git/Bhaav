const db = require("../db/db");

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

const BASELINE_SESSIONS =
  Number(process.env.BASELINE_SESSIONS) || 7;

const MIN_SESSIONS =
  Number(process.env.MIN_SESSIONS_FOR_BASELINE) || 5;


function mean(values) {
  if (!values.length) return 0;

  return values.reduce(
    (sum, value) => sum + value,
    0
  ) / values.length;
}


function std(values) {
  if (values.length < 2) return 0;

  const avg = mean(values);

  return Math.sqrt(
    mean(
      values.map(
        value =>
          Math.pow(value - avg, 2)
      )
    )
  );
}


function calculateBaseline(userId) {

  const sessions = db.prepare(`
    SELECT *
    FROM sessions
    WHERE user_id = ?
    ORDER BY start_ts DESC
    LIMIT ?
  `).all(
    userId,
    BASELINE_SESSIONS
  );


  if (
    sessions.length < MIN_SESSIONS
  ) {
    return null;
  }


  const baseline = {};


  for (const feature of FEATURES) {

    const values = sessions
      .map(
        session =>
          Number(session[feature])
      )
      .filter(
        value =>
          Number.isFinite(value)
      );


    baseline[
      `${feature}_mean`
    ] = mean(values);


    baseline[
      `${feature}_std`
    ] = std(values);
  }


  baseline.session_count =
    sessions.length;

  baseline.last_updated =
    new Date().toISOString();


  db.prepare(`
    INSERT INTO baselines (

      user_id,

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

      average_pause_duration_mean,
      average_pause_duration_std,

      longest_pause_mean,
      longest_pause_std,

      session_duration_mean,
      session_duration_std,

      active_typing_duration_mean,
      active_typing_duration_std,

      session_count,
      last_updated

    )

    VALUES (
      ?, ?, ?,
      ?, ?,
      ?, ?,
      ?, ?,
      ?, ?,
      ?, ?,
      ?, ?,
      ?, ?,
      ?, ?,
      ?, ?,
      ?, ?
    )

    ON CONFLICT(user_id)
    DO UPDATE SET

      avg_inter_keystroke_interval_mean =
        excluded.avg_inter_keystroke_interval_mean,

      avg_inter_keystroke_interval_std =
        excluded.avg_inter_keystroke_interval_std,

      pause_frequency_mean =
        excluded.pause_frequency_mean,

      pause_frequency_std =
        excluded.pause_frequency_std,

      backspace_rate_mean =
        excluded.backspace_rate_mean,

      backspace_rate_std =
        excluded.backspace_rate_std,

      wpm_mean =
        excluded.wpm_mean,

      wpm_std =
        excluded.wpm_std,

      typing_speed_variance_mean =
        excluded.typing_speed_variance_mean,

      typing_speed_variance_std =
        excluded.typing_speed_variance_std,

      average_pause_duration_mean =
        excluded.average_pause_duration_mean,

      average_pause_duration_std =
        excluded.average_pause_duration_std,

      longest_pause_mean =
        excluded.longest_pause_mean,

      longest_pause_std =
        excluded.longest_pause_std,

      session_duration_mean =
        excluded.session_duration_mean,

      session_duration_std =
        excluded.session_duration_std,

      active_typing_duration_mean =
        excluded.active_typing_duration_mean,

      active_typing_duration_std =
        excluded.active_typing_duration_std,

      session_count =
        excluded.session_count,

      last_updated =
        excluded.last_updated

  `).run(

    userId,

    baseline.avg_inter_keystroke_interval_mean,
    baseline.avg_inter_keystroke_interval_std,

    baseline.pause_frequency_mean,
    baseline.pause_frequency_std,

    baseline.backspace_rate_mean,
    baseline.backspace_rate_std,

    baseline.wpm_mean,
    baseline.wpm_std,

    baseline.typing_speed_variance_mean,
    baseline.typing_speed_variance_std,

    baseline.average_pause_duration_mean,
    baseline.average_pause_duration_std,

    baseline.longest_pause_mean,
    baseline.longest_pause_std,

    baseline.session_duration_mean,
    baseline.session_duration_std,

    baseline.active_typing_duration_mean,
    baseline.active_typing_duration_std,

    baseline.session_count,
    baseline.last_updated
  );


  return baseline;
}


module.exports = {
  calculateBaseline
};