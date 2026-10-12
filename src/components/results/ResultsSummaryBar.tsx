import React from 'react';
import { NeuCard } from '../ui/NeuCard';
import { NeuButton } from '../ui/NeuButton';
import { SlidersHorizontal, Download, ArrowUpDown, Clock } from 'lucide-react';
import { SearchFilters } from '../../types';

interface ResultsSummaryBarProps {
  filters: SearchFilters;
  resultCount: number;
  fromCache: boolean;
  executionTimeMs: number;
  onRefine: () => void;
  onExportCSV: () => void;
  companyFilter: string;
  setCompanyFilter: (co: string) => void;
  availableCompanies: string[];
  sortBy: 'relevance' | 'company' | 'name';
  setSortBy: (sort: 'relevance' | 'company' | 'name') => void;
}

export const ResultsSummaryBar: React.FC<ResultsSummaryBarProps> = ({
  filters,
  resultCount,
  fromCache,
  executionTimeMs,
  onRefine,
  onExportCSV,
  companyFilter,
  setCompanyFilter,
  availableCompanies,
  sortBy,
  setSortBy,
}) => {
  return (
    <NeuCard className="p-4 sm:p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Summary Info */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {resultCount} {resultCount === 1 ? 'alumnus' : 'alumni'} found
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              for {filters.college} · {filters.branch} · {filters.passout_year}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-mono">
              <Clock size={12} />
              {executionTimeMs}ms
            </span>
            {fromCache && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                · Served instantly from cache
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <NeuButton size="sm" variant="subtle" onClick={onRefine}>
            <SlidersHorizontal size={14} />
            <span>Refine Search</span>
          </NeuButton>

          <NeuButton size="sm" variant="subtle" onClick={onExportCSV}>
            <Download size={14} />
            <span>Export CSV</span>
          </NeuButton>
        </div>
      </div>

      {/* Filter Chips & Sort Controls */}
      <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Company Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-500 dark:text-slate-400 mr-1 font-medium">Company:</span>
          <button
            onClick={() => setCompanyFilter('')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              companyFilter === ''
                ? 'neu-inset text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All
          </button>
          {availableCompanies.slice(0, 5).map((co) => (
            <button
              key={co}
              onClick={() => setCompanyFilter(companyFilter === co ? '' : co)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                companyFilter === co
                  ? 'neu-inset text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {co}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <ArrowUpDown size={12} />
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg neu-inset px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 bg-transparent outline-none cursor-pointer"
          >
            <option value="relevance" className="bg-[#eaf0f6] dark:bg-[#141720]">Match Relevance</option>
            <option value="company" className="bg-[#eaf0f6] dark:bg-[#141720]">Company (A-Z)</option>
            <option value="name" className="bg-[#eaf0f6] dark:bg-[#141720]">Name (A-Z)</option>
          </select>
        </div>
      </div>
    </NeuCard>
  );
};
