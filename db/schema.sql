CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  support_level INTEGER DEFAULT 1,
  trusted_contact_name TEXT,
  trusted_contact_phone TEXT
);


CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  start_ts INTEGER NOT NULL,
  end_ts INTEGER NOT NULL,

  -- Core rhythm metrics
  avg_inter_keystroke_interval REAL,
  pause_frequency REAL,
  backspace_rate REAL,
  wpm REAL,
  typing_speed_variance REAL,

  -- Extended session analysis
  total_keystrokes INTEGER DEFAULT 0,
  pause_count INTEGER DEFAULT 0,
  average_pause_duration REAL DEFAULT 0,
  longest_pause REAL DEFAULT 0,
  backspace_count INTEGER DEFAULT 0,
  session_duration INTEGER DEFAULT 0,
  active_typing_duration INTEGER DEFAULT 0,
  time_of_day TEXT,

  -- Combined deviation
  combined_z REAL,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
);


CREATE TABLE IF NOT EXISTS baselines (
  user_id TEXT PRIMARY KEY,

  avg_inter_keystroke_interval_mean REAL,
  avg_inter_keystroke_interval_std REAL,

  pause_frequency_mean REAL,
  pause_frequency_std REAL,

  backspace_rate_mean REAL,
  backspace_rate_std REAL,

  wpm_mean REAL,
  wpm_std REAL,

  typing_speed_variance_mean REAL,
  typing_speed_variance_std REAL,

  session_count INTEGER,

  last_updated TEXT
);


CREATE TABLE IF NOT EXISTS insights (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  week_start TEXT NOT NULL,
  observation TEXT,
  suggestion TEXT,
  followup_check TEXT,
  created_at TEXT NOT NULL,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
);


CREATE TABLE IF NOT EXISTS insight_feedback (
  id TEXT PRIMARY KEY,
  insight_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  feedback TEXT NOT NULL,
  created_at TEXT NOT NULL,

  FOREIGN KEY (insight_id)
    REFERENCES insights(id),

  FOREIGN KEY (user_id)
    REFERENCES users(id)
);