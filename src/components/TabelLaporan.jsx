import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Printer, 
  Edit3, 
  Trash2, 
  MapPin, 
  Users, 
  Calendar, 
  Building2, 
  Coins, 
  FileSpreadsheet, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { WILAYAH_WARU, BIDANG_KEGIATAN } from '../constants';
import { formatRupiah } from '../services/apiService';

export default function TabelLaporan({
  reports = [],
  onAddNew,
  onEditReport,
  onDeleteReport,
  onSelectReport,
  onPrintReport,
  onRefresh,
  isLoading
}) {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDesa, setSelectedDesa] = useState('ALL');
  const [selectedBidang, setSelectedBidang] = useState('ALL');

  // Modal Konfirmasi Hapus
  const [reportToDelete, setReportToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const matchDesa = selectedDesa === 'ALL' || item.desa === selectedDesa;
      const matchBidang = selectedBidang === 'ALL' || (item.bidangKegiatan && item.bidangKegiatan.includes(selectedBidang));
      
      const term = searchTerm.toLowerCase();
      const matchSearch = !term || 
        (item.desa && item.desa.toLowerCase().includes(term)) ||
        (item.deskripsiKegiatan && item.deskripsiKegiatan.toLowerCase().includes(term)) ||
        (item.lokasiKegiatan && item.lokasiKegiatan.toLowerCase().includes(term)) ||
        (item.peralatan && item.peralatan.toLowerCase().includes(term)) ||
        (item.material && item.material.toLowerCase().includes(term));

      return matchDesa && matchBidang && matchSearch;
    });
  }, [reports, searchTerm, selectedDesa, selectedBidang]);

  // Ringkasan Cepat
  const summary = useMemo(() => {
    let hadir = 0;
    let swadaya = 0;
    reports.forEach((r) => {
      hadir += Number(r.jumlahHadir) || 0;
      swadaya += (Number(r.nilaiOrangRupiah) || 0) + 
                 (Number(r.nilaiKonsumsiRupiah) || 0) + 
                 (Number(r.nilaiMaterialRupiah) || 0);
    });
    return {
      total: reports.length,
      hadir,
      swadaya
    };
  }, [reports]);

  // Handler Konfirmasi Hapus
  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteReport(reportToDelete);
      setReportToDelete(null);
    } catch (err) {
      alert("Gagal menghapus laporan: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      {/* ================= HEADER ATAS: JUDUL & TOMBOL INPUT/TAMBAH ================= */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Manajemen Data
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Kecamatan Waru</span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">
            Daftar Laporan Kegiatan Gotong Royong
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola, edit, hapus, dan input laporan kegiatan gotong royong swadaya masyarakat.
          </p>
        </div>

        {/* Action Buttons: Input/Tambah & Sinkron */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200 shrink-0"
            title="Sinkronkan data dari Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sinkron Data</span>
          </button>

          <button
            onClick={onAddNew}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white transition-all cursor-pointer shadow-md shadow-emerald-600/30 shrink-0"
            title="Buka Formulir Input Laporan Baru"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Input / Tambah Laporan</span>
          </button>
        </div>
      </div>

      {/* ================= 3 MINI METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Laporan Terdata
            </span>
            <span className="text-lg font-extrabold text-slate-900">
              {summary.total} Kegiatan
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Partisipasi Warga
            </span>
            <span className="text-lg font-extrabold text-slate-900">
              {summary.hadir.toLocaleString('id-ID')} Orang Hadir
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Akumulasi Swadaya
            </span>
            <span className="text-lg font-extrabold text-emerald-800">
              {formatRupiah(summary.swadaya)}
            </span>
          </div>
        </div>
      </div>

      {/* ================= PENCARIAN & FILTER BAR ================= */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Kolom Pencarian */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari desa, uraian kegiatan, lokasi, material, peralatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-emerald-500 focus:bg-white"
            />
          </div>

          {/* Filter Wilayah Desa/Kelurahan */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedDesa}
              onChange={(e) => setSelectedDesa(e.target.value)}
              className="w-full md:w-48 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-emerald-500"
            >
              <option value="ALL">Semua Wilayah</option>
              {WILAYAH_WARU.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>

            {/* Filter Bidang Kegiatan */}
            <select
              value={selectedBidang}
              onChange={(e) => setSelectedBidang(e.target.value)}
              className="w-full md:w-48 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-emerald-500"
            >
              <option value="ALL">Semua Bidang</option>
              {BIDANG_KEGIATAN.map((b) => (
                <option key={b.id} value={b.id}>{b.id}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter Info & Reset Filter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Menampilkan <strong>{filteredReports.length}</strong> dari <strong>{reports.length}</strong> data laporan
          </span>
          {(selectedDesa !== 'ALL' || selectedBidang !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedDesa('ALL');
                setSelectedBidang('ALL');
                setSearchTerm('');
              }}
              className="text-emerald-700 hover:underline font-semibold cursor-pointer text-xs"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* ================= TABEL DATA LAPORAN DENGAN TOMBOL EDIT & HAPUS ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">Belum ada laporan yang sesuai</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tidak ada data yang cocok dengan kriteria pencarian Anda, atau belum ada laporan yang masuk.
            </p>
            <button
              onClick={onAddNew}
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Input Laporan Pertama Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5 text-center w-12">No</th>
                  <th className="py-3 px-4 min-w-[180px]">Waktu & Wilayah</th>
                  <th className="py-3 px-4 min-w-[220px]">Bentuk Kegiatan & Lokasi</th>
                  <th className="py-3 px-4 text-center min-w-[110px]">Partisipasi</th>
                  <th className="py-3 px-4 text-right min-w-[130px]">Nilai Swadaya</th>
                  <th className="py-3 px-4 text-center min-w-[110px]">Dokumentasi</th>
                  <th className="py-3 px-4 text-center min-w-[190px] sticky right-0 bg-slate-50/95 shadow-xs">
                    Aksi / Tindakan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((r, index) => {
                  const total = (Number(r.nilaiOrangRupiah) || 0) + 
                                (Number(r.nilaiKonsumsiRupiah) || 0) + 
                                (Number(r.nilaiMaterialRupiah) || 0);

                  return (
                    <tr key={r.id || index} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Nomor */}
                      <td className="py-3.5 px-3.5 align-top text-center text-slate-400 font-semibold">
                        {index + 1}
                      </td>

                      {/* Waktu & Wilayah */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-bold text-slate-900 block text-xs">
                          {r.desa || "Kecamatan Waru"}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {r.waktuKegiatan}
                        </span>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {r.bidangKegiatan}
                        </span>
                      </td>

                      {/* Uraian Kegiatan & Lokasi */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="font-semibold text-slate-800 line-clamp-2">
                          {r.deskripsiKegiatan}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-1">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{r.lokasiKegiatan}</span>
                        </p>
                        {r.material && (
                          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                            Material: {r.material}
                          </span>
                        )}
                      </td>

                      {/* Partisipasi Kehadiran */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <span className="inline-flex items-center space-x-1 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{r.jumlahHadir} Org</span>
                        </span>
                      </td>

                      {/* Nilai Swadaya */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <span className="font-extrabold text-slate-900 block">
                          {formatRupiah(total)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Tenaga: {formatRupiah(r.nilaiOrangRupiah)}
                        </span>
                      </td>

                      {/* Dokumentasi Badges */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {r.fotoKegiatanUrl && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
                              Foto
                            </span>
                          )}
                          {r.fotoKonsumsiUrl && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                              Konsumsi
                            </span>
                          )}
                          {r.fotoMaterialUrl && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-200">
                              Material
                            </span>
                          )}
                          {r.daftarHadirUrl && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                              Presensi
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ================= TOMBOL AKSI: EDIT, HAPUS, DETAIL, CETAK ================= */}
                      <td className="py-3.5 px-4 align-top text-center sticky right-0 bg-white/95 backdrop-blur-2xs">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* TOMBOL EDIT */}
                          <button
                            onClick={() => onEditReport(r)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            title="Edit / Ubah Data Laporan Ini"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                            <span>Edit</span>
                          </button>

                          {/* TOMBOL HAPUS */}
                          <button
                            onClick={() => setReportToDelete(r)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            title="Hapus Laporan Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span>Hapus</span>
                          </button>

                          {/* TOMBOL DETAIL */}
                          <button
                            onClick={() => onSelectReport(r)}
                            className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Lengkap & Galeri Foto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* TOMBOL CETAK */}
                          <button
                            onClick={() => onPrintReport(r)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Cetak Berita Acara Resmi"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL KONFIRMASI HAPUS ================= */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Hapus Laporan Gotong Royong?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus data laporan ini? Tindakan ini akan menghapus baris dari Google Sheets & penyimpanan sistem.
              </p>

              {/* Rincian data yang akan dihapus */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Wilayah:</span>
                  <span className="font-bold text-slate-800">{reportToDelete.desa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waktu:</span>
                  <span className="font-medium text-slate-700">{reportToDelete.waktuKegiatan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bentuk Kegiatan:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">{reportToDelete.deskripsiKegiatan}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="text-slate-400">Nilai Swadaya:</span>
                  <span className="font-extrabold text-emerald-800">
                    {formatRupiah(
                      (Number(reportToDelete.nilaiOrangRupiah) || 0) +
                      (Number(reportToDelete.nilaiKonsumsiRupiah) || 0) +
                      (Number(reportToDelete.nilaiMaterialRupiah) || 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Tombol Konfirmasi */}
              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setReportToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Ya, Hapus Laporan</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}