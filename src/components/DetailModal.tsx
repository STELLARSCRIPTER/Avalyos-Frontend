import React from 'react';
import { MapHotspot, GlobalEvent, OpportunityRegion } from '../types';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  categoryTag?: string;
  type?: 'hotspot' | 'event' | 'opportunity' | 'settings' | 'support' | 'notifications' | 'profile';
  data?: MapHotspot | GlobalEvent | OpportunityRegion | any;
  onActionClick?: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  title,
  categoryTag,
  type,
  data,
  onActionClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl bg-[#0A0A0A] border border-[#1F1F1F] shadow-2xl rounded-sm p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[#1F1F1F] pb-4">
          <div>
            {categoryTag && (
              <span className="font-['JetBrains_Mono'] text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.2em] px-2 py-0.5 bg-[#C5A059]/10 rounded-sm border border-[#C5A059]/30">
                {categoryTag}
              </span>
            )}
            <h2 className="font-serif-title text-xl font-normal text-white mt-1.5">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-white p-1 rounded-sm bg-[#141414] hover:bg-[#1F1F1F]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Dynamic Content Body based on type */}
        {type === 'hotspot' && data && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#141414] p-3 rounded-sm border border-[#1F1F1F]">
              <span className="font-['JetBrains_Mono'] text-xs text-[#888888]">SEVERITY LEVEL:</span>
              <span
                className={`font-['JetBrains_Mono'] text-xs font-bold ${
                  data.severity === 'CRITICAL' ? 'text-[#ff8e8e]' : 'text-[#C5A059]'
                }`}
              >
                {data.severity} ({data.impactScore} / 10)
              </span>
            </div>

            <div>
              <h4 className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] mb-1">
                SUMMARY
              </h4>
              <p className="font-['Geist'] text-sm text-white">{data.summary}</p>
            </div>

            <div>
              <h4 className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#888888] uppercase tracking-[0.2em] mb-1">
                OPERATIONAL DETAILS
              </h4>
              <p className="font-['Geist'] text-xs text-[#888888] p-3 bg-[#141414] rounded-sm border border-[#1F1F1F]">
                {data.details}
              </p>
            </div>

            <div>
              <h4 className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#ff8e8e] uppercase tracking-[0.2em] mb-1">
                RECOMMENDED OPERATIONAL ACTION
              </h4>
              <p className="font-['Geist'] text-xs text-[#ff8e8e] p-3 bg-[#ff8e8e]/10 rounded-sm border border-[#ff8e8e]/30">
                {data.actionRequired}
              </p>
            </div>
          </div>
        )}

        {type === 'event' && data && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#141414] p-3 rounded-sm border border-[#1F1F1F] font-['JetBrains_Mono'] text-xs">
              <span className="text-[#888888]">TIMESTAMP:</span>
              <span className="text-[#C5A059] font-bold">{data.timeUTC}</span>
            </div>

            <div>
              <h4 className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] mb-1">
                EVENT SUMMARY
              </h4>
              <p className="font-['Geist'] text-sm text-white">{data.summary}</p>
            </div>

            <div>
              <h4 className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#888888] uppercase tracking-[0.2em] mb-1">
                SATELLITE & TELEMETRY DETAILS
              </h4>
              <p className="font-['Geist'] text-xs text-[#888888] p-3 bg-[#141414] rounded-sm border border-[#1F1F1F]">
                {data.details}
              </p>
            </div>

            <div>
              <h4 className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] mb-1">
                AFFECTED INSTITUTIONAL ASSETS
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.affectedAssets?.map((ast: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-sm bg-[#C5A059]/10 text-[#C5A059] text-xs font-['JetBrains_Mono'] border border-[#C5A059]/30"
                  >
                    {ast}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {type === 'opportunity' && data && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#C5A059]/10 p-3 rounded-sm border border-[#C5A059]/30">
              <span className="font-['JetBrains_Mono'] text-xs text-[#C5A059]">GROWTH POTENTIAL:</span>
              <span className="font-['JetBrains_Mono'] text-base font-bold text-[#C5A059]">
                +{data.growth}
              </span>
            </div>

            <div>
              <h4 className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] mb-1">
                OVERVIEW
              </h4>
              <p className="font-['Geist'] text-sm text-white">{data.description}</p>
            </div>

            <div>
              <h4 className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#888888] uppercase tracking-[0.2em] mb-1">
                CORE CATALYSTS
              </h4>
              <ul className="space-y-1">
                {data.keyDrivers?.map((driver: string, idx: number) => (
                  <li key={idx} className="text-xs font-['Geist'] text-[#888888] flex items-center gap-2">
                    <span className="text-[#C5A059]">&bull;</span> {driver}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] mb-1">
                RECOMMENDED POSITIONING
              </h4>
              <p className="font-['Geist'] text-xs text-[#C5A059] p-3 bg-[#C5A059]/10 rounded-sm border border-[#C5A059]/30">
                {data.recommendedPositioning}
              </p>
            </div>
          </div>
        )}

        {type === 'settings' && (
          <div className="space-y-4 font-['Geist'] text-xs">
            <div className="p-3 bg-[#141414] rounded-sm border border-[#1F1F1F] space-y-2">
              <h4 className="font-['JetBrains_Mono'] font-bold text-[#C5A059] text-[10px] uppercase tracking-[0.2em]">
                DATA STREAM REFRESH RATE
              </h4>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-[#C5A059] text-black font-['JetBrains_Mono'] font-bold rounded-sm text-[10px] uppercase tracking-wider">
                  15 SECONDS
                </button>
                <button className="px-3 py-1 bg-[#0A0A0A] text-[#888888] font-['JetBrains_Mono'] rounded-sm text-[10px] uppercase tracking-wider border border-[#1F1F1F]">
                  60 SECONDS
                </button>
                <button className="px-3 py-1 bg-[#0A0A0A] text-[#888888] font-['JetBrains_Mono'] rounded-sm text-[10px] uppercase tracking-wider border border-[#1F1F1F]">
                  MANUAL
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#141414] rounded-sm border border-[#1F1F1F] space-y-2">
              <h4 className="font-['JetBrains_Mono'] font-bold text-[#C5A059] text-[10px] uppercase tracking-[0.2em]">
                SECURITY CLEARANCE LEVEL
              </h4>
              <p className="text-[#888888]">
                Active Access: <strong className="text-white">LEVEL 5 (CHIEF INTEL OFFICER)</strong>. All signals decrypted.
              </p>
            </div>
          </div>
        )}

        {type === 'notifications' && (
          <div className="space-y-3">
            <div className="p-3 bg-[#ff8e8e]/10 border border-[#ff8e8e]/30 rounded-sm">
              <p className="font-['JetBrains_Mono'] text-[10px] text-[#ff8e8e] uppercase tracking-wider">CRITICAL ALERT &bull; 10m ago</p>
              <p className="font-['Geist'] text-xs text-white mt-0.5">
                Submarine cable telemetry disruption detected in North Sea Corridor.
              </p>
            </div>
            <div className="p-3 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-sm">
              <p className="font-['JetBrains_Mono'] text-[10px] text-[#C5A059] uppercase tracking-wider">SIGNAL UPDATE &bull; 25m ago</p>
              <p className="font-['Geist'] text-xs text-white mt-0.5">
                Neo-Seoul fab subsidies ratified by Ministry of Industry.
              </p>
            </div>
            <div className="p-3 bg-[#141414] border border-[#1F1F1F] rounded-sm">
              <p className="font-['JetBrains_Mono'] text-[10px] text-[#888888] uppercase tracking-wider">SYSTEM LOG &bull; 1h ago</p>
              <p className="font-['Geist'] text-xs text-[#888888] mt-0.5">
                Automated risk models re-indexed against Q3 commodity futures.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-[#1F1F1F] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-sm bg-[#141414] text-[#888888] hover:text-white font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider font-bold border border-[#1F1F1F]"
          >
            Close
          </button>
          {onActionClick && (
            <button
              onClick={() => {
                onClose();
                onActionClick();
              }}
              className="px-4 py-2 rounded-sm bg-[#C5A059] text-black font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] font-bold hover:brightness-110"
            >
              Run AI Analysis &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
