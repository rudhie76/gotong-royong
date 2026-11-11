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
            id: `row-${idx + 1}`,
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

          // Simpan ke cache lokal
          localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(mapped));
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

  // Simpan terlebih dahulu ke cache lokal
  const localReports = JSON.parse(localStorage.getItem(STORAGE_KEY_REPORTS) || "[]");
  const newReportLocal = {
    id: `local-${Date.now()}`,
    timestamp: new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "Asia/Makassar",
    }).format(new Date()),
    ...payload,
    // Jika ada file object, buat URL preview objek lokal
    fotoKegiatanUrl: payload.fotoKegiatan?.base64 || payload.fotoKegiatanUrl || "",
    fotoKonsumsiUrl: payload.fotoKonsumsi?.base64 || payload.fotoKonsumsiUrl || "",
    fotoMaterialUrl: payload.fotoMaterial?.base64 || payload.fotoMaterialUrl || "",
    daftarHadirUrl: payload.daftarHadir?.base64 || payload.daftarHadirUrl || "",
  };

  localReports.unshift(newReportLocal);
  localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(localReports));

  // Jika URL Google Apps Script telah diset, kirim ke cloud
  if (config.scriptUrl) {
    if (onProgress) onProgress("Mengunggah foto ke Google Drive waruppusigap@gmail.com...");

    try {
      const response = await fetch(config.scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      if (onProgress) onProgress("Mencatat data ke baris Google Sheet...");

      const result = await response.json();
      if (result.status === "success") {
        // Update URL Drive jika ada kembalian dari Apps Script
        if (result.driveLinks) {
          if (result.driveLinks.fotoKegiatan) newReportLocal.fotoKegiatanUrl = result.driveLinks.fotoKegiatan;
          if (result.driveLinks.fotoKonsumsi) newReportLocal.fotoKonsumsiUrl = result.driveLinks.fotoKonsumsi;
          if (result.driveLinks.fotoMaterial) newReportLocal.fotoMaterialUrl = result.driveLinks.fotoMaterial;
          if (result.driveLinks.daftarHadir) newReportLocal.daftarHadirUrl = result.driveLinks.daftarHadir;
          localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(localReports));
        }

        return {
          success: true,
          cloudSync: true,
          message: "Laporan berhasil terkirim ke Google Sheets & Google Drive waruppusigap@gmail.com!",
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
