/**
 * SIDAPEK - Sistem Informasi Data Penduduk
 * Backend Script for Google Apps Script
 */

const CONFIG = {
  SPREADSHEET_ID: "", // MASUKKAN ID SPREADSHEET DI SINI JIKA SCRIPT TIDAK TERHUBUNG OTOMATIS
  SHEETS: {
    RESIDENTS: "residents",
    USERS: "users",
    LOGS: "logs",
    SETTINGS: "settings",
    DATA_DESA: "datadesa",
    HISTORY: "history",
    KELAHIRAN: "kelahiran",
    KEMATIAN: "kematian"
  },
  DRIVE_FOLDER_ID: "", // MASUKKAN ID FOLDER GOOGLE DRIVE DI SINI
  SECRET_KEY: "sidapek_secret_key_123"
};

/**
 * Initialize Spreadsheet and Sheets if they don't exist
 * Can be run manually from the Apps Script editor to setup the environment
 */
function setup() {
  try {
    const ss = initSpreadsheet();
    Logger.log("Spreadsheet initialized successfully: " + ss.getUrl());
    return "Setup berhasil! Silakan buka Web App Anda.";
  } catch (e) {
    Logger.log("Setup gagal: " + e.toString());
    return "Setup gagal: " + e.toString();
  }
}

function initSpreadsheet() {
  let ss;
  try {
    ss = CONFIG.SPREADSHEET_ID 
      ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID) 
      : SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    throw new Error("Tidak dapat mengakses Spreadsheet. Jika ini script mandiri (standalone), silakan isi SPREADSHEET_ID di Code.gs.");
  }
  
  if (!ss) {
    throw new Error("Spreadsheet tidak ditemukan. Pastikan script ini terhubung ke Spreadsheet atau SPREADSHEET_ID sudah benar.");
  }

  // Ensure Residents Sheet
  let residentSheet = ss.getSheetByName(CONFIG.SHEETS.RESIDENTS);
  if (!residentSheet) {
    residentSheet = ss.insertSheet(CONFIG.SHEETS.RESIDENTS);
    residentSheet.appendRow([
      "nik", "no_kk", "nama", "tempat_lahir", "tanggal_lahir", "jenis_kelamin", 
      "alamat", "rt", "rw", "dusun", "agama", "status_perkawinan", 
      "pendidikan", "pekerjaan", "status_hubungan", "kewarganegaraan", 
      "nama_ayah", "nama_ibu", "golongan_darah", "jabatan", "lembaga", "created_at", "updated_at"
    ]);
    residentSheet.setFrozenRows(1);
  }

  // Ensure Users Sheet
  let userSheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  if (!userSheet) {
    userSheet = ss.insertSheet(CONFIG.SHEETS.USERS);
    userSheet.appendRow(["username", "password", "nama_lengkap", "role", "status", "email", "photo_url", "permissions", "token", "created_at"]);
    userSheet.setFrozenRows(1);
    // Add default admin
    userSheet.appendRow(["admin", "123", "Administrator", "Admin", "Active", "", "", "[]", "", new Date()]);
  }

  // Ensure Logs Sheet
  let logSheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
  if (!logSheet) {
    logSheet = ss.insertSheet(CONFIG.SHEETS.LOGS);
    logSheet.appendRow(["timestamp", "username", "nama_lengkap", "action", "detail"]);
    logSheet.setFrozenRows(1);
  } else {
    // Check if nama_lengkap column exists
    const headers = logSheet.getRange(1, 1, 1, logSheet.getLastColumn()).getValues()[0];
    if (!headers.includes("nama_lengkap")) {
      logSheet.insertColumnAfter(2);
      logSheet.getRange(1, 3).setValue("nama_lengkap");
    }
  }

  // Ensure Settings Sheet
  let settingsSheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(CONFIG.SHEETS.SETTINGS);
    settingsSheet.appendRow(["key", "value"]);
    settingsSheet.setFrozenRows(1);
  }

  // Ensure Data Desa Sheet
  let dataDesaSheet = ss.getSheetByName(CONFIG.SHEETS.DATA_DESA);
  const dataDesaHeaders = [
    "lembaga_id", "Nama Lengkap", "NIK", "No. KK", "Tempat Lahir", "Tanggal Lahir", 
    "Jenis Kelamin", "Pendidikan", "No SK Pengangkatan", "Tanggal SK Pengangkatan", 
    "Jabatan", "NIPD", "Nomor Handphone", "Keterangan"
  ];

  if (!dataDesaSheet) {
    dataDesaSheet = ss.insertSheet(CONFIG.SHEETS.DATA_DESA);
    dataDesaSheet.appendRow(dataDesaHeaders);
    dataDesaSheet.setFrozenRows(1);
  } else {
    // Check if headers match, if not, update them
    const currentHeaders = dataDesaSheet.getRange(1, 1, 1, dataDesaHeaders.length).getValues()[0];
    const headersMatch = dataDesaHeaders.every((h, i) => h === currentHeaders[i]);
    if (!headersMatch) {
      // If headers don't match, we might want to backup or just overwrite headers
      // For this request, we'll ensure they match
      dataDesaSheet.getRange(1, 1, 1, dataDesaHeaders.length).setValues([dataDesaHeaders]);
    }
  }

  // Ensure History Sheet
  let historySheet = ss.getSheetByName(CONFIG.SHEETS.HISTORY);
  if (!historySheet) {
    historySheet = ss.insertSheet(CONFIG.SHEETS.HISTORY);
    historySheet.appendRow(["nik", "username", "action", "changes", "timestamp"]);
    historySheet.setFrozenRows(1);
  }

  initKelahiranKematianSheets(ss);

  return ss;
}

