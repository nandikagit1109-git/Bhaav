const db = require("./db");


// =========================================
// SESSION COLUMNS
// =========================================

const sessionColumns = [
  {
    name: "total_keystrokes",
    type: "INTEGER DEFAULT 0"
  },
  {
    name: "pause_count",
    type: "INTEGER DEFAULT 0"
  },
  {
    name: "average_pause_duration",
    type: "REAL DEFAULT 0"
  },
  {
    name: "longest_pause",
    type: "REAL DEFAULT 0"
  },
  {
    name: "backspace_count",
    type: "INTEGER DEFAULT 0"
  },
  {
    name: "session_duration",
    type: "INTEGER DEFAULT 0"
  },
  {
    name: "active_typing_duration",
    type: "INTEGER DEFAULT 0"
  },
  {
    name: "time_of_day",
    type: "TEXT"
  }
];


// =========================================
// BASELINE COLUMNS
// =========================================

const baselineColumns = [
  {
    name: "average_pause_duration_mean",
    type: "REAL DEFAULT 0"
  },
  {
    name: "average_pause_duration_std",
    type: "REAL DEFAULT 0"
  },
  {
    name: "longest_pause_mean",
    type: "REAL DEFAULT 0"
  },
  {
    name: "longest_pause_std",
    type: "REAL DEFAULT 0"
  },
  {
    name: "session_duration_mean",
    type: "REAL DEFAULT 0"
  },
  {
    name: "session_duration_std",
    type: "REAL DEFAULT 0"
  },
  {
    name: "active_typing_duration_mean",
    type: "REAL DEFAULT 0"
  },
  {
    name: "active_typing_duration_std",
    type: "REAL DEFAULT 0"
  }
];


// =========================================
// ADD MISSING COLUMNS
// =========================================

function migrateTable(
  tableName,
  columns
) {

  const existingColumns =
    db.prepare(
      `PRAGMA table_info(${tableName})`
    ).all();

  const existingNames =
    new Set(
      existingColumns.map(
        column =>
          column.name
      )
    );


  for (
    const column of columns
  ) {

    if (
      !existingNames.has(
        column.name
      )
    ) {

      db.exec(`
        ALTER TABLE ${tableName}
        ADD COLUMN ${column.name}
        ${column.type}
      `);

      console.log(
        `Added ${tableName}.${column.name}`
      );
    }
  }
}


// =========================================
// RUN MIGRATION
// =========================================

migrateTable(
  "sessions",
  sessionColumns
);

migrateTable(
  "baselines",
  baselineColumns
);


console.log(
  "Database migration complete."
);

process.exit(0);