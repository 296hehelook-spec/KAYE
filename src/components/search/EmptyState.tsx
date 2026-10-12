import React from 'react';
import { NeuCard } from '../ui/NeuCard';
import { NeuButton } from '../ui/NeuButton';
import { SearchX, Lightbulb, RefreshCw } from 'lucide-react';
import { SearchFilters } from '../../types';

interface EmptyStateProps {
  filters: SearchFilters;
  onModifySearch: () => void;
  onResetFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  filters,
  onModifySearch,
  onResetFilters,
}) => {
  return (
    <NeuCard className="p-8 sm:p-12 text-center max-w-2xl mx-auto flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl neu-inset flex items-center justify-center text-slate-400 mb-4">
        <SearchX size={28} />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
        No alumni profiles found
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6 max-w-md">
        We could not find matching public profiles for <span className="font-semibold text-slate-700 dark:text-slate-300">{filters.college}</span>, <span className="font-semibold text-slate-700 dark:text-slate-300">{filters.branch}</span> ({filters.passout_year}).
      </p>

      {/* Helpful Search Tips */}
      <div className="w-full text-left p-4 rounded-xl neu-inset mb-6 flex flex-col gap-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
          <Lightbulb size={15} />
          <span>Search Refinement Tips:</span>
        </div>
        <ul className="text-xs text-slate-600 dark:text-slate-300 list-disc list-inside space-y-1">
          <li>Try the college's common acronym or short form (e.g. "IIT Jodhpur" instead of the long formal name).</li>
          <li>Widen the graduation year window by 1–2 years (e.g., try 2019 or 2021).</li>
          <li>Remove specific company or city restrictions from "Refine filters".</li>
          <li>Try standard branch names like "Computer Science" or "ECE".</li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <NeuButton size="sm" variant="subtle" onClick={onResetFilters}>
          <RefreshCw size={14} />
          <span>Reset Extra Filters</span>
        </NeuButton>
        <NeuButton size="sm" variant="primary" onClick={onModifySearch}>
          <span>Modify College & Year</span>
        </NeuButton>
      </div>
    </NeuCard>
  );
};