/**
 * Main API Entry Point for POST requests
 */
function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const result = api(request);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Main API Entry Point for GET requests (for simple testing)
 */
function doGet(e) {
  if (e.parameter.action) {
    const result = api(e.parameter);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService.createHtmlOutputFromFile('index.html.gas')
    .setTitle('SIDAPEK - Sistem Informasi Data Penduduk')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Core API Logic
 */
function api(request) {
  try {
    const ss = initSpreadsheet();
    const { action, data, token } = request;

    // Auth Check (except for login)
    let currentUser = null;
    if (action !== 'login') {
      currentUser = validateToken(ss, token);
      if (!currentUser) return { status: 'error', message: 'Sesi berakhir. Silakan login kembali.' };
    }

    switch (action) {
      case 'login':
        return handleLogin(ss, data);
      case 'getStats':
        return getStats(ss);
      case 'getResidents':
        return getResidents(ss);
      case 'saveResident':
        return saveResident(ss, data, currentUser);
      case 'deleteResident':
        return deleteResident(ss, data.nik, currentUser);
      case 'getUsers':
        return getUsers(ss);
      case 'saveUser':
        return saveUser(ss, data, currentUser);
      case 'deleteUser':
        return deleteUser(ss, data.username, currentUser);
      case 'getLogs':
        return getLogs(ss);
      case 'updateProfile':
        return updateProfile(ss, data, currentUser);
      case 'changePassword':
        return changePassword(ss, data, currentUser);
      case 'importResidents':
        return importResidents(ss, data, currentUser);
      case 'getVillageInfo':
        return getVillageInfo(ss);
      case 'updateVillageInfo':
        return updateVillageInfo(ss, data, currentUser);
      case 'getVillageData':
        return getVillageData(ss, data.key);
      case 'getVillageDataAll':
        return getVillageDataAll(ss);
      case 'saveVillageData':
        return saveVillageData(ss, data.key, data.value, currentUser);
      case 'bulkDeleteResidents':
        return bulkDeleteResidents(ss, data.niks, currentUser);
      case 'getResidentHistory':
        return getResidentHistory(ss, data.nik);
      case 'handleKelahiran':
        return handleKelahiran(ss, data, currentUser);
      case 'handleKematian':
        return handleKematian(ss, data, currentUser);
      case 'deleteKelahiran':
        return deleteKelahiran(ss, data.nik, currentUser);
      case 'deleteKematian':
        return deleteKematian(ss, data.nik, currentUser);
      case 'uploadProfilePhoto':
        return uploadProfilePhoto(ss, data, currentUser);
      default:
        return { status: 'error', message: 'Aksi tidak dikenal: ' + action };
    }
  } catch (e) {
    return { status: 'error', message: e.toString() };
  }
}

function validateToken(ss, token) {
  if (!token) return null;
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const tokenIdx = headers.indexOf('token');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][tokenIdx] === token) {
      const user = {};
      headers.forEach((h, idx) => user[h] = data[i][idx]);
      return user;
    }
  }
  return null;
}

function handleLogin(ss, { username, password }) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === username && row[1].toString() === password.toString()) {
      if (row[4] !== 'Active') return { status: 'error', message: 'Akun dinonaktifkan' };
      
      const token = Utilities.getUuid();
      sheet.getRange(i + 1, headers.indexOf('token') + 1).setValue(token);
      
      const user = {};
      headers.forEach((h, idx) => {
        if (h !== 'password') user[h] = row[idx];
      });
      user.token = token;
      
      logActivity(ss, username, 'LOGIN', 'Berhasil masuk ke sistem');
      return { status: 'success', user };
    }
  }
  return { status: 'error', message: 'Username atau password salah' };
}

