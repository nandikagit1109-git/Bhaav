const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const dbPath = process.env.DB_PATH || "./bhaav.db";

let db = null;

function saveDb() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
  return { changes: db.getRowsModified() };
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  if (stmt.step()) {
    const cols = stmt.getColumnNames();
    const values = stmt.get();
    stmt.free();
    const row = {};
    cols.forEach((col, i) => { row[col] = values[i]; });
    return row;
  }
  stmt.free();
  return undefined;
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    const cols = stmt.getColumnNames();
    const values = stmt.get();
    const row = {};
    cols.forEach((col, i) => { row[col] = values[i]; });
    rows.push(row);
  }
  stmt.free();
  return rows;
}

function exec(sql) {
  db.run(sql);
  saveDb();
}

async function initDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Run schema
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  const statements = schema
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    try {
      db.run(stmt + ";");
    } catch (e) {
      // table already exists, ignore
    }
  }

  saveDb();
  console.log(`Database connected: ${dbPath}`);
}

// better-sqlite3 compatible wrapper for route files
function prepare(sql) {
  return {
    run(...params) { return run(sql, params); },
    get(...params) { return get(sql, params); },
    all(...params) { return all(sql, params); }
  };
}

module.exports = { initDatabase, prepare, exec: exec };
