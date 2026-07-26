import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KpiRow } from './components/KpiRow';
import { MarketTickerFooter } from './components/MarketTickerFooter';
import { CompanyIntelligenceView } from './components/CompanyIntelligenceView';
import { FloodRiskView } from './components/FloodRiskView';
import { NewAnalysisModal } from './components/NewAnalysisModal';
import { DetailModal } from './components/DetailModal';

import { NavTab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('global-overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Modals state
  const [isNewAnalysisOpen, setIsNewAnalysisOpen] = useState<boolean>(false);
  const [analysisInitialTopic, setAnalysisInitialTopic] = useState<string>('');

  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalCategory, setModalCategory] = useState<string>('');
  const [modalType, setModalType] = useState<
    'settings' | 'support' | 'notifications' | 'profile'
  >('settings');
  const [modalData, setModalData] = useState<any>(null);

  // Trigger New Analysis AI Modal with pre-filled topic
  const handleOpenNewAnalysisWithTopic = (topic: string) => {
    setAnalysisInitialTopic(topic);
    setIsNewAnalysisOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#e2e2e8] flex flex-col font-['Geist'] antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewAnalysis={() => handleOpenNewAnalysisWithTopic('')}
        onOpenSettings={() => {
          setModalTitle('System Settings & Stream Feeds');
          setModalCategory('SYSTEM CONFIGURATION');
          setModalType('settings');
          setDetailModalOpen(true);
        }}
        onOpenSupport={() => {
          setModalTitle('Intelligence Clearance & Support');
          setModalCategory('CLEARANCE LEVEL 5');
          setModalType('support');
          setDetailModalOpen(true);
        }}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Container Area */}
      <div className="md:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Navigation Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenNotifications={() => {
            setModalTitle('Live Intelligence Stream Alerts');
            setModalCategory('SYSTEM ALERTS');
            setModalType('notifications');
            setDetailModalOpen(true);
          }}
          onOpenProfile={() => {
            setModalTitle('Chief Intel Officer Profile & Access');
            setModalCategory('V. VOLKOV &bull; LEVEL 5');
            setModalType('profile');
            setDetailModalOpen(true);
          }}
          onOpenFilters={() => {
            setModalTitle('Global Signal Category Filters');
            setModalCategory('FILTER CONTROL');
            setModalType('settings');
            setDetailModalOpen(true);
          }}
        />

        {/* Dynamic Content Views */}
        <main className="p-4 md:p-8 flex-1 space-y-6">
          {searchQuery && (
            <div className="glass-panel p-3 border-[#00f0ff]/40 flex justify-between items-center text-xs font-['JetBrains_Mono']">
              <span className="text-[#00f0ff]">
                Filtering global signals for: <strong>"{searchQuery}"</strong>
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#b9cacb] hover:text-white underline"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* VIEW 1: GLOBAL OVERVIEW */}
          {activeTab === 'global-overview' && (
            <>
              {/* Top KPI Metrics Row */}
              <KpiRow
                onSelectKpi={(type) => handleOpenNewAnalysisWithTopic(`Deep Analysis on ${type}`)}
              />
              {/* NOTE: World map, events feed, and bento grid removed here.
                  This is where a real risk-score/dashboard view can go once
                  it's wired to the /analyze and /companies endpoints. */}
            </>
          )}

          {/* VIEW 2: COMPANY INTELLIGENCE */}
          {activeTab === 'company-intelligence' && (
            <CompanyIntelligenceView
              onOpenNewAnalysisWithTopic={handleOpenNewAnalysisWithTopic}
            />
          )}

          {/* VIEW 3: FLOOD RISK INTELLIGENCE */}
          {activeTab === 'flood-risk' && <FloodRiskView />}
        </main>

        {/* Bottom Financial Market Marquee Ticker */}
        <MarketTickerFooter
          onSelectTicker={(sym) => handleOpenNewAnalysisWithTopic(`Financial Impact Analysis on ${sym}`)}
        />
      </div>

      {/* AI Analysis Brief Modal */}
      <NewAnalysisModal
        isOpen={isNewAnalysisOpen}
        onClose={() => setIsNewAnalysisOpen(false)}
        initialTopic={analysisInitialTopic}
      />

      {/* Generic Item Detail Drawer / Modal */}
      <DetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={modalTitle}
        categoryTag={modalCategory}
        type={modalType}
        data={modalData}
        onActionClick={() => {
          setDetailModalOpen(false);
          handleOpenNewAnalysisWithTopic(`In-Depth Assessment on ${modalTitle}`);
        }}
      />
    </div>
  );
}