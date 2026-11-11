/**
 * ==============================================================================
 * SISTEM INFORMASI PELAPORAN GOTONG ROYONG (SIGAP GOTONG ROYONG)
 * KECAMATAN WARU - KABUPATEN PENAJAM PASER UTARA
 * Akun Pengelola: waruppusigap@gmail.com
 * ==============================================================================
 * 
 * Script ini berfungsi sebagai Web API Backend yang menerima pengiriman data form
 * dari Web App Pelaporan Gotong Royong:
 * 1. Menerima file upload (Foto Kegiatan, Konsumsi, Material, Video, Daftar Hadir)
 * 2. Menyimpan file tersebut secara otomatis ke Folder Google Drive yang ditentukan
 * 3. Menghasilkan link Google Drive untuk setiap file
 * 4. Menyimpan baris laporan baru ke dalam Google Sheets secara real-time
 * 5. Menyediakan data laporan (GET request) untuk Dashboard & Rekapitulasi
 * ==============================================================================
 */

// ================= KONFIGURASI =================
// Masukkan ID Spreadsheet Anda (Bisa diambil dari URL Google Sheet di antara /d/ dan /edit)
var SPREADSHEET_ID = ""; // Kosongkan jika script ini dibuat langsung dari 'Ekstensi > Apps Script' pada Google Sheet terkait

// Nama Tab Sheet tempat data disimpan
var SHEET_NAME = "Sheet1"; // atau nama sheet Anda, misal: "Data Laporan" atau "Form Responses 1"

// Masukkan ID Folder Google Drive tempat menyimpan berkas (buka folder drive di waruppusigap@gmail.com, lihat ID di URL)
// Contoh URL: https://drive.google.com/drive/folders/1a2b3c4d5e... -> ID adalah "1a2b3c4d5e..."
var ROOT_FOLDER_ID = ""; 

// ================= HANDLER UTAMA =================

/**
 * Endpoint GET: Digunakan untuk mengambil data laporan untuk dashboard & rekapitulasi,
 * atau untuk testing status koneksi web app.
 */
