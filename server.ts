import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("sidapek.db");

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

  -- Migration for existing tables
  PRAGMA table_info(residents);

  CREATE INDEX IF NOT EXISTS idx_residents_nama ON residents(nama);
  CREATE INDEX IF NOT EXISTS idx_residents_rt ON residents(rt);
  CREATE INDEX IF NOT EXISTS idx_residents_dusun ON residents(dusun);
  CREATE INDEX IF NOT EXISTS idx_residents_no_kk ON residents(no_kk);
  CREATE INDEX IF NOT EXISTS idx_residents_status_hubungan ON residents(status_hubungan);
`);

// Add missing columns if they don't exist
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
if (!userColumnNames.includes('permissions')) {
  db.exec("ALTER TABLE users ADD COLUMN permissions TEXT");
}
if (!userColumnNames.includes('photo_url')) {
  db.exec("ALTER TABLE users ADD COLUMN photo_url TEXT");
}

newColumns.forEach(col => {
  if (!columnNames.includes(col.name)) {
    db.exec(`ALTER TABLE residents ADD COLUMN ${col.name} ${col.type}`);
  }
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

// Insert default admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!adminExists) {
  db.prepare("INSERT INTO users (username, password, nama_lengkap, role, status) VALUES (?, ?, ?, ?, ?)").run(
    "admin",
    "123",
    "Administrator Sistem",
    "Admin",
    "Active"
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // --- API ROUTES ---

  // Proxy for GAS to avoid CORS issues
  app.post("/api/gas-proxy", async (req, res) => {
    const { url, body } = req.body;
    
    if (!url || !url.startsWith('https://script.google.com/macros/s/')) {
      console.error('Invalid GAS URL received:', url);
      return res.status(400).json({ status: 'error', message: 'Invalid GAS URL' });
    }

    console.log(`Proxying request to GAS: ${url} (Action: ${body?.action})`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for GAS

      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'text/plain',
          'User-Agent': 'SIDAPEK-Proxy/1.0'
        },
        body: JSON.stringify(body),
        signal: controller.signal as any
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GAS responded with status ${response.status}:`, errorText);
        return res.status(response.status).json({ 
          status: 'error', 
          message: `Google Apps Script returned error ${response.status}`,
          details: errorText
        });
      }

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        res.json(json);
      } catch (e) {
        console.error('Failed to parse GAS response as JSON. Raw response:', text);
        res.status(500).json({ 
          status: 'error', 
          message: 'GAS response was not valid JSON', 
          details: text.substring(0, 500) // Limit details size
        });
      }
    } catch (error: any) {
      console.error('GAS Proxy Error:', error);
      const isTimeout = error.name === 'AbortError';
      res.status(500).json({ 
        status: 'error', 
        message: isTimeout ? 'Request ke Google Apps Script timeout (60s)' : 'Gagal menghubungi Google Apps Script: ' + error.message 
      });
    }
  });

  // Auth
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    
    if (user) {
      if (user.status !== 'Active') return res.status(403).json({ status: 'error', message: 'Akun dinonaktifkan' });
      const token = Math.random().toString(36).substring(2);
      db.prepare("UPDATE users SET token = ? WHERE username = ?").run(token, username);
      
      // Default permissions for Admin if not set
      let permissions = user.permissions;
      if (!permissions && user.role === 'Admin') {
        permissions = JSON.stringify(['dashboard', 'residents', 'reports', 'users', 'logs', 'settings', 'profile']);
      } else if (!permissions) {
        permissions = JSON.stringify(['dashboard', 'residents', 'profile']);
      }

      res.json({ status: 'success', user: { ...user, token, password: '', permissions } });
      
      db.prepare("INSERT INTO activity_logs (username, nama_lengkap, action, detail) VALUES (?, ?, ?, ?)").run(
        username, user.nama_lengkap, 'Login', 'User berhasil login'
      );
    } else {
      res.status(401).json({ status: 'error', message: 'Username atau password salah' });
    }
  });

  // Middleware to check token
  const auth = (req: any, res: any, next: any) => {
    // Allow public access to stats
    if (req.path === '/api/stats' && req.method === 'GET') {
      return next();
    }
    
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    const user = db.prepare("SELECT * FROM users WHERE token = ?").get(token) as any;
    if (!user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    req.user = user;
    next();
  };

  // Dashboard Stats
  app.get("/api/stats", auth, (req: any, res) => {
    const totalPenduduk = db.prepare("SELECT COUNT(*) as count FROM residents").get() as any;
    const totalLakiLaki = db.prepare("SELECT COUNT(*) as count FROM residents WHERE UPPER(jenis_kelamin) = 'LAKI-LAKI'").get() as any;
    const totalPerempuan = db.prepare("SELECT COUNT(*) as count FROM residents WHERE UPPER(jenis_kelamin) = 'PEREMPUAN'").get() as any;
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
    
    const totalKK = db.prepare("SELECT COUNT(*) as count FROM residents WHERE UPPER(status_hubungan) = 'KEPALA KELUARGA'").get() as any;
    const totalKKLakiLaki = db.prepare("SELECT COUNT(*) as count FROM residents WHERE UPPER(status_hubungan) = 'KEPALA KELUARGA' AND UPPER(jenis_kelamin) = 'LAKI-LAKI'").get() as any;
    const totalKKPerempuan = db.prepare("SELECT COUNT(*) as count FROM residents WHERE UPPER(status_hubungan) = 'KEPALA KELUARGA' AND UPPER(jenis_kelamin) = 'PEREMPUAN'").get() as any;
    
    const totalKelahiran = db.prepare("SELECT COUNT(*) as count FROM kelahiran").get() as any;
    const totalKematian = db.prepare("SELECT COUNT(*) as count FROM kematian").get() as any;

    const recentLogs = db.prepare("SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 5").all();

    // Age Distribution Logic (Kemenkes Standard)
    const residents = db.prepare("SELECT tanggal_lahir FROM residents").all() as any[];
    const ageGroups = {
      '0-5': 0,
      '6-10': 0,
      '11-19': 0,
      '20-59': 0,
      '60+': 0
    };
    
    let produktif = 0;
    let nonProduktif = 0;

    const now = new Date();
    residents.forEach(r => {
      if (!r.tanggal_lahir) return;
      const birthDate = new Date(r.tanggal_lahir);
      let age = now.getFullYear() - birthDate.getFullYear();
      const m = now.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
        age--;
      }

      // Kemenkes Categories
      if (age <= 5) ageGroups['0-5']++;
      else if (age <= 10) ageGroups['6-10']++;
      else if (age <= 19) ageGroups['11-19']++;
      else if (age <= 59) ageGroups['20-59']++;
      else ageGroups['60+']++;

      // Produktifitas (15-64)
      if (age >= 15 && age <= 64) produktif++;
      else nonProduktif++;
    });

    const ageData = Object.keys(ageGroups).map(key => ({ name: key, value: ageGroups[key as keyof typeof ageGroups] }));
    const productivityData = [
      { name: 'Produktif (15-64)', value: produktif },
      { name: 'Non-Produktif', value: nonProduktif }
    ];

    // Dusun Recap Logic
    const dusunRecap = db.prepare("SELECT dusun as name, COUNT(*) as value FROM residents GROUP BY dusun").all() as any[];

    // RT Recap Logic
    const rtStatsRaw = db.prepare("SELECT rt, COUNT(*) as value FROM residents WHERE rt IS NOT NULL AND rt != '' GROUP BY rt ORDER BY rt ASC").all() as any[];
    const rtStats = rtStatsRaw.map(r => ({ name: `RT ${String(r.rt).padStart(3, '0')}`, value: r.value }));

    res.json({
      status: 'success',
      data: {
        totalPenduduk: totalPenduduk.count,
        totalLakiLaki: totalLakiLaki.count,
        totalPerempuan: totalPerempuan.count,
        totalUsers: totalUsers.count,
        totalKK: totalKK.count,
        totalKKLakiLaki: totalKKLakiLaki.count,
        totalKKPerempuan: totalKKPerempuan.count,
        totalKelahiran: totalKelahiran.count,
        totalKematian: totalKematian.count,
        recentLogs,
        rtStats,
        genderData: [
          { name: 'Laki-laki', value: totalLakiLaki.count },
          { name: 'Perempuan', value: totalPerempuan.count }
        ],
        ageData,
        productivityData,
        dusunData: dusunRecap
      }
    });
  });

  // Change Password
  app.post("/api/change-password", auth, (req: any, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(req.user.username, oldPassword) as any;
    
    if (user) {
      db.prepare("UPDATE users SET password = ? WHERE username = ?").run(newPassword, req.user.username);
      db.prepare("INSERT INTO activity_logs (username, nama_lengkap, action, detail) VALUES (?, ?, ?, ?)").run(
        req.user.username, req.user.nama_lengkap, 'Ganti Password', 'User berhasil mengubah password sendiri'
      );
      res.json({ status: 'success' });
    } else {
      res.status(400).json({ status: 'error', message: 'Password lama salah' });
    }
  });

  // Update Profile
  app.post("/api/update-profile", auth, (req: any, res) => {
    const { nama_lengkap, email, photo_url } = req.body;
    db.prepare("UPDATE users SET nama_lengkap = ?, email = ?, photo_url = ? WHERE username = ?").run(nama_lengkap, email, photo_url, req.user.username);
    db.prepare("INSERT INTO activity_logs (username, nama_lengkap, action, detail) VALUES (?, ?, ?, ?)").run(
      req.user.username, req.user.nama_lengkap, 'Update Profil', `Mengubah profil: ${nama_lengkap}`
    );
    res.json({ status: 'success' });
  });

  // Village Info
  app.get("/api/village-info", auth, (req, res) => {
    const info = db.prepare("SELECT * FROM settings WHERE key = 'village_info'").get() as any;
    const defaultInfo = {
      nama_desa: 'Desa Contoh',
      kecamatan: 'Kecamatan Makmur',
      kabupaten: 'Kabupaten Sejahtera',
      provinsi: 'Provinsi Jaya',
      kode_pos: '12345',
      alamat_kantor: 'Jl. Balai Desa No. 1',
      nama_kepala_desa: 'Bpk. Kepala Desa'
    };
    res.json({ status: 'success', data: info ? JSON.parse(info.value) : defaultInfo });
  });

  app.post("/api/village-info", auth, (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ status: 'error', message: 'Forbidden' });
    const data = req.body;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run('village_info', JSON.stringify(data));
    db.prepare("INSERT INTO activity_logs (username, nama_lengkap, action, detail) VALUES (?, ?, ?, ?)").run(
      req.user.username, req.user.nama_lengkap, 'Update Info Desa', 'Memperbarui informasi desa'
    );
    res.json({ status: 'success' });
  });

  // Village Data (Institutions)
  app.get("/api/village-data-all", auth, (req, res) => {
    const data: Record<string, any> = {};
    
    // Get all from village_data table
    const villageRows = db.prepare("SELECT key, value FROM village_data").all() as any[];
    villageRows.forEach(row => {
      data[row.key] = JSON.parse(row.value);
    });
    
    // Get kelahiran and kematian
    data['kelahiran'] = db.prepare("SELECT * FROM kelahiran ORDER BY timestamp DESC").all();
    data['kematian'] = db.prepare("SELECT * FROM kematian ORDER BY timestamp DESC").all();
    
    res.json({ status: 'success', data });
  });

  app.get("/api/village-data/:key", auth, (req, res) => {
    const { key } = req.params;
    if (key === 'kelahiran') {
      const data = db.prepare("SELECT * FROM kelahiran ORDER BY timestamp DESC").all();
      return res.json({ status: 'success', data });
    }
    if (key === 'kematian') {
      const data = db.prepare("SELECT * FROM kematian ORDER BY timestamp DESC").all();
      return res.json({ status: 'success', data });
    }
    const data = db.prepare("SELECT * FROM village_data WHERE key = ?").get(key) as any;
    res.json({ status: 'success', data: data ? JSON.parse(data.value) : [] });
  });

  app.post("/api/village-data/:key", auth, (req: any, res) => {
    const { key } = req.params;
    const data = req.body;
    db.prepare("INSERT OR REPLACE INTO village_data (key, value) VALUES (?, ?)").run(key, JSON.stringify(data));
    db.prepare("INSERT INTO activity_logs (username, nama_lengkap, action, detail) VALUES (?, ?, ?, ?)").run(
      req.user.username, req.user.nama_lengkap, 'Update Data Desa', `Memperbarui data lembaga: ${key}`
    );
    res.json({ status: 'success' });
  });

  // Bulk Import Residents
  app.post("/api/residents/import", auth, (req: any, res) => {
    const data = req.body; // Array of resident objects
    if (!Array.isArray(data)) return res.status(400).json({ status: 'error', message: 'Data harus berupa array' });

    const checkNik = db.prepare("SELECT nik FROM residents WHERE nik = ?");
    const insert = db.prepare(`
      INSERT INTO residents (
        nik, no_kk, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, 
        alamat, rt, rw, dusun, agama, status_perkawinan, pendidikan, 
        pekerjaan, status_hubungan, kewarganegaraan, nama_ayah, nama_ibu, golongan_darah,
        jabatan, lembaga, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let success = 0;
    let failed = 0;
    const failedDetails: any[] = [];

    const transaction = db.transaction((residents) => {
      for (const r of residents) {
        try {
          const existing = checkNik.get(r.nik);
          if (existing) {
            failed++;
            failedDetails.push({ nik: r.nik, nama: r.nama, reason: 'NIK Ganda' });
            continue;
          }

          const now = new Date().toISOString();
          insert.run(
            r.nik, r.no_kk, r.nama, r.tempat_lahir, r.tanggal_lahir, r.jenis_kelamin,
            r.alamat, r.rt, r.rw, r.dusun, r.agama, r.status_perkawinan, r.pendidikan,
            r.pekerjaan, r.status_hubungan, r.kewarganegaraan || 'WNI', r.nama_ayah, r.nama_ibu, r.golongan_darah,
            r.jabatan || '', r.lembaga || 'None', now, now
          );
          success++;
        } catch (e: any) {
          failed++;
          failedDetails.push({ nik: r.nik, nama: r.nama, reason: e.message });
        }
      }
    });

    try {
      transaction(data);
      db.prepare("INSERT INTO activity_logs (username, nama_lengkap, action, detail) VALUES (?, ?, ?, ?)").run(
        req.user.username, req.user.nama_lengkap, 'Impor Data', `Mengimpor ${success} data (Gagal: ${failed})`
      );
      res.json({ status: 'success', success, failed, failedDetails });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Residents CRUD
  app.get("/api/residents", auth, (req, res) => {
    const residents = db.prepare("SELECT * FROM residents ORDER BY created_at DESC").all();
    res.json({ status: 'success', data: residents });
  });

  app.get("/api/residents/family/:no_kk", auth, (req, res) => {
    const { no_kk } = req.params;
    const family = db.prepare("SELECT * FROM residents WHERE no_kk = ?").all();
    res.json({ status: 'success', data: family });
  });

  app.get("/api/residents/history/:nik", auth, (req, res) => {
    const { nik } = req.params;
    const history = db.prepare("SELECT * FROM resident_history WHERE nik = ? ORDER BY timestamp DESC").all();
    res.json({ status: 'success', data: history });
  });

  app.post("/api/residents", auth, (req: any, res) => {
    const data = req.body;
    const existing = db.prepare("SELECT * FROM residents WHERE nik = ?").get(data.nik) as any;
    
    if (existing) {
      const fields = Object.keys(data).filter(k => k !== 'nik' && k !== 'created_at').map(k => `${k} = ?`).join(', ');
      const values = Object.keys(data).filter(k => k !== 'nik' && k !== 'created_at').map(k => data[k]);
      db.prepare(`UPDATE residents SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE nik = ?`).run(...values, data.nik);
      
      // Calculate changes for history
      const changes: any = {};
      Object.keys(data).forEach(key => {
        const oldVal = existing[key] === null || existing[key] === undefined ? '' : String(existing[key]);
        const newVal = data[key] === null || data[key] === undefined ? '' : String(data[key]);
        
        if (newVal !== oldVal && key !== 'updated_at' && key !== 'created_at') {
          changes[key] = { old: oldVal, new: newVal };
        }
      });

      if (Object.keys(changes).length > 0) {
        db.prepare("INSERT INTO resident_history (nik, username, action, changes) VALUES (?, ?, ?, ?)").run(
          data.nik, req.user.username, 'Update', JSON.stringify(changes)
        );
      }

      const isPindahRT = changes.rt || changes.rw;
      const logAction = isPindahRT ? 'Pindah RT' : 'Update Penduduk';
      const logDetail = isPindahRT 
        ? `Pindah RT/RW: ${data.nama} (Dari ${existing.rt}/${existing.rw} ke ${data.rt}/${data.rw})`
        : `Mengubah data: ${data.nama}`;

      db.prepare("INSERT INTO activity_logs (username, nama_lengkap, action, detail) VALUES (?, ?, ?, ?)").run(
        req.user.username, req.user.nama_lengkap, logAction, logDetail
      );
    } else {
      const keys = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      db.prepare(`INSERT INTO residents (${keys}) VALUES (${placeholders})`).run(...values);
      
      db.prepare("INSERT INTO resident_history (nik, username, action, changes) VALUES (?, ?, ?, ?)").run(
        data.nik, req.user.username, 'Create', JSON.stringify({ message: 'Data penduduk baru dibuat' })
      );

      db.prepare("INSERT INTO activity_logs (username, nama_lengkap, action, detail) VALUES (?, ?, ?, ?)").run(
        req.user.username, req.user.nama_lengkap, 'Tambah Penduduk', `Menambah data: ${data.nama}`
      );
    }
    res.json({ status: 'success' });
  });

  app.post("/api/residents/kelahiran", auth, (req: any, res) => {
    const { resident, berat_lahir, panjang_lahir, is_dead, tanggal_kematian, tempat_kematian, penyebab } = req.body;
    
    const transaction = db.transaction(() => {
      // Add to residents only if not dead
      if (!is_dead) {
        const keys = Object.keys(resident).join(', ');
        const placeholders = Object.keys(resident).map(() => '?').join(', ');
        const values = Object.values(resident);
        db.prepare(`INSERT INTO residents (${keys}) VALUES (${placeholders})`).run(...values);
      }

      // Add to kelahiran
      db.prepare(`
        INSERT INTO kelahiran (nik, no_kk, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, nama_ayah, nama_ibu, berat_lahir, panjang_lahir, operator)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        resident.nik, resident.no_kk, resident.nama, resident.tempat_lahir, resident.tanggal_lahir, resident.jenis_kelamin,
        resident.nama_ayah, resident.nama_ibu, berat_lahir, panjang_lahir, req.user.username
      );

      // If dead, add to kematian
      if (is_dead) {
        db.prepare(`
          INSERT INTO kematian (nik, no_kk, nama, jenis_kelamin, tanggal_lahir, tanggal_kematian, tempat_kematian, penyebab, alamat, rt, rw, dusun, operator)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          resident.nik, resident.no_kk, resident.nama, resident.jenis_kelamin, resident.tanggal_lahir,
          tanggal_kematian, tempat_kematian, penyebab, resident.alamat, resident.rt, resident.rw, resident.dusun, req.user.username
        );
      }

      db.prepare("INSERT INTO activity_logs (username, nama_lengkap, action, detail) VALUES (?, ?, ?, ?)").run(
        req.user.username, req.user.nama_lengkap, 'Tambah Kelahiran', `Mencatat kelahiran: ${resident.nama}${is_dead ? ' (Meninggal)' : ''}`
      );
    });

    try {
      transaction();
      res.json({ status: 'success' });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  app.post("/api/residents/kematian", auth, (req: any, res) => {
    const { nik, tanggal_kematian, tempat_kematian, penyebab } = req.body;
    
    const transaction = db.transaction(() => {
      const resident = db.prepare("SELECT * FROM residents WHERE nik = ?").get(nik) as any;
      if (!resident) throw new Error('Data penduduk tidak ditemukan');

      // Add to kematian
      db.prepare(`
        INSERT INTO kematian (nik, no_kk, nama, jenis_kelamin, tanggal_lahir, tanggal_kematian, tempat_kematian, penyebab, alamat, rt, rw, dusun, operator)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        resident.nik, resident.no_kk, resident.nama, resident.jenis_kelamin, resident.tanggal_lahir,
        tanggal_kematian, tempat_kematian, penyebab, resident.alamat, resident.rt, resident.rw, resident.dusun, req.user.username
      );

      // Delete from residents
      db.prepare("DELETE FROM residents WHERE nik = ?").run(nik);

      db.prepare("INSERT INTO activity_logs (username, nama_lengkap, action, detail) VALUES (?, ?, ?, ?)").run(
        req.user.username, req.user.nama_lengkap, 'Tambah Kematian', `Mencatat kematian: ${resident.nama}`
      );
    });

    try {
      transaction();
      res.json({ status: 'success' });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  app.delete("/api/residents/kelahiran/:nik", auth, (req: any, res) => {
    const { nik } = req.params;
    const record = db.prepare("SELECT nama FROM kelahiran WHERE nik = ?").get(nik) as any;
    if (record) {
      db.prepare("DELETE FROM kelahiran WHERE nik = ?").run(nik);
      db.prepare("INSERT INTO activity_logs (username, nama_lengkap, action, detail) VALUES (?, ?, ?, ?)").run(
        req.user.username, req.user.nama_lengkap, 'Hapus Kelahiran', `Menghapus data kelahiran: ${record.nama}`
      );
      res.json({ status: 'success' });
    } else {
      res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
    }
  });

  app.delete("/api/residents/kematian/:nik", auth, (req: any, res) => {
    const { nik } = req.params;
    const record = db.prepare("SELECT nama FROM kematian WHERE nik = ?").get(nik) as any;
    if (record) {
      db.prepare("DELETE FROM kematian WHERE nik = ?").run(nik);
      db.prepare("INSERT INTO activity_logs (username, nama_lengkap, action, detail) VALUES (?, ?, ?, ?)").run(
        req.user.username, req.user.nama_lengkap, 'Hapus Kematian', `Menghapus data kematian: ${record.nama}`
      );
      res.json({ status: 'success' });
    } else {
      res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
    }
  });

  app.post("/api/residents/move-family-rt", auth, (req: any, res) => {
    const { no_kk, rt, rw, dusun, alamat, members } = req.body;
    
    const transaction = db.transaction(() => {
      // Update all members in the family
      const updateStmt = db.prepare(`
        UPDATE residents 
        SET rt = ?, rw = ?, dusun = ?, alamat = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE no_kk = ?
      `);
      updateStmt.run(rt, rw, dusun, alamat, no_kk);

      // Log the action
      db.prepare("INSERT INTO activity_logs (username, nama_lengkap, action, detail) VALUES (?, ?, ?, ?)").run(
        req.user.username, req.user.nama_lengkap, 'Pindah RT Keluarga', 
        `Memindahkan keluarga (KK: ${no_kk}) ke RT ${rt}/RW ${rw}`
      );

      // Add to history for each member
      const historyStmt = db.prepare("INSERT INTO resident_history (nik, username, action, changes) VALUES (?, ?, ?, ?)");
      for (const nik of members) {
        historyStmt.run(nik, req.user.username, 'Pindah RT', JSON.stringify({ 
          message: `Pindah RT Keluarga ke ${rt}/${rw}`,
          rt: { new: rt },
          rw: { new: rw },
          dusun: { new: dusun },
          alamat: { new: alamat }
        }));
      }
    });

    try {
      transaction();
      res.json({ status: 'success' });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  app.delete("/api/residents/:nik", auth, (req: any, res) => {
    const { nik } = req.params;
    const resident = db.prepare("SELECT nama FROM residents WHERE nik = ?").get(nik) as any;
    if (resident) {
      db.prepare("DELETE FROM residents WHERE nik = ?").run(nik);
      db.prepare("INSERT INTO activity_logs (username, nama_lengkap, action, detail) VALUES (?, ?, ?, ?)").run(
        req.user.username, req.user.nama_lengkap, 'Hapus Penduduk', `Menghapus data: ${resident.nama}`
      );
      res.json({ status: 'success' });
    } else {
      res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
    }
  });

  // Bulk Delete Residents
  app.post("/api/residents/bulk-delete", auth, (req: any, res) => {
    const { niks } = req.body;
    if (!Array.isArray(niks) || niks.length === 0) {
      return res.status(400).json({ status: 'error', message: 'NIK tidak valid' });
    }

    const deleteStmt = db.prepare("DELETE FROM residents WHERE nik = ?");
    const getResident = db.prepare("SELECT nama FROM residents WHERE nik = ?");
    
    let deletedCount = 0;
    const names: string[] = [];

    const transaction = db.transaction((nikList) => {
      for (const nik of nikList) {
        const resident = getResident.get(nik) as any;
        if (resident) {
          names.push(resident.nama);
          deleteStmt.run(nik);
          deletedCount++;
        }
      }
    });

    try {
      transaction(niks);
      db.prepare("INSERT INTO activity_logs (username, nama_lengkap, action, detail) VALUES (?, ?, ?, ?)").run(
        req.user.username, req.user.nama_lengkap, 'Hapus Massal', `Menghapus ${deletedCount} penduduk: ${names.slice(0, 5).join(', ')}${names.length > 5 ? '...' : ''}`
      );
      res.json({ status: 'success', message: `${deletedCount} penduduk berhasil dihapus` });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Users CRUD (Admin Only)
  app.get("/api/users", auth, (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ status: 'error', message: 'Forbidden' });
    const users = db.prepare("SELECT username, nama_lengkap, role, status, email, permissions FROM users").all();
    res.json({ status: 'success', data: users });
  });

  app.post("/api/users", auth, (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ status: 'error', message: 'Forbidden' });
    const data = req.body;
    const existing = db.prepare("SELECT username FROM users WHERE username = ?").get(data.username);
    
    if (data.isEdit) {
      if (data.password) {
        db.prepare("UPDATE users SET password = ?, nama_lengkap = ?, role = ?, status = ?, email = ?, permissions = ?, photo_url = ? WHERE username = ?").run(
          data.password, data.nama_lengkap, data.role, data.status, data.email, data.permissions, data.photo_url, data.username
        );
      } else {
        db.prepare("UPDATE users SET nama_lengkap = ?, role = ?, status = ?, email = ?, permissions = ?, photo_url = ? WHERE username = ?").run(
          data.nama_lengkap, data.role, data.status, data.email, data.permissions, data.photo_url, data.username
        );
      }
    } else {
      if (existing) return res.status(400).json({ status: 'error', message: 'Username sudah ada' });
      db.prepare("INSERT INTO users (username, password, nama_lengkap, role, status, email, permissions, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
        data.username, data.password, data.nama_lengkap, data.role, data.status, data.email, data.permissions, data.photo_url
      );
    }
    res.json({ status: 'success' });
  });

  app.delete("/api/users/:username", auth, (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ status: 'error', message: 'Forbidden' });
    const { username } = req.params;
    if (username === 'admin') return res.status(400).json({ status: 'error', message: 'Admin utama tidak bisa dihapus' });
    db.prepare("DELETE FROM users WHERE username = ?").run(username);
    res.json({ status: 'success' });
  });

  // Activity Logs
  app.get("/api/logs", auth, (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ status: 'error', message: 'Forbidden' });
    
    // Auto-delete logs older than 24 hours
    db.prepare("DELETE FROM activity_logs WHERE timestamp < datetime('now', '-1 day')").run();
    
    const logs = db.prepare("SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 1000").all();
    res.json({ status: 'success', data: logs });
  });

  app.post("/api/upload-photo", auth, (req: any, res) => {
    const { base64 } = req.body;
    if (!base64) return res.status(400).json({ status: 'error', message: 'No image data provided' });
    
    // In a real app, we would save this to a file or cloud storage.
    // For this environment, we'll return the base64 as a data URL.
    const photoUrl = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
    
    res.json({ status: 'success', photo_url: photoUrl });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
