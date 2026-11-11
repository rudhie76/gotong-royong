import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  HardDrive, 
  FileSpreadsheet, 
  Check, 
  Copy, 
  ExternalLink, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  Sparkles, 
  HelpCircle,
  FolderPlus,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  getConfig, 
  saveConfig, 
  testApiConnection 
} from '../services/apiService';
import { SHEET_COLUMNS } from '../constants';

export default function PengaturanModal({ onClose, onSaved }) {
  const currentConfig = getConfig();
  
  const [scriptUrl, setScriptUrl] = useState(currentConfig.scriptUrl || '');
  const [sheetId, setSheetId] = useState(currentConfig.sheetId || '');
  const [folderId, setFolderId] = useState(currentConfig.folderId || '');
  const [defaultHokRate, setDefaultHokRate] = useState(currentConfig.defaultHokRate || 100000);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'tutorial' | 'script'

  const handleSave = () => {
    const updated = {
      ...currentConfig,
      scriptUrl: scriptUrl.trim(),
      sheetId: sheetId.trim(),
      folderId: folderId.trim(),
      defaultHokRate: Number(defaultHokRate) || 100000,
    };
    saveConfig(updated);
    if (onSaved) onSaved(updated);
    alert("Konfigurasi berhasil disimpan!");
    onClose();
  };

  const handleTestPing = async () => {
    if (!scriptUrl.trim()) {
      alert("Masukkan URL Web App Google Apps Script terlebih dahulu.");
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    const result = await testApiConnection(scriptUrl.trim());
    setIsTesting(false);
    setTestResult(result);
  };

  const copyAppsScript = () => {
    const scriptText = `/**
 * SISTEM INFORMASI PELAPORAN GOTONG ROYONG (SIGAP GOTONG ROYONG)
 * KECAMATAN WARU - KABUPATEN PENAJAM PASER UTARA
 * Akun Pengelola: waruppusigap@gmail.com
 */

var SPREADSHEET_ID = "${sheetId.trim()}"; // ID Spreadsheet Anda (atau kosongkan jika script terpasang di Sheet)
var SHEET_NAME = "Sheet1";
var ROOT_FOLDER_ID = "${folderId.trim()}"; // ID Folder Google Drive waruppusigap@gmail.com

function doGet(e) {
  try {
    var action = e && e.parameter && e.parameter.action ? e.parameter.action : "getData";
    if (action === "ping") {
      return createJsonResponse({ status: "success", message: "API Siaga & Terhubung!", timestamp: new Date().toISOString() });
    }
    var sheet = getSheetInstance();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse({ status: "success", total: 0, headers: data[0] || [], data: [] });
    }
    var headers = data[0];
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var rowObj = {};
      var isEmpty = true;
      for (var j = 0; j < headers.length; j++) {
        var val = data[i][j];
        if (val !== "" && val !== null && val !== undefined) isEmpty = false;
        if (val instanceof Date) {
          val = Utilities.formatDate(val, "Asia/Makassar", "dd/MM/yyyy HH:mm");
        }
        rowObj[String(headers[j]).trim()] = val;
      }
      if (!isEmpty) rows.push(rowObj);
    }
    return createJsonResponse({ status: "success", total: rows.length, headers: headers, data: rows });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(30000); } catch (t) {
    return createJsonResponse({ status: "error", message: "Server sibuk, coba beberapa saat lagi." });
  }

  try {
    var payload = JSON.parse(e.postData.contents);
    var timestampStr = Utilities.formatDate(new Date(), "Asia/Makassar", "dd/MM/yyyy HH:mm:ss");
    var targetFolder = getTargetFolder(payload.desa || "Kecamatan Waru");

    var urlFotoKegiatan = saveFileToDrive(payload.fotoKegiatan, "Foto_Kegiatan", targetFolder);
    var urlFotoKonsumsi = saveFileToDrive(payload.fotoKonsumsi, "Foto_Konsumsi", targetFolder);
    var urlFotoMaterial = saveFileToDrive(payload.fotoMaterial, "Foto_Material", targetFolder);
    var urlVideoKegiatan = payload.videoUrl || saveFileToDrive(payload.videoKegiatan, "Video_Kegiatan", targetFolder);
    var urlDaftarHadir = saveFileToDrive(payload.daftarHadir, "Daftar_Hadir", targetFolder);

    var sheet = getSheetInstance();
    ensureHeaders(sheet);

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
      message: "Laporan berhasil disimpan ke Google Sheets & Drive!",
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
    return createJsonResponse({ status: "error", message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function getSheetInstance() {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  return sheet;
}

function getTargetFolder(namaDesa) {
  var parent = ROOT_FOLDER_ID ? DriveApp.getFolderById(ROOT_FOLDER_ID) : DriveApp.getRootFolder();
  var year = Utilities.formatDate(new Date(), "Asia/Makassar", "yyyy");
  var yearFolder = getOrCreateSubFolder(parent, "Gotong Royong " + year);
  return getOrCreateSubFolder(yearFolder, namaDesa);
}

function getOrCreateSubFolder(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function saveFileToDrive(fileObj, prefix, folder) {
  if (!fileObj || !fileObj.base64) return "";
  try {
    var raw = fileObj.base64;
    if (raw.indexOf(",") > -1) raw = raw.split(",")[1];
    var decoded = Utilities.base64Decode(raw);
    var mime = fileObj.mimeType || "image/jpeg";
    var ext = mime.indexOf("png") > -1 ? ".png" : (mime.indexOf("pdf") > -1 ? ".pdf" : ".jpg");
    var timeStamp = Utilities.formatDate(new Date(), "Asia/Makassar", "yyyyMMdd_HHmmss");
    var blob = Utilities.newBlob(decoded, mime, prefix + "_" + timeStamp + "_" + Math.floor(Math.random() * 1000) + ext);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch(e) {
    return "";
  }
}

function cleanNumber(val) {
  if (!val) return 0;
  if (typeof val === "number") return val;
  var str = String(val).replace(/[^0-9]/g, "");
  return str ? parseInt(str, 10) : 0;
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    var h = ${JSON.stringify(SHEET_COLUMNS)};
    sheet.appendRow(h);
    sheet.getRange(1, 1, 1, h.length).setFontWeight("bold").setBackground("#e6f4ea");
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}`;

    navigator.clipboard.writeText(scriptText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Header Modal */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Pengaturan Koneksi Google Sheets & Drive
              </h3>
              <p className="text-xs text-slate-500">
                Hubungkan ke akun: <strong className="text-emerald-800">waruppusigap@gmail.com</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-4 border-b border-slate-200 flex space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Form Konfigurasi
          </button>
          <button
            onClick={() => setActiveTab('tutorial')}
            className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'tutorial'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Panduan Setup Langkah-demi-Langkah
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'script'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Salin Kode Apps Script (Code.gs)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          
          {/* TAB 1: FORM KONFIGURASI */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Status Integrasi Google Cloud Waru Sigap</span>
                  <p className="mt-0.5 text-slate-700 leading-relaxed">
                    Setelah Anda mendeploy Google Apps Script di akun <strong className="text-emerald-900">waruppusigap@gmail.com</strong>, tempelkan link Web App URL di bawah ini. Aplikasi akan langsung terhubung secara live ke Google Sheets dan Google Drive tanpa perlu hosting berbayar!
                  </p>
                </div>
              </div>

              {/* URL Web App */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL Google Apps Script Web App <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    value={scriptUrl}
                    onChange={(e) => setScriptUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-emerald-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleTestPing}
                    disabled={isTesting || !scriptUrl}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{isTesting ? "Mengecek..." : "Test Koneksi"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Format harus berakhiran <code className="text-emerald-700 font-bold">/exec</code>.
                </p>

                {/* Test Result Display */}
                {testResult && (
                  <div className={`mt-2 p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                    testResult.success 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                      : 'bg-red-50 text-red-800 border-red-300'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* ID Google Sheet & ID Folder Drive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ID Spreadsheet Google Sheets
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE"
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Bisa dilihat pada URL Google Sheet di browser di antara <code className="text-slate-600">/d/</code> dan <code className="text-slate-600">/edit</code>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ID Folder Google Drive Tujuan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 1e92d8F4k... (Folder di waruppusigap@gmail.com)"
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Buka folder di Google Drive akun waruppusigap@gmail.com, ambil kode di akhir URL folder
                  </p>
                </div>
              </div>

              {/* Standar HOK Rate */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Standar Nilai Rupiah Tenaga Kerja per Orang (HOK Gotong Royong)
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">Rp</span>
                  <input
                    type="number"
                    step="10000"
                    value={defaultHokRate}
                    onChange={(e) => setDefaultHokRate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Digunakan untuk tombol "Hitung Otomatis HOK" di formulir input.
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: PANDUAN LANGKAH DEMI LANGKAH */}
          {activeTab === 'tutorial' && (
            <div className="space-y-4 text-xs text-slate-700">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">1</span>
                  <h4>Login ke Akun waruppusigap@gmail.com</h4>
                </div>
                <p className="text-slate-600 pl-7 leading-relaxed">
                  Buka peramban Google Chrome dan pastikan Anda sudah masuk (login) menggunakan akun <strong>waruppusigap@gmail.com</strong>.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">2</span>
                  <h4>Buka Google Drive & Buat Folder Berkas</h4>
                </div>
                <p className="text-slate-600 pl-7 leading-relaxed">
                  Buka <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">drive.google.com</a>. Buat folder baru, beri nama misalnya: <code className="bg-slate-200 px-1 py-0.5 rounded font-bold">DOKUMEN_GOTONG_ROYONG_WARU</code>. Buka folder tersebut dan salin ID foldernya dari URL di browser.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">3</span>
                  <h4>Buka Google Sheets & Pasang Apps Script</h4>
                </div>
                <p className="text-slate-600 pl-7 leading-relaxed">
                  Buka file Google Sheet pelaporan Anda (atau buat baru). Klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>. Hapus isi bawaan di editor, lalu salin dan tempelkan kode dari tab <em>"Salin Kode Apps Script"</em> di aplikasi ini.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">4</span>
                  <h4>Terapkan (Deploy) Sebagai Web App</h4>
                </div>
                <div className="pl-7 space-y-2 text-slate-600">
                  <p>Di halaman editor Apps Script, klik tombol biru <strong>Deploy (Terapkan)</strong> &gt; <strong>New deployment (Penerapan baru)</strong>:</p>
                  <ul className="list-disc list-inside space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                    <li>Pilih jenis (roda gigi): <strong>Web app (Aplikasi Web)</strong></li>
                    <li>Deskripsi: <em>API Gotong Royong Waru</em></li>
                    <li>Execute as (Jalankan sebagai): <strong>Me (waruppusigap@gmail.com)</strong></li>
                    <li>Who has access (Yang memiliki akses): <strong className="text-emerald-700">Anyone (Siapa saja)</strong></li>
                  </ul>
                  <p>Klik <strong>Deploy</strong>, izinkan akses akun Google (Authorize Access), lalu salin <strong>Web App URL</strong> yang dihasilkan.</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">5</span>
                  <h4>Tempelkan URL di Menu Konfigurasi Aplikasi</h4>
                </div>
                <p className="text-slate-600 pl-7 leading-relaxed">
                  Kembali ke tab <em>"Form Konfigurasi"</em> di aplikasi ini, tempelkan URL tersebut, klik <strong>Test Koneksi</strong>, lalu klik <strong>Simpan Pengaturan</strong>. Selesai!
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: SALIN KODE SCRIPT */}
          {activeTab === 'script' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Script Google Apps Script (Code.gs)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    File ini sudah disesuaikan dengan folder & sheet ID yang Anda masukkan di form.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyAppsScript}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? "Berhasil Disalin!" : "Salin Seluruh Kode"}</span>
                </button>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-72 border border-slate-800">
                <pre>{`// Google Apps Script Backend Siap Pakai
// Paste script ini di Ekstensi > Apps Script Google Sheet Anda
// Klik Deploy > New Deployment > Web App > Access: Anyone`}</pre>
                <p className="text-slate-400 mt-2">
                  (Klik tombol "Salin Seluruh Kode" di pojok kanan atas untuk menyalin naskah lengkap).
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-1">
                  Format Header Kolom Google Sheet (Sesuai Spreadsheet Anda):
                </span>
                <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                  {SHEET_COLUMNS.map((col, idx) => (
                    <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-slate-700">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Kecamatan Waru • waruppusigap@gmail.com
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
