const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const dbPath = process.env.DB_PATH || "./bhaav.db";

const db = new Database(dbPath);

const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

db.exec(schema);

console.log(`Database connected: ${dbPath}`);

module.exports = db;
