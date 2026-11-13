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
  CheckCircle2,
  Download,
  TableProperties
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
  const [isInitializingSheet, setIsInitializingSheet] = useState(false);
  const [initSheetResult, setInitSheetResult] = useState(null);
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

  // Panggil action=setup untuk membuat 21 kolom header di Google Sheets secara otomatis
  const handleAutoSetupHeaders = async () => {
    if (!scriptUrl.trim()) {
      alert("Masukkan URL Web App Google Apps Script terlebih dahulu.");
      return;
    }
    setIsInitializingSheet(true);
    setInitSheetResult(null);

    try {
      const sep = scriptUrl.includes("?") ? "&" : "?";
      const res = await fetch(`${scriptUrl.trim()}${sep}action=setup&_t=${Date.now()}`);
      const json = await res.json();
      setIsInitializingSheet(false);
      setInitSheetResult({
        success: json.status === "success",
        message: json.message || "Kolom header Google Sheets berhasil dibuat otomatis!"
      });
    } catch (e) {
      setIsInitializingSheet(false);
      setInitSheetResult({
        success: false,
        message: "Gagal memanggil API: " + e.message
      });
    }
  };

  const copyAppsScript = () => {
    const code = document.getElementById("raw-code-gs")?.innerText || "";
    navigator.clipboard.writeText(code);
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
                Pengaturan Database & Kolom Google Sheets
              </h3>
              <p className="text-xs text-slate-500">
                Akun Google Pengelola: <strong className="text-emerald-800">waruppusigap@gmail.com</strong>
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
            Form Konfigurasi & Inisialisasi
          </button>
          <button
            onClick={() => setActiveTab('tutorial')}
            className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'tutorial'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Panduan Lengkap
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'script'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Salin Kode Apps Script
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          
          {/* TAB 1: FORM KONFIGURASI */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              
              {/* Solusi Langsung Masalah "Kenapa belum ada kolom di database" */}
              <div className="bg-amber-50/90 p-4 rounded-2xl border border-amber-300 text-xs text-amber-950">
                <div className="flex items-start space-x-2.5">
                  <TableProperties className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <span className="font-bold text-sm block text-amber-900">
                      Kenapa belum ada kolom di Google Sheet Anda?
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      Google Spreadsheet yang baru dibuat masih berupa sheet kosong (polos). Kolom header (Kolom A s/d U) belum terbentuk karena belum pernah diinisialisasi.
                    </p>
                    <div className="pt-1 flex flex-wrap gap-2">
                      <a
                        href="./Template_Database_Gotong_Royong_Waru.xlsx"
                        download="Template_Database_Gotong_Royong_Waru.xlsx"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Template Excel (.xlsx)</span>
                      </a>
                      <a
                        href="./Template_Database_Gotong_Royong_Waru.csv"
                        download="Template_Database_Gotong_Royong_Waru.csv"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-semibold cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Download CSV (.csv)</span>
                      </a>
                    </div>
                    <p className="text-[11px] text-amber-800 italic">
                      💡 Anda cukup upload berkas Excel di atas ke Google Drive akun <strong>waruppusigap@gmail.com</strong> lalu klik "Buka dengan Google Spreadsheet", maka 21 kolom langsung jadi!
                    </p>
                  </div>
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
                    {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{isTesting ? "Mengecek..." : "Test Koneksi"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Format harus berakhiran <code className="text-emerald-700 font-bold">/exec</code>.
                </p>

                {/* Tombol Buat Kolom Otomatis via API */}
                {scriptUrl && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Buat Kolom Otomatis ke Google Sheets:</span>
                      <span className="text-[11px] text-slate-500">Kirim instruksi ke Apps Script untuk membuat 21 kolom header seketika.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoSetupHeaders}
                      disabled={isInitializingSheet}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                    >
                      <TableProperties className="w-3.5 h-3.5" />
                      <span>{isInitializingSheet ? "Membuat Kolom..." : "Buat Kolom Sekarang"}</span>
                    </button>
                  </div>
                )}

                {/* Status Inisialisasi */}
                {initSheetResult && (
                  <div className={`mt-2 p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                    initSheetResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
                  }`}>
                    {initSheetResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                    <span>{initSheetResult.message}</span>
                  </div>
                )}

                {/* Test Result Display */}
                {testResult && (
                  <div className={`mt-2 p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                    testResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
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
                    Kode di URL browser di antara <code className="text-slate-600">/d/</code> dan <code className="text-slate-600">/edit</code>
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
                    Buka folder di Google Drive waruppusigap, ambil kode di akhir link folder
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
              </div>

            </div>
          )}

          {/* TAB 2: PANDUAN */}
          {activeTab === 'tutorial' && (
            <div className="space-y-4 text-xs text-slate-700">
              
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                <h4 className="font-bold text-emerald-900 text-sm mb-1">
                  CARA PALING PRAKTIS MEMBUAT DATABASE & KOLOM:
                </h4>
                <p className="text-slate-700 leading-relaxed mb-3">
                  Pilih salah satu dari 2 cara mudah di bawah ini agar kolom di Google Sheets langsung terisi rapi:
                </p>
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded-xl border border-emerald-300">
                    <span className="font-bold text-emerald-800 block">Cara A (Upload Berkas Jadi):</span>
                    <p className="text-slate-600">
                      1. Download berkas <strong>Template_Database_Gotong_Royong_Waru.xlsx</strong>.<br />
                      2. Buka <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">drive.google.com</a> akun <code>waruppusigap@gmail.com</code>.<br />
                      3. Klik <strong>Baru (New)</strong> &gt; <strong>Upload file</strong> &gt; pilih file Excel tadi.<br />
                      4. Klik ganda file tersebut lalu pilih <strong>Buka dengan Google Spreadsheet</strong>. Selesai!
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-300">
                    <span className="font-bold text-emerald-800 block">Cara B (Menu Otomatis di Google Sheet):</span>
                    <p className="text-slate-600">
                      1. Buka Google Sheet Anda.<br />
                      2. Buka <strong>Ekstensi</strong> &gt; <strong>Apps Script</strong>, pasang kode dari tab "Salin Kode Apps Script".<br />
                      3. Di bilah atas Apps Script, pilih fungsi <strong><code>inisialisasiDatabaseOtomatis</code></strong> lalu klik tombol <strong>Run (Jalankan)</strong>.<br />
                      4. Buka kembali Google Sheet Anda, seluruh 21 kolom (A s/d U) langsung otomatis dibuat lengkap dengan warna dan garis border!
                    </p>
                  </div>
                </div>
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
                    Sudah dilengkapi fungsi otomatis <code>inisialisasiDatabaseOtomatis()</code> dan menu Google Sheet!
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
                <pre id="raw-code-gs">{`/**
 * SISTEM INFORMASI PELAPORAN GOTONG ROYONG (SIGAP GOTONG ROYONG)
 * KECAMATAN WARU - KABUPATEN PENAJAM PASER UTARA
 * Akun Pengelola: waruppusigap@gmail.com
 */

var SPREADSHEET_ID = "${sheetId.trim()}";
var SHEET_NAME = "Sheet1";
var ROOT_FOLDER_ID = "${folderId.trim()}";

var DAFTAR_KOLOM_HEADER = ${JSON.stringify(SHEET_COLUMNS, null, 2)};

function onOpen() {
  SpreadsheetApp.getUi().createMenu("🏛️ Menu Kecamatan Waru")
    .addItem("⚡ Inisialisasi Kolom Header Otomatis (A - U)", "inisialisasiDatabaseOtomatis")
    .addItem("📋 Isi Data Contoh Awal (Simulasi)", "isiDataContohAwal")
    .addToUi();
}

function inisialisasiDatabaseOtomatis() {
  var sheet = getSheetInstance();
  sheet.getRange(1, 1, 1, DAFTAR_KOLOM_HEADER.length).setValues([DAFTAR_KOLOM_HEADER]);
  var headerRange = sheet.getRange(1, 1, 1, DAFTAR_KOLOM_HEADER.length);
  headerRange.setFontWeight("bold").setFontColor("#ffffff").setBackground("#065f46")
             .setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
  sheet.setRowHeight(1, 40);
  sheet.setFrozenRows(1);
  sheet.getRange("H2:H").setNumberFormat('"Rp"#,##0');
  sheet.getRange("K2:K").setNumberFormat('"Rp"#,##0');
  sheet.getRange("O2:O").setNumberFormat('"Rp"#,##0');
  sheet.getRange("G2:G").setHorizontalAlignment("center");
  for (var i = 1; i <= DAFTAR_KOLOM_HEADER.length; i++) {
    sheet.autoResizeColumn(i);
    if (sheet.getColumnWidth(i) < 140) sheet.setColumnWidth(i, 160);
  }
}

function doGet(e) {
  try {
    var action = e && e.parameter && e.parameter.action ? e.parameter.action : "getData";
    if (action === "ping") {
      return createJsonResponse({ status: "success", message: "API Siaga & Terhubung!" });
    }
    if (action === "setup") {
      inisialisasiDatabaseOtomatis();
      return createJsonResponse({ status: "success", message: "Kolom header Google Sheets berhasil dibuat otomatis!" });
    }
    var sheet = getSheetInstance();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse({ status: "success", total: 0, headers: data[0] || DAFTAR_KOLOM_HEADER, data: [] });
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
    var action = payload.action || "create";
    var sheet = getSheetInstance();
    if (sheet.getLastRow() === 0) inisialisasiDatabaseOtomatis();

    // 1. AKSI HAPUS (DELETE)
    if (action === "delete") {
      var targetRow = findRowIndex(sheet, payload);
      if (targetRow > 1) {
        sheet.deleteRow(targetRow);
        return createJsonResponse({ status: "success", message: "Laporan baris ke-" + targetRow + " berhasil dihapus!", deletedRow: targetRow });
      }
      return createJsonResponse({ status: "warning", message: "Baris tidak ditemukan." });
    }

    // 2. AKSI EDIT / UPDATE
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
          driveLinks: { fotoKegiatan: urlFotoKegiatan, fotoKonsumsi: urlFotoKonsumsi, fotoMaterial: urlFotoMaterial, videoKegiatan: urlVideoKegiatan, daftarHadir: urlDaftarHadir }
        });
      }
      throw new Error("Baris data tidak ditemukan untuk diedit.");
    }

    // 3. AKSI CREATE
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
      message: "Laporan berhasil disimpan!",
      driveLinks: {
        fotoKegiatan: urlFotoKegiatan,
        fotoKonsumsi: urlFotoKonsumsi,
        fotoMaterial: urlFotoMaterial,
        videoKegiatan: urlVideoKegiatan,
        daftarHadir: urlDaftarHadir
      }
    });
  } catch(err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function getSheetInstance() {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
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
  } catch(e) { return ""; }
}

function findRowIndex(sheet, payload) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;
  var targetRow = Number(payload.rowNumber);
  var targetTimestamp = String(payload.timestamp || "").trim();
  if (targetRow && targetRow >= 2 && targetRow <= lastRow) return targetRow;
  var rangeVals = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < rangeVals.length; i++) {
    var curVal = rangeVals[i][0];
    var curTime = curVal instanceof Date ? Utilities.formatDate(curVal, "Asia/Makassar", "dd/MM/yyyy HH:mm") : String(curVal || "").trim();
    if (targetTimestamp && (curTime === targetTimestamp || curTime.indexOf(targetTimestamp) !== -1 || targetTimestamp.indexOf(curTime) !== -1)) return i + 2;
  }
  return -1;
}

function mergeFileUrls(filesInput, existingUrlStr, prefix, folder) {
  var newUrls = saveFilesToDrive(filesInput, prefix, folder);
  var exist = existingUrlStr ? String(existingUrlStr).trim() : "";
  if (newUrls && exist) return exist + "\n" + newUrls;
  return newUrls || exist || "";
}

function saveFilesToDrive(filesInput, prefix, folder) {
  if (!filesInput) return "";
  if (Array.isArray(filesInput)) {
    var urls = [];
    for (var i = 0; i < filesInput.length; i++) {
      var u = saveFileToDrive(filesInput[i], prefix + "_" + (i + 1), folder);
      if (u) urls.push(u);
    }
    return urls.join("\n");
  }
  return saveFileToDrive(filesInput, prefix, folder);
}

function cleanNumber(val) {
  if (!val) return 0;
  if (typeof val === "number") return val;
  var str = String(val).replace(/[^0-9]/g, "");
  return str ? parseInt(str, 10) : 0;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}`}</pre>
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
