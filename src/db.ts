import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: path.join(dataDir, 'creatoros.db'),
    driver: sqlite3.Database
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      onboarding_data_json TEXT
    );

    CREATE TABLE IF NOT EXISTS ig_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      ig_user_id TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL,
      followers_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0,
      media_count INTEGER DEFAULT 0,
      profile_picture_url TEXT,
      access_token_encrypted TEXT NOT NULL,
      token_expires_at DATETIME NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS agent_runs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      prompt TEXT,
      result_json TEXT NOT NULL,
      is_simulated INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS scheduled_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      caption TEXT,
      media_url TEXT NOT NULL,
      media_type TEXT NOT NULL, -- REELS, CAROUSEL, IMAGE
      status TEXT NOT NULL, -- 'draft', 'pending_approval', 'approved', 'published', 'failed'
      scheduled_at DATETIME,
      published_at DATETIME,
      ig_media_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS analytics_cache (
      id TEXT PRIMARY KEY,
      ig_user_id TEXT NOT NULL,
      metric TEXT NOT NULL,
      value INTEGER NOT NULL,
      period_start DATETIME,
      period_end DATETIME,
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return dbInstance;
}
