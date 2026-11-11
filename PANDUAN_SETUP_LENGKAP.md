# PANDUAN LENGKAP SETUP SISTEM PELAPORAN GOTONG ROYONG
## KECAMATAN WARU, KABUPATEN PENAJAM PASER UTARA
**Database: Google Sheets | Penyimpanan File: Google Drive (waruppusigap@gmail.com)**

---

### 1. Ringkasan Arsitektur Sistem
Aplikasi ini dirancang khusus untuk memenuhi kebutuhan Kantor Kecamatan Waru dalam mengumpulkan, mengelola, dan merekapitulasi laporan kegiatan gotong royong dari seluruh kelurahan dan desa (Kelurahan Waru, Desa Sesulu, Desa Bangun Mulya, Desa Api-Api, dan Instansi Kecamatan Waru).

- **Antarmuka Pengguna (Web App):** Responsif di smartphone (HP Android petugas lapangan) dan laptop/PC kantor. Dilengkapi kompresi otomatis gambar agar hemat kuota dan cepat saat upload di lokasi dengan sinyal minim.
- **Backend API:** Menggunakan **Google Apps Script** (Gratis, tanpa sewa hosting/server, langsung berjalan di cloud Google).
- **Database:** **Google Sheets** (Setiap laporan langsung tercatat rapi per baris secara real-time).
- **Penyimpanan Dokumen/Foto/Video:** **Google Drive** milik akun `waruppusigap@gmail.com` (File tersimpan otomatis dan teratur per sub-folder tahun dan desa).

---

### 2. Langkah 1: Persiapan Folder di Google Drive waruppusigap@gmail.com