function getStats(ss) {
  const residentSheet = ss.getSheetByName(CONFIG.SHEETS.RESIDENTS);
  const userSheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  
  const residents = residentSheet.getDataRange().getValues();
  const users = userSheet.getDataRange().getValues();
  
  const headers = residents[0];
  const jkIdx = headers.indexOf('jenis_kelamin');
  const hubIdx = headers.indexOf('status_hubungan');
  const tglIdx = headers.indexOf('tanggal_lahir');
  const dusunIdx = headers.indexOf('dusun');
  
  let male = 0, female = 0, totalKK = 0, kkMale = 0, kkFemale = 0;
  const ageGroups = { '0-5': 0, '6-12': 0, '13-17': 0, '18-35': 0, '36-50': 0, '51+': 0 };
  const dusunMap = {};
  
  const now = new Date();
  
  for (let i = 1; i < residents.length; i++) {
    const row = residents[i];
    
    // Gender
    if (row[jkIdx] === 'Laki-laki') male++;
    else if (row[jkIdx] === 'Perempuan') female++;
    
    // KK
    if (row[hubIdx] === 'Kepala Keluarga') {
      totalKK++;
      if (row[jkIdx] === 'Laki-laki') kkMale++;
      else if (row[jkIdx] === 'Perempuan') kkFemale++;
    }
    
    // Age
    if (row[tglIdx]) {
      const birth = new Date(row[tglIdx]);
      let age = now.getFullYear() - birth.getFullYear();
      if (age <= 5) ageGroups['0-5']++;
      else if (age <= 12) ageGroups['6-12']++;
      else if (age <= 17) ageGroups['13-17']++;
      else if (age <= 35) ageGroups['18-35']++;
      else if (age <= 50) ageGroups['36-50']++;
      else ageGroups['51+']++;
    }
    
    // Dusun
    const dusun = row[dusunIdx] || 'Lainnya';
    dusunMap[dusun] = (dusunMap[dusun] || 0) + 1;
  }
  
  const dusunData = Object.keys(dusunMap).map(name => ({ name, value: dusunMap[name] }));
  const ageData = Object.keys(ageGroups).map(name => ({ name, value: ageGroups[name] }));
  
  const kelahiranSheet = ss.getSheetByName(CONFIG.SHEETS.KELAHIRAN);
  const kematianSheet = ss.getSheetByName(CONFIG.SHEETS.KEMATIAN);
  const totalKelahiran = kelahiranSheet ? kelahiranSheet.getLastRow() - 1 : 0;
  const totalKematian = kematianSheet ? kematianSheet.getLastRow() - 1 : 0;

  return {
    status: 'success',
    data: {
      totalPenduduk: residents.length - 1,
      totalLakiLaki: male,
      totalPerempuan: female,
      totalUsers: users.length - 1,
      totalKK,
      totalKKLakiLaki: kkMale,
      totalKKPerempuan: kkFemale,
      totalKelahiran: totalKelahiran > 0 ? totalKelahiran : 0,
      totalKematian: totalKematian > 0 ? totalKematian : 0,
      genderData: [{ name: 'Laki-laki', value: male }, { name: 'Perempuan', value: female }],
      ageData,
      dusunData,
      recentLogs: getLogs(ss).data.slice(0, 5)
    }
  };
}

function getResidents(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.RESIDENTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    headers.forEach((h, idx) => obj[h] = data[i][idx]);
    result.push(obj);
  }
  
  return { status: 'success', data: result };
}

