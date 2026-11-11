import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Coins, 
  Building2, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  RefreshCw, 
  Eye, 
  ExternalLink, 
  FileSpreadsheet, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Camera, 
  FileText,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { WILAYAH_WARU, BIDANG_KEGIATAN } from '../constants';
import { formatRupiah } from '../services/apiService';

export default function Dashboard({ 
  reports, 
  onRefresh, 
  onSelectReport, 
  onPrintReport, 
  onPrintAll, 
  dataSource, 
  isLoading 
}) {
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDesa, setSelectedDesa] = useState('ALL');
  const [selectedBidang, setSelectedBidang] = useState('ALL');

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const matchDesa = selectedDesa === 'ALL' || item.desa === selectedDesa;
      const matchBidang = selectedBidang === 'ALL' || item.bidangKegiatan.includes(selectedBidang);
      
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

  // Key Aggregated Metrics
  const metrics = useMemo(() => {
    let totalHadir = 0;
    let totalNilaiTenaga = 0;
    let totalNilaiKonsumsi = 0;
    let totalNilaiMaterial = 0;
    const desaCounts = {};

    reports.forEach((r) => {
      totalHadir += Number(r.jumlahHadir) || 0;
      totalNilaiTenaga += Number(r.nilaiOrangRupiah) || 0;
      totalNilaiKonsumsi += Number(r.nilaiKonsumsiRupiah) || 0;
      totalNilaiMaterial += Number(r.nilaiMaterialRupiah) || 0;

      const d = r.desa || "Lainnya";
      desaCounts[d] = (desaCounts[d] || 0) + 1;
    });

    const totalSwadaya = totalNilaiTenaga + totalNilaiKonsumsi + totalNilaiMaterial;

    // Cari desa teraktif
    let topDesa = "-";
    let maxCount = 0;
    Object.keys(desaCounts).forEach((key) => {
      if (desaCounts[key] > maxCount) {
        maxCount = desaCounts[key];
        topDesa = `${key} (${maxCount} keg)`;
      }
    });

    return {
      totalKegiatan: reports.length,
      totalHadir,
      totalNilaiTenaga,
      totalNilaiKonsumsi,
      totalNilaiMaterial,
      totalSwadaya,
      topDesa,
      desaCounts
    };
  }, [reports]);

  // Export to CSV Function
  const exportToCSV = () => {
    if (reports.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const headers = [
      "Timestamp",
      "Kecamatan/Kelurahan/Desa",
      "Bidang Kegiatan",
      "Waktu Kegiatan",
      "Deskripsi Kegiatan",
      "Lokasi Kegiatan",
      "Jumlah Hadir",
      "Nilai Tenaga (Rp)",
      "Jenis Konsumsi",
      "Nilai Konsumsi (Rp)",
      "Peralatan",
      "Material",
      "Nilai Material (Rp)",
      "Total Nilai Swadaya (Rp)",
      "Foto Kegiatan URL",
      "Foto Konsumsi URL",
      "Foto Material URL",
      "Daftar Hadir URL",
      "Video URL",
      "Capaian",
      "Kendala",
      "Catatan"
    ];

    const rows = filteredReports.map((r) => {
      const total = (Number(r.nilaiOrangRupiah) || 0) + 
                    (Number(r.nilaiKonsumsiRupiah) || 0) + 
                    (Number(r.nilaiMaterialRupiah) || 0);

      return [
        `"${r.timestamp || ''}"`,
        `"${r.desa || ''}"`,
        `"${r.bidangKegiatan || ''}"`,
        `"${r.waktuKegiatan || ''}"`,
        `"${(r.deskripsiKegiatan || '').replace(/"/g, '""')}"`,
        `"${(r.lokasiKegiatan || '').replace(/"/g, '""')}"`,
        r.jumlahHadir || 0,
        r.nilaiOrangRupiah || 0,
        `"${(r.jenisKonsumsi || '').replace(/"/g, '""')}"`,
        r.nilaiKonsumsiRupiah || 0,
        `"${(r.peralatan || '').replace(/"/g, '""')}"`,
        `"${(r.material || '').replace(/"/g, '""')}"`,
        r.nilaiMaterialRupiah || 0,
        total,
        `"${r.fotoKegiatanUrl || ''}"`,
        `"${r.fotoKonsumsiUrl || ''}"`,
        `"${r.fotoMaterialUrl || ''}"`,
        `"${r.daftarHadirUrl || ''}"`,
        `"${r.videoUrl || ''}"`,
        `"${(r.capaian || '').replace(/"/g, '""')}"`,
        `"${(r.kendala || '').replace(/"/g, '""')}"`,
        `"${(r.catatanTambahan || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Gotong_Royong_Kecamatan_Waru_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">
              Dashboard & Rekapitulasi Data
            </h2>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              dataSource === 'google_sheet' 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {dataSource === 'google_sheet' ? '● Live Google Sheets' : '● Data Lokal'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi partisipasi masyarakat & data swadaya Kecamatan Waru, PPU
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            title="Sinkronkan data terbaru dari Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sinkron Data</span>
          </button>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer border border-emerald-200"
            title="Ekspor seluruh baris ke Excel/CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onPrintAll}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer shadow-xs"
            title="Cetak Berita Acara Rekapitulasi Resmi Kecamatan"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rekap Resmi</span>
          </button>
        </div>
      </div>

      {/* METRIC STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Kegiatan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Kegiatan
            </span>
            <span className="text-2xl font-black text-slate-900">
              {metrics.totalKegiatan}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Kegiatan terdaftar
            </span>
          </div>
        </div>

        {/* Total Partisipan Hadir */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Warga Terlibat
            </span>
            <span className="text-2xl font-black text-emerald-700">
              {metrics.totalHadir.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Orang berpartisipasi
            </span>
          </div>
        </div>

        {/* Total Nilai Swadaya */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg border border-amber-100">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Nilai Swadaya
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-700">
              {formatRupiah(metrics.totalSwadaya)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Akumulasi nilai ekonomi
            </span>
          </div>
        </div>

        {/* Desa Teraktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg border border-purple-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Wilayah Teraktif
            </span>
            <span className="text-base sm:text-lg font-bold text-purple-900 block truncate max-w-[150px]">
              {metrics.topDesa}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Partisipasi tertinggi
            </span>
          </div>
        </div>
      </div>

      {/* SWADAYA BREAKDOWN & DESA BAR GRAPH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Distribusi Nilai Swadaya */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 mb-4">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>Komposisi Nilai Swadaya Gotong Royong</span>
          </h3>

          <div className="space-y-3">
            {/* Tenaga Kerja */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Partisipasi Tenaga Kerja</span>
                <span className="text-slate-900 font-bold">{formatRupiah(metrics.totalNilaiTenaga)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-2.5 rounded-full" 
                  style={{ width: `${metrics.totalSwadaya ? (metrics.totalNilaiTenaga / metrics.totalSwadaya) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Konsumsi */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Konsumsi Swadaya</span>
                <span className="text-slate-900 font-bold">{formatRupiah(metrics.totalNilaiKonsumsi)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full" 
                  style={{ width: `${metrics.totalSwadaya ? (metrics.totalNilaiKonsumsi / metrics.totalSwadaya) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Material */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Material & Bahan Swadaya</span>
                <span className="text-slate-900 font-bold">{formatRupiah(metrics.totalNilaiMaterial)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${metrics.totalSwadaya ? (metrics.totalNilaiMaterial / metrics.totalSwadaya) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Total Akumulasi:</span>
            <span className="text-sm font-extrabold text-emerald-800">{formatRupiah(metrics.totalSwadaya)}</span>
          </div>
        </div>

        {/* Distribusi Laporan per Desa/Kelurahan */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 mb-4">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Sebaran Kegiatan per Desa / Kelurahan di Kecamatan Waru</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {WILAYAH_WARU.map((w) => {
              const count = metrics.desaCounts[w] || 0;
              const max = Math.max(...Object.values(metrics.desaCounts), 1);
              const percentage = Math.round((count / max) * 100);

              return (
                <div 
                  key={w}
                  onClick={() => setSelectedDesa(selectedDesa === w ? 'ALL' : w)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-center ${
                    selectedDesa === w 
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-xs' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800 block truncate" title={w}>
                    {w.replace("Desa ", "").replace("Kelurahan ", "Kel. ")}
                  </span>
                  <span className="text-xl font-extrabold text-emerald-700 block mt-1">
                    {count}
                  </span>
                  <span className="text-[10px] text-slate-400 block">kegiatan</span>
                  <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-600 h-1 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari lokasi, uraian kegiatan, peralatan, material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-emerald-500 focus:bg-white"
            />
          </div>

          {/* Filter Desa */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedDesa}
              onChange={(e) => setSelectedDesa(e.target.value)}
              className="w-full md:w-44 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-emerald-500"
            >
              <option value="ALL">Semua Desa/Kelurahan</option>
              {WILAYAH_WARU.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>

            {/* Filter Bidang */}
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

        {/* Result counts */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Menampilkan <strong>{filteredReports.length}</strong> dari <strong>{reports.length}</strong> laporan kegiatan</span>
          {(selectedDesa !== 'ALL' || selectedBidang !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedDesa('ALL');
                setSelectedBidang('ALL');
                setSearchTerm('');
              }}
              className="text-emerald-700 hover:underline font-semibold cursor-pointer"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">Tidak ada laporan yang cocok</h4>
            <p className="text-xs text-slate-400 mt-1">
              Coba sesuaikan kata kunci pencarian atau reset filter di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Waktu & Wilayah</th>
                  <th className="py-3 px-4">Bentuk Kegiatan & Lokasi</th>
                  <th className="py-3 px-4 text-center">Kehadiran</th>
                  <th className="py-3 px-4 text-right">Nilai Swadaya</th>
                  <th className="py-3 px-4 text-center">Bukti / Berkas</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((r, index) => {
                  const total = (Number(r.nilaiOrangRupiah) || 0) + 
                                (Number(r.nilaiKonsumsiRupiah) || 0) + 
                                (Number(r.nilaiMaterialRupiah) || 0);

                  return (
                    <tr key={r.id || index} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Waktu & Wilayah */}
                      <td className="py-3 px-4 align-top">
                        <span className="font-bold text-slate-900 block">
                          {r.desa || "Kecamatan Waru"}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {r.waktuKegiatan}
                        </span>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {r.bidangKegiatan}
                        </span>
                      </td>

                      {/* Deskripsi & Lokasi */}
                      <td className="py-3 px-4 align-top max-w-xs">
                        <p className="font-semibold text-slate-800 line-clamp-2">
                          {r.deskripsiKegiatan}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-1">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{r.lokasiKegiatan}</span>
                        </p>
                        {r.material && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Mat: {r.material}
                          </span>
                        )}
                      </td>

                      {/* Kehadiran */}
                      <td className="py-3 px-4 align-top text-center">
                        <span className="inline-flex items-center space-x-1 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{r.jumlahHadir} Org</span>
                        </span>
                      </td>

                      {/* Nilai Swadaya */}
                      <td className="py-3 px-4 align-top text-right">
                        <span className="font-extrabold text-slate-900 block">
                          {formatRupiah(total)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Tenaga: {formatRupiah(r.nilaiOrangRupiah)}
                        </span>
                      </td>

                      {/* Berkas / Drive */}
                      <td className="py-3 px-4 align-top text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {r.fotoKegiatanUrl && (
                            <span 
                              className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-200" 
                              title="Tersedia Foto Kegiatan"
                            >
                              Foto
                            </span>
                          )}
                          {r.fotoKonsumsiUrl && (
                            <span 
                              className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200" 
                              title="Tersedia Foto Konsumsi"
                            >
                              Konsumsi
                            </span>
                          )}
                          {r.fotoMaterialUrl && (
                            <span 
                              className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-200" 
                              title="Tersedia Foto Material"
                            >
                              Material
                            </span>
                          )}
                          {r.daftarHadirUrl && (
                            <span 
                              className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200" 
                              title="Tersedia Daftar Hadir"
                            >
                              Hadir
                            </span>
                          )}
                          {r.videoUrl && (
                            <span 
                              className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-medium border border-red-200" 
                              title="Tersedia Link Video"
                            >
                              Video
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 align-top text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onSelectReport(r)}
                            className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onPrintReport(r)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Cetak Berita Acara Kegiatan"
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

    </div>
  );
}
