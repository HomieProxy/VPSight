
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'db');
const DB_PATH = path.join(DB_DIR, 'vpsight.sqlite');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const db = new Database(DB_PATH);

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS vps_instances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      group_name TEXT,
      ip_address TEXT,
      country_region TEXT,
      agent_version TEXT,
      secret TEXT UNIQUE NOT NULL,
      install_command TEXT,
      note_billing_start_date TEXT,
      note_billing_end_date TEXT,
      note_billing_cycle TEXT,
      note_billing_amount TEXT,
      note_plan_bandwidth TEXT,
      note_plan_traffic_type INTEGER, -- 0: Both, 1: Outbound only, 2: Inbound only
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const adminExists = db.prepare('SELECT id FROM admins LIMIT 1').get();

  if (!adminExists) {
    const defaultUsername = process.env.INITIAL_ADMIN_USERNAME || 'admin';
    const defaultPassword = process.env.INITIAL_ADMIN_PASSWORD || 'changeme'; 
    
    if (defaultPassword === 'changeme' && process.env.NODE_ENV === 'production') {
        console.warn("WARNING: Default admin password is 'changeme'. This is insecure for production. Please set a strong INITIAL_ADMIN_PASSWORD environment variable or change it immediately.");
    } else if (defaultPassword === 'changeme') {
        console.log("INFO: Default admin account 'admin' created with password 'changeme'. Please change this password in a production environment or by setting INITIAL_ADMIN_PASSWORD.");
    }

    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
    
    try {
      db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)')
        .run(defaultUsername, hashedPassword);
      console.log(`Initial admin user '${defaultUsername}' created.`);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.log(`Admin user '${defaultUsername}' already exists or was concurrently created.`);
      } else {
        console.error('Failed to create initial admin user:', error);
        throw error; 
      }
    }
  }
}

initializeDatabase();
