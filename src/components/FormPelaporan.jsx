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
  X
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

  // State Files Uploaded
  const [files, setFiles] = useState({
    fotoKegiatan: null,
    fotoKonsumsi: null,
    fotoMaterial: null,
    daftarHadir: null,
  });

  // State Previews
  const [previews, setPreviews] = useState({
    fotoKegiatan: null,
    fotoKonsumsi: null,
    fotoMaterial: null,
    daftarHadir: null,
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

  // Handle File Selection
  const handleFileChange = async (key, file) => {
    if (!file) return;

    // Tampilkan preview instan
    const localUrl = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [key]: localUrl }));

    // Simpan file terkompresi
    try {
      const encoded = await compressAndEncodeImage(file);
      setFiles((prev) => ({ ...prev, [key]: encoded }));
    } catch (e) {
      console.error("Gagal membaca berkas:", e);
    }
  };

  const handleRemoveFile = (key) => {
    setPreviews((prev) => ({ ...prev, [key]: null }));
    setFiles((prev) => ({ ...prev, [key]: null }));
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

    setIsSubmitting(true);
    setSubmitProgress("Menyiapkan berkas dan enkripsi gambar...");

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
      fotoKegiatan: files.fotoKegiatan,
      jenisKonsumsi: formData.jenisKonsumsi,
      nilaiKonsumsiRupiah: Number(formData.nilaiKonsumsiRupiah) || 0,
      fotoKonsumsi: files.fotoKonsumsi,
      peralatan: formData.peralatan,
      material: formData.material,
      nilaiMaterialRupiah: Number(formData.nilaiMaterialRupiah) || 0,
      fotoMaterial: files.fotoMaterial,
      videoUrl: formData.videoUrl,
      daftarHadir: files.daftarHadir,
      capaian: formData.capaian,
      kendala: formData.kendala,
      catatanTambahan: formData.catatanTambahan,
    };

    try {
      const res = await submitReport(payload, (msg) => setSubmitProgress(msg));
      setIsSubmitting(false);
      setSubmitSuccess(res);

      // Trigger Confetti effect
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
      fotoKegiatan: null,
      fotoKonsumsi: null,
      fotoMaterial: null,
      daftarHadir: null,
    });
    setFiles({
      fotoKegiatan: null,
      fotoKonsumsi: null,
      fotoMaterial: null,
      daftarHadir: null,
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
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
      {/* Banner Intro */}
      <div className="mb-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Formulir Entri Laporan</span>
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Pelaporan Kegiatan Gotong Royong
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Input data swadaya masyarakat, bukti dokumentasi kegiatan, dan rincian partisipasi warga Kecamatan Waru.
            </p>
          </div>
          <div className="bg-white px-3.5 py-2 rounded-xl border border-emerald-200 shadow-xs text-xs text-slate-600">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Tujuan Sinkronisasi:</span>
            <span className="font-semibold text-emerald-800">Google Sheets & Drive waruppusigap</span>
          </div>
        </div>
      </div>

      {/* Success Dialog Modal */}
      {submitSuccess && (
        <div className="mb-6 p-5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl shadow-md text-emerald-900 animate-in fade-in duration-300">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs">
              <Check className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-emerald-950">
                Laporan Gotong Royong Berhasil Disimpan!
              </h3>
              <p className="text-sm text-emerald-800 mt-1">
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
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onViewDashboard}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  Lihat di Dashboard Rekapitulasi →
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-xl border border-emerald-300 cursor-pointer transition-colors"
                >
                  + Buat Laporan Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: IDENTITAS WILAYAH & WAKTU */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">
              1. Identitas Wilayah, Waktu & Bidang
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Desa / Kelurahan / Kecamatan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kecamatan / Kelurahan / Desa <span className="text-red-500">*</span>
              </label>
              <select
                name="desa"
                value={formData.desa}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-emerald-500 focus:bg-white transition-all"
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
                  placeholder="Ketik nama desa / kelurahan / instansi"
                  value={formData.desaCustom}
                  onChange={handleChange}
                  className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-emerald-500"
                  required
                />
              )}
            </div>

            {/* Bidang Kegiatan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bidang Kegiatan Gotong Royong <span className="text-red-500">*</span>
              </label>
              <select
                name="bidangKegiatan"
                value={formData.bidangKegiatan}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-emerald-500 focus:bg-white transition-all"
                required
              >
                {BIDANG_KEGIATAN.map((b) => (
                  <option key={b.id} value={b.label}>{b.label}</option>
                ))}
              </select>
            </div>

            {/* Tanggal & Jam */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal & Jam Pelaksanaan (WITA) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-emerald-500"
                  required
                />
                <input
                  type="time"
                  name="jam"
                  value={formData.jam}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-emerald-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 italic">
                Format: {getFormattedWaktu()}
              </p>
            </div>

            {/* Lokasi Spesifik */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lokasi Spesifik Kegiatan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="lokasiKegiatan"
                  placeholder="Contoh: Kantor Kecamatan Waru / RT.003 & RT.009 Desa Sesulu"
                  value={formData.lokasiKegiatan}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-emerald-500 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Deskripsi Kegiatan */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bentuk / Deskripsi Kegiatan Gotong Royong <span className="text-red-500">*</span>
              </label>
              <textarea
                name="deskripsiKegiatan"
                rows="2"
                placeholder="Jelaskan secara ringkas kegiatan gotong royong yang dilakukan, sasaran pembersihan/perbaikan, dsb."
                value={formData.deskripsiKegiatan}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-emerald-500 focus:bg-white"
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PARTISIPASI & TENAGA KERJA (NILAI SWADAYA) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-base">
                2. Partisipasi Tenaga Kerja & Estimasi Nilai Rupiah
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAutoCalcTenaga}
              className="inline-flex items-center space-x-1.5 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="Hitung otomatis: Jumlah Orang x Standar HOK Rp 100.000"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Hitung Otomatis HOK</span>
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Jumlah Orang Hadir */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Jumlah Orang Yang Hadir (Warga / Pegawai) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="jumlahHadir"
                  min="1"
                  value={formData.jumlahHadir}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-emerald-500"
                  required
                />
                <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">
                  Orang
                </span>
              </div>
            </div>

            {/* Nilai Rupiah Tenaga Kerja */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Estimasi Nilai Partisipasi Tenaga Kerja (Rupiah) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="nilaiOrangRupiah"
                min="0"
                step="10000"
                value={formData.nilaiOrangRupiah}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-emerald-800 focus:outline-emerald-500"
                required
              />
              <p className="text-xs text-emerald-600 font-medium mt-1">
                Terbaca: {formatRupiah(formData.nilaiOrangRupiah)}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: KONSUMSI SWADAYA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200 flex items-center space-x-2">
            <Coffee className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">
              3. Konsumsi Swadaya & Bukti Foto Konsumsi
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Jenis Konsumsi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Jenis Konsumsi yang Disediakan
              </label>
              <input
                type="text"
                name="jenisKonsumsi"
                placeholder="Contoh: Gorengan, Snack Kotak, Air Mineral, Kopi"
                value={formData.jenisKonsumsi}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-emerald-500"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {REKOMENDASI_KONSUMSI.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, jenisKonsumsi: k }))}
                    className="text-[11px] bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-600 px-2 py-0.5 rounded-md transition-colors"
                  >
                    + {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Nilai Rupiah Konsumsi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Estimasi Nilai Rupiah Konsumsi
              </label>
              <input
                type="number"
                name="nilaiKonsumsiRupiah"
                min="0"
                step="5000"
                value={formData.nilaiKonsumsiRupiah}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-emerald-800 focus:outline-emerald-500"
              />
              <p className="text-xs text-emerald-600 font-medium mt-1">
                Terbaca: {formatRupiah(formData.nilaiKonsumsiRupiah)}
              </p>
            </div>

            {/* Upload Foto Konsumsi */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Foto Bukti Konsumsi (Tersimpan ke Drive waruppusigap@gmail.com)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl p-3 flex items-center justify-center space-x-2 cursor-pointer transition-colors">
                  <Camera className="w-5 h-5 text-slate-500" />
                  <span className="text-xs font-medium text-slate-600">
                    {previews.fotoKonsumsi ? "Ganti Foto Konsumsi" : "Pilih / Ambil Foto Konsumsi"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFileChange('fotoKonsumsi', e.target.files[0])}
                  />
                </label>
                {previews.fotoKonsumsi && (
                  <div className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                    <img src={previews.fotoKonsumsi} alt="Konsumsi" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile('fotoKonsumsi')}
                      className="absolute inset-0 bg-red-600/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: PERALATAN & MATERIAL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200 flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">
              4. Peralatan, Material Swadaya & Bukti Foto
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Peralatan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Peralatan Yang Digunakan
              </label>
              <input
                type="text"
                name="peralatan"
                placeholder="Contoh: Cangkul, mesin rumput, parang, sapu lidi"
                value={formData.peralatan}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-emerald-500"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {REKOMENDASI_ALAT.slice(0, 6).map((alat) => (
                  <button
                    key={alat}
                    type="button"
                    onClick={() => handleAddTool(alat)}
                    className="text-[11px] bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-600 px-2 py-0.5 rounded-md transition-colors"
                  >
                    + {alat}
                  </button>
                ))}
              </div>
            </div>

            {/* Material */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Material Yang Digunakan
              </label>
              <input
                type="text"
                name="material"
                placeholder="Contoh: Semen, Semen, Obat Rumput, BBM, Cat"
                value={formData.material}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-emerald-500"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {REKOMENDASI_MATERIAL.slice(0, 6).map((mat) => (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => handleAddMaterial(mat)}
                    className="text-[11px] bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-600 px-2 py-0.5 rounded-md transition-colors"
                  >
                    + {mat}
                  </button>
                ))}
              </div>
            </div>

            {/* Nilai Rupiah Material */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Estimasi Nilai Rupiah Material Swadaya
              </label>
              <input
                type="number"
                name="nilaiMaterialRupiah"
                min="0"
                step="5000"
                value={formData.nilaiMaterialRupiah}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-emerald-800 focus:outline-emerald-500"
              />
              <p className="text-xs text-emerald-600 font-medium mt-1">
                Terbaca: {formatRupiah(formData.nilaiMaterialRupiah)}
              </p>
            </div>

            {/* Upload Foto Material */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Foto Bukti Material / Nota Pembelian
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl p-3 flex items-center justify-center space-x-2 cursor-pointer transition-colors">
                  <Camera className="w-5 h-5 text-slate-500" />
                  <span className="text-xs font-medium text-slate-600">
                    {previews.fotoMaterial ? "Ganti Foto Material" : "Upload Foto Material"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFileChange('fotoMaterial', e.target.files[0])}
                  />
                </label>
                {previews.fotoMaterial && (
                  <div className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                    <img src={previews.fotoMaterial} alt="Material" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile('fotoMaterial')}
                      className="absolute inset-0 bg-red-600/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: DOKUMENTASI UTAMA, VIDEO & DAFTAR HADIR */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200 flex items-center space-x-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">
              5. Foto Utama Kegiatan, Video & Bukti Daftar Hadir
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Foto Utama Kegiatan */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Foto Utama Dokumentasi Kegiatan <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500 mb-3">
                Ambil foto kegiatan warga saat bergotong royong di lapangan.
              </p>

              {previews.fotoKegiatan ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-300 group max-h-48">
                  <img src={previews.fotoKegiatan} alt="Foto Kegiatan" className="w-full h-44 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="p-2 bg-white text-slate-800 rounded-lg text-xs font-semibold cursor-pointer">
                      Ganti Foto
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handleFileChange('fotoKegiatan', e.target.files[0])}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile('fotoKegiatan')}
                      className="p-2 bg-red-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                  <div className="p-3 bg-emerald-600 text-white rounded-full mb-2 shadow-xs">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-950">
                    Klik untuk Ambil Foto / Pilih Berkas
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Format JPG/PNG • Otomatis dikompres & diunggah ke Google Drive
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFileChange('fotoKegiatan', e.target.files[0])}
                  />
                </label>
              )}
            </div>

            {/* Bukti Daftar Hadir / Presensi */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Foto / Dokumen Lembar Daftar Hadir Warga
              </label>
              <p className="text-[11px] text-slate-500 mb-3">
                Unggah foto lembar presensi/tanda tangan kehadiran peserta.
              </p>

              {previews.daftarHadir ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-300 group max-h-48">
                  <img src={previews.daftarHadir} alt="Daftar Hadir" className="w-full h-44 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="p-2 bg-white text-slate-800 rounded-lg text-xs font-semibold cursor-pointer">
                      Ganti Berkas
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange('daftarHadir', e.target.files[0])}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile('daftarHadir')}
                      className="p-2 bg-red-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-slate-50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                  <div className="p-3 bg-slate-100 text-slate-600 rounded-full mb-2">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    Upload Foto / Scan Daftar Hadir
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Dapat berupa foto tanda tangan atau dokumen PDF
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange('daftarHadir', e.target.files[0])}
                  />
                </label>
              )}
            </div>

            {/* Video Kegiatan */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tautan / Link Video Kegiatan (Google Drive / YouTube / Cloud)
              </label>
              <div className="relative">
                <Video className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  name="videoUrl"
                  placeholder="https://drive.google.com/file/d/... atau https://youtu.be/..."
                  value={formData.videoUrl}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Opsional: Masukkan link video jika video telah diunggah ke Google Drive atau kanal YouTube.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 6: CAPAIAN, KENDALA & TINDAK LANJUT */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">
              6. Capaian Hasil, Kendala & Catatan Evaluasi
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Capaian */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Capaian Dalam Kegiatan
              </label>
              <textarea
                name="capaian"
                rows="2"
                placeholder="Contoh: Saluran air 200 meter berhasil dibersihkan, rumput liar terpotong rapi"
                value={formData.capaian}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-emerald-500"
              />
            </div>

            {/* Kendala */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kendala Dalam Kegiatan
              </label>
              <textarea
                name="kendala"
                rows="2"
                placeholder="Contoh: Keterbatasan alat berat / cuaca hujan gerimis saat pelaksanaan"
                value={formData.kendala}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-emerald-500"
              />
            </div>

            {/* Catatan Tambahan */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Catatan Tambahan / Rekomendasi Tindak Lanjut
              </label>
              <input
                type="text"
                name="catatanTambahan"
                placeholder="Contoh: Perlu diagendakan kerja bakti lanjutan bulan depan bersama pihak RT sekitar"
                value={formData.catatanTambahan}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* FLOATING / STICKY BOTTOM ACTION BAR */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border-2 border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
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
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{submitProgress || "Mengirim Laporan..."}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
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
