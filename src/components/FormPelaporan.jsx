import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  MapPin, 
  Users, 
  Coffee, 
  Wrench, 
  Package, 
  Camera, 
  Video, 
  FileCheck, 
  FileText, 
  Send, 
  Upload, 
  Check, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Calculator,
  RefreshCw,
  Image as ImageIcon,
  X,
  Plus
} from 'lucide-react';
import { 
  WILAYAH_WARU, 
  BIDANG_KEGIATAN, 
  REKOMENDASI_ALAT, 
  REKOMENDASI_MATERIAL, 
  REKOMENDASI_KONSUMSI 
} from '../constants';
import { 
  formatRupiah, 
  compressAndEncodeImage, 
  submitReport,
  getConfig 
} from '../services/apiService';
import confetti from 'canvas-confetti';

export default function FormPelaporan({ onReportSubmitted, onViewDashboard }) {
  const config = getConfig();

  // State Form
  const [formData, setFormData] = useState({
    desa: 'Kecamatan Waru',
    desaCustom: '',
    bidangKegiatan: 'Lingkungan (Gerakan Indonesia Bersih)',
    tanggal: new Date().toISOString().split('T')[0],
    jam: '08:00',
    waktuCustom: '',
    deskripsiKegiatan: '',
    lokasiKegiatan: '',
    jumlahHadir: 20,
    nilaiOrangRupiah: 2000000,
    jenisKonsumsi: 'Gorengan dan Minuman Teh Hangat',
    nilaiKonsumsiRupiah: 250000,
    peralatan: 'Cangkul, mesin rumput, parang, sapu lidi',
    material: 'Obat Rumput, BBM Mesin',
    nilaiMaterialRupiah: 200000,
    videoUrl: '',
    capaian: '',
    kendala: '',
    catatanTambahan: '',
  });

  // State Files Uploaded (Mendukung Multi-Foto / Minimal 2 Foto)
  const [files, setFiles] = useState({
    fotoKegiatan: [],
    fotoKonsumsi: [],
    fotoMaterial: [],
    daftarHadir: [],
  });

  // State Previews (Array of URL strings)
  const [previews, setPreviews] = useState({
    fotoKegiatan: [],
    fotoKonsumsi: [],
    fotoMaterial: [],
    daftarHadir: [],
  });

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Auto-calculated summary
  const totalSwadaya = (Number(formData.nilaiOrangRupiah) || 0) + 
                       (Number(formData.nilaiKonsumsiRupiah) || 0) + 
                       (Number(formData.nilaiMaterialRupiah) || 0);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Quick Calculator: Hitung Nilai Tenaga Kerja = Jumlah Hadir * HOK
  const handleAutoCalcTenaga = () => {
    const hokRate = config.defaultHokRate || 100000;
    const total = (Number(formData.jumlahHadir) || 0) * hokRate;
    setFormData((prev) => ({ ...prev, nilaiOrangRupiah: total }));
  };

  // Quick Chips Append (Peralatan & Material)
  const handleAddTool = (tool) => {
    setFormData((prev) => {
      const current = prev.peralatan ? prev.peralatan.split(',').map((s) => s.trim()) : [];
      if (!current.includes(tool)) {
        return { ...prev, peralatan: current.concat(tool).filter(Boolean).join(', ') };
      }
      return prev;
    });
  };

  const handleAddMaterial = (mat) => {
    setFormData((prev) => {
      const current = prev.material ? prev.material.split(',').map((s) => s.trim()) : [];
      if (!current.includes(mat)) {
        return { ...prev, material: current.concat(mat).filter(Boolean).join(', ') };
      }
      return prev;
    });
  };

  // Handle Multi-File Selection & Compression
  const handleAddFiles = async (key, fileList) => {
    if (!fileList || fileList.length === 0) return;
    const incomingFiles = Array.from(fileList);

    // Buat URL preview lokal langsung untuk UI instan
    const newPreviewUrls = incomingFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...newPreviewUrls],
    }));

    // Kompresi gambar di latar belakang
    try {
      const compressionPromises = incomingFiles.map((f) => compressAndEncodeImage(f));
      const compressedFiles = await Promise.all(compressionPromises);

      setFiles((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), ...compressedFiles],
      }));
    } catch (e) {
      console.error("Gagal memproses berkas:", e);
    }
  };

  // Hapus single foto dari array
  const handleRemoveSingleFile = (key, index) => {
    setPreviews((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== index),
    }));
    setFiles((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== index),
    }));
  };

  // Format Tanggal Indonesia WITA
  const getFormattedWaktu = () => {
    if (formData.waktuCustom) return formData.waktuCustom;
    try {
      const d = new Date(`${formData.tanggal}T${formData.jam}`);
      const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()];
      const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][d.getMonth()];
      return `${hari}, ${d.getDate()} ${bulan} ${d.getFullYear()}, Pukul ${formData.jam} WITA`;
    } catch {
      return `${formData.tanggal} ${formData.jam} WITA`;
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.deskripsiKegiatan.trim()) {
      alert("Mohon isi deskripsi atau bentuk kegiatan gotong royong.");
      return;
    }
    if (!formData.lokasiKegiatan.trim()) {
      alert("Mohon isi lokasi spesifik pelaksanaan kegiatan.");
      return;
    }

    // Validasi Minimal 2 Foto untuk Foto Kegiatan Utama
    if (!files.fotoKegiatan || files.fotoKegiatan.length < 2) {
      alert("Mohon unggah minimal 2 foto untuk dokumentasi kegiatan gotong royong (saat ini baru " + (files.fotoKegiatan?.length || 0) + " foto).");
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress("Menyiapkan dan mengompres berkas foto...");

    const finalDesa = formData.desa === "Lainnya" ? formData.desaCustom : formData.desa;
    const waktuFinal = getFormattedWaktu();

    const payload = {
      desa: finalDesa,
      bidangKegiatan: formData.bidangKegiatan,
      waktuKegiatan: waktuFinal,
      deskripsiKegiatan: formData.deskripsiKegiatan,
      lokasiKegiatan: formData.lokasiKegiatan,
      jumlahHadir: Number(formData.jumlahHadir) || 0,
      nilaiOrangRupiah: Number(formData.nilaiOrangRupiah) || 0,
      fotoKegiatan: files.fotoKegiatan, // Array of files (>= 2)
      jenisKonsumsi: formData.jenisKonsumsi,
      nilaiKonsumsiRupiah: Number(formData.nilaiKonsumsiRupiah) || 0,
      fotoKonsumsi: files.fotoKonsumsi, // Array of files
      peralatan: formData.peralatan,
      material: formData.material,
      nilaiMaterialRupiah: Number(formData.nilaiMaterialRupiah) || 0,
      fotoMaterial: files.fotoMaterial, // Array of files
      videoUrl: formData.videoUrl,
      daftarHadir: files.daftarHadir, // Array of files
      capaian: formData.capaian,
      kendala: formData.kendala,
      catatanTambahan: formData.catatanTambahan,
    };

    try {
      const res = await submitReport(payload, (msg) => setSubmitProgress(msg));
      setIsSubmitting(false);
      setSubmitSuccess(res);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      if (onReportSubmitted) {
        onReportSubmitted();
      }
    } catch (err) {
      setIsSubmitting(false);
      alert("Terjadi kesalahan saat menyimpan laporan: " + err.message);
    }
  };

  const resetForm = () => {
    setSubmitSuccess(null);
    setPreviews({
      fotoKegiatan: [],
      fotoKonsumsi: [],
      fotoMaterial: [],
      daftarHadir: [],
    });
    setFiles({
      fotoKegiatan: [],
      fotoKonsumsi: [],
      fotoMaterial: [],
      daftarHadir: [],
    });
    setFormData((prev) => ({
      ...prev,
      deskripsiKegiatan: '',
      lokasiKegiatan: '',
      capaian: '',
      kendala: '',
      catatanTambahan: '',
      videoUrl: '',
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
      
      {/* Banner Intro Bersih (Tanpa Judul Ganda) */}
      <div className="mb-6 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
          Formulir Entri Laporan Gotong Royong
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Lengkapi rincian kegiatan, estimasi nilai swadaya warga, dan berkas dokumentasi (minimal 2 foto kegiatan).
        </p>
      </div>

      {/* Success Dialog Modal */}
      {submitSuccess && (
        <div className="mb-6 p-5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl shadow-md text-emerald-900 animate-in fade-in duration-300">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs">
              <Check className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-emerald-950">
                Laporan Gotong Royong Berhasil Disimpan!
              </h3>
              <p className="text-xs text-emerald-800 mt-1">
                {submitSuccess.message}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-semibold border border-emerald-300">
                  Total Nilai Swadaya: {formatRupiah(totalSwadaya)}
                </span>
                <span className="bg-white text-emerald-800 px-2.5 py-1 rounded-lg font-medium border border-emerald-200">
                  Waktu: {getFormattedWaktu()}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={onViewDashboard}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  Lihat di Dashboard Rekapitulasi →
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-300 cursor-pointer transition-colors"
                >
                  + Buat Laporan Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Utama: 2 Kolom Simetris & Seimbang */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* ================= KOLOM KIRI: DATA WILAYAH, TENAGA & KONSUMSI ================= */}
          <div className="space-y-6">
            
            {/* SECTION 1: IDENTITAS WILAYAH & WAKTU */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  1. Identitas Wilayah, Waktu & Bidang
                </h3>
              </div>
              <div className="p-4 space-y-3.5">
                
                {/* Desa / Kelurahan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kecamatan / Kelurahan / Desa <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="desa"
                    value={formData.desa}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-emerald-500 focus:bg-white"
                    required
                  >
                    {WILAYAH_WARU.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                    <option value="Lainnya">Lainnya (Ketik Manual)...</option>
                  </select>
                  {formData.desa === "Lainnya" && (
                    <input
                      type="text"
                      name="desaCustom"
                      placeholder="Ketik nama desa / instansi"
                      value={formData.desaCustom}
                      onChange={handleChange}
                      className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                      required
                    />
                  )}
                </div>

                {/* Bidang Kegiatan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bidang Kegiatan Gotong Royong <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="bidangKegiatan"
                    value={formData.bidangKegiatan}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-emerald-500 focus:bg-white"
                    required
                  >
                    {BIDANG_KEGIATAN.map((b) => (
                      <option key={b.id} value={b.label}>{b.label}</option>
                    ))}
                  </select>
                </div>

                {/* Tanggal & Jam */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal & Jam Pelaksanaan (WITA) <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                      required
                    />
                    <input
                      type="time"
                      name="jam"
                      value={formData.jam}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    Format: {getFormattedWaktu()}
                  </p>
                </div>

                {/* Lokasi Spesifik */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lokasi Spesifik Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="lokasiKegiatan"
                      placeholder="Contoh: Kantor Kecamatan Waru / RT.003 & RT.009 Desa Sesulu"
                      value={formData.lokasiKegiatan}
                      onChange={handleChange}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-emerald-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Deskripsi Kegiatan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bentuk / Deskripsi Kegiatan Gotong Royong <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="deskripsiKegiatan"
                    rows="2"
                    placeholder="Jelaskan ringkasan kerja bakti yang dilaksanakan, pembersihan jalan/parit, dsb."
                    value={formData.deskripsiKegiatan}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-emerald-500 focus:bg-white"
                    required
                  />
                </div>

              </div>
            </div>

            {/* SECTION 2: PARTISIPASI & TENAGA KERJA */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-800 text-sm">
                    2. Partisipasi Tenaga Kerja & HOK
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAutoCalcTenaga}
                  className="inline-flex items-center space-x-1 text-[11px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                  title="Hitung: Hadir x Standar HOK Rp 100.000"
                >
                  <Calculator className="w-3 h-3" />
                  <span>Hitung HOK</span>
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Hadir (Warga/Staf) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="jumlahHadir"
                      min="1"
                      value={formData.jumlahHadir}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-emerald-500"
                      required
                    />
                    <span className="absolute right-3 top-2 text-[11px] font-medium text-slate-400">
                      Orang
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nilai Tenaga Kerja (Rupiah) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="nilaiOrangRupiah"
                    min="0"
                    step="10000"
                    value={formData.nilaiOrangRupiah}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-emerald-800 focus:outline-emerald-500"
                    required
                  />
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                    Terbaca: {formatRupiah(formData.nilaiOrangRupiah)}
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 3: KONSUMSI SWADAYA */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center space-x-2">
                <Coffee className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  3. Konsumsi Swadaya & Foto
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jenis Konsumsi
                    </label>
                    <input
                      type="text"
                      name="jenisKonsumsi"
                      placeholder="Contoh: Gorengan, Snack, Air Mineral"
                      value={formData.jenisKonsumsi}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nilai Konsumsi (Rupiah)
                    </label>
                    <input
                      type="number"
                      name="nilaiKonsumsiRupiah"
                      min="0"
                      step="5000"
                      value={formData.nilaiKonsumsiRupiah}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-emerald-800"
                    />
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      {formatRupiah(formData.nilaiKonsumsiRupiah)}
                    </p>
                  </div>
                </div>

                {/* Upload Multi-Foto Konsumsi */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Foto Konsumsi Swadaya
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({previews.fotoKonsumsi.length} foto terpilih)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5 items-center">
                    {previews.fotoKonsumsi.map((url, idx) => (
                      <div key={idx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-300 shadow-2xs">
                        <img src={url} alt={`Konsumsi ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveSingleFile('fotoKonsumsi', idx)}
                          className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    <label className="h-14 px-3 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-colors text-slate-600">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span className="text-[11px] font-semibold">+ Tambah Foto</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleAddFiles('fotoKonsumsi', e.target.files)}
                      />
                    </label>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ================= KOLOM KANAN: MATERIAL, DOKUMENTASI & EVALUASI ================= */}
          <div className="space-y-6">
            
            {/* SECTION 4: PERALATAN & MATERIAL */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  4. Peralatan, Material Swadaya & Bukti
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peralatan Yang Digunakan
                  </label>
                  <input
                    type="text"
                    name="peralatan"
                    placeholder="Cangkul, mesin rumput, parang, sapu lidi"
                    value={formData.peralatan}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {REKOMENDASI_ALAT.slice(0, 5).map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => handleAddTool(a)}
                        className="text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-600 px-2 py-0.5 rounded transition-colors"
                      >
                        + {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Material Yang Digunakan
                    </label>
                    <input
                      type="text"
                      name="material"
                      placeholder="Obat rumput, semen, BBM, cat"
                      value={formData.material}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nilai Material (Rupiah)
                    </label>
                    <input
                      type="number"
                      name="nilaiMaterialRupiah"
                      min="0"
                      step="5000"
                      value={formData.nilaiMaterialRupiah}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-emerald-800"
                    />
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      {formatRupiah(formData.nilaiMaterialRupiah)}
                    </p>
                  </div>
                </div>

                {/* Upload Multi-Foto Material */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Foto Material / Nota Pembelian
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({previews.fotoMaterial.length} foto terpilih)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5 items-center">
                    {previews.fotoMaterial.map((url, idx) => (
                      <div key={idx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-300 shadow-2xs">
                        <img src={url} alt={`Material ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveSingleFile('fotoMaterial', idx)}
                          className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    <label className="h-14 px-3 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-colors text-slate-600">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span className="text-[11px] font-semibold">+ Tambah Foto / Nota</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleAddFiles('fotoMaterial', e.target.files)}
                      />
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* SECTION 5: DOKUMENTASI UTAMA (MINIMAL 2 FOTO), VIDEO & DAFTAR HADIR */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-800 text-sm">
                    5. Dokumentasi Foto (Min. 2 Foto), Video & Presensi
                  </h3>
                </div>
              </div>
              <div className="p-4 space-y-4">
                
                {/* UPLOAD FOTO KEGIATAN UTAMA (MINIMAL 2 FOTO BISA LEBIH) */}
                <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Foto Dokumentasi Kegiatan <span className="text-red-500">*</span>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Wajib unggah minimal 2 foto kegiatan di lapangan (bisa 2, 3, 4 atau lebih).
                      </span>
                    </div>

                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      previews.fotoKegiatan.length >= 2 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {previews.fotoKegiatan.length >= 2 
                        ? `✓ ${previews.fotoKegiatan.length} Foto Siap` 
                        : `Kurang ${2 - previews.fotoKegiatan.length} Foto (Min 2)`}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 items-center">
                    {previews.fotoKegiatan.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-300 shadow-2xs">
                        <img src={url} alt={`Dokumentasi ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded font-bold">
                          Foto {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSingleFile('fotoKegiatan', idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <label className="aspect-square border-2 border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-100/60 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors p-2">
                      <Camera className="w-5 h-5 text-emerald-600 mb-1" />
                      <span className="text-[11px] font-bold text-emerald-900 leading-tight">
                        + Tambah Foto
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        Pilih / Ambil
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleAddFiles('fotoKegiatan', e.target.files)}
                      />
                    </label>
                  </div>
                </div>

                {/* UPLOAD FOTO / SCAN DAFTAR HADIR (BISA LEBIH DARI 1 HALAMAN) */}
                <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Foto / Scan Lembar Daftar Hadir
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Unggah foto presensi tanda tangan peserta (bisa 1 halaman atau lebih).
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({previews.daftarHadir.length} berkas)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5 items-center">
                    {previews.daftarHadir.map((url, idx) => (
                      <div key={idx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-300 shadow-2xs">
                        <img src={url} alt={`Daftar Hadir ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveSingleFile('daftarHadir', idx)}
                          className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    <label className="h-14 px-3 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-colors text-slate-600">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-[11px] font-semibold">+ Tambah Lembar Presensi</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleAddFiles('daftarHadir', e.target.files)}
                      />
                    </label>
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Link Video Kegiatan (Google Drive / YouTube)
                  </label>
                  <div className="relative">
                    <Video className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      name="videoUrl"
                      placeholder="https://drive.google.com/... atau https://youtu.be/..."
                      value={formData.videoUrl}
                      onChange={handleChange}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* SECTION 6: CAPAIAN & KENDALA */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  6. Capaian Hasil, Kendala & Catatan
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Capaian Hasil Kegiatan
                    </label>
                    <textarea
                      name="capaian"
                      rows="2"
                      placeholder="Saluran air 200m dinormalisasi..."
                      value={formData.capaian}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kendala Lapangan
                    </label>
                    <textarea
                      name="kendala"
                      rows="2"
                      placeholder="Cuaca hujan, kurang alat cangkul..."
                      value={formData.kendala}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Tambahan / Rekomendasi
                  </label>
                  <input
                    type="text"
                    name="catatanTambahan"
                    placeholder="Diagendakan kerja bakti lanjutan..."
                    value={formData.catatanTambahan}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM ACTION BAR SIMETRIS & SEIMBANG */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border-2 border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
                Total Nilai Partisipasi Swadaya
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-800">
                {formatRupiah(totalSwadaya)}
              </span>
              <span className="text-[10px] text-slate-400 block">
                (Tenaga: {formatRupiah(formData.nilaiOrangRupiah)} + Konsumsi: {formatRupiah(formData.nilaiKonsumsiRupiah)} + Material: {formatRupiah(formData.nilaiMaterialRupiah)})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{submitProgress || "Mengirim Laporan..."}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Laporan Gotong Royong</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