function saveResident(ss, residentData, currentUser) {
  // Strict Validation
  if (!residentData.nik || !/^\d{16}$/.test(residentData.nik.toString())) {
    return { status: 'error', message: 'NIK harus 16 digit angka' };
  }
  if (residentData.no_kk && !/^\d{16}$/.test(residentData.no_kk.toString())) {
    return { status: 'error', message: 'No. KK harus 16 digit angka' };
  }
  if (residentData.tanggal_lahir) {
    try {
      const birthDate = new Date(residentData.tanggal_lahir);
      if (isNaN(birthDate.getTime()) || birthDate > new Date()) {
        return { status: 'error', message: 'Tanggal lahir tidak valid' };
      }
      // Ensure it's stored as a proper date object for GAS
      residentData.tanggal_lahir = birthDate;
    } catch (e) {
      return { status: 'error', message: 'Format tanggal lahir tidak valid' };
    }
  }

  const sheet = ss.getSheetByName(CONFIG.SHEETS.RESIDENTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const nikIdx = headers.indexOf('nik');
  
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][nikIdx].toString() === residentData.nik.toString()) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const row = headers.map(h => {
    if (h === 'updated_at') return new Date();
    return residentData[h] !== undefined ? residentData[h] : "";
  });

  if (rowIndex > 0) {
    const oldRow = data[rowIndex - 1];
    const changes = {};
    headers.forEach((h, idx) => {
      if (h === 'updated_at' || h === 'created_at') return;
      const oldVal = oldRow[idx] === null || oldRow[idx] === undefined ? '' : String(oldRow[idx]);
      const newVal = residentData[h] === null || residentData[h] === undefined ? '' : String(residentData[h]);
      if (newVal !== oldVal) {
        changes[h] = { old: oldVal, new: newVal };
      }
    });

    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([row]);
    
    const isPindahRT = changes.rt || changes.rw;
    const logAction = isPindahRT ? 'PINDAH_RT' : 'UPDATE_RESIDENT';
    const logDetail = isPindahRT 
      ? `Pindah RT/RW: ${residentData.nama} (Dari ${oldRow[headers.indexOf('rt')]}/${oldRow[headers.indexOf('rw')]} ke ${residentData.rt}/${residentData.rw})`
      : `Memperbarui data penduduk NIK: ${residentData.nik}`;

    logActivity(ss, currentUser.username, logAction, logDetail);
    
    if (Object.keys(changes).length > 0) {
      logResidentHistory(ss, residentData.nik, currentUser.username, 'Update', changes);
    }
  } else {
    row[headers.indexOf('created_at')] = new Date();
    sheet.appendRow(row);
    logActivity(ss, currentUser.username, 'ADD_RESIDENT', `Menambah penduduk baru NIK: ${residentData.nik}`);
    logResidentHistory(ss, residentData.nik, currentUser.username, 'Create', { message: 'Data penduduk baru dibuat' });
  }
  
  sortResidentsSheet(ss);
  return { status: 'success' };
}

function deleteResident(ss, nik, currentUser) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.RESIDENTS);
  const data = sheet.getDataRange().getValues();
  const nikIdx = data[0].indexOf('nik');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][nikIdx].toString() === nik.toString()) {
      sheet.deleteRow(i + 1);
      logActivity(ss, currentUser.username, 'DELETE_RESIDENT', `Menghapus data penduduk NIK: ${nik}`);
      logResidentHistory(ss, nik, currentUser.username, 'Delete', { message: 'Data penduduk dihapus' });
      sortResidentsSheet(ss);
      return { status: 'success' };
    }
  }
  return { status: 'error', message: 'Data tidak ditemukan' };
}

function handleKelahiran(ss, data, currentUser) {
  const { resident, is_dead, tanggal_kematian, tempat_kematian, penyebab } = data;
  
  // Validation: NIK must be 16 digits if provided
  if (resident.nik && !/^\d{16}$/.test(resident.nik.toString())) {
    return { status: 'error', message: 'NIK harus 16 digit angka' };
  }

  // Add to residents only if not dead
  if (!is_dead) {
    const residentResult = saveResident(ss, resident, currentUser);
    if (residentResult.status === 'error') return residentResult;
  }

  // Add to kelahiran sheet
  const birthSheet = ss.getSheetByName(CONFIG.SHEETS.KELAHIRAN);
  const birthHeaders = birthSheet.getDataRange().getValues()[0];
  const birthRow = birthHeaders.map(h => {
    if (h === 'timestamp') return new Date();
    if (h === 'operator') return currentUser.username;
    return resident[h] || data[h] || "";
  });
  birthSheet.appendRow(birthRow);

  // If dead, add to kematian sheet
  if (is_dead) {
    const deathSheet = ss.getSheetByName(CONFIG.SHEETS.KEMATIAN);
    const deathHeaders = deathSheet.getDataRange().getValues()[0];
    const deathRow = deathHeaders.map(h => {
      if (h === 'timestamp') return new Date();
      if (h === 'operator') return currentUser.username;
      if (h === 'tanggal_kematian') return tanggal_kematian;
      if (h === 'tempat_kematian') return tempat_kematian;
      if (h === 'penyebab') return penyebab;
      return resident[h] || "";
    });
    deathSheet.appendRow(deathRow);
  }
  
  logActivity(ss, currentUser.username, 'ADD_KELAHIRAN', `Mencatat kelahiran baru: ${resident.nama}${is_dead ? ' (Meninggal)' : ''}`);
  return { status: 'success' };
}

function deleteKelahiran(ss, nik, currentUser) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.KELAHIRAN);
  const data = sheet.getDataRange().getValues();
  const nikIdx = data[0].indexOf('nik');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][nikIdx].toString() === nik.toString()) {
      const nama = data[i][data[0].indexOf('nama')];
      sheet.deleteRow(i + 1);
      logActivity(ss, currentUser.username, 'DELETE_KELAHIRAN', `Menghapus data kelahiran: ${nama}`);
      return { status: 'success' };
    }
  }
  return { status: 'error', message: 'Data tidak ditemukan' };
}

