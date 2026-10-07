import React, { useState, useEffect, useRef } from 'react';
import { Company } from '../types';

const API_BASE = 'http://localhost:8000';

interface CompanySearchProps {
  onSelect: (company: Company) => void;
  placeholder?: string;
}

export const CompanySearch: React.FC<CompanySearchProps> = ({
  onSelect,
  placeholder = 'Search a company name...',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    const trimmed = query.trim();

    // Clear everything if query is too short
    if (trimmed.length < 3) {
      setResults([]);
      setIsOpen(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(false);

    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/companies/search?q=${encodeURIComponent(trimmed)}&limit=15`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.detail?.error || `Search failed (${res.status})`);
        }
        const data: Company[] = await res.json();
        setResults(data);
        setError(null);
        setIsOpen(true);
        setHasSearched(true);
      } catch (err: any) {
        setError(err?.message || 'Search failed');
        setResults([]);
        setIsOpen(true);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (company: Company) => {
    onSelect(company);
    setQuery('');
    setIsOpen(false);
    setResults([]);
    setHasSearched(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setError(null);
    setHasSearched(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#666666]">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 3 && hasSearched) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-[#0A0A0A] border border-[#1F1F1F] focus:border-[#C5A059] text-white font-['JetBrains_Mono'] text-xs px-4 py-3 pl-10 pr-10 rounded-sm outline-none transition-colors placeholder:text-[#555555]"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-['JetBrains_Mono'] text-[#C5A059] uppercase tracking-wider">
            Searching…
          </span>
        )}
        {!loading && query.length > 0 && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {isOpen && query.trim().length >= 3 && (
        <div className="absolute z-50 mt-1 w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-sm shadow-2xl max-h-80 overflow-y-auto">
          {error && (
            <div className="px-4 py-3 text-xs font-['JetBrains_Mono'] text-red-400 border-b border-[#1F1F1F]">
              {error}
            </div>
          )}

          {!error && hasSearched && results.length === 0 && !loading && (
            <div className="px-4 py-3 text-xs font-['JetBrains_Mono'] text-[#666666]">
              No companies found for "{query.trim()}"
            </div>
          )}

          {results.map((c) => (
            <button
              key={c.lei}
              onClick={() => handleSelect(c)}
              className="w-full text-left px-4 py-3 border-b border-[#1F1F1F] last:border-b-0 hover:bg-[#141414] transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-white font-medium truncate group-hover:text-[#C5A059] transition-colors">
                    {c.name}
                  </div>
                  <div className="mt-1 text-[10px] font-['JetBrains_Mono'] text-[#666666] uppercase tracking-wider">
                    {[c.city, c.country].filter(Boolean).join(' · ') || c.jurisdiction || '—'}
                  </div>
                </div>
                <div
                  className={`shrink-0 text-[9px] font-['JetBrains_Mono'] font-bold uppercase tracking-wider px-2 py-1 rounded-sm border ${
                    c.status === 'ACTIVE'
                      ? 'text-[#C5A059] border-[#C5A059]/40 bg-[#C5A059]/5'
                      : 'text-[#666666] border-[#1F1F1F]'
                  }`}
                >
                  {c.status}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

