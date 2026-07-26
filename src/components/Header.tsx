import React, { useState } from 'react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onToggleMobileSidebar: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenFilters: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onToggleMobileSidebar,
  onOpenNotifications,
  onOpenProfile,
  onOpenFilters,
}) => {
  const [unreadCount] = useState(3);

  return (
    <header className="flex justify-between items-center w-full px-4 md:px-8 h-16 sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-2xl border-b border-[#1F1F1F] shadow-md">
      {/* Search & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden text-[#666666] hover:text-[#C5A059] p-1.5 rounded bg-[#141414] border border-[#1F1F1F]"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#666666] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Scan global signals..."
            className="bg-[#141414] border border-[#1F1F1F] rounded-sm pl-9 pr-8 py-1.5 font-['Geist'] text-xs text-white placeholder-[#666666] focus:ring-1 focus:ring-[#C5A059]/60 focus:border-[#C5A059] focus:outline-none w-48 sm:w-72 md:w-96 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Tools & User Info */}
      <div className="flex items-center gap-4 md:gap-6">
        <button
          onClick={onOpenFilters}
          className="p-1.5 text-[#666666] hover:text-[#C5A059] hover:bg-[#141414] rounded transition-colors"
          title="Filter Signal Categories"
        >
          <span className="material-symbols-outlined text-[20px]">filter_list</span>
        </button>

        <div className="relative">
          <button
            onClick={onOpenNotifications}
            className="p-1.5 text-[#666666] hover:text-[#C5A059] hover:bg-[#141414] rounded transition-colors relative"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C5A059] rounded-full animate-ping"></span>
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C5A059] rounded-full"></span>
            )}
          </button>
        </div>

        {/* User CIO Profile */}
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-3 border-l border-[#1F1F1F] pl-4 md:pl-6 cursor-pointer group hover:opacity-90 transition-opacity"
        >
          <div className="text-right hidden sm:block">
            <p className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-[0.2em] leading-tight text-[#C5A059] font-bold">
              Chief Intel Officer
            </p>
            <p className="font-['Geist'] text-xs font-semibold text-[#888888] group-hover:text-white">
              V. Volkov
            </p>
          </div>
          <div className="relative">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrhvQnvEQspsY_3qhMSghlrt9R-5XFmPM_SfVf2W7Wm2_DAHNUPeOzBD01BJd4NdWXBGrNTMjhvx2xxF2jI07GosimzmWCmbk-QUYjbWVP25emYhn_kUzotkZU5oxZeefATwiUepso_wXRxcmUOh2dfoBAfyMnkNGsUvEBQLx59wvigXc-4FZcNMMyT-943kt1XEWVUXgGpy_9A5Uy77jrR5J8nKhMBKpGY7CjrInEwEA31ClaYXP1gzrcpxqpy8jL-d3sP3JGP0Ox"
              alt="CIO Avatar"
              className="w-8 h-8 rounded-full border border-[#C5A059]/60 shadow-[0_0_10px_rgba(197,160,89,0.2)] object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#C5A059] border-2 border-[#0A0A0A] rounded-full"></span>
          </div>
        </div>
      </div>
    </header>
  );
};