function deleteKematian(ss, nik, currentUser) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.KEMATIAN);
  const data = sheet.getDataRange().getValues();
  const nikIdx = data[0].indexOf('nik');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][nikIdx].toString() === nik.toString()) {
      const nama = data[i][data[0].indexOf('nama')];
      sheet.deleteRow(i + 1);
      logActivity(ss, currentUser.username, 'DELETE_KEMATIAN', `Menghapus data kematian: ${nama}`);
      return { status: 'success' };
    }
  }
  return { status: 'error', message: 'Data tidak ditemukan' };
}

function handleKematian(ss, data, currentUser) {
  const residentSheet = ss.getSheetByName(CONFIG.SHEETS.RESIDENTS);
  const residentData = residentSheet.getDataRange().getValues();
  const headers = residentSheet.getDataRange().getValues()[0];
  const nikIdx = headers.indexOf('nik');
  
  let residentObj = null;
  for (let i = 1; i < residentData.length; i++) {
    if (residentData[i][nikIdx].toString() === data.nik.toString()) {
      residentObj = {};
      headers.forEach((h, idx) => residentObj[h] = residentData[i][idx]);
      residentSheet.deleteRow(i + 1);
      break;
    }
  }

  if (!residentObj) return { status: 'error', message: 'Data penduduk tidak ditemukan' };

  const deathSheet = ss.getSheetByName(CONFIG.SHEETS.KEMATIAN);
  const deathHeaders = deathSheet.getDataRange().getValues()[0];
  const row = deathHeaders.map(h => {
    if (h === 'timestamp') return new Date();
    if (h === 'operator') return currentUser.username;
    if (h === 'tanggal_kematian') return data.tanggal_kematian;
    if (h === 'penyebab') return data.penyebab;
    if (h === 'tempat_kematian') return data.tempat_kematian;
    return residentObj[h] || "";
  });
  deathSheet.appendRow(row);

  logActivity(ss, currentUser.username, 'ADD_KEMATIAN', `Mencatat kematian: ${residentObj.nama}`);
  logResidentHistory(ss, data.nik, currentUser.username, 'Death', { message: 'Data penduduk dipindahkan ke arsip kematian' });
  
  return { status: 'success' };
}

function bulkDeleteResidents(ss, niks, currentUser) {
  if (!Array.isArray(niks) || niks.length === 0) return { status: 'error', message: 'NIK tidak valid' };
  
  const sheet = ss.getSheetByName(CONFIG.SHEETS.RESIDENTS);
  const data = sheet.getDataRange().getValues();
  const nikIdx = data[0].indexOf('nik');
  
  let deletedCount = 0;
  // Delete from bottom to top to maintain indices
  for (let i = data.length - 1; i >= 1; i--) {
    if (niks.includes(data[i][nikIdx].toString())) {
      const nik = data[i][nikIdx].toString();
      sheet.deleteRow(i + 1);
      logResidentHistory(ss, nik, currentUser.username, 'Delete', { message: 'Data penduduk dihapus massal' });
      deletedCount++;
    }
  }
  
  logActivity(ss, currentUser.username, 'BULK_DELETE', `Menghapus ${deletedCount} data penduduk`);
  sortResidentsSheet(ss);
  return { status: 'success', message: `${deletedCount} penduduk berhasil dihapus` };
}

function initKelahiranKematianSheets(ss) {
  // Kelahiran
  let birthSheet = ss.getSheetByName(CONFIG.SHEETS.KELAHIRAN);
  if (!birthSheet) {
    birthSheet = ss.insertSheet(CONFIG.SHEETS.KELAHIRAN);
    birthSheet.appendRow([
      "nik", "no_kk", "nama", "tempat_lahir", "tanggal_lahir", "jenis_kelamin", 
      "alamat", "rt", "rw", "dusun", "nama_ayah", "nama_ibu", "berat_lahir", "panjang_lahir", "timestamp", "operator"
    ]);
    birthSheet.setFrozenRows(1);
  } else {
    // Ensure all headers are present
    const expectedHeaders = [
      "nik", "no_kk", "nama", "tempat_lahir", "tanggal_lahir", "jenis_kelamin", 
      "alamat", "rt", "rw", "dusun", "nama_ayah", "nama_ibu", "berat_lahir", "panjang_lahir", "timestamp", "operator"
    ];
    const currentHeaders = birthSheet.getRange(1, 1, 1, birthSheet.getLastColumn()).getValues()[0];
    expectedHeaders.forEach(h => {
      if (!currentHeaders.includes(h)) {
        birthSheet.insertColumnAfter(birthSheet.getLastColumn());
        birthSheet.getRange(1, birthSheet.getLastColumn()).setValue(h);
      }
    });
  }

  // Kematian
  let deathSheet = ss.getSheetByName(CONFIG.SHEETS.KEMATIAN);
  if (!deathSheet) {
    deathSheet = ss.insertSheet(CONFIG.SHEETS.KEMATIAN);
    deathSheet.appendRow([
      "nik", "no_kk", "nama", "jenis_kelamin", "tanggal_lahir", "tanggal_kematian", 
      "tempat_kematian", "penyebab", "alamat", "rt", "rw", "dusun", "timestamp", "operator"
    ]);
    deathSheet.setFrozenRows(1);
  }
}

