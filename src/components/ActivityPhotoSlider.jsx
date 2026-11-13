import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Users, 
  Eye, 
  Camera 
} from 'lucide-react';

// Helper memecah multiple URL (dipisahkan baris baru atau koma)
const parseUrls = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return String(val)
    .split(/[\n\r,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

export default function ActivityPhotoSlider({ reports = [], onSelectReport }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Kumpulkan seluruh foto kegiatan dari data laporan yang ada
  const slides = useMemo(() => {
    const list = [];
    reports.forEach((r) => {
      const urls = parseUrls(r.fotoKegiatanUrl);
      urls.forEach((url, i) => {
        list.push({
          url,
          report: r,
          photoNum: i + 1,
          totalPhotos: urls.length,
          deskripsi: r.deskripsiKegiatan || 'Kegiatan Gotong Royong Warga',
          desa: r.desa || 'Kecamatan Waru',
          bidang: r.bidangKegiatan || 'Lingkungan',
          waktu: r.waktuKegiatan || '',
          lokasi: r.lokasiKegiatan || '',
          jumlahHadir: r.jumlahHadir || 0
        });
      });
    });

    // Fallback jika belum ada foto
    if (list.length === 0) {
      list.push({
        url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80",
        report: null,
        photoNum: 1,
        totalPhotos: 1,
        deskripsi: "Pembersihan Halaman Kantor dan Saluran Air Depan",
        desa: "Kecamatan Waru",
        bidang: "Lingkungan",
        waktu: "Jumat Bersih",
        lokasi: "Halaman & Area Kantor Kecamatan Waru",
        jumlahHadir: 20
      });
    }

    return list;
  }, [reports]);

  // Auto-play pergantian foto setiap 4.5 detik
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  // Jaga index tetap dalam batas
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const current = slides[currentIndex] || slides[0];

  return (
    <div 
      className="relative w-full h-72 sm:h-80 md:h-[390px] rounded-3xl overflow-hidden shadow-md border border-slate-200/90 group select-none bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Gambar-Gambar Slider dengan Efek Cross-Fade Halus */}
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={s.url}
            alt={s.deskripsi}
            className="w-full h-full object-cover object-center"
          />
        </div>
      ))}

      {/* Lapisan Gradient Gelap agar Teks Selalu Jelas Terbaca */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/95 via-slate-900/40 to-transparent pointer-events-none" />

      {/* Bagian Atas: Label & Penghitung Slide */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/20 text-xs font-bold shadow-md">
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dokumentasi Kegiatan</span>
          </span>
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-semibold border border-emerald-400/30">
            {current.desa}
          </span>
        </div>

        {/* Counter Badge */}
        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-semibold border border-white/10">
          {currentIndex + 1} / {slides.length}
        </span>
      </div>

      {/* Konten Keterangan Kegiatan di Bagian Bawah */}
      <div className="absolute bottom-5 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-30 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl text-white">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="sm:hidden px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
              {current.desa}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-white text-[11px] font-medium border border-white/20">
              {current.bidang}
            </span>
            {current.totalPhotos > 1 && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                Foto #{current.photoNum} dari {current.totalPhotos}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-xl md:text-2xl font-black text-white leading-snug drop-shadow-md line-clamp-2">
            {current.deskripsi}
          </h3>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs text-slate-200">
            {current.lokasi && (
              <span className="flex items-center space-x-1 drop-shadow">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{current.lokasi}</span>
              </span>
            )}
            {current.waktu && (
              <span className="flex items-center space-x-1 drop-shadow">
                <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{current.waktu}</span>
              </span>
            )}
            {current.jumlahHadir > 0 && (
              <span className="flex items-center space-x-1 font-bold text-emerald-300 drop-shadow">
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>{current.jumlahHadir} Warga Hadir</span>
              </span>
            )}
          </div>
        </div>

        {/* Tombol Lihat Detail */}
        {current.report && onSelectReport && (
          <button
            onClick={() => onSelectReport(current.report)}
            className="self-start md:self-end px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/40 flex items-center space-x-2 transition-all cursor-pointer shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Lihat Detail Laporan</span>
          </button>
        )}
      </div>

      {/* Tombol Panah Kiri & Kanan (Muncul Saat Kursor Mengarah ke Slider) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md transition-all cursor-pointer border border-white/20 opacity-0 group-hover:opacity-100 shadow-lg"
            title="Foto Sebelumnya"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md transition-all cursor-pointer border border-white/20 opacity-0 group-hover:opacity-100 shadow-lg"
            title="Foto Berikutnya"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Indikator Titik (Dots) di Bagian Bawah */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-1.5 pointer-events-auto">
          {slides.slice(0, 10).map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === currentIndex 
                  ? 'w-6 bg-emerald-400 shadow-sm' 
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              title={`Pindah ke foto ${i + 1}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
          {slides.length > 10 && (
            <span className="text-[9px] text-white/60 font-mono ml-1">+{slides.length - 10}</span>
          )}
        </div>
      )}
    </div>
  );
}