import React from 'react';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import { formatRupiah } from '../services/apiService';

// Helper parse string multiple URLs
const parseUrls = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return String(val)
    .split(/[\n\r,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

export default function CetakLaporan({ report, reports, isBatch, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  // Hitung total untuk batch report
  const batchTotals = React.useMemo(() => {
    if (!reports) return { totalKeg: 0, hadir: 0, swadaya: 0 };
    let hadir = 0;
    let swadaya = 0;
    reports.forEach((r) => {
      hadir += Number(r.jumlahHadir) || 0;
      swadaya += (Number(r.nilaiOrangRupiah) || 0) + 
                 (Number(r.nilaiKonsumsiRupiah) || 0) + 
                 (Number(r.nilaiMaterialRupiah) || 0);
    });
    return {
      totalKeg: reports.length,
      hadir,
      swadaya
    };
  }, [reports]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 p-4 sm:p-6 flex flex-col items-center">
      
      {/* Top Floating Control Bar (Hidden on print) */}
      <div className="no-print w-full max-w-4xl bg-slate-900 text-white px-5 py-3 rounded-2xl mb-4 flex items-center justify-between shadow-xl">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Aplikasi</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400">
            {isBatch ? `Mencetak Rekapitulasi (${reports?.length || 0} Kegiatan)` : "Mencetak Berita Acara Kegiatan"}
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* PAPER CANVAS A4 (Styled for Print) */}
      <div className="bg-white w-full max-w-4xl min-h-[1100px] p-8 sm:p-12 shadow-2xl rounded-xl text-slate-900 text-xs sm:text-sm font-serif">
        
        {/* KOP SURAT PEMERINTAH RESMI */}
        <div className="text-center relative pb-3 border-b-4 border-double border-slate-900">
          <h2 className="text-sm sm:text-base font-bold tracking-wider uppercase text-slate-900">
            Pemerintah Kabupaten Penajam Paser Utara
          </h2>
          <h1 className="text-lg sm:text-2xl font-black tracking-widest uppercase text-slate-900 my-0.5">
            Kecamatan Waru
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-700 italic font-sans">
            Jl. Propinsi Km. 25 Waru, Kabupaten Penajam Paser Utara, Kalimantan Timur 76284
          </p>
          <p className="text-[10px] text-slate-600 font-sans">
            Layanan Pelaporan Gotong Royong Terpadu • Email: waruppusigap@gmail.com
          </p>
        </div>

        {/* ================= JIKA SINGLE REPORT ================= */}
        {!isBatch && report && (
          <div className="mt-6 space-y-5 font-sans">
            
            <div className="text-center">
              <h3 className="text-base font-bold uppercase underline tracking-wide text-slate-900">
                Berita Acara Pelaksanaan Kegiatan Gotong Royong
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Nomor: 400.10.2 / BA-GR / WARU / {new Date().getFullYear()}
              </p>
            </div>

            <p className="text-xs text-justify leading-relaxed">
              Pada hari dan tanggal sebagaimana tercantum dalam laporan ini, telah dilaksanakan kegiatan gotong royong masyarakat dengan rincian data sebagai berikut:
            </p>

            {/* TABEL DATA KEGIATAN */}
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="w-1/3 py-2 px-3 bg-slate-50 font-bold border-r border-slate-200">Wilayah / Instansi</td>
                  <td className="py-2 px-3 font-semibold">{report.desa || "Kecamatan Waru"}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 bg-slate-50 font-bold border-r border-slate-200">Bidang Kegiatan</td>
                  <td className="py-2 px-3">{report.bidangKegiatan}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 bg-slate-50 font-bold border-r border-slate-200">Waktu Pelaksanaan</td>
                  <td className="py-2 px-3">{report.waktuKegiatan}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 bg-slate-50 font-bold border-r border-slate-200">Lokasi Kegiatan</td>
                  <td className="py-2 px-3">{report.lokasiKegiatan}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 bg-slate-50 font-bold border-r border-slate-200">Bentuk / Uraian Kegiatan</td>
                  <td className="py-2 px-3">{report.deskripsiKegiatan}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 bg-slate-50 font-bold border-r border-slate-200">Jumlah Peserta / Warga Hadir</td>
                  <td className="py-2 px-3 font-bold text-emerald-800">{report.jumlahHadir} Orang</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 bg-slate-50 font-bold border-r border-slate-200">Peralatan Yang Digunakan</td>
                  <td className="py-2 px-3">{report.peralatan || "-"}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 bg-slate-50 font-bold border-r border-slate-200">Material & Bahan Swadaya</td>
                  <td className="py-2 px-3">{report.material || "-"}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 bg-slate-50 font-bold border-r border-slate-200">Jenis Konsumsi Swadaya</td>
                  <td className="py-2 px-3">{report.jenisKonsumsi || "-"}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 bg-slate-50 font-bold border-r border-slate-200">Capaian Hasil Kegiatan</td>
                  <td className="py-2 px-3">{report.capaian || "-"}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 bg-slate-50 font-bold border-r border-slate-200">Kendala & Evaluasi</td>
                  <td className="py-2 px-3">{report.kendala || "-"}</td>
                </tr>
              </tbody>
            </table>

            {/* TABEL RINCIAN NILAI SWADAYA */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-800 mb-2">
                Rincian Estimasi Nilai Swadaya Gotong Royong (Ekonomi Masyarakat)
              </h4>
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="py-2 px-3 text-center w-12 border-r border-slate-300">No</th>
                    <th className="py-2 px-3 text-left border-r border-slate-300">Komponen Partisipasi Swadaya</th>
                    <th className="py-2 px-3 text-right">Nilai Estimasi (Rupiah)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 px-3 text-center border-r border-slate-200">1</td>
                    <td className="py-2 px-3 border-r border-slate-200">Partisipasi Tenaga Kerja ({report.jumlahHadir} Orang)</td>
                    <td className="py-2 px-3 text-right font-medium">{formatRupiah(report.nilaiOrangRupiah)}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 px-3 text-center border-r border-slate-200">2</td>
                    <td className="py-2 px-3 border-r border-slate-200">Konsumsi Swadaya ({report.jenisKonsumsi || 'Konsumsi'})</td>
                    <td className="py-2 px-3 text-right font-medium">{formatRupiah(report.nilaiKonsumsiRupiah)}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 px-3 text-center border-r border-slate-200">3</td>
                    <td className="py-2 px-3 border-r border-slate-200">Material & Bahan ({report.material || 'Material'})</td>
                    <td className="py-2 px-3 text-right font-medium">{formatRupiah(report.nilaiMaterialRupiah)}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                    <td colSpan="2" className="py-2 px-3 text-right border-r border-slate-300 uppercase">
                      Total Akumulasi Nilai Swadaya:
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-900 text-sm font-extrabold">
                      {formatRupiah(
                        (Number(report.nilaiOrangRupiah) || 0) +
                        (Number(report.nilaiKonsumsiRupiah) || 0) +
                        (Number(report.nilaiMaterialRupiah) || 0)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* DOKUMENTASI FOTO DALAM CETAKAN (MENDUKUNG MULTI-FOTO) */}
            <div className="print-break-inside-avoid pt-2">
              <h4 className="text-xs font-bold uppercase text-slate-800 mb-2">
                Lampiran Dokumentasi Kegiatan Lapangan & Presensi
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {/* Foto Kegiatan (Bisa 2 atau lebih) */}
                {parseUrls(report.fotoKegiatanUrl).map((url, idx) => (
                  <div key={`keg-${idx}`} className="border border-slate-300 p-1.5 rounded text-center bg-slate-50">
                    <img src={url} alt={`Kegiatan ${idx + 1}`} className="w-full h-36 object-cover rounded" />
                    <span className="text-[10px] font-semibold text-slate-700 mt-1 block">
                      Foto Kegiatan #{idx + 1}: Dokumentasi Lapangan
                    </span>
                  </div>
                ))}

                {/* Foto Konsumsi */}
                {parseUrls(report.fotoKonsumsiUrl).map((url, idx) => (
                  <div key={`kon-${idx}`} className="border border-slate-300 p-1.5 rounded text-center bg-slate-50">
                    <img src={url} alt={`Konsumsi ${idx + 1}`} className="w-full h-36 object-cover rounded" />
                    <span className="text-[10px] font-semibold text-slate-700 mt-1 block">
                      Foto Konsumsi #{idx + 1}: Swadaya Warga
                    </span>
                  </div>
                ))}

                {/* Foto Material */}
                {parseUrls(report.fotoMaterialUrl).map((url, idx) => (
                  <div key={`mat-${idx}`} className="border border-slate-300 p-1.5 rounded text-center bg-slate-50">
                    <img src={url} alt={`Material ${idx + 1}`} className="w-full h-36 object-cover rounded" />
                    <span className="text-[10px] font-semibold text-slate-700 mt-1 block">
                      Foto Material #{idx + 1}: Bukti Penggunaan / Nota
                    </span>
                  </div>
                ))}

                {/* Foto Daftar Hadir */}
                {parseUrls(report.daftarHadirUrl).map((url, idx) => (
                  <div key={`hadir-${idx}`} className="border border-slate-300 p-1.5 rounded text-center bg-slate-50">
                    <img src={url} alt={`Daftar Hadir ${idx + 1}`} className="w-full h-36 object-cover rounded" />
                    <span className="text-[10px] font-semibold text-slate-700 mt-1 block">
                      Lampiran Presensi #{idx + 1}: Daftar Hadir Warga
                    </span>
                  </div>
                ))}

                {/* Placeholder jika tidak ada foto sama sekali */}
                {parseUrls(report.fotoKegiatanUrl).length === 0 &&
                 parseUrls(report.fotoKonsumsiUrl).length === 0 &&
                 parseUrls(report.fotoMaterialUrl).length === 0 &&
                 parseUrls(report.daftarHadirUrl).length === 0 && (
                  <div className="col-span-2 py-4 text-center text-xs text-slate-400 italic border border-dashed border-slate-300 rounded">
                    Tidak ada lampiran foto dokumentasi fisik
                  </div>
                )}
              </div>
            </div>

            {/* TANDA TANGAN BERITA ACARA */}
            <div className="print-break-inside-avoid pt-6 grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <p className="text-slate-500 mb-14">Petugas Pelapor Lapangan,</p>
                <p className="font-bold underline uppercase">( ........................................ )</p>
                <p className="text-[10px] text-slate-500">Staf / Teknisi Gotong Royong</p>
              </div>

              <div>
                <p className="text-slate-500 mb-14">Mengetahui,<br />Kepala Desa / Lurah,</p>
                <p className="font-bold underline uppercase">( ........................................ )</p>
                <p className="text-[10px] text-slate-500">NIP. ........................................</p>
              </div>

              <div>
                <p className="text-slate-500 mb-1">Waru, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                <p className="text-slate-500 mb-12">Camat Waru,</p>
                <p className="font-bold underline uppercase">( ........................................ )</p>
                <p className="text-[10px] text-slate-500">Pembina / NIP. ........................</p>
              </div>
            </div>

          </div>
        )}

        {/* ================= JIKA BATCH REKAPITULASI ================= */}
        {isBatch && reports && (
          <div className="mt-6 space-y-5 font-sans">
            
            <div className="text-center">
              <h3 className="text-base font-bold uppercase underline tracking-wide text-slate-900">
                Laporan Rekapitulasi Pelaksanaan Kegiatan Gotong Royong
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Kecamatan Waru, Kabupaten Penajam Paser Utara • Tahun {new Date().getFullYear()}
              </p>
            </div>

            {/* TABEL RINGKASAN */}
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] sm:text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-center">
                    <th className="py-2 px-2 border-r border-slate-300 w-8">No</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-left">Wilayah</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-left">Waktu & Lokasi</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-left">Uraian Kegiatan</th>
                    <th className="py-2 px-2 border-r border-slate-300">Hadir</th>
                    <th className="py-2 px-2 text-right">Total Swadaya (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, idx) => {
                    const total = (Number(r.nilaiOrangRupiah) || 0) + 
                                  (Number(r.nilaiKonsumsiRupiah) || 0) + 
                                  (Number(r.nilaiMaterialRupiah) || 0);

                    return (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="py-1.5 px-2 text-center border-r border-slate-200">{idx + 1}</td>
                        <td className="py-1.5 px-2 font-semibold border-r border-slate-200">{r.desa}</td>
                        <td className="py-1.5 px-2 border-r border-slate-200">
                          <span className="block font-medium">{r.waktuKegiatan}</span>
                          <span className="text-[10px] text-slate-500">{r.lokasiKegiatan}</span>
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-200">{r.deskripsiKegiatan}</td>
                        <td className="py-1.5 px-2 text-center font-bold border-r border-slate-200">{r.jumlahHadir}</td>
                        <td className="py-1.5 px-2 text-right font-medium">{formatRupiah(total)}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                    <td colSpan="4" className="py-2 px-2 text-right uppercase border-r border-slate-300">
                      Total Akumulasi Swadaya ({reports.length} Kegiatan):
                    </td>
                    <td className="py-2 px-2 text-center font-bold border-r border-slate-300">
                      {batchTotals.hadir} Org
                    </td>
                    <td className="py-2 px-2 text-right text-emerald-900 font-extrabold">
                      {formatRupiah(batchTotals.swadaya)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* TANDA TANGAN REKAPITULASI */}
            <div className="print-break-inside-avoid pt-8 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="text-slate-500 mb-14">
                  Pengelola Sistem Informasi Pelaporan,<br />Kecamatan Waru
                </p>
                <p className="font-bold underline uppercase">( TEKNISI KECAMATAN WARU )</p>
                <p className="text-[10px] text-slate-500">waruppusigap@gmail.com</p>
              </div>

              <div>
                <p className="text-slate-500 mb-1">Waru, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                <p className="text-slate-500 mb-12">
                  Mengetahui,<br />Camat Waru Kabupaten Penajam Paser Utara
                </p>
                <p className="font-bold underline uppercase">( ..................................................... )</p>
                <p className="text-[10px] text-slate-500">NIP. .....................................................</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