function getResidentHistory(ss, nik) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.HISTORY);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const nikIdx = headers.indexOf('nik');
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][nikIdx].toString() === nik.toString()) {
      const obj = {};
      headers.forEach((h, idx) => obj[h] = data[i][idx]);
      result.push(obj);
    }
  }
  
  // Sort by timestamp descending
  result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return { status: 'success', data: result };
}

function logResidentHistory(ss, nik, username, action, changes) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.HISTORY);
  sheet.appendRow([nik, username, action, JSON.stringify(changes), new Date()]);
}

function getUsers(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    headers.forEach((h, idx) => {
      if (h !== 'password') obj[h] = data[i][idx];
    });
    result.push(obj);
  }
  
  return { status: 'success', data: result };
}

function saveUser(ss, userData, currentUser) {
  if (currentUser.role !== 'Admin') return { status: 'error', message: 'Forbidden' };
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const userIdx = headers.indexOf('username');
  
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][userIdx] === userData.username) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex > 0) {
    headers.forEach((h, idx) => {
      if (userData[h] !== undefined && h !== 'username') {
        sheet.getRange(rowIndex, idx + 1).setValue(userData[h]);
      }
    });
    logActivity(ss, currentUser.username, 'UPDATE_USER', `Memperbarui user: ${userData.username}`);
  } else {
    const row = headers.map(h => userData[h] || "");
    row[headers.indexOf('created_at')] = new Date();
    sheet.appendRow(row);
    logActivity(ss, currentUser.username, 'ADD_USER', `Menambah user baru: ${userData.username}`);
  }
  return { status: 'success' };
}

function deleteUser(ss, username, currentUser) {
  if (currentUser.role !== 'Admin') return { status: 'error', message: 'Forbidden' };
  if (username === 'admin') return { status: 'error', message: 'Admin utama tidak bisa dihapus' };
  
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const userIdx = data[0].indexOf('username');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][userIdx] === username) {
      sheet.deleteRow(i + 1);
      logActivity(ss, currentUser.username, 'DELETE_USER', `Menghapus user: ${username}`);
      return { status: 'success' };
    }
  }
  return { status: 'error', message: 'User tidak ditemukan' };
}

function updateProfile(ss, profileData, currentUser) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const userIdx = headers.indexOf('username');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][userIdx] === currentUser.username) {
      sheet.getRange(i + 1, headers.indexOf('nama_lengkap') + 1).setValue(profileData.nama_lengkap);
      sheet.getRange(i + 1, headers.indexOf('email') + 1).setValue(profileData.email);
      sheet.getRange(i + 1, headers.indexOf('photo_url') + 1).setValue(profileData.photo_url);
      logActivity(ss, currentUser.username, 'UPDATE_PROFILE', 'Memperbarui profil');
      return { status: 'success' };
    }
  }
  return { status: 'error', message: 'User tidak ditemukan' };
}

function changePassword(ss, { oldPassword, newPassword }, currentUser) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const userIdx = headers.indexOf('username');
  const passIdx = headers.indexOf('password');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][userIdx] === currentUser.username) {
      if (data[i][passIdx].toString() === oldPassword.toString()) {
        sheet.getRange(i + 1, passIdx + 1).setValue(newPassword);
        logActivity(ss, currentUser.username, 'CHANGE_PASSWORD', 'Mengubah password');
        return { status: 'success' };
      } else {
        return { status: 'error', message: 'Password lama salah' };
      }
    }
  }
  return { status: 'error', message: 'User tidak ditemukan' };
}

function getVillageInfo(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'village_info') {
      return { status: 'success', data: JSON.parse(data[i][1]) };
    }
  }
  return { 
    status: 'success', 
    data: {
      nama_desa: 'Desa Contoh', kecamatan: 'Kecamatan Makmur', kabupaten: 'Kabupaten Sejahtera',
      provinsi: 'Provinsi Jaya', kode_pos: '12345', alamat_kantor: 'Jl. Balai Desa No. 1',
      nama_kepala_desa: 'Bpk. Kepala Desa'
    }
  };
}

