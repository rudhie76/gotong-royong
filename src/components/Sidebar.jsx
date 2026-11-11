import React from 'react';
import { 
  Users, 
  PlusCircle, 
  LayoutDashboard, 
  Printer, 
  FileSpreadsheet, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  HardDrive, 
  Sparkles,
  Download,
  X,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed, 
  isMobileOpen, 
  setIsMobileOpen,
  onOpenSettings,
  onPrintAll,
  isConnected,
  reportCount
}) {
  const menuItems = [
    {
      id: 'form',
      label: 'Input Laporan',
      sublabel: 'Entri kegiatan baru',
      icon: PlusCircle,
      onClick: () => {
        setActiveTab('form');
        setIsMobileOpen(false);
      },
      badge: null
    },
    {
      id: 'dashboard',
      label: 'Dashboard & Data',
      sublabel: 'Rekapitulasi swadaya',
      icon: LayoutDashboard,
      onClick: () => {
        setActiveTab('dashboard');
        setIsMobileOpen(false);
      },
      badge: reportCount > 0 ? reportCount : null
    },
    {
      id: 'print',
      label: 'Cetak Rekap Resmi',
      sublabel: 'Kop Surat Kecamatan',
      icon: Printer,
      onClick: () => {
        onPrintAll();
        setIsMobileOpen(false);
      },
      badge: null
    },
    {
      id: 'template',
      label: 'Download Excel',
      sublabel: 'Template 21 Kolom',
      icon: FileSpreadsheet,
      onClick: () => {
        const link = document.createElement('a');
        link.href = './Template_Database_Gotong_Royong_Waru.xlsx';
        link.download = 'Template_Database_Gotong_Royong_Waru.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsMobileOpen(false);
      },
      badge: '.xlsx'
    },
    {
      id: 'settings',
      label: 'Pengaturan API',
      sublabel: 'Koneksi Sheets & Drive',
      icon: Settings,
      onClick: () => {
        onOpenSettings();
        setIsMobileOpen(false);
      },
      badge: isConnected ? 'Online' : 'Offline'
    }
  ];

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`no-print fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-white border-r border-slate-800 transition-all duration-300 ease-in-out shadow-2xl ${
          // Lebar Desktop (Collapsed vs Expanded)
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          // Posisi Mobile (Slide Drawer)
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* TOP BRAND HEADER */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 shrink-0">
              <Users className="w-5 h-5 text-emerald-100" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="truncate">
                <span className="block text-sm font-extrabold tracking-tight text-white leading-tight truncate">
                  SIP-Gotong Royong
                </span>
                <span className="block text-[11px] font-semibold text-emerald-400 truncate">
                  Kecamatan Waru
                </span>
              </div>
            )}
          </div>

          {/* Close button for Mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Collapse/Expand Toggle for Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={isCollapsed ? "Buka Menu Penuh" : "Kecilkan Menu"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* SUB-DISTRICT IDENTITY BANNER */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-4 py-2.5 bg-slate-950/50 border-b border-slate-800/50 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300 block">KABUPATEN PPU</span>
            <span className="text-[10px] text-slate-500">Provinsi Kalimantan Timur</span>
          </div>
        )}

        {/* NAVIGATION MENU ITEMS */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center rounded-xl p-2.5 transition-all text-left cursor-pointer group relative ${
                  isActive 
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/30' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
                } ${isCollapsed && !isMobileOpen ? 'justify-center' : 'space-x-3'}`}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-emerald-400'
                }`} />

                {(!isCollapsed || isMobileOpen) && (
                  <div className="flex-1 truncate">
                    <span className="block text-xs font-semibold leading-tight truncate">
                      {item.label}
                    </span>
                    <span className={`block text-[10px] truncate ${
                      isActive ? 'text-emerald-100' : 'text-slate-500'
                    }`}>
                      {item.sublabel}
                    </span>
                  </div>
                )}

                {/* Badges */}
                {(!isCollapsed || isMobileOpen) && item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    item.id === 'settings'
                      ? isConnected 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : isActive 
                        ? 'bg-white text-emerald-900' 
                        : 'bg-slate-800 text-emerald-400 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Floating Tooltip in Collapsed Desktop Mode */}
                {isCollapsed && !isMobileOpen && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-700">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* BOTTOM ACCOUNT / CLOUD STATUS CARD */}
        <div className="p-3 border-t border-slate-800 shrink-0 bg-slate-950/60">
          <div className={`flex items-center ${isCollapsed && !isMobileOpen ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="truncate flex-1">
                <span className="block text-[10px] font-medium text-slate-400">Google Drive:</span>
                <span className="block text-[11px] font-bold text-white truncate" title="waruppusigap@gmail.com">
                  waruppusigap@gmail.com
                </span>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  <span className={`text-[10px] font-semibold ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isConnected ? 'Sheets & Drive Aktif' : 'Mode Offline'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

      </aside>
    </>
  );
}
