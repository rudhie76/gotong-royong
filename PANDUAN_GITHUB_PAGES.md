# PANDUAN DEPLOY KE GITHUB PAGES
## APLIKASI SIP-GOTONG ROYONG KECAMATAN WARU
**Akses Online Gratis untuk Petugas Lapangan & Warga Se-Kecamatan Waru**

Dengan GitHub Pages, aplikasi ini dapat diakses secara online 24 jam gratis oleh seluruh staf kantor kecamatan, kepala desa, lurah, dan ketua RT melalui HP maupun laptop dari mana saja melalui tautan resmi:
`https://<username-github>.github.io/gotong-royong/`

---

### METODE 1: Otomatis via GitHub Actions (Sangat Disarankan)

Proyek ini sudah dilengkapi file workflow otomatis di [`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml). Setiap kali Anda melakukan `git push`, GitHub akan otomatis mem-build dan memperbarui website Anda dalam 1 menit.

#### Langkah-langkah:
1. **Buat Repositori Baru di GitHub:**
   - Buka [github.com](https://github.com) dan login ke akun GitHub Anda.
   - Klik tombol hijau **New** (Buat repositori baru).
   - Beri nama repositori, contoh: **`gotong-royong`** (atau `sip-gotong-royong`).
   - Pilih **Public** (agar GitHub Pages gratis).
   - Jangan centang "Add a README file" (karena file sudah ada di lokal).
   - Klik **Create repository**.

2. **Inisialisasi & Push Kode dari Komputer Anda:**
   Buka terminal PowerShell di folder ini (`d:\RUDIANSYAH\Aplikasku\Gotong-royong`) dan ketik perintah berikut secara berurutan:
   ```bash
   git init
   git add .
   git commit -m "Inisialisasi Aplikasi Gotong Royong Kecamatan Waru"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/gotong-royong.git
   git push -u origin main
   ```
   *(Ganti `USERNAME_ANDA` dengan username akun GitHub Anda).*

3. **Aktifkan GitHub Pages di Repository Settings:**
   - Di halaman repositori GitHub Anda, klik tab **Settings** (di sebelah kanan atas).
   - Di menu sebelah kiri, klik menu **Pages** (di bawah bagian *Code and automation*).
   - Pada bagian **Build and deployment** &gt; **Source**, ganti pilihan dropdown dari *"Deploy from a branch"* menjadi **`GitHub Actions`**.
   - Tunggu sekitar 1 menit. Buka tab **Actions** di atas untuk melihat proses deploy.
   - Selesai! Tautan website Anda akan muncul di bagian atas halaman Pages:
     **`https://USERNAME_ANDA.github.io/gotong-royong/`**

---

### METODE 2: Deploy Cepat 1 Perintah via `npm run deploy`

Jika Anda ingin deploy langsung dari terminal komputer tanpa setup GitHub Actions:

1. Pastikan remote git sudah terhubung:
   ```bash
   git remote add origin https://github.com/USERNAME_ANDA/gotong-royong.git
   ```
2. Jalankan perintah:
   ```bash
   npm run deploy
   ```
3. Perintah ini akan otomatis:
   - Menjalankan `npm run build`
   - Membuat branch `gh-pages` di repositori GitHub Anda
   - Mengunggah seluruh berkas web ke branch tersebut.
4. Di GitHub **Settings** &gt; **Pages**:
   - Pastikan **Source** adalah: *Deploy from a branch*
   - Branch: pilih **`gh-pages`** dan folder **`/(root)`**
   - Klik **Save**.

---

### Catatan Penting untuk Teknisi:
- Konfigurasi `base: './'` pada [`vite.config.js`](file:///d:/RUDIANSYAH/Aplikasku/Gotong-royong/vite.config.js) sudah diatur dengan path relatif. Artinya, berkas CSS, gambar, dan JavaScript akan terbaca normal tanpa error 404 berapapun nama repositori yang Anda gunakan.
- Web App URL Google Apps Script yang terhubung ke `waruppusigap@gmail.com` akan tetap tersimpan aman di browser masing-masing pengguna (atau bisa dimasukkan sekali di menu Pengaturan aplikasi).