function updateVillageInfo(ss, infoData, currentUser) {
  if (currentUser.role !== 'Admin') return { status: 'error', message: 'Forbidden' };
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'village_info') {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 2).setValue(JSON.stringify(infoData));
  } else {
    sheet.appendRow(['village_info', JSON.stringify(infoData)]);
  }
  logActivity(ss, currentUser.username, 'UPDATE_VILLAGE_INFO', 'Memperbarui informasi desa');
  return { status: 'success' };
}

function getVillageData(ss, key) {
  if (key === 'kelahiran' || key === 'kematian') {
    const sheetName = key === 'kelahiran' ? CONFIG.SHEETS.KELAHIRAN : CONFIG.SHEETS.KEMATIAN;
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { status: 'success', data: [] };
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'success', data: [] };
    const headers = data[0];
    const result = [];
    for (let i = 1; i < data.length; i++) {
      const obj = {};
      headers.forEach((h, idx) => obj[h] = data[i][idx]);
      result.push(obj);
    }
    return { status: 'success', data: result };
  }

  const sheet = ss.getSheetByName(CONFIG.SHEETS.DATA_DESA);
  const data = sheet.getDataRange().getValues();
  const members = [];
  
  // Headers: lembaga_id (0), Nama Lengkap (1), NIK (2), No. KK (3), Tempat Lahir (4), Tanggal Lahir (5), 
  // Jenis Kelamin (6), Pendidikan (7), No SK Pengangkatan (8), Tanggal SK Pengangkatan (9), 
  // Jabatan (10), NIPD (11), Nomor Handphone (12), Keterangan (13)
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      members.push({
        nama_lengkap: data[i][1],
        nik: data[i][2],
        no_kk: data[i][3],
        tempat_lahir: data[i][4],
        tanggal_lahir: data[i][5],
        jenis_kelamin: data[i][6],
        pendidikan: data[i][7],
        no_sk: data[i][8],
        tanggal_sk: data[i][9],
        jabatan: data[i][10],
        nipd: data[i][11],
        no_hp: data[i][12],
        keterangan: data[i][13]
      });
    }
  }
  return { status: 'success', data: members };
}

function getVillageDataAll(ss) {
  const data = {};
  
  // Get all from DATA_DESA
  const dataDesaSheet = ss.getSheetByName(CONFIG.SHEETS.DATA_DESA);
  if (dataDesaSheet) {
    const values = dataDesaSheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      const key = values[i][0];
      if (!data[key]) data[key] = [];
      data[key].push({
        nama_lengkap: values[i][1],
        nik: values[i][2],
        no_kk: values[i][3],
        tempat_lahir: values[i][4],
        tanggal_lahir: values[i][5],
        jenis_kelamin: values[i][6],
        pendidikan: values[i][7],
        no_sk: values[i][8],
        tanggal_sk: values[i][9],
        jabatan: values[i][10],
        nipd: values[i][11],
        no_hp: values[i][12],
        keterangan: values[i][13]
      });
    }
  }
  
  // Get kelahiran
  const kelahiranRes = getVillageData(ss, 'kelahiran');
  if (kelahiranRes.status === 'success') data['kelahiran'] = kelahiranRes.data;
  
  // Get kematian
  const kematianRes = getVillageData(ss, 'kematian');
  if (kematianRes.status === 'success') data['kematian'] = kematianRes.data;
  
  return { status: 'success', data };
}

function saveVillageData(ss, key, value, currentUser) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.DATA_DESA);
  const data = sheet.getDataRange().getValues();
  
  // First, remove existing members for this institution
  // We go backwards to avoid index issues when deleting
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === key) {
      sheet.deleteRow(i + 1);
    }
  }
  
  // Then append new members
  if (Array.isArray(value)) {
    value.forEach(member => {
      sheet.appendRow([
        key,
        member.nama_lengkap || '',
        member.nik || '',
        member.no_kk || '',
        member.tempat_lahir || '',
        member.tanggal_lahir || '',
        member.jenis_kelamin || '',
        member.pendidikan || '',
        member.no_sk || '',
        member.tanggal_sk || '',
        member.jabatan || '',
        member.nipd || '',
        member.no_hp || '',
        member.keterangan || ''
      ]);
    });
  }
  
  logActivity(ss, currentUser.username, 'UPDATE_VILLAGE_DATA', `Memperbarui data lembaga: ${key}`);
  return { status: 'success' };
}

