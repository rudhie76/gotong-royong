import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const headers = [
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

const sampleRows = [
  [
    "21/08/2026 16:11:32",
    "Kecamatan Waru",
    "Lingkungan",
    "Sabtu, 21 Mei 2026, 08.00 Wita",
    "Membersihkan Halaman Kantor",
    "Kantor Kecamatan Waru",
    20,
    300000,
    "https://drive.google.com/open?id=sample_foto_kegiatan_1",
    "Gorengan dan minuman",
    250000,
    "https://drive.google.com/open?id=sample_foto_konsumsi_1",
    "Cangkul, mesin rumput, parang, sapu lidi",
    "Obat Rumput",
    25000,
    "https://drive.google.com/open?id=sample_foto_material_1",
    "https://drive.google.com/open?id=sample_video_1",
    "https://drive.google.com/open?id=sample_daftar_hadir_1",
    "Halaman kantor seluas 1.500 m2 bersih dan rapi",
    "Tidak ada kendala berarti",
    "Rutin diadakan Jumat bersih"
  ],
  [
    "28/08/2026 10:48:41",
    "Desa Sesulu",
    "Lingkungan",
    "Jumat, 05 Nov 2026",
    "Kegiatan Gotong royong pembersihan saluran drainase",
    "Wilayah RT/001 dan RT/011",
    25,
    4750000,
    "https://drive.google.com/open?id=sample_foto_kegiatan_2",
    "Snack dan Air Mineral",
    450000,
    "https://drive.google.com/open?id=sample_foto_konsumsi_2",
    "Cangkul, sapu lidi, parang dll",
    "Semen",
    75000,
    "https://drive.google.com/open?id=sample_foto_material_2",
    "https://drive.google.com/open?id=sample_video_2",
    "https://drive.google.com/open?id=sample_daftar_hadir_2",
    "Saluran air 250 meter dinormalisasi",
    "Tanah longsor di tepi parit",
    "Swadaya warga RT.001 dan RT.011 sangat antusias"
  ],
  [
    "09/06/2026 11:49:55",
    "Desa Bangun Mulya",
    "Lingkungan",
    "Kamis, 08 Jun 2026",
    "Kegiatan gotong royong pembersihan lingkungan dan gapura",
    "RT/003 & RT/009 Desa Bangun Mulya",
    55,
    8415000,
    "https://drive.google.com/open?id=sample_foto_kegiatan_3",
    "Makanan Ringan dan Teh",
    650000,
    "https://drive.google.com/open?id=sample_foto_konsumsi_3",
    "Plastik Sampah, sapu, kuas cat",
    "Semen",
    75000,
    "https://drive.google.com/open?id=sample_foto_material_3",
    "https://drive.google.com/open?id=sample_video_3",
    "https://drive.google.com/open?id=sample_daftar_hadir_3",
    "Gapura selesai dicat dan bahu jalan bersih",
    "Kekurangan kuas cat",
    "Didukung Karang Taruna dan PKK"
  ],
  [
    "02/07/2026 09:23:56",
    "Desa Api-Api",
    "Keagamaan",
    "Selasa, 01 Jul 2026 Pukul 06.30 Wita",
    "Gotong Royong Persiapan Kegiatan Tabligh & Penataan Lingkungan",
    "Jl. Propinsi RT. 009 (Halaman Belakang)",
    33,
    5082000,
    "https://drive.google.com/open?id=sample_foto_kegiatan_4",
    "Snack dan Air Mineral",
    412500,
    "https://drive.google.com/open?id=sample_foto_konsumsi_4",
    "Alat Kebersihan, Sapu lidi, Sapu",
    "Semen",
    412500,
    "https://drive.google.com/open?id=sample_foto_material_4",
    "https://drive.google.com/open?id=sample_video_4",
    "https://drive.google.com/open?id=sample_daftar_hadir_4",
    "Lokasi kegiatan tertata rapi dan bersih",
    "Tanah agak becek",
    "Dihadiri tokoh masyarakat desa"
  ],
  [
    "11/08/2026 09:12:44",
    "Kelurahan Waru",
    "Lingkungan",
    "Jumat, 8 Agustus 2026",
    "Membersihkan Fasilitas Umum dan Trotoar Jalan",
    "Kantor Kecamatan Waru & Sekitarnya",
    20,
    200000,
    "https://drive.google.com/open?id=sample_foto_kegiatan_5",
    "Gorengan dan minuman",
    100000,
    "https://drive.google.com/open?id=sample_foto_konsumsi_5",
    "Sapu lidi, cangkul, gerobak, mesin rumput",
    "BBM",
    25000,
    "https://drive.google.com/open?id=sample_foto_material_5",
    "https://drive.google.com/open?id=sample_video_5",
    "https://drive.google.com/open?id=sample_daftar_hadir_5",
    "Bahu jalan bebas semak liar",
    "Arus lalu lintas ramai",
    "Koordinasi Babinsa dan Bhabinkamtibmas"
  ]
];

const data = [headers, ...sampleRows];

// Buat Workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(data);

// Set column widths
ws['!cols'] = [
  { wch: 20 }, // Timestamp
  { wch: 22 }, // Desa
  { wch: 20 }, // Bidang
  { wch: 32 }, // Waktu
  { wch: 45 }, // Deskripsi
  { wch: 35 }, // Lokasi
  { wch: 15 }, // Hadir
  { wch: 22 }, // Nilai Hadir
  { wch: 35 }, // Foto Kegiatan
  { wch: 25 }, // Konsumsi
  { wch: 20 }, // Nilai Konsumsi
  { wch: 35 }, // Foto Konsumsi
  { wch: 35 }, // Peralatan
  { wch: 25 }, // Material
  { wch: 20 }, // Nilai Material
  { wch: 35 }, // Foto Material
  { wch: 35 }, // Video
  { wch: 35 }, // Daftar Hadir
  { wch: 35 }, // Capaian
  { wch: 30 }, // Kendala
  { wch: 35 }  // Catatan
];

XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

// Tulis ke root dan public
const xlsxFileName = "Template_Database_Gotong_Royong_Waru.xlsx";
const csvFileName = "Template_Database_Gotong_Royong_Waru.csv";

XLSX.writeFile(wb, xlsxFileName);
XLSX.writeFile(wb, path.join("public", xlsxFileName));

// Tulis CSV
const csvContent = "\uFEFF" + data.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
fs.writeFileSync(csvFileName, csvContent, 'utf-8');
fs.writeFileSync(path.join("public", csvFileName), csvContent, 'utf-8');

console.log("Template XLSX dan CSV berhasil dibuat di root dan public!");
