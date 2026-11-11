import React from 'react';
import { 
  Users, 
  FileSpreadsheet, 
  HardDrive, 
  Settings, 
  ClipboardList, 
  BarChart3, 
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenSettings, isConnected, reportCount }) {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Sub-District Identity */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-600/50">
              RESMI
            </span>
            <span className="font-medium tracking-wide">
              Pemerintah Kabupaten Penajam Paser Utara • Kecamatan Waru
            </span>
          </div>
          <div className="flex items-center space-x-3 text-emerald-100">
            <div className="flex items-center space-x-1.5 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-700/50">
              <HardDrive className="w-3 h-3 text-emerald-300" />
              <span className="text-[11px]">Drive: <strong className="text-white">waruppusigap@gmail.com</strong></span>
            </div>
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <span className="inline-flex items-center space-x-1 text-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-[11px]">Google Sheets Aktif</span>
                </span>
              ) : (
                <button 
                  onClick={onOpenSettings}
                  className="inline-flex items-center space-x-1 text-amber-300 hover:text-white transition-colors cursor-pointer"
                  title="Klik untuk konfigurasi Google Apps Script URL"
                >
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-[11px] underline">Mode Offline (Klik Setup)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  SIP-Gotong Royong
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  Kecamatan Waru
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sistem Informasi Pelaporan Kegiatan Gotong Royong Terpadu
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <nav className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium">
              <button
                onClick={() => setActiveTab('form')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Input Laporan</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer relative ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Dashboard & Data</span>
                {reportCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                    {reportCount}
                  </span>
                )}
              </button>
            </nav>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
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
