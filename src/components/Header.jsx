import React from 'react';
import { 
  Users, 
  HardDrive, 
  Settings, 
  BarChart3, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenSettings, isConnected, reportCount }) {
  return (
    <header className="no-print bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-md sticky top-0 z-30 border-b border-emerald-800/80">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* SISI KIRI: IDENTITAS RESMI KECAMATAN WARU */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/80 border border-emerald-500/40 flex items-center justify-center text-white shadow-sm shadow-emerald-950/40 shrink-0">
              <Users className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight">
                  SIP-Gotong Royong
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 border border-emerald-500/30">
                  Kecamatan Waru
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80 font-medium tracking-wide">
                Pemerintah Kabupaten Penajam Paser Utara
              </p>
            </div>
          </div>

          {/* SISI TENGAH: TAB NAVIGASI SIMETRIS & SEIMBANG */}
          <div className="flex justify-center">
            <nav className="inline-flex bg-emerald-950/70 p-1 rounded-xl border border-emerald-700/60 shadow-inner text-xs sm:text-sm font-semibold">
              <button
                onClick={() => setActiveTab('form')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-300" />
                <span>Input Laporan</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer relative ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-emerald-300" />
                <span>Dashboard & Data</span>
                {reportCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white text-emerald-900 font-bold">
                    {reportCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* SISI KANAN: STATUS & PENGATURAN DALAM 1 AREA SIMETRIS */}
          <div className="flex items-center justify-between lg:justify-end gap-2 shrink-0">
            
            {/* Kapsul Status Terpadu (Drive + Status Google Sheets) */}
            <div className="flex items-center bg-emerald-950/80 border border-emerald-700/70 rounded-xl px-3 py-1.5 text-xs shadow-inner gap-2.5">
              
              {/* Info Akun Drive */}
              <div className="flex items-center space-x-1.5 text-emerald-200 border-r border-emerald-700/70 pr-2.5">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-medium text-slate-300 hidden sm:inline">Drive:</span>
                <span className="text-[11px] font-semibold text-white truncate max-w-[145px] sm:max-w-none">
                  waruppusigap@gmail.com
                </span>
              </div>

              {/* Status Koneksi */}
              <div className="flex items-center space-x-1.5">
                {isConnected ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[11px] font-bold text-emerald-300">
                      Google Sheets Aktif
                    </span>
                  </>
                ) : (
                  <button
                    onClick={onOpenSettings}
                    className="flex items-center space-x-1 text-amber-300 hover:text-white cursor-pointer transition-colors"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] underline font-semibold">Mode Offline</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tombol Pengaturan Roda Gigi Sejajar */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white border border-emerald-600/60 shadow-sm transition-all cursor-pointer"
              title="Pengaturan Koneksi Google Sheets & Drive"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
