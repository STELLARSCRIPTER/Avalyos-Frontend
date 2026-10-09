import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Region } from '../types';

const API_BASE = 'http://localhost:8000';

// Module-level cache — the ISO country list is stable, so we fetch once
// per page load and share across all RegionSelect instances.
let cachedRegions: Region[] | null = null;
let inflight: Promise<Region[]> | null = null;

async function fetchRegions(): Promise<Region[]> {
  if (cachedRegions) return cachedRegions;
  if (inflight) return inflight;

  inflight = fetch(`${API_BASE}/regions`)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load regions (${res.status})`);
      return res.json();
    })
    .then((data: Region[]) => {
      cachedRegions = data;
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

interface RegionSelectProps {
  value: string | null;                // selected ISO-2 code, or null for none
  onChange: (iso: string) => void;
  label?: string;
  placeholder?: string;
  includeAll?: boolean;                // adds an "All regions" option at the top
}

export const RegionSelect: React.FC<RegionSelectProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select a region…',
  includeAll = false,
}) => {
  const [regions, setRegions] = useState<Region[]>(cachedRegions ?? []);
  const [loading, setLoading] = useState<boolean>(!cachedRegions);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Fetch list ---
  useEffect(() => {
    if (cachedRegions) return;
    let cancelled = false;
    fetchRegions()
      .then((list) => {
        if (!cancelled) {
          setRegions(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Failed to load regions');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Close on outside click ---
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // --- Filtered list ---
  const filtered = useMemo(() => {
    if (!search.trim()) return regions;
    const q = search.trim().toLowerCase();
    return regions.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.iso_code.toLowerCase().includes(q),
    );
  }, [regions, search]);

  const selected = value ? regions.find((r) => r.iso_code === value) : null;
  const allOption = includeAll ? { iso_code: '', name: 'All regions' } : null;

  const handleSelect = (iso: string) => {
    onChange(iso);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888] font-bold mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          // Focus the search input once the dropdown is open
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        disabled={loading}
        className="w-full bg-[#0A0A0A] border border-[#1F1F1F] focus:border-[#C5A059] hover:border-[#2F2F2F] text-white font-['JetBrains_Mono'] text-xs px-4 py-3 rounded-sm outline-none transition-colors text-left flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {selected ? (
          <>
            <img
              src={selected.flag_url ?? ''}
              alt=""
              className="w-5 h-3.5 object-cover"
              onError={(e) => ((e.currentTarget.style.display = 'none'))}
            />
            <span className="truncate">{selected.name}</span>
            <span className="ml-auto text-[#666666]">{selected.iso_code}</span>
          </>
        ) : allOption && value === '' ? (
          <span className="truncate">{allOption.name}</span>
        ) : loading ? (
          <span className="text-[#666666]">Loading regions…</span>
        ) : (
          <span className="text-[#555555] truncate">{placeholder}</span>
        )}

        <span className="ml-auto material-symbols-outlined text-[16px] text-[#666666]">
          expand_more
        </span>
      </button>

      {error && (
        <div className="mt-2 text-[10px] font-['JetBrains_Mono'] text-red-400">
          {error}
        </div>
      )}

      {open && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-sm shadow-2xl">
          <div className="p-2 border-b border-[#1F1F1F]">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to filter…"
              className="w-full bg-[#141414] border border-[#1F1F1F] focus:border-[#C5A059] text-white font-['JetBrains_Mono'] text-[11px] px-3 py-2 rounded-sm outline-none transition-colors placeholder:text-[#555555]"
            />
          </div>

          <div className="max-h-72 overflow-y-auto">
            {allOption && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className="w-full text-left px-3 py-2 hover:bg-[#141414] transition-colors border-b border-[#1F1F1F]"
              >
                <span className="text-[12px] text-[#C5A059] font-['JetBrains_Mono'] uppercase tracking-wider">
                  {allOption.name}
                </span>
              </button>
            )}

            {filtered.length === 0 && (
              <div className="px-3 py-3 text-[11px] font-['JetBrains_Mono'] text-[#666666]">
                No regions match "{search}"
              </div>
            )}

            {filtered.map((r) => (
              <button
                key={r.iso_code}
                type="button"
                onClick={() => handleSelect(r.iso_code)}
                className={`w-full text-left px-3 py-2 hover:bg-[#141414] transition-colors flex items-center gap-3 ${
                  value === r.iso_code ? 'bg-[#C5A059]/5' : ''
                }`}
              >
                <img
                  src={r.flag_url ?? ''}
                  alt=""
                  className="w-5 h-3.5 object-cover shrink-0"
                  onError={(e) => ((e.currentTarget.style.display = 'none'))}
                />
                <span className="text-[12px] text-[#e0e0e0] truncate flex-1">
                  {r.name}
                </span>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[#666666] shrink-0">
                  {r.iso_code}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};