/**
 * Service untuk komunikasi dengan Google Apps Script Web App API
 * dan manajemen penyimpanan lokal / offline fallback
 */

const STORAGE_KEY_REPORTS = "sigap_gotong_royong_reports";
const STORAGE_KEY_CONFIG = "sigap_gotong_royong_config";

export const DEFAULT_CONFIG = {
  scriptUrl: "https://script.google.com/macros/s/AKfycbxz1JenYj9nnrXNMeNPhXRajGmkcRmgLMSQpyHOiZT023R4FdmeNln7jao0WGry5BDlrw/exec", // URL Google Apps Script Web App Resmi
  sheetId: "",
  folderId: "",
  adminEmail: "waruppusigap@gmail.com",
  subdistrictName: "Kecamatan Waru",
  districtName: "Kabupaten Penajam Paser Utara",
  defaultHokRate: 100000, // Standar nilai rupiah per orang (HOK) jika dihitung otomatis
};

/**
 * Mengambil konfigurasi dari localStorage
 */
export function getConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      // Pastikan jika di localStorage nilainya kosong, tetap gunakan URL resmi Google Apps Script
      scriptUrl: (parsed.scriptUrl && parsed.scriptUrl.trim()) ? parsed.scriptUrl : DEFAULT_CONFIG.scriptUrl,
    };
  } catch (e) {
    return DEFAULT_CONFIG;
  }
}

/**
 * Menyimpan konfigurasi ke localStorage
 */
export function saveConfig(newConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
    return true;
  } catch (e) {
    console.error("Gagal menyimpan config:", e);
    return false;
  }
}

/**
 * Membersihkan URL bertipe base64 mentah & objek berkas dari daftar laporan
 * sebelum disimpan ke localStorage agar tidak melebihi kuota 5MB browser.
 * Link resmi Google Drive (https://...) tetap dipertahankan.
 */
export function sanitizeReportsForLocalStorage(reports) {
  if (!Array.isArray(reports)) return [];
  return reports.map((report) => {
    const clean = { ...report };

    const sanitizeUrlField = (val) => {
      if (!val) return "";
      const lines = String(val).split('\n');
      const validUrls = lines.map(line => {
        const trimmed = line.trim();
        // Singkirkan data base64 (diawali data: atau string sangat panjang tanpa https)
        if (trimmed.startsWith('data:') || (trimmed.length > 500 && !trimmed.startsWith('http'))) {
          return "";
        }
        return trimmed;
      }).filter(Boolean);
      return validUrls.join('\n');
    };

    clean.fotoKegiatanUrl = sanitizeUrlField(clean.fotoKegiatanUrl);
    clean.fotoKonsumsiUrl = sanitizeUrlField(clean.fotoKonsumsiUrl);
    clean.fotoMaterialUrl = sanitizeUrlField(clean.fotoMaterialUrl);
    clean.daftarHadirUrl = sanitizeUrlField(clean.daftarHadirUrl);

    // Hapus berkas mentah base64 yang membebani localStorage
    delete clean.fotoKegiatan;
    delete clean.fotoKonsumsi;
    delete clean.fotoMaterial;
    delete clean.daftarHadir;
    delete clean.videoKegiatan;

    return clean;
  });
}

/**
 * Menyimpan laporan ke localStorage dengan aman tanpa risiko QuotaExceededError
 */
export function safeSetLocalStorageReports(reports) {
  try {
    const sanitized = sanitizeReportsForLocalStorage(reports);
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(sanitized));
  } catch (err) {
    console.warn("Storage quota exceeded saat menyimpan cache laporan. Melakukan pembersihan cache:", err);
    try {
      // Jika penyimpanan browser penuh, simpan 10 laporan terbaru saja
      const trimmed = sanitizeReportsForLocalStorage(reports).slice(0, 10);
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(trimmed));
    } catch (err2) {
      console.warn("Gagal menyimpan ke cache lokal:", err2);
      // JANGAN LEMPAR ERROR: Jangan biarkan kegagalan cache browser menghentikan proses simpan ke Google Sheets!
    }
  }
}

// Inisialisasi: otomatis bersihkan localStorage jika sebelumnya tersimpan data base64
try {
  const existingRaw = localStorage.getItem(STORAGE_KEY_REPORTS);
  if (existingRaw && (existingRaw.includes('data:image') || existingRaw.length > 200000)) {
    const parsed = JSON.parse(existingRaw);
    safeSetLocalStorageReports(parsed);
  }
} catch (e) {
  console.warn("Inisialisasi pembersihan cache lokal:", e);
}

/**
 * Kompres gambar di sisi browser agar ukuran berkas kecil (< 300KB)
 * dan cepat terunggah ke Google Drive melalui Google Apps Script.
 */
