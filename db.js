import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Open SQLite database connection
export async function getDb() {
  return open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });
}

// Initialize tables if they don't exist
export async function initDb() {
  const db = await getDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      hashed_pattern TEXT NOT NULL,
      saved_grid TEXT,
      attempt_count INTEGER DEFAULT 0,
      locked_until DATETIME
    );

    CREATE TABLE IF NOT EXISTS otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      attempts INTEGER DEFAULT 0,
      FOREIGN KEY (email) REFERENCES users (email)
    );
  `);

  // Safety check just in case the column doesn't exist from a previous run
  try {
    await db.exec("ALTER TABLE users ADD COLUMN saved_grid TEXT");
  } catch (e) { /* Column exists */ }

  try {
    await db.exec("ALTER TABLE users ADD COLUMN daily_resend_count INTEGER DEFAULT 0");
    await db.exec("ALTER TABLE users ADD COLUMN last_resend_date TEXT");
  } catch (e) { /* Columns exist */ }

  console.log('Database initialized successfully.');
  return db;
}
