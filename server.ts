import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = (() => {
  try {
    const database = new Database("sidapek.db");
    return database;
  } catch (e) {
    console.error("Failed to initialize SQLite database. This is expected on Vercel if using Google Sheets mode.", e);
    return null;
  }
})();

if (db) {
  // Initialize Database
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      nama_lengkap TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      email TEXT,
      token TEXT,
      photo_url TEXT,
      permissions TEXT
    );

    CREATE TABLE IF NOT EXISTS residents (
      nik TEXT PRIMARY KEY,
      no_kk TEXT,
      nama TEXT NOT NULL,
      tempat_lahir TEXT,
      tanggal_lahir TEXT,
      jenis_kelamin TEXT,
      alamat TEXT,
      rt TEXT,
      rw TEXT,
      dusun TEXT,
      agama TEXT,
      status_perkawinan TEXT,
      pendidikan TEXT,
      pekerjaan TEXT,
      status_hubungan TEXT,
      kewarganegaraan TEXT DEFAULT 'WNI',
      nama_ayah TEXT,
      nama_ibu TEXT,
      golongan_darah TEXT,
      jabatan TEXT,
      lembaga TEXT DEFAULT 'None',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS village_data (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    
    CREATE TABLE IF NOT EXISTS kelahiran (
      nik TEXT PRIMARY KEY,
      no_kk TEXT,
      nama TEXT NOT NULL,
      tempat_lahir TEXT,
      tanggal_lahir TEXT,
      jenis_kelamin TEXT,
      nama_ayah TEXT,
      nama_ibu TEXT,
      berat_lahir TEXT,
      panjang_lahir TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      operator TEXT
    );

    CREATE TABLE IF NOT EXISTS kematian (
      nik TEXT PRIMARY KEY,
      no_kk TEXT,
      nama TEXT NOT NULL,
      jenis_kelamin TEXT,
      tanggal_lahir TEXT,
      tanggal_kematian TEXT,
      tempat_kematian TEXT,
      penyebab TEXT,
      alamat TEXT,
      rt TEXT,
      rw TEXT,
      dusun TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      operator TEXT
    );

    PRAGMA table_info(residents);
    CREATE INDEX IF NOT EXISTS idx_residents_nama ON residents(nama);
    CREATE INDEX IF NOT EXISTS idx_residents_rt ON residents(rt);
    CREATE INDEX IF NOT EXISTS idx_residents_dusun ON residents(dusun);
    CREATE INDEX IF NOT EXISTS idx_residents_no_kk ON residents(no_kk);
    CREATE INDEX IF NOT EXISTS idx_residents_status_hubungan ON residents(status_hubungan);
  `);

  const columns = db.prepare("PRAGMA table_info(residents)").all() as any[];
  const columnNames = columns.map(c => c.name);
  const newColumns = [
    { name: 'no_kk', type: 'TEXT' },
    { name: 'status_hubungan', type: 'TEXT' },
    { name: 'kewarganegaraan', type: 'TEXT DEFAULT "WNI"' },
    { name: 'nama_ayah', type: 'TEXT' },
    { name: 'nama_ibu', type: 'TEXT' },
    { name: 'jabatan', type: 'TEXT' },
    { name: 'lembaga', type: 'TEXT DEFAULT "None"' }
  ];

  const userColumns = db.prepare("PRAGMA table_info(users)").all() as any[];
  const userColumnNames = userColumns.map(c => c.name);
  if (!userColumnNames.includes('permissions')) db.exec("ALTER TABLE users ADD COLUMN permissions TEXT");
  if (!userColumnNames.includes('photo_url')) db.exec("ALTER TABLE users ADD COLUMN photo_url TEXT");

  newColumns.forEach(col => {
    if (!columnNames.includes(col.name)) db.exec(`ALTER TABLE residents ADD COLUMN ${col.name} ${col.type}`);
  });

  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      username TEXT,
      nama_lengkap TEXT,
      action TEXT,
      detail TEXT
    );
    CREATE TABLE IF NOT EXISTS resident_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nik TEXT,
      username TEXT,
      action TEXT,
      changes TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
  if (!adminExists) {
    db.prepare("INSERT INTO users (username, password, nama_lengkap, role, status) VALUES (?, ?, ?, ?, ?)").run(
      "admin", "123", "Administrator Sistem", "Admin", "Active"
    );
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Proxy for GAS
  app.post("/api/gas-proxy", async (req, res) => {
    const { url, body } = req.body;
    if (!url || !url.startsWith('https://script.google.com/macros/s/')) {
      return res.status(400).json({ status: 'error', message: 'Invalid GAS URL' });
    }
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(body)
      });
      const text = await response.text();
      try { res.json(JSON.parse(text)); } catch (e) { res.status(500).json({ status: 'error', message: 'Invalid JSON from GAS', details: text }); }
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // Auth
  app.post("/api/login", (req, res) => {
    if (!db) return res.status(500).json({ status: 'error', message: 'Database not available' });
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    if (user) {
      const token = Math.random().toString(36).substring(2);
      db.prepare("UPDATE users SET token = ? WHERE username = ?").run(token, username);
      res.json({ status: 'success', user: { ...user, token, password: '' } });
    } else {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }
  });

  const auth = (req: any, res: any, next: any) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    if (!db) return next();
    const user = db.prepare("SELECT * FROM users WHERE token = ?").get(token) as any;
    if (!user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    req.user = user;
    next();
  };

  // Basic routes for local dev
  app.get("/api/residents", auth, (req, res) => {
    if (!db) return res.json({ status: 'success', data: [] });
    res.json({ status: 'success', data: db.prepare("SELECT * FROM residents").all() });
  });

  app.get("/api/stats", auth, (req, res) => {
    if (!db) return res.json({ status: 'success', data: {} });
    res.json({ status: 'success', data: { totalPenduduk: db.prepare("SELECT COUNT(*) as count FROM residents").get() } });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
export default {};
