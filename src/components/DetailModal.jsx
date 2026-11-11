import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Users, 
  Coffee, 
  Wrench, 
  Package, 
  Video, 
  FileCheck, 
  Printer, 
  ExternalLink,
  Coins,
  Building2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { formatRupiah } from '../services/apiService';

export default function DetailModal({ report, onClose, onPrint }) {
  if (!report) return null;

  const totalSwadaya = (Number(report.nilaiOrangRupiah) || 0) + 
                       (Number(report.nilaiKonsumsiRupiah) || 0) + 
                       (Number(report.nilaiMaterialRupiah) || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Header Modal */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Detail Laporan Kegiatan Gotong Royong
              </h3>
              <p className="text-xs text-slate-500">
                {report.desa || "Kecamatan Waru"} • {report.waktuKegiatan}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPrint(report)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Berita Acara</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Highlight Box Uraian Kegiatan */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Bentuk / Uraian Kegiatan
            </span>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {report.deskripsiKegiatan}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <strong>{report.lokasiKegiatan}</strong>
              </span>
              <span>•</span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-800 font-semibold text-[11px]">
                {report.bidangKegiatan}
              </span>
              <span>•</span>
              <span className="text-slate-500">
                Waktu: {report.waktuKegiatan}
              </span>
            </div>
          </div>

          {/* Rincian Partisipasi & Nilai Swadaya */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Rincian Swadaya & Nilai Ekonomi Gotong Royong
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 text-slate-600 text-xs font-semibold mb-1">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Tenaga Kerja ({report.jumlahHadir} Orang)</span>
                </div>
                <span className="text-base font-extrabold text-slate-900 block">
                  {formatRupiah(report.nilaiOrangRupiah)}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 text-slate-600 text-xs font-semibold mb-1">
                  <Coffee className="w-4 h-4 text-amber-600" />
                  <span>Konsumsi Swadaya</span>
                </div>
                <span className="text-base font-extrabold text-slate-900 block">
                  {formatRupiah(report.nilaiKonsumsiRupiah)}
                </span>
                <span className="text-[10px] text-slate-500 block truncate" title={report.jenisKonsumsi}>
                  {report.jenisKonsumsi || "-"}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 text-slate-600 text-xs font-semibold mb-1">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>Material / Bahan</span>
                </div>
                <span className="text-base font-extrabold text-slate-900 block">
                  {formatRupiah(report.nilaiMaterialRupiah)}
                </span>
                <span className="text-[10px] text-slate-500 block truncate" title={report.material}>
                  {report.material || "-"}
                </span>
              </div>
            </div>

            <div className="mt-3 bg-emerald-100/60 p-3 rounded-xl border border-emerald-300 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950">
                Total Akumulasi Nilai Swadaya:
              </span>
              <span className="text-lg font-black text-emerald-900">
                {formatRupiah(totalSwadaya)}
              </span>
            </div>
          </div>

          {/* Peralatan & Material Detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Peralatan Yang Digunakan:</span>
              <p className="text-slate-600">{report.peralatan || "Tidak ada catatan peralatan"}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Material / Bahan Swadaya:</span>
              <p className="text-slate-600">{report.material || "Tidak ada catatan material"}</p>
            </div>
          </div>

          {/* Capaian & Kendala */}
          {(report.capaian || report.kendala || report.catatanTambahan) && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Evaluasi & Keterangan Lapangan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {report.capaian && (
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-900 block mb-0.5">Capaian Hasil:</span>
                    <p className="text-emerald-800">{report.capaian}</p>
                  </div>
                )}
                {report.kendala && (
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-900 block mb-0.5">Kendala Lapangan:</span>
                    <p className="text-amber-800">{report.kendala}</p>
                  </div>
                )}
              </div>
              {report.catatanTambahan && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-0.5">Catatan Tambahan / Tindak Lanjut:</span>
                  <p className="text-slate-600">{report.catatanTambahan}</p>
                </div>
              )}
            </div>
          )}

          {/* Galeri Bukti & Dokumentasi Foto */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Dokumentasi Foto & Berkas Tersimpan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              
              {/* Foto Utama Kegiatan */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <span className="block px-3 py-1.5 text-[11px] font-bold bg-slate-100 text-slate-700 border-b border-slate-200">
                  Foto Utama Kegiatan
                </span>
                {report.fotoKegiatanUrl ? (
                  <div className="relative group">
                    <img 
                      src={report.fotoKegiatanUrl} 
                      alt="Kegiatan" 
                      className="w-full h-36 object-cover" 
                    />
                    <a 
                      href={report.fotoKegiatanUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold space-x-1"
                    >
                      <span>Buka Gambar Penuh</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="h-28 flex items-center justify-center text-xs text-slate-400">
                    Tidak ada foto
                  </div>
                )}
              </div>

              {/* Foto Konsumsi */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <span className="block px-3 py-1.5 text-[11px] font-bold bg-slate-100 text-slate-700 border-b border-slate-200">
                  Foto Konsumsi
                </span>
                {report.fotoKonsumsiUrl ? (
                  <div className="relative group">
                    <img 
                      src={report.fotoKonsumsiUrl} 
                      alt="Konsumsi" 
                      className="w-full h-36 object-cover" 
                    />
                    <a 
                      href={report.fotoKonsumsiUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold space-x-1"
                    >
                      <span>Buka Gambar Penuh</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="h-28 flex items-center justify-center text-xs text-slate-400">
                    Tidak ada foto
                  </div>
                )}
              </div>

              {/* Foto Material */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <span className="block px-3 py-1.5 text-[11px] font-bold bg-slate-100 text-slate-700 border-b border-slate-200">
                  Foto Material / Bukti Nota
                </span>
                {report.fotoMaterialUrl ? (
                  <div className="relative group">
                    <img 
                      src={report.fotoMaterialUrl} 
                      alt="Material" 
                      className="w-full h-36 object-cover" 
                    />
                    <a 
                      href={report.fotoMaterialUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold space-x-1"
                    >
                      <span>Buka Gambar Penuh</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="h-28 flex items-center justify-center text-xs text-slate-400">
                    Tidak ada foto
                  </div>
                )}
              </div>

              {/* Lembar Presensi / Daftar Hadir */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <span className="block px-3 py-1.5 text-[11px] font-bold bg-slate-100 text-slate-700 border-b border-slate-200">
                  Foto / Scan Daftar Hadir
                </span>
                {report.daftarHadirUrl ? (
                  <div className="relative group">
                    <img 
                      src={report.daftarHadirUrl} 
                      alt="Daftar Hadir" 
                      className="w-full h-36 object-cover" 
                    />
                    <a 
                      href={report.daftarHadirUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold space-x-1"
                    >
                      <span>Buka Berkas Penuh</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="h-28 flex items-center justify-center text-xs text-slate-400">
                    Tidak ada berkas
                  </div>
                )}
              </div>

              {/* Video Kegiatan */}
              {report.videoUrl && (
                <div className="sm:col-span-2 border border-slate-200 rounded-xl p-3 bg-red-50/50 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs">
                    <Video className="w-5 h-5 text-red-600" />
                    <div>
                      <span className="font-bold text-slate-800 block">Link Video Kegiatan</span>
                      <span className="text-[11px] text-slate-500 truncate max-w-xs block">{report.videoUrl}</span>
                    </div>
                  </div>
                  <a
                    href={report.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
                  >
                    <span>Tonton Video</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Footer Modal */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
