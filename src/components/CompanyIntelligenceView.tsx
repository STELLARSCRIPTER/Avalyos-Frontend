import React, { useEffect, useState } from 'react';

interface CompanyOut {
  name: string;
  code: string;
  sector: string;
  subsector: string;
  description: string | null;
  branch_count: number;
}

interface BranchOut {
  code: string;
  name: string | null;
  company: string;
  continent: string;
  country: string;
  state: string;
  city: string | null;
  sector: string;
  subsector: string;
  employees: number;
}

interface CompanyDetailOut extends CompanyOut {
  branches: BranchOut[];
}

interface CompanyIntelligenceViewProps {
  onOpenNewAnalysisWithTopic: (topic: string) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const CompanyIntelligenceView: React.FC<CompanyIntelligenceViewProps> = ({
  onOpenNewAnalysisWithTopic,
}) => {
  const [companies, setCompanies] = useState<CompanyOut[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyOut | null>(null);
  const [companyDetail, setCompanyDetail] = useState<CompanyDetailOut | null>(null);

  const [listLoading, setListLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load the company list once on mount
  useEffect(() => {
    const loadCompanies = async () => {
      setListLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/companies`);
        if (!res.ok) throw new Error('Failed to load companies');
        const data: CompanyOut[] = await res.json();
        setCompanies(data);
        if (data.length > 0) setSelectedCompany(data[0]);
      } catch (err: any) {
        setError(err?.message || 'Could not reach backend');
      } finally {
        setListLoading(false);
      }
    };
    loadCompanies();
  }, []);

  // Load branch detail whenever the selected company changes
  useEffect(() => {
    if (!selectedCompany) return;
    const loadDetail = async () => {
      setDetailLoading(true);
      setCompanyDetail(null);
      try {
        const res = await fetch(`${API_BASE}/companies/${encodeURIComponent(selectedCompany.name)}`);
        if (!res.ok) throw new Error('Failed to load company detail');
        const data: CompanyDetailOut = await res.json();
        setCompanyDetail(data);
      } catch (err: any) {
        setError(err?.message || 'Could not load company detail');
      } finally {
        setDetailLoading(false);
      }
    };
    loadDetail();
  }, [selectedCompany]);

  const totalEmployees = companyDetail?.branches?.reduce((sum, b) => sum + (b.employees || 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-title text-xl font-normal text-white">
            Company & Branch Intelligence
          </h2>
          <p className="font-['Geist'] text-xs text-[#888888]">
            Company records, sectors, and branch-level footprint from the risk database
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[#ff8e8e]/10 border border-[#ff8e8e]/40 rounded-sm text-[#ff8e8e] text-xs font-['Geist']">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Company List */}
        <div className="lg:col-span-5 space-y-3">
          {listLoading && (
            <div className="glass-panel p-4 text-xs font-['Geist'] text-[#888888]">
              Loading companies...
            </div>
          )}

          {!listLoading && companies.length === 0 && !error && (
            <div className="glass-panel p-4 text-xs font-['Geist'] text-[#888888]">
              No companies found in the database.
            </div>
          )}

          {companies.map((company) => {
            const isSelected = selectedCompany?.code === company.code;

            return (
              <div
                key={company.code}
                onClick={() => setSelectedCompany(company)}
                className={`glass-panel p-4 cursor-pointer transition-all rounded-sm border ${
                  isSelected
                    ? 'border-[#C5A059] bg-[#C5A059]/10 shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                    : 'border-[#1F1F1F] bg-[#0A0A0A] hover:border-[#333333]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] bg-[#C5A059]/15 px-2 py-0.5 rounded-sm mr-2 border border-[#C5A059]/30">
                      {company.code}
                    </span>
                    <span className="font-['Geist'] text-sm font-semibold text-white">
                      {company.name}
                    </span>
                  </div>
                  <span className="font-['JetBrains_Mono'] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40">
                    {company.branch_count} BRANCHES
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs font-['JetBrains_Mono'] text-[#888888] mt-3 pt-2 border-t border-[#1F1F1F]">
                  <span>Sector: {company.sector}</span>
                  <span>{company.subsector}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-7 glass-panel p-6 space-y-6 flex flex-col justify-between">
          {!selectedCompany && (
            <div className="text-xs font-['Geist'] text-[#888888]">
              Select a company to view details.
            </div>
          )}

          {selectedCompany && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-[#1F1F1F] pb-4">
                <div>
                  <span className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.25em]">
                    CORPORATE PROFILE
                  </span>
                  <h3 className="font-serif-title text-2xl font-normal text-white mt-1">
                    {selectedCompany.name} ({selectedCompany.code})
                  </h3>
                  <p className="font-['Geist'] text-xs text-[#888888]">
                    {selectedCompany.sector} &bull; {selectedCompany.subsector}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-['JetBrains_Mono'] text-[9px] text-[#666666] uppercase tracking-wider">BRANCHES</p>
                  <span className="font-serif-title text-3xl font-normal text-white">
                    {selectedCompany.branch_count}
                  </span>
                </div>
              </div>

              {selectedCompany.description && (
                <p className="font-['Geist'] text-sm text-white leading-relaxed bg-[#141414] p-3.5 border border-[#1F1F1F] rounded-sm">
                  {selectedCompany.description}
                </p>
              )}

              {detailLoading && (
                <div className="text-xs font-['Geist'] text-[#888888]">Loading branch detail...</div>
              )}

              {companyDetail && (
                <>
                  {/* Network stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#141414] border border-[#1F1F1F] rounded-sm">
                      <p className="font-['JetBrains_Mono'] text-[9px] text-[#666666] uppercase tracking-wider">
                        TOTAL EMPLOYEES
                      </p>
                      <p className="font-serif-title text-xl font-normal text-white mt-1">
                        {totalEmployees.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 bg-[#141414] border border-[#1F1F1F] rounded-sm">
                      <p className="font-['JetBrains_Mono'] text-[9px] text-[#666666] uppercase tracking-wider">
                        COUNTRIES OF OPERATION
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {[...new Set(companyDetail.branches.map((b) => b.country))].map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-[10px] font-['JetBrains_Mono'] font-bold bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30 rounded-sm"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Branch list */}
                  <div>
                    <h4 className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] mb-2">
                      BRANCH FOOTPRINT
                    </h4>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                      {companyDetail.branches.map((branch) => (
                        <div
                          key={branch.code}
                          className="flex items-center justify-between p-2.5 bg-[#141414] border border-[#1F1F1F] rounded-sm text-xs font-['Geist'] text-white"
                        >
                          <span>
                            {branch.city ? `${branch.city}, ` : ''}
                            {branch.country}
                          </span>
                          <span className="text-[#888888] font-['JetBrains_Mono']">
                            {branch.employees.toLocaleString()} employees
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => onOpenNewAnalysisWithTopic(selectedCompany.name)}
                className="w-full border border-[#C5A059] text-[#C5A059] bg-[#C5A059]/10 hover:bg-[#C5A059] hover:text-black py-3 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] font-bold rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(197,160,89,0.1)]"
              >
                <span className="material-symbols-outlined text-[18px]">analytics</span>
                Run Risk Analysis on {selectedCompany.name}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};