export async function compressAndEncodeImage(file, maxDimension = 1280, quality = 0.75) {
  if (!file) return null;

  // Jika bukan gambar (misal PDF atau Video), baca langsung ke Base64
  if (!file.type.startsWith("image/")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          base64: reader.result,
          size: file.size,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve({
          name: file.name,
          mimeType: "image/jpeg",
          base64: compressedDataUrl,
          size: Math.round((compressedDataUrl.length * 3) / 4),
        });
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Format angka ke format mata uang Rupiah
 */
export function formatRupiah(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Uji koneksi ke Google Apps Script Web App
 */
export async function testApiConnection(url) {
  const targetUrl = url || getConfig().scriptUrl;
  if (!targetUrl) {
    return { success: false, message: "URL Web App belum diisi." };
  }

  try {
    const separator = targetUrl.includes("?") ? "&" : "?";
    const pingUrl = `${targetUrl}${separator}action=ping&_t=${Date.now()}`;
    const res = await fetch(pingUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      data,
      message: "Terhubung sukses dengan Google Apps Script waruppusigap@gmail.com!",
    };
  } catch (error) {
    return {
      success: false,
      message: `Gagal terhubung: ${error.message}. Pastikan Web App di-deploy dengan akses 'Anyone' (Siapa saja).`,
    };
  }
}

/**
 * Mengambil data laporan:
 * Jika Web App URL diatur, ambil dari Google Sheets via GAS.
 * Jika belum, ambil dari localStorage (atau sampel awal).
 */
export async function fetchReports() {
  const config = getConfig();

  if (config.scriptUrl) {
    try {
      const separator = config.scriptUrl.includes("?") ? "&" : "?";
      const fetchUrl = `${config.scriptUrl}${separator}action=getData&_t=${Date.now()}`;
      const res = await fetch(fetchUrl);
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          // Normalisasi nama field dari spreadsheet ke format frontend
          const mapped = json.data.map((row, idx) => ({
            id: row["Timestamp"] ? `rep-${String(row["Timestamp"]).replace(/[^a-zA-Z0-9]/g, '')}-${idx}` : `row-${idx + 1}`,
            rowNumber: row["_rowNumber"] || (idx + 2),
            timestamp: row["Timestamp"] || "",
            desa: row["Kecamatan/Kelurahan/Desa"] || "",
            bidangKegiatan: row["Bidang Kegiatan"] || "",
            waktuKegiatan: row["Tanggal/Hari/Jam Kegiatan"] || "",
            deskripsiKegiatan: row["Deskripsi Kegiatan"] || "",
            lokasiKegiatan: row["Lokasi Kegiatan"] || "",
            jumlahHadir: Number(row["Jumlah Orang Yang Hadir"]) || 0,
            nilaiOrangRupiah: Number(row["Jumlah Orang (Nilai Rupiah)"]) || 0,
            fotoKegiatanUrl: row["Dokumentasi/Foto Kegiatan"] || "",
            jenisKonsumsi: row["Jenis Konsumsi"] || "",
            nilaiKonsumsiRupiah: Number(row["Jenis Konsumsi (Nilai Rupiah)"]) || 0,
            fotoKonsumsiUrl: row["Foto Konsumsi"] || "",
            peralatan: row["Peralatan Yang Digunakan"] || "",
            material: row["Material Yang Digunakan"] || "",
            nilaiMaterialRupiah: Number(row["Material Yang Digunakan (Nilai Rupiah)"]) || 0,
            fotoMaterialUrl: row["Foto Material"] || "",
            videoUrl: row["Video Kegiatan"] || "",
            daftarHadirUrl: row["Daftar Hadir Kegiatan"] || "",
            capaian: row["Capaian Dalam Kegiatan"] || "",
            kendala: row["Kendala Dalam Kegiatan"] || "",
            catatanTambahan: row["Catatan / Keterangan Tambahan"] || "",
          }));

          // Simpan ke cache lokal secara aman
          safeSetLocalStorageReports(mapped);
          return { data: mapped, source: "google_sheet" };
        }
      }
    } catch (e) {
      console.warn("Gagal fetch dari Google Sheet, menggunakan data lokal:", e);
    }
  }

  // Fallback ke localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (raw) {
      return { data: JSON.parse(raw), source: "local_storage" };
    }
  } catch (e) {
    console.error("Gagal baca local storage", e);
  }

  return { data: [], source: "none" };
}

/**
 * Menyimpan laporan baru ke Google Apps Script (Drive + Sheet)
 * dan ke localStorage
 */
