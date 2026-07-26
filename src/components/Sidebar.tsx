import React from 'react';
import { NavTab } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenNewAnalysis: () => void;
  onOpenSettings: () => void;
  onOpenSupport: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewAnalysis,
  onOpenSettings,
  onOpenSupport,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const navItems: { id: NavTab; label: string; icon: string }[] = [
    { id: 'global-overview', label: 'Global Overview', icon: 'public' },
    { id: 'company-intelligence', label: 'Company Intelligence', icon: 'business_center' },
    { id: 'flood-risk', label: 'Flood Risk Intelligence', icon: 'water_drop' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 flex flex-col z-50 bg-[#0A0A0A] border-r border-[#1F1F1F] shadow-2xl transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#1F1F1F] flex justify-between items-start">
          <div>
            <h1 className="font-serif-title text-2xl font-normal text-white tracking-tight flex items-center gap-2.5">
              <span className="text-[#C5A059] italic text-2xl">Æ</span>
              <span>Avalyos</span>
            </h1>
            <div className="mt-2">
              <p className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.3em]">
                Intelligence Ops
              </p>
              <p className="font-['Geist'] text-xs text-[#666666]">Platinum Apex &bull; Level 5</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-[#666666] hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 mt-6 px-3 space-y-1.5 overflow-y-auto hide-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-[#C5A059]/10 text-[#C5A059] border-l-2 border-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                    : 'text-[#888888] hover:text-white hover:bg-[#141414]'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isActive ? 'text-[#C5A059]' : 'text-[#666666]'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider font-semibold">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Action Button: New Analysis */}
        <div className="p-4 border-t border-[#1F1F1F]">
          <button
            onClick={() => {
              onOpenNewAnalysis();
              setIsMobileOpen(false);
            }}
            className="w-full border border-[#C5A059] text-[10px] uppercase tracking-[0.2em] font-['JetBrains_Mono'] font-bold text-[#C5A059] bg-[#C5A059]/10 hover:bg-[#C5A059] hover:text-black py-3 rounded-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(197,160,89,0.1)]"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Analysis
          </button>
        </div>

        {/* Secondary Links */}
        <div className="px-4 py-5 space-y-3 border-t border-[#1F1F1F] bg-[#141414]/50">
          <button
            onClick={() => {
              onOpenSettings();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-1.5 text-xs font-['JetBrains_Mono'] text-[#666666] hover:text-[#C5A059] transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            Settings
          </button>
          <button
            onClick={() => {
              onOpenSupport();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-1.5 text-xs font-['JetBrains_Mono'] text-[#666666] hover:text-[#C5A059] transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[18px]">help_outline</span>
            Support & Clearances
          </button>
        </div>
      </aside>
    </>
  );
};