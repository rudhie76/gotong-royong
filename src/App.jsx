import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FormPelaporan from './components/FormPelaporan';
import TabelLaporan from './components/TabelLaporan';
import Dashboard from './components/Dashboard';
import DetailModal from './components/DetailModal';
import CetakLaporan from './components/CetakLaporan';
import PengaturanModal from './components/PengaturanModal';
import { SAMPLE_REPORTS } from './constants';
import { fetchReports, deleteReport, getConfig } from './services/apiService';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // Default menu utama adalah Dashboard
  const [reports, setReports] = useState([]);
  const [dataSource, setDataSource] = useState('local_storage'); // 'google_sheet' | 'local_storage'
  const [isLoading, setIsLoading] = useState(false);

  // Mode Tampilan di Menu Input Laporan: 'table' (daftar tabel) atau 'form' (formulir input/edit)
  const [laporanViewMode, setLaporanViewMode] = useState('table');
  const [editingReport, setEditingReport] = useState(null);

  // Sidebar States (Collapsible / Hide-Unhide)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals & Print States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [printData, setPrintData] = useState(null); // { report, reports, isBatch }

  // Check connection status
  const [config, setConfig] = useState(getConfig);
  const isConnected = Boolean(config.scriptUrl);

  // Toggle Sidebar Handlers
  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  // Load data on initial mount
  const loadData = async () => {
    setIsLoading(true);
    try {
      setConfig(getConfig());
      const res = await fetchReports();
      if (res.data && res.data.length > 0) {
        setReports(res.data);
        setDataSource(res.source);
      } else {
        setReports(SAMPLE_REPORTS);
        localStorage.setItem("sigap_gotong_royong_reports", JSON.stringify(SAMPLE_REPORTS));
        setDataSource('local_storage');
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
      setReports(SAMPLE_REPORTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers untuk Navigasi Menu & Form Laporan
  const handleOpenLaporanMenu = () => {
    setActiveTab('form');
    setLaporanViewMode('table');
    setEditingReport(null);
  };

  const handleAddNewReport = () => {
    setEditingReport(null);
    setLaporanViewMode('form');
    setActiveTab('form');
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setLaporanViewMode('form');
    setActiveTab('form');
  };

  const handleDeleteReport = async (report) => {
    try {
      await deleteReport(report.id, report);
      await loadData();
    } catch (err) {
      console.error("Gagal menghapus laporan:", err);
      alert("Gagal menghapus laporan: " + err.message);
    }
  };

  const handleReportSubmitted = () => {
    loadData();
    setLaporanViewMode('table');
    setEditingReport(null);
  };

  const handlePrintSingle = (report) => {
    setPrintData({ report, isBatch: false });
  };

  const handlePrintAll = () => {
    setPrintData({ reports, isBatch: true });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex font-sans">
      
      {/* SIDEBAR NAVIGATION (HIDE / UNHIDE) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLaporan={handleOpenLaporanMenu}
        onPrintAll={handlePrintAll}
        isConnected={isConnected}
        reportCount={reports.length}
      />

      {/* MAIN CONTENT WRAPPER */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* TOP BAR / HEADER */}
        <Header
          activeTab={activeTab}
          onToggleSidebar={handleToggleSidebar}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isConnected={isConnected}
        />

        {/* MAIN BODY VIEW */}
        <main className="flex-1 pb-16">
          {activeTab === 'form' ? (
            laporanViewMode === 'table' ? (
              <TabelLaporan
                reports={reports}
                onAddNew={handleAddNewReport}
                onEditReport={handleEditReport}
                onDeleteReport={handleDeleteReport}
                onSelectReport={(r) => setSelectedReport(r)}
                onPrintReport={handlePrintSingle}
                onRefresh={loadData}
                isLoading={isLoading}
              />
            ) : (
              <FormPelaporan
                key={editingReport ? editingReport.id : 'form-new'}
                editingReport={editingReport}
                onCancel={() => {
                  setLaporanViewMode('table');
                  setEditingReport(null);
                }}
                onReportSubmitted={handleReportSubmitted}
                onViewDashboard={() => setActiveTab('dashboard')}
              />
            )
          ) : (
            <Dashboard
              reports={reports}
              onRefresh={loadData}
              onSelectReport={(r) => setSelectedReport(r)}
              onPrintReport={handlePrintSingle}
              onPrintAll={handlePrintAll}
              onNewReport={handleAddNewReport}
              onEditReport={handleEditReport}
              onDeleteReport={handleDeleteReport}
              dataSource={dataSource}
              isLoading={isLoading}
            />
          )}
        </main>

        {/* FOOTER */}
        <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            <p className="font-semibold text-slate-700">
              Sistem Informasi Pelaporan Gotong Royong (SIP-Gotong Royong)
            </p>
            <p className="text-[11px] text-slate-400">
              Pemerintah Kecamatan Waru • Kabupaten Penajam Paser Utara, Kalimantan Timur
            </p>
            <p className="text-[10px] text-slate-400">
              Sistem Informasi Pelaporan Gotong Royong Terpadu • Aman, Tertib & Akuntabel
            </p>
          </div>
        </footer>
      </div>

      {/* DETAIL MODAL */}
      {selectedReport && (
        <DetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onPrint={(r) => {
            setSelectedReport(null);
            handlePrintSingle(r);
          }}
        />
      )}

      {/* CETAK VIEW (SINGLE / BATCH) */}
      {printData && (
        <CetakLaporan
          report={printData.report}
          reports={printData.reports}
          isBatch={printData.isBatch}
          onClose={() => setPrintData(null)}
        />
      )}

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <PengaturanModal
          onClose={() => setIsSettingsOpen(false)}
          onSaved={(newCfg) => {
            setConfig(newCfg || getConfig());
            loadData();
          }}
        />
      )}

    </div>
  );
}