export async function submitReport(payload, onProgress) {
  const config = getConfig();

  if (onProgress) onProgress("Menyiapkan berkas dan data laporan...");

  // Pisahkan berkas mentah base64 agar tidak membebani memori lokal
  const { fotoKegiatan, fotoKonsumsi, fotoMaterial, daftarHadir, videoKegiatan, ...payloadWithoutFiles } = payload;

  const localReports = JSON.parse(localStorage.getItem(STORAGE_KEY_REPORTS) || "[]");
  const newReportLocal = {
    id: `local-${Date.now()}`,
    timestamp: new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "Asia/Makassar",
    }).format(new Date()),
    ...payloadWithoutFiles,
    fotoKegiatanUrl: payload.fotoKegiatanUrl || "",
    fotoKonsumsiUrl: payload.fotoKonsumsiUrl || "",
    fotoMaterialUrl: payload.fotoMaterialUrl || "",
    daftarHadirUrl: payload.daftarHadirUrl || "",
  };

  localReports.unshift(newReportLocal);
  safeSetLocalStorageReports(localReports);

  // Jika URL Google Apps Script telah diset, kirim ke cloud
  if (config.scriptUrl) {
    if (onProgress) onProgress("Mengunggah berkas dokumentasi ke Google Drive...");

    try {
      const response = await fetch(config.scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      if (onProgress) onProgress("Menyimpan data laporan ke Google Sheets...");

      const result = await response.json();
      if (result.status === "success") {
        // Update URL Drive jika ada kembalian dari Apps Script
        if (result.driveLinks) {
          if (result.driveLinks.fotoKegiatan) newReportLocal.fotoKegiatanUrl = result.driveLinks.fotoKegiatan;
          if (result.driveLinks.fotoKonsumsi) newReportLocal.fotoKonsumsiUrl = result.driveLinks.fotoKonsumsi;
          if (result.driveLinks.fotoMaterial) newReportLocal.fotoMaterialUrl = result.driveLinks.fotoMaterial;
          if (result.driveLinks.daftarHadir) newReportLocal.daftarHadirUrl = result.driveLinks.daftarHadir;
          safeSetLocalStorageReports(localReports);
        }

        return {
          success: true,
          cloudSync: true,
          message: "Laporan kegiatan gotong royong berhasil dikirim dan tersimpan!",
          result,
        };
      } else {
        throw new Error(result.message || "Gagal dari Apps Script");
      }
    } catch (e) {
      console.error("Gagal sync ke Google Apps Script:", e);
      return {
        success: true,
        cloudSync: false,
        message: `Laporan disimpan di perangkat lokal (Gagal sync ke Google Sheets: ${e.message}). Pastikan koneksi internet stabil.`,
      };
    }
  }

  // Jika belum ada URL GAS
  return {
    success: true,
    cloudSync: false,
    message: "Laporan tersimpan di memori aplikasi lokal! Hubungkan Web App URL Google Apps Script di menu 'Pengaturan' untuk otomatis simpan ke Google Sheet & Drive.",
  };
}

/**
 * Memperbarui / Mengedit laporan yang sudah ada
 */