1. Buka peramban (browser) dan login ke akun Google: **`waruppusigap@gmail.com`**.
2. Buka **Google Drive** ([drive.google.com](https://drive.google.com)).
3. Buat Folder Baru, beri nama misalnya: **`GOTONG_ROYONG_WARU`**.
4. Buka folder yang baru dibuat tersebut. Perhatikan link URL di address bar browser Anda:
   ```text
   https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ12345
   ```
5. **Salin ID Folder** tersebut (kode acak setelah `/folders/`, contoh di atas: `1aBcDeFgHiJkLmNoPqRsTuVwXyZ12345`). Simpan kode ini.

---

### 3. Langkah 2: Persiapan Google Sheets

1. Di Google Drive akun `waruppusigap@gmail.com`, buat file **Google Spreadsheet** baru. Beri judul misalnya: **`Database Pelaporan Gotong Royong Kecamatan Waru`**.
2. Pada baris pertama (Baris 1 / Header), pastikan susunan kolomnya sebagai berikut (Kolom A sampai U):

| Kolom | Nama Header Kolom | Keterangan |
| :--- | :--- | :--- |
| **A** | Timestamp | Tanggal & waktu pengiriman data |
| **B** | Kecamatan/Kelurahan/Desa | Nama desa/kelurahan pelapor |
| **C** | Bidang Kegiatan | Bidang gotong royong |
| **D** | Tanggal/Hari/Jam Kegiatan | Waktu pelaksanaan di lapangan |
| **E** | Deskripsi Kegiatan | Uraian bentuk kegiatan |
| **F** | Lokasi Kegiatan | Titik/lokasi gotong royong |
| **G** | Jumlah Orang Yang Hadir | Jumlah warga/peserta |
| **H** | Jumlah Orang (Nilai Rupiah) | Nilai estimasi tenaga kerja (HOK) |
| **I** | Dokumentasi/Foto Kegiatan | Link file Google Drive |
| **J** | Jenis Konsumsi | Uraian konsumsi swadaya |
| **K** | Jenis Konsumsi (Nilai Rupiah) | Nilai rupiah konsumsi |
| **L** | Foto Konsumsi | Link file Google Drive |
| **M** | Peralatan Yang Digunakan | Cangkul, mesin rumput, parang, dll. |
| **N** | Material Yang Digunakan | Semen, pasir, cat, BBM, dll. |
| **O** | Material Yang Digunakan (Nilai Rupiah) | Nilai rupiah material |
| **P** | Foto Material | Link file Google Drive |
| **Q** | Video Kegiatan | Link video drive/YouTube |
| **R** | Daftar Hadir Kegiatan | Link file presensi peserta |
| **S** | Capaian Dalam Kegiatan | Hasil yang dicapai |
| **T** | Kendala Dalam Kegiatan | Hambatan di lapangan |
| **U** | Catatan / Keterangan Tambahan | Catatan evaluasi / tindak lanjut |

3. Perhatikan URL Google Sheet Anda:
   ```text
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE/edit
   ```
   Kode di antara `/d/` dan `/edit` adalah **Spreadsheet ID**. Salin kode ini.

---

### 4. Langkah 3: Pemasangan Google Apps Script (Code.gs)

1. Pada Google Spreadsheet yang terbuka, klik menu: **Ekstensi (Extensions)** &gt; **Apps Script**.
2. Anda akan diarahkan ke editor Google Apps Script.
3. Hapus seluruh kode bawaan yang ada di editor.
4. Buka file **`apps-script/Code.gs`** yang ada di folder proyek ini (atau salin langsung dari tab *"Salin Kode Apps Script"* di menu Pengaturan aplikasi).
5. Tempelkan (Paste) seluruh kode tersebut ke editor Apps Script.
6. Pada bagian paling atas file script, isi variabel:
   ```javascript
   var SPREADSHEET_ID = "MASUKKAN_SPREADSHEET_ID_ANDA"; // Atau kosongkan jika script dibuat dari spreadsheet terkait
   var SHEET_NAME = "Sheet1"; // Sesuaikan nama tab di spreadsheet
   var ROOT_FOLDER_ID = "MASUKKAN_FOLDER_ID_DRIVE_ANDA"; // ID folder di waruppusigap@gmail.com
   ```
7. Klik ikon **Simpan (Save Disk)** atau tekan `Ctrl + S`.

---

### 5. Langkah 4: Terapkan (Deploy) Sebagai Web App

1. Di pojok kanan atas editor Apps Script, klik tombol biru **Deploy (Terapkan)** &gt; **New deployment (Penerapan baru)**.
2. Pada panel yang muncul, klik ikon roda gigi di sebelah kiri ("Select type") lalu pilih **Web app (Aplikasi Web)**.
3. Masukkan konfigurasi:
   - **Description:** `API Gotong Royong Waru v1`
   - **Execute as (Jalankan sebagai):** `Me (waruppusigap@gmail.com)`
   - **Who has access (Yang memiliki akses):** **`Anyone (Siapa saja)`** *(PENTING: Harus "Anyone" agar aplikasi pelaporan dapat mengirim berkas tanpa memblokir petugas lapangan).*
4. Klik tombol **Deploy**.
5. Jika muncul jendela izin keamanan ("Authorization required"), klik **Authorize access**, pilih akun `waruppusigap@gmail.com`, klik **Advanced (Lanjutan)** &gt; **Go to Untitled project (unsafe)** &gt; klik **Allow (Izinkan)**.
6. Salin **Web app URL** yang muncul (formatnya: `https://script.google.com/macros/s/AKfycb.../exec`).

---

### 6. Langkah 5: Hubungkan ke Aplikasi Web SIP-Gotong Royong

1. Buka aplikasi web SIP-Gotong Royong di browser Anda.
2. Klik ikon **Pengaturan (Roda Gigi)** di kanan atas.
3. Tempelkan Web App URL yang sudah Anda salin ke kolom **"URL Google Apps Script Web App"**.
4. Masukkan ID Spreadsheet dan ID Folder Drive Anda.
5. Klik tombol **Test Koneksi**. Jika muncul notifikasi hijau *"Terhubung sukses dengan Google Apps Script!"*, klik **Simpan Pengaturan**.
6. Selamat! Aplikasi kini **100% terhubung secara live**:
   - Setiap foto/berkas yang diunggah akan otomatis masuk ke folder Google Drive `waruppusigap@gmail.com`.
   - Setiap laporan akan tercatat langsung ke baris Google Sheet.
   - Dashboard dapat langsung menampilkan data rekapitulasi real-time!

---

### 7. Menjalankan Aplikasi di Komputer Kantor

Untuk menjalankan aplikasi ini di komputer kantor kapan saja:
1. Jalankan perintah di terminal:
   ```bash
   npm run dev
   ```
2. Buka tautan lokal yang muncul (contoh: `http://localhost:5173`).
3. Anda juga dapat membuat file shortcut `Jalankan_Aplikasi.bat` (sudah disediakan di folder proyek) sehingga staf kantor cukup klik ganda (double click) untuk membuka aplikasi.

---

### 8. Tips Publikasi Online (Agar Bisa Diakses Warga & Aparatur Desa dari HP)

Jika Anda ingin aplikasi ini dapat diakses oleh seluruh Kepala Desa, Lurah, Ketua RT, dan masyarakat se-Kecamatan Waru melalui HP masing-masing tanpa harus berada di kantor:
- Aplikasi ini dapat diunggah gratis ke **Vercel**, **GitHub Pages**, atau **Netlify** dalam waktu kurang dari 2 menit (karena backend sudah ditangani oleh Google Apps Script di akun `waruppusigap@gmail.com`).
- Tinggal build proyek dengan `npm run build`, lalu upload folder `dist/` ke Vercel/Netlify.