function doGet(e) {
  try {
    var action = e && e.parameter && e.parameter.action ? e.parameter.action : "getData";
    
    // Uji koneksi / ping
    if (action === "ping") {
      return createJsonResponse({
        status: "success",
        message: "API Google Apps Script Siaga & Terhubung!",
        timestamp: new Date().toISOString()
      });
    }

    // Ambil data laporan dari Google Sheets
    var sheet = getSheetInstance();
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return createJsonResponse({
        status: "success",
        total: 0,
        headers: data.length === 1 ? data[0] : [],
        data: []
      });
    }

    var headers = data[0];
    var rows = [];

    for (var i = 1; i < data.length; i++) {
      var rowObj = {};
      var isEmptyRow = true;
      for (var j = 0; j < headers.length; j++) {
        var key = String(headers[j]).trim();
        var val = data[i][j];
        if (val !== "" && val !== null && val !== undefined) {
          isEmptyRow = false;
        }
        // Format tanggal jika objek Date
        if (val instanceof Date) {
          val = formatDateIndo(val);
        }
        rowObj[key] = val;
      }
      if (!isEmptyRow) {
        rowObj["_rowNumber"] = i + 1;
        rows.push(rowObj);
      }
    }

    return createJsonResponse({
      status: "success",
      total: rows.length,
      headers: headers,
      data: rows
    });

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

/**
 * Endpoint POST: Menerima pengiriman laporan kegiatan gotong royong dari aplikasi web
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  // Kunci script selama maks 30 detik untuk mencegah tabrakan data saat banyak orang submit bersamaan
  try {
    lock.waitLock(30000);
  } catch (t) {
    return createJsonResponse({
      status: "error",
      message: "Server sedang sibuk, silakan coba beberapa saat lagi."
    });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Tidak ada data yang dikirimkan (payload kosong).");
    }

    var payload = JSON.parse(e.postData.contents);
    var timestampStr = Utilities.formatDate(new Date(), "Asia/Makassar", "dd/MM/yyyy HH:mm:ss");

    // Persiapkan Folder Penyimpanan di Google Drive
    var targetFolder = getTargetFolder(payload.desa || "Kecamatan Waru");

    // Simpan file-file yang diunggah ke Google Drive dan ambil link URL-nya
    var urlFotoKegiatan = saveFileToDrive(payload.fotoKegiatan, "Foto_Kegiatan", targetFolder);
    var urlFotoKonsumsi = saveFileToDrive(payload.fotoKonsumsi, "Foto_Konsumsi", targetFolder);
    var urlFotoMaterial = saveFileToDrive(payload.fotoMaterial, "Foto_Material", targetFolder);
    var urlVideoKegiatan = payload.videoUrl || saveFileToDrive(payload.videoKegiatan, "Video_Kegiatan", targetFolder);
    var urlDaftarHadir = saveFileToDrive(payload.daftarHadir, "Daftar_Hadir", targetFolder);

    // Ambil instansi sheet
    var sheet = getSheetInstance();

    // Pastikan header kolom sudah ada jika sheet masih kosong
    ensureHeaders(sheet);

    // Susun baris data persis sesuai susunan kolom Google Sheets:
    // A: Timestamp
    // B: Kecamatan/Kelurahan/Desa
    // C: Bidang Kegiatan
    // D: Tanggal/Hari/Jam Kegiatan
    // E: Deskripsi Kegiatan
    // F: Lokasi Kegiatan
    // G: Jumlah Orang Yang Hadir
    // H: Jumlah Orang (Nilai Rupiah)
    // I: Dokumentasi/Foto Kegiatan
    // J: Jenis Konsumsi
    // K: Jenis Konsumsi (Nilai Rupiah)
    // L: Foto Konsumsi
    // M: Peralatan Yang Digunakan
    // N: Material Yang Digunakan
    // O: Material Yang Digunakan (Nilai Rupiah)
    // P: Foto Material (Nilai Rupiah) / Foto Material
    // Q: Video Kegiatan
    // R: Daftar Hadir Kegiatan
    // S: Capaian Dalam Kegiatan
    // T: Kendala Dalam Kegiatan
    // U: Catatan / Keterangan Tambahan

    var rowData = [
      timestampStr,                                         // A: Timestamp
      payload.desa || "Kecamatan Waru",                    // B: Kecamatan/Kelurahan/Desa
      payload.bidangKegiatan || "Lingkungan",              // C: Bidang Kegiatan
      payload.waktuKegiatan || "",                         // D: Tanggal/Hari/Jam Kegiatan
      payload.deskripsiKegiatan || "",                     // E: Deskripsi Kegiatan
      payload.lokasiKegiatan || "",                        // F: Lokasi Kegiatan
      payload.jumlahHadir || "",                           // G: Jumlah Orang Yang Hadir
      cleanNumber(payload.nilaiOrangRupiah),               // H: Jumlah Orang (Nilai Rupiah)
      urlFotoKegiatan || "",                               // I: Dokumentasi/Foto Kegiatan
      payload.jenisKonsumsi || "",                         // J: Jenis Konsumsi
      cleanNumber(payload.nilaiKonsumsiRupiah),            // K: Jenis Konsumsi (Nilai Rupiah)
      urlFotoKonsumsi || "",                               // L: Foto Konsumsi
      payload.peralatan || "",                             // M: Peralatan Yang Digunakan
      payload.material || "",                              // N: Material Yang Digunakan
      cleanNumber(payload.nilaiMaterialRupiah),            // O: Material Yang Digunakan (Nilai Rupiah)
      urlFotoMaterial || "",                               // P: Foto Material
      urlVideoKegiatan || "",                              // Q: Video Kegiatan
      urlDaftarHadir || "",                                // R: Daftar Hadir Kegiatan
      payload.capaian || "",                               // S: Capaian Dalam Kegiatan
      payload.kendala || "",                               // T: Kendala Dalam Kegiatan
      payload.catatanTambahan || ""                        // U: Catatan / Keterangan Tambahan
    ];

    sheet.appendRow(rowData);

    // Hitung total swadaya untuk info kembali
    var totalSwadaya = (cleanNumber(payload.nilaiOrangRupiah) || 0) + 
                       (cleanNumber(payload.nilaiKonsumsiRupiah) || 0) + 
                       (cleanNumber(payload.nilaiMaterialRupiah) || 0);

    return createJsonResponse({
      status: "success",
      message: "Laporan kegiatan gotong royong berhasil disimpan!",
      timestamp: timestampStr,
      totalSwadaya: totalSwadaya,
      driveLinks: {
        fotoKegiatan: urlFotoKegiatan,
        fotoKonsumsi: urlFotoKonsumsi,
        fotoMaterial: urlFotoMaterial,
        videoKegiatan: urlVideoKegiatan,
        daftarHadir: urlDaftarHadir
      }
    });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: "Gagal menyimpan laporan: " + err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

// ================= HELPER FUNCTIONS =================

/**
 * Mendapatkan referensi Sheet aktif
 */
function getSheetInstance() {
  var ss;
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  
  if (!ss) {
    throw new Error("Spreadsheet tidak ditemukan. Pastikan SPREADSHEET_ID diisi atau script terhubung ke Google Sheet.");
  }

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0]; // Fallback ke sheet pertama jika nama tidak cocok
  }
  return sheet;
}