export async function updateReport(reportId, payload, onProgress) {
  const config = getConfig();

  if (onProgress) onProgress("Menyiapkan pembaruan data laporan...");

  // Format link Google Drive lama yang dipertahankan
  const existingFotoKegiatanList = Array.isArray(payload.existingFotoKegiatan) ? payload.existingFotoKegiatan : (payload.existingFotoKegiatan ? [payload.existingFotoKegiatan] : []);
  const existingFotoKonsumsiList = Array.isArray(payload.existingFotoKonsumsi) ? payload.existingFotoKonsumsi : (payload.existingFotoKonsumsi ? [payload.existingFotoKonsumsi] : []);
  const existingFotoMaterialList = Array.isArray(payload.existingFotoMaterial) ? payload.existingFotoMaterial : (payload.existingFotoMaterial ? [payload.existingFotoMaterial] : []);
  const existingDaftarHadirList = Array.isArray(payload.existingDaftarHadir) ? payload.existingDaftarHadir : (payload.existingDaftarHadir ? [payload.existingDaftarHadir] : []);

  // 1. Perbarui di localStorage secara aman (tanpa berkas mentah base64)
  let localReports = JSON.parse(localStorage.getItem(STORAGE_KEY_REPORTS) || "[]");
  const { fotoKegiatan, fotoKonsumsi, fotoMaterial, daftarHadir, videoKegiatan, ...payloadWithoutFiles } = payload;

  let foundIndex = localReports.findIndex(r => r.id === reportId || (r.timestamp && r.timestamp === payload.timestamp));
  if (foundIndex !== -1) {
    localReports[foundIndex] = {
      ...localReports[foundIndex],
      ...payloadWithoutFiles,
      fotoKegiatanUrl: existingFotoKegiatanList.join('\n') || localReports[foundIndex].fotoKegiatanUrl || "",
      fotoKonsumsiUrl: existingFotoKonsumsiList.join('\n') || localReports[foundIndex].fotoKonsumsiUrl || "",
      fotoMaterialUrl: existingFotoMaterialList.join('\n') || localReports[foundIndex].fotoMaterialUrl || "",
      daftarHadirUrl: existingDaftarHadirList.join('\n') || localReports[foundIndex].daftarHadirUrl || "",
    };
    safeSetLocalStorageReports(localReports);
  }

  // 2. Jika Google Apps Script terhubung, kirim aksi update ke cloud
  if (config.scriptUrl) {
    if (onProgress) onProgress("Mengunggah berkas baru & menyimpan perubahan ke Google Sheets...");

    try {
      const response = await fetch(config.scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          action: "update",
          id: reportId,
          timestamp: payload.timestamp,
          rowNumber: payload.rowNumber,
          existingFotoKegiatan: existingFotoKegiatanList.join('\n'),
          existingFotoKonsumsi: existingFotoKonsumsiList.join('\n'),
          existingFotoMaterial: existingFotoMaterialList.join('\n'),
          existingDaftarHadir: existingDaftarHadirList.join('\n'),
          ...payload,
        }),
      });

      const result = await response.json();
      if (result.status === "success") {
        // Deteksi apakah deployment Google Apps Script di server Google masih versi lama (append-only)
        const isOldScriptVersion = result.message && result.message.indexOf("Perubahan") === -1 && !result.updatedRow;

        if (result.driveLinks && foundIndex !== -1) {
          if (result.driveLinks.fotoKegiatan) localReports[foundIndex].fotoKegiatanUrl = result.driveLinks.fotoKegiatan;
          if (result.driveLinks.fotoKonsumsi) localReports[foundIndex].fotoKonsumsiUrl = result.driveLinks.fotoKonsumsi;
          if (result.driveLinks.fotoMaterial) localReports[foundIndex].fotoMaterialUrl = result.driveLinks.fotoMaterial;
          if (result.driveLinks.daftarHadir) localReports[foundIndex].daftarHadirUrl = result.driveLinks.daftarHadir;
          safeSetLocalStorageReports(localReports);
        }

        if (isOldScriptVersion) {
          return {
            success: true,
            cloudSync: true,
            needsScriptUpdate: true,
            message: "Laporan tersimpan, namun Google Apps Script masih versi lama (menambahkan baris baru alih-alih menimpa). Silakan perbarui versi script di Apps Script.",
            result,
          };
        }

        return {
          success: true,
          cloudSync: true,
          needsScriptUpdate: false,
          message: "Perubahan laporan berhasil disimpan ke Google Sheets & Drive!",
          result,
        };
      } else {
        throw new Error(result.message || "Gagal dari Google Apps Script");
      }
    } catch (e) {
      console.warn("Gagal sync update ke Google Apps Script:", e);
      return {
        success: true,
        cloudSync: false,
        message: `Perubahan disimpan di penyimpanan lokal (Cloud: ${e.message})`,
      };
    }
  }

  return {
    success: true,
    cloudSync: false,
    message: "Perubahan laporan berhasil disimpan!",
  };
}

/**
 * Menghapus laporan dari sistem dan cloud
 */
export async function deleteReport(reportId, reportIdentifier, onProgress) {
  const config = getConfig();

  if (onProgress) onProgress("Menghapus data laporan...");

  // 1. Hapus dari cache localStorage
  let localReports = JSON.parse(localStorage.getItem(STORAGE_KEY_REPORTS) || "[]");
  localReports = localReports.filter(r => {
    if (reportId && r.id === reportId) return false;
    if (reportIdentifier?.timestamp && r.timestamp === reportIdentifier.timestamp) return false;
    return true;
  });
  safeSetLocalStorageReports(localReports);

  // 2. Jika Google Apps Script terhubung, kirim aksi delete ke cloud
  if (config.scriptUrl) {
    if (onProgress) onProgress("Menghapus baris data dari Google Sheets...");

    try {
      const response = await fetch(config.scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          action: "delete",
          id: reportId,
          timestamp: reportIdentifier?.timestamp || "",
          rowNumber: reportIdentifier?.rowNumber || null,
          deskripsiKegiatan: reportIdentifier?.deskripsiKegiatan || "",
        }),
      });

      const result = await response.json();
      return {
        success: true,
        cloudSync: true,
        message: "Laporan berhasil dihapus dari Google Sheets!",
        result,
      };
    } catch (e) {
      console.warn("Gagal sync delete ke Google Apps Script:", e);
      return {
        success: true,
        cloudSync: false,
        message: `Laporan telah dihapus dari tampilan lokal.`,
      };
    }
  }

  return {
    success: true,
    cloudSync: false,
    message: "Laporan berhasil dihapus!",
  };
}
