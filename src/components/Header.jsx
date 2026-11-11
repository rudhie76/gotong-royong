import React from 'react';
import { 
  Menu, 
  HardDrive, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Building2
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  onToggleSidebar, 
  onOpenSettings, 
  isConnected 
}) {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          
          {/* SISI KIRI: TOMBOL HAMBURGER HIDE/UNHIDE + JUDUL HALAMAN */}
          <div className="flex items-center space-x-3">
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
                  {activeTab === 'form' ? 'Formulir Pelaporan Gotong Royong' : 'Dashboard Rekapitulasi Swadaya'}
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Kecamatan Waru
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Pemerintah Kabupaten Penajam Paser Utara • Wilayah Kerja Kecamatan Waru
              </p>
            </div>
          </div>

          {/* SISI KANAN: STATUS KONEKSI & PENGATURAN */}
          <div className="flex items-center space-x-2.5 shrink-0">
            
            {/* Kapsul Status Akun Drive & Sheet */}
            <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs gap-2.5 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-slate-600 border-r border-slate-200 pr-2.5">
                <HardDrive className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-medium text-slate-500">Drive:</span>
                <span className="text-[11px] font-semibold text-slate-800">
                  waruppusigap@gmail.com
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                {isConnected ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      Sheets Aktif
                    </span>
                  </>
                ) : (
                  <button
                    onClick={onOpenSettings}
                    className="flex items-center space-x-1 text-amber-700 hover:text-amber-900 cursor-pointer transition-colors"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-[11px] font-semibold underline">Mode Offline</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tombol Pengaturan Cepat */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              title="Pengaturan Google Sheets & Drive"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
