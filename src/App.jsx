import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FormPelaporan from './components/FormPelaporan';
import Dashboard from './components/Dashboard';
import DetailModal from './components/DetailModal';
import CetakLaporan from './components/CetakLaporan';
import PengaturanModal from './components/PengaturanModal';
import { SAMPLE_REPORTS } from './constants';
import { fetchReports, getConfig } from './services/apiService';

export default function App() {
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'dashboard'
  const [reports, setReports] = useState([]);
  const [dataSource, setDataSource] = useState('local_storage'); // 'google_sheet' | 'local_storage'
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Print States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [printData, setPrintData] = useState(null); // { report, reports, isBatch }

  // Check connection status
  const config = getConfig();
  const isConnected = Boolean(config.scriptUrl);

  // Load data on initial mount
  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchReports();
      if (res.data && res.data.length > 0) {
        setReports(res.data);
        setDataSource(res.source);
      } else {
        // Fallback ke contoh data spreadsheet jika memori masih kosong
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

  // Handlers
  const handleReportSubmitted = () => {
    loadData();
  };

  const handlePrintSingle = (report) => {
    setPrintData({ report, isBatch: false });
  };

  const handlePrintAll = () => {
    setPrintData({ reports, isBatch: true });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isConnected={isConnected}
        reportCount={reports.length}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {activeTab === 'form' ? (
          <FormPelaporan
            onReportSubmitted={handleReportSubmitted}
            onViewDashboard={() => setActiveTab('dashboard')}
          />
        ) : (
          <Dashboard
            reports={reports}
            onRefresh={loadData}
            onSelectReport={(r) => setSelectedReport(r)}
            onPrintReport={handlePrintSingle}
            onPrintAll={handlePrintAll}
            dataSource={dataSource}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Detail Modal */}
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

      {/* Cetak View (Single / Batch) */}
      {printData && (
        <CetakLaporan
          report={printData.report}
          reports={printData.reports}
          isBatch={printData.isBatch}
          onClose={() => setPrintData(null)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <PengaturanModal
          onClose={() => setIsSettingsOpen(false)}
          onSaved={() => {
            loadData();
          }}
        />
      )}

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            Sistem Informasi Pelaporan Gotong Royong (SIP-Gotong Royong)
          </p>
          <p className="text-[11px] text-slate-400">
            Pemerintah Kecamatan Waru • Kabupaten Penajam Paser Utara, Kalimantan Timur
          </p>
          <p className="text-[10px] text-slate-400">
            Penyimpanan Terintegrasi Google Sheets & Google Drive (waruppusigap@gmail.com)
          </p>
        </div>
      </footer>

    </div>
  );
}
