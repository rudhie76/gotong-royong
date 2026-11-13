/**
 * ==============================================================================
 * SISTEM INFORMASI PELAPORAN GOTONG ROYONG (SIGAP GOTONG ROYONG)
 * KECAMATAN WARU - KABUPATEN PENAJAM PASER UTARA
 * Akun Pengelola: waruppusigap@gmail.com
 * ==============================================================================
 */

// ================= KONFIGURASI =================
// Masukkan ID Spreadsheet Anda (Bisa diambil dari URL Google Sheet di antara /d/ dan /edit)
// Jika script ini dibuat langsung dari 'Ekstensi > Apps Script' pada spreadsheet terkait,
// Anda dapat mengosongkannya ("").
var SPREADSHEET_ID = ""; 

// Nama Tab Sheet tempat data disimpan
var SHEET_NAME = "Sheet1";

// Masukkan ID Folder Google Drive tempat menyimpan berkas di waruppusigap@gmail.com
// Contoh: URL drive.google.com/drive/folders/1a2b3c... -> ID adalah "1a2b3c..."
var ROOT_FOLDER_ID = ""; 

// Daftar 21 Kolom Header Resmi Sesuai Format Kecamatan Waru
var DAFTAR_KOLOM_HEADER = [
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

// ================= MENU OTOMATIS DI GOOGLE SHEET =================

/**
 * Menu otomatis yang akan muncul di bilah menu Google Sheets saat file dibuka
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("🏛️ Menu Kecamatan Waru")
    .addItem("⚡ Inisialisasi Kolom Header Otomatis (A - U)", "inisialisasiDatabaseOtomatis")
    .addItem("📋 Isi Data Contoh Awal (Simulasi)", "isiDataContohAwal")
    .addSeparator()
    .addItem("📂 Cek Folder Drive Penyimpanan", "cekStatusFolderDrive")
    .addToUi();
}

/**
 * FUNGSI 1-KLIK UNTUK MEMBUAT SELURUH KOLOM DATABASE:
 * Klik fungsi ini lalu klik tombol 'Run / Jalankan' di editor Apps Script.
 * Fungsi ini akan langsung membuat 21 kolom header lengkap dari kolom A sampai U
 * dengan format warna hijau resmi, teks tebal, dan auto-resize lebar kolom!
 */
function inisialisasiDatabaseOtomatis() {
  var sheet = getSheetInstance();
  
  // Jika sheet sudah ada data di baris 1, tanyakan konfirmasi atau timpa header
  sheet.getRange(1, 1, 1, DAFTAR_KOLOM_HEADER.length).setValues([DAFTAR_KOLOM_HEADER]);
  
  // Beri gaya visual profesional pada Header (Hijau Emerald resmi, teks putih tebal)
  var headerRange = sheet.getRange(1, 1, 1, DAFTAR_KOLOM_HEADER.length);
  headerRange.setFontWeight("bold")
             .setFontColor("#ffffff")
             .setBackground("#065f46") // Emerald 800
             .setHorizontalAlignment("center")
             .setVerticalAlignment("middle")
             .setWrap(true);
  
  sheet.setRowHeight(1, 40);
  
  // Bekukan baris pertama agar header tetap terlihat saat scroll ke bawah
  sheet.setFrozenRows(1);

  // Format kolom Rupiah (Kolom H, K, O) menjadi format mata uang Indonesia Rp
  sheet.getRange("H2:H").setNumberFormat('"Rp"#,##0');
  sheet.getRange("K2:K").setNumberFormat('"Rp"#,##0');
  sheet.getRange("O2:O").setNumberFormat('"Rp"#,##0');

  // Format kolom Jumlah Hadir (Kolom G) rata tengah
  sheet.getRange("G2:G").setHorizontalAlignment("center");

  // Sesuaikan lebar kolom
  for (var i = 1; i <= DAFTAR_KOLOM_HEADER.length; i++) {
    sheet.autoResizeColumn(i);
    // Beri batas minimal lebar kolom agar nyaman dibaca
    if (sheet.getColumnWidth(i) < 140) {
      sheet.setColumnWidth(i, 160);
    }
  }

  Logger.log("✅ Berhasil! 21 Kolom Database Gotong Royong siap digunakan.");
  try {
    SpreadsheetApp.getUi().alert("✅ Berhasil!\n\nSeluruh 21 kolom database pelaporan gotong royong (Kolom A s/d U) telah dibuat dan diformat rapi.");
  } catch(e) {}
}

/**
 * Fungsi pembantu untuk memasukkan sampel data awal jika diinginkan
 */
function isiDataContohAwal() {
  var sheet = getSheetInstance();
  inisialisasiDatabaseOtomatis();

  if (sheet.getLastRow() > 1) {
    try {
      SpreadsheetApp.getUi().alert("Sheet sudah berisi data baris. Data contoh tidak ditambahkan untuk mencegah duplikasi.");
    } catch(e) {}
    return;
  }

  var contoh = [
    [
      "21/08/2026 16:11:32", "Kecamatan Waru", "Lingkungan", "Sabtu, 21 Mei 2026, 08.00 Wita",
      "Membersihkan Halaman Kantor", "Kantor Kecamatan Waru", 20, 300000,
      "https://drive.google.com/open?id=sample_foto_1", "Gorengan dan minuman", 250000,
      "https://drive.google.com/open?id=sample_foto_konsumsi_1", "Cangkul, mesin rumput, parang",
      "Obat Rumput", 25000, "https://drive.google.com/open?id=sample_material_1",
      "https://drive.google.com/open?id=sample_video_1", "https://drive.google.com/open?id=sample_hadir_1",
      "Halaman kantor bersih dan saluran lancar", "-", "Rutin diadakan Jumat bersih"
    ],
    [
      "28/08/2026 10:48:41", "Desa Sesulu", "Lingkungan", "Jumat, 05 Nov 2026",
      "Kegiatan Gotong royong pembersihan drainase", "Wilayah RT/001 dan RT/011", 25, 4750000,
      "https://drive.google.com/open?id=sample_foto_2", "Snack dan Air Mineral", 450000,
      "https://drive.google.com/open?id=sample_foto_konsumsi_2", "Cangkul, sapu lidi, parang dll",
      "Semen", 75000, "https://drive.google.com/open?id=sample_material_2",
      "https://drive.google.com/open?id=sample_video_2", "https://drive.google.com/open?id=sample_hadir_2",
      "Drainase 250 meter lancar", "Parit agak longsor", "Swadaya warga sangat baik"
    ]
  ];

  for (var r = 0; r < contoh.length; r++) {
    sheet.appendRow(contoh[r]);
  }

  try {
    SpreadsheetApp.getUi().alert("✅ Data contoh berhasil dimasukkan!");
  } catch(e) {}
}

/**
 * Cek status folder penyimpanan di Google Drive waruppusigap@gmail.com
 */
function cekStatusFolderDrive() {
  var folder = getTargetFolder("Test Folder");
  var msg = "Folder Drive terhubung!\nNama Folder: " + folder.getName() + "\nURL: " + folder.getUrl();
  Logger.log(msg);
  try {
    SpreadsheetApp.getUi().alert(msg);
  } catch(e) {}
}

// ================= HANDLER WEB APP (API) =================

function doGet(e) {
  try {
    var action = e && e.parameter && e.parameter.action ? e.parameter.action : "getData";
    
    if (action === "ping") {
      return createJsonResponse({
        status: "success",
        message: "API Google Apps Script Siaga & Terhubung!",
        timestamp: new Date().toISOString()
      });
    }

    if (action === "setup") {
      inisialisasiDatabaseOtomatis();
      return createJsonResponse({
        status: "success",
        message: "Header kolom Google Sheet berhasil dibuat secara otomatis!"
      });
    }

    var sheet = getSheetInstance();
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return createJsonResponse({
        status: "success",
        total: 0,
        headers: data.length === 1 ? data[0] : DAFTAR_KOLOM_HEADER,
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
        if (val instanceof Date) {
          val = Utilities.formatDate(val, "Asia/Makassar", "dd/MM/yyyy HH:mm");
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

function doPost(e) {
  var lock = LockService.getScriptLock();
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
    var action = payload.action || "create";
    var sheet = getSheetInstance();
    
    // Pastikan header kolom sudah ada jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      inisialisasiDatabaseOtomatis();
    }

    // ================= 1. AKSI HAPUS (DELETE) =================
    if (action === "delete") {
      var targetRow = findRowIndex(sheet, payload);
      if (targetRow > 1) {
        sheet.deleteRow(targetRow);
        return createJsonResponse({
          status: "success",
          message: "Laporan baris ke-" + targetRow + " berhasil dihapus dari Google Sheets!",
          deletedRow: targetRow
        });
      } else {
        return createJsonResponse({
          status: "warning",
          message: "Data baris tidak ditemukan di Google Sheets untuk dihapus."
        });
      }
    }

    // ================= 2. AKSI EDIT / UPDATE =================
    if (action === "update" || action === "edit") {
      var targetRow = findRowIndex(sheet, payload);
      if (targetRow > 1) {
        var targetFolder = getTargetFolder(payload.desa || "Kecamatan Waru");

        var urlFotoKegiatan = mergeFileUrls(payload.fotoKegiatan, payload.existingFotoKegiatan || payload.fotoKegiatanUrl, "Foto_Kegiatan", targetFolder);
        var urlFotoKonsumsi = mergeFileUrls(payload.fotoKonsumsi, payload.existingFotoKonsumsi || payload.fotoKonsumsiUrl, "Foto_Konsumsi", targetFolder);
        var urlFotoMaterial = mergeFileUrls(payload.fotoMaterial, payload.existingFotoMaterial || payload.fotoMaterialUrl, "Foto_Material", targetFolder);
        var urlVideoKegiatan = payload.videoUrl || "";
        var urlDaftarHadir = mergeFileUrls(payload.daftarHadir, payload.existingDaftarHadir || payload.daftarHadirUrl, "Daftar_Hadir", targetFolder);

        var existingTimestamp = payload.timestamp || sheet.getRange(targetRow, 1).getValue();

        var updatedRowData = [
          existingTimestamp,
          payload.desa || "Kecamatan Waru",
          payload.bidangKegiatan || "Lingkungan",
          payload.waktuKegiatan || "",
          payload.deskripsiKegiatan || "",
          payload.lokasiKegiatan || "",
          payload.jumlahHadir || 0,
          cleanNumber(payload.nilaiOrangRupiah),
          urlFotoKegiatan || "",
          payload.jenisKonsumsi || "",
          cleanNumber(payload.nilaiKonsumsiRupiah),
          urlFotoKonsumsi || "",
          payload.peralatan || "",
          payload.material || "",
          cleanNumber(payload.nilaiMaterialRupiah),
          urlFotoMaterial || "",
          urlVideoKegiatan || "",
          urlDaftarHadir || "",
          payload.capaian || "",
          payload.kendala || "",
          payload.catatanTambahan || ""
        ];

        sheet.getRange(targetRow, 1, 1, updatedRowData.length).setValues([updatedRowData]);

        return createJsonResponse({
          status: "success",
          message: "Perubahan laporan berhasil disimpan ke Google Sheets!",
          updatedRow: targetRow,
          driveLinks: {
            fotoKegiatan: urlFotoKegiatan,
            fotoKonsumsi: urlFotoKonsumsi,
            fotoMaterial: urlFotoMaterial,
            videoKegiatan: urlVideoKegiatan,
            daftarHadir: urlDaftarHadir
          }
        });
      } else {
        throw new Error("Baris data tidak ditemukan di Google Sheets untuk diedit.");
      }
    }

    // ================= 3. AKSI CREATE / TAMBAH BARU (DEFAULT) =================
    var timestampStr = Utilities.formatDate(new Date(), "Asia/Makassar", "dd/MM/yyyy HH:mm:ss");
    var targetFolder = getTargetFolder(payload.desa || "Kecamatan Waru");

    var urlFotoKegiatan = saveFilesToDrive(payload.fotoKegiatan, "Foto_Kegiatan", targetFolder);
    var urlFotoKonsumsi = saveFilesToDrive(payload.fotoKonsumsi, "Foto_Konsumsi", targetFolder);
    var urlFotoMaterial = saveFilesToDrive(payload.fotoMaterial, "Foto_Material", targetFolder);
    var urlVideoKegiatan = payload.videoUrl || saveFilesToDrive(payload.videoKegiatan, "Video_Kegiatan", targetFolder);
    var urlDaftarHadir = saveFilesToDrive(payload.daftarHadir, "Daftar_Hadir", targetFolder);

    var rowData = [
      timestampStr,
      payload.desa || "Kecamatan Waru",
      payload.bidangKegiatan || "Lingkungan",
      payload.waktuKegiatan || "",
      payload.deskripsiKegiatan || "",
      payload.lokasiKegiatan || "",
      payload.jumlahHadir || 0,
      cleanNumber(payload.nilaiOrangRupiah),
      urlFotoKegiatan || "",
      payload.jenisKonsumsi || "",
      cleanNumber(payload.nilaiKonsumsiRupiah),
      urlFotoKonsumsi || "",
      payload.peralatan || "",
      payload.material || "",
      cleanNumber(payload.nilaiMaterialRupiah),
      urlFotoMaterial || "",
      urlVideoKegiatan || "",
      urlDaftarHadir || "",
      payload.capaian || "",
      payload.kendala || "",
      payload.catatanTambahan || ""
    ];

    sheet.appendRow(rowData);

    return createJsonResponse({
      status: "success",
      message: "Laporan kegiatan gotong royong berhasil disimpan!",
      timestamp: timestampStr,
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
      message: "Gagal memproses data laporan: " + err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Mencari indeks baris (1-based) untuk edit atau hapus
 */
function findRowIndex(sheet, payload) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;

  var targetRow = Number(payload.rowNumber);
  var targetTimestamp = String(payload.timestamp || "").trim();
  var targetDeskripsi = String(payload.deskripsiKegiatan || "").trim();

  // 1. Cek langsung nomor baris jika ada
  if (targetRow && targetRow >= 2 && targetRow <= lastRow) {
    if (!targetTimestamp) return targetRow;
    var rowTime = String(sheet.getRange(targetRow, 1).getValue()).trim();
    if (rowTime === targetTimestamp || rowTime.indexOf(targetTimestamp) !== -1 || targetTimestamp.indexOf(rowTime) !== -1) {
      return targetRow;
    }
  }

  // 2. Scan kolom A (Timestamp) dan E (Deskripsi)
  var rangeVals = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  for (var i = 0; i < rangeVals.length; i++) {
    var curTime = String(rangeVals[i][0]).trim();
    var curDesc = String(rangeVals[i][4]).trim();
    if (targetTimestamp && (curTime === targetTimestamp || curTime.indexOf(targetTimestamp) !== -1)) {
      return i + 2;
    }
    if (targetDeskripsi && curDesc === targetDeskripsi) {
      return i + 2;
    }
  }

  return -1;
}

/**
 * Menggabungkan URL berkas lama dan URL berkas yang baru diupload
 */
function mergeFileUrls(filesInput, existingUrlStr, prefix, targetFolder) {
  var newUrls = saveFilesToDrive(filesInput, prefix, targetFolder);
  var existingUrls = existingUrlStr ? String(existingUrlStr).trim() : "";
  
  if (newUrls && existingUrls) {
    return existingUrls + "\n" + newUrls;
  }
  return newUrls || existingUrls || "";
}

// ================= HELPER FUNCTIONS =================

function getSheetInstance() {
  var ss;
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  
  if (!ss) {
    throw new Error("Spreadsheet tidak ditemukan. Pastikan script dibuat di Google Sheets terkait atau isi SPREADSHEET_ID.");
  }

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  return sheet;
}

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

function saveFilesToDrive(filesInput, prefix, targetFolder) {
  if (!filesInput) return "";
  if (Array.isArray(filesInput)) {
    var urls = [];
    for (var i = 0; i < filesInput.length; i++) {
      var singleUrl = saveFileToDrive(filesInput[i], prefix + "_" + (i + 1), targetFolder);
      if (singleUrl) urls.push(singleUrl);
    }
    return urls.join("\n");
  } else {
    return saveFileToDrive(filesInput, prefix, targetFolder);
  }
}

function saveFileToDrive(fileObj, prefix, targetFolder) {
  if (!fileObj || !fileObj.base64) {
    return "";
  }

  try {
    var rawBase64 = fileObj.base64;
    if (rawBase64.indexOf(",") > -1) {
      rawBase64 = rawBase64.split(",")[1];
    }

    var decoded = Utilities.base64Decode(rawBase64);
    var mimeType = fileObj.mimeType || "image/jpeg";
    var extension = mimeType.indexOf("png") > -1 ? ".png" : (mimeType.indexOf("pdf") > -1 ? ".pdf" : ".jpg");
    
    var timeStamp = Utilities.formatDate(new Date(), "Asia/Makassar", "yyyyMMdd_HHmmss");
    var fileName = prefix + "_" + timeStamp + "_" + Math.floor(Math.random() * 1000) + extension;

    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    var file = targetFolder.createFile(blob);

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    Logger.log("Error save file: " + e.toString());
    return "";
  }
}

function cleanNumber(val) {
  if (!val) return 0;
  if (typeof val === "number") return val;
  var str = String(val).replace(/[^0-9]/g, "");
  return str ? parseInt(str, 10) : 0;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