/**
 * Mendapatkan atau membuat folder tujuan di Google Drive
 */
function getTargetFolder(namaDesa) {
  var parentFolder;
  if (ROOT_FOLDER_ID && ROOT_FOLDER_ID.trim() !== "") {
    try {
      parentFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
    } catch (e) {
      parentFolder = DriveApp.getRootFolder();
    }
  } else {
    parentFolder = DriveApp.getRootFolder();
  }

  // Buat sub-folder berdasarkan tahun dan desa agar rapi
  var currentYear = Utilities.formatDate(new Date(), "Asia/Makassar", "yyyy");
  var yearFolder = getOrCreateSubFolder(parentFolder, "Gotong Royong " + currentYear);
  var desaFolder = getOrCreateSubFolder(yearFolder, namaDesa || "Kecamatan Waru");
  
  return desaFolder;
}

function getOrCreateSubFolder(parent, folderName) {
  var folders = parent.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parent.createFolder(folderName);
}

/**
 * Menyimpan file base64 yang dikirim dari form ke Google Drive
 */
function saveFileToDrive(fileObj, prefix, targetFolder) {
  if (!fileObj || !fileObj.base64) {
    return "";
  }

  try {
    var rawBase64 = fileObj.base64;
    // Bersihkan prefix data URL misal 'data:image/jpeg;base64,'
    if (rawBase64.indexOf(",") > -1) {
      rawBase64 = rawBase64.split(",")[1];
    }

    var decoded = Utilities.base64Decode(rawBase64);
    var mimeType = fileObj.mimeType || "image/jpeg";
    var extension = getExtensionFromMime(mimeType);
    
    var timeStamp = Utilities.formatDate(new Date(), "Asia/Makassar", "yyyyMMdd_HHmmss");
    var fileName = prefix + "_" + timeStamp + "_" + Math.floor(Math.random() * 1000) + extension;

    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    var file = targetFolder.createFile(blob);

    // Berikan izin agar file dapat dilihat melalui link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return file.getUrl();
  } catch (e) {
    Logger.log("Error save file: " + e.toString());
    return "";
  }
}

function getExtensionFromMime(mime) {
  if (mime.indexOf("png") > -1) return ".png";
  if (mime.indexOf("jpeg") > -1 || mime.indexOf("jpg") > -1) return ".jpg";
  if (mime.indexOf("pdf") > -1) return ".pdf";
  if (mime.indexOf("mp4") > -1) return ".mp4";
  return ".bin";
}

/**
 * Memastikan kolom header di Sheet sudah tersedia
 */
function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    var defaultHeaders = [
      "Timestamp",
      "Kecamatan/Kelurahan/Desa",
      "Bidang Kegiatan",
      "Tanggal/Hari/Jam Kegiatan",
      "Deskripsi Kegiatan",
      "Lokasi Kegiatan",
      "Jumlah Orang Yang Hadir",
      "Jumlah Orang (Nilai Rupiah)",
      "Dokumentasi/Foto Kegiatan",
      "Jenis Konsumsi",
      "Jenis Konsumsi (Nilai Rupiah)",
      "Foto Konsumsi",
      "Peralatan Yang Digunakan",
      "Material Yang Digunakan",
      "Material Yang Digunakan (Nilai Rupiah)",
      "Foto Material",
      "Video Kegiatan",
      "Daftar Hadir Kegiatan",
      "Capaian Dalam Kegiatan",
      "Kendala Dalam Kegiatan",
      "Catatan / Keterangan Tambahan"
    ];
    sheet.appendRow(defaultHeaders);
    sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight("bold").setBackground("#e6f4ea");
  }
}

function cleanNumber(val) {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  var str = String(val).replace(/[^0-9]/g, "");
  return str === "" ? 0 : parseInt(str, 10);
}

function formatDateIndo(d) {
  return Utilities.formatDate(d, "Asia/Makassar", "dd/MM/yyyy HH:mm");
}

/**
 * Format JSON Response dengan header CORS lengkap
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