function importResidents(ss, residents, currentUser) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.RESIDENTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const nikIdx = headers.indexOf('nik');
  
  const existingNiks = new Set(data.slice(1).map(row => row[nikIdx].toString()));
  
  const newRows = [];
  let success = 0;
  let failed = 0;
  const failedDetails = [];

  residents.forEach(r => {
    if (!r.nik) return;
    if (existingNiks.has(r.nik.toString())) {
      failed++;
      failedDetails.push({ nik: r.nik, nama: r.nama, reason: 'NIK Ganda' });
      return;
    }

    const row = headers.map(h => {
      if (h === 'created_at' || h === 'updated_at') return new Date();
      return r[h] !== undefined ? r[h] : "";
    });
    newRows.push(row);
    existingNiks.add(r.nik.toString());
    success++;
  });
  
  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length).setValues(newRows);
  }
  
  sortResidentsSheet(ss);
  logActivity(ss, currentUser.username, 'IMPORT_RESIDENTS', `Mengimpor ${success} data (Gagal: ${failed})`);
  return { status: 'success', success, failed, failedDetails };
}

function sortResidentsSheet(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.RESIDENTS);
  const range = sheet.getDataRange();
  const values = range.getValues();
  const headers = values.shift();
  
  const kkIdx = headers.indexOf('no_kk');
  const hubIdx = headers.indexOf('status_hubungan');
  
  const hubOrder = {
    'Kepala Keluarga': 1,
    'Suami': 2,
    'Istri': 3,
    'Anak': 4,
    'Menantu': 5,
    'Cucu': 6,
    'Orang Tua': 7,
    'Mertua': 8,
    'Famili Lain': 9,
    'Pembantu': 10
  };

  values.sort((a, b) => {
    // Sort by No. KK first
    const kkA = String(a[kkIdx]);
    const kkB = String(b[kkIdx]);
    if (kkA !== kkB) return kkA.localeCompare(kkB);
    
    // Then by Status Hubungan custom order
    const hubA = hubOrder[a[hubIdx]] || 99;
    const hubB = hubOrder[b[hubIdx]] || 99;
    return hubA - hubB;
  });

  // Write back sorted values
  sheet.getRange(2, 1, values.length, headers.length).setValues(values);
}

function uploadProfilePhoto(ss, { base64, fileName }, currentUser) {
  try {
    if (!CONFIG.DRIVE_FOLDER_ID) {
      return { status: 'error', message: 'ID Folder Google Drive belum dikonfigurasi di Code.gs' };
    }
    
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    const contentType = base64.substring(base64.indexOf(":") + 1, base64.indexOf(";"));
    const data = Utilities.base64Decode(base64.split(",")[1]);
    const blob = Utilities.newBlob(data, contentType, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const photoUrl = "https://drive.google.com/uc?export=view&id=" + file.getId();
    
    // Update user photo_url in sheet
    const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
    const users = sheet.getDataRange().getValues();
    const headers = users[0];
    const photoIdx = headers.indexOf('photo_url');
    
    for (let i = 1; i < users.length; i++) {
      if (users[i][0] === currentUser.username) {
        sheet.getRange(i + 1, photoIdx + 1).setValue(photoUrl);
        break;
      }
    }
    
    logActivity(ss, currentUser.username, 'UPDATE_PHOTO', 'Berhasil mengunggah foto profil ke Google Drive');
    return { status: 'success', photoUrl };
  } catch (e) {
    return { status: 'error', message: e.toString() };
  }
}

function logActivity(ss, username, action, detail) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
  
  // Get nama_lengkap from users sheet
  const userSheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const userData = userSheet.getDataRange().getValues();
  let namaLengkap = username;
  for (let i = 1; i < userData.length; i++) {
    if (userData[i][0] === username) {
      namaLengkap = userData[i][2];
      break;
    }
  }
  
  sheet.appendRow([new Date(), username, namaLengkap, action, detail]);
}

function getLogs(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
  
  // Auto-delete logs older than 24 hours
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    const now = new Date().getTime();
    const rowsToDelete = [];
    
    for (let i = 0; i < data.length; i++) {
      const logTime = new Date(data[i][0]).getTime();
      if (now - logTime > 24 * 60 * 60 * 1000) {
        rowsToDelete.push(i + 2);
      }
    }
    
    // Delete from bottom to top to maintain indices
    for (let i = rowsToDelete.length - 1; i >= 0; i--) {
      sheet.deleteRow(rowsToDelete[i]);
    }
  }

  const newLastRow = sheet.getLastRow();
  if (newLastRow <= 1) return { status: 'success', data: [] };
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const numRowsToRead = Math.min(100, newLastRow - 1);
  const startRow = newLastRow - numRowsToRead + 1;
  
  const data = sheet.getRange(startRow, 1, numRowsToRead, headers.length).getValues();
  const result = [];
  
  for (let i = data.length - 1; i >= 0; i--) {
    const obj = {};
    headers.forEach((h, idx) => obj[h] = data[i][idx]);
    result.push(obj);
  }
  
  return { status: 'success', data: result };
}
