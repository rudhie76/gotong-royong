import React from 'react';
import { 
  Menu, 
  Calendar,
  Building2
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  onToggleSidebar 
}) {
  // Format Tanggal Hari Ini (WITA)
  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Makassar'
  }).format(new Date());

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          
          {/* SISI KIRI: TOMBOL HAMBURGER HIDE/UNHIDE + JUDUL HALAMAN */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-300/80 shadow-xs"
              title="Buka / Tutup Menu Samping"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  SIP-Gotong Royong
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Kecamatan Waru
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Pemerintah Kabupaten Penajam Paser Utara
              </p>
            </div>
          </div>

          {/* SISI KANAN: TANGGAL RESMI & INSTANSI (BERSIH & PROFESIONAL) */}
          <div className="flex items-center space-x-2 text-slate-600">
            <div className="hidden sm:flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{todayStr}</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-800">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden md:inline">Kecamatan Waru</span>
              <span className="md:hidden">Waru</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
