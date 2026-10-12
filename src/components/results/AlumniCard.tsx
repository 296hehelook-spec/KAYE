import React from 'react';
import { NeuCard } from '../ui/NeuCard';
import { NeuButton } from '../ui/NeuButton';
import {
  ExternalLink,
  Bookmark,
  UserCheck,
  MapPin,
  Building2,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { AlumniProfile } from '../../types';

interface AlumniCardProps {
  alumni: AlumniProfile;
  isBookmarked: boolean;
  onToggleBookmark: (alumni: AlumniProfile) => void;
  onConnect: (alumni: AlumniProfile) => void;
  onOptOut: (linkedinUrl: string) => void;
}

export const AlumniCard: React.FC<AlumniCardProps> = ({
  alumni,
  isBookmarked,
  onToggleBookmark,
  onConnect,
  onOptOut,
}) => {
  // Generate consistent initials
  const initials = alumni.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  const matches = alumni.matches || [];
  const hasCollegeMatch = alumni.college_match || matches.includes('college');
  const hasYearMatch = alumni.year_match || matches.includes('year');
  const hasBranchMatch = alumni.branch_match || matches.includes('branch');

  return (
    <NeuCard className="p-5 flex flex-col justify-between h-full group transition-all duration-200 hover:-translate-y-0.5">
      <div>
        {/* Top Header: Avatar & Match Badge */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          {/* Avatar with initials (never hotlinking photos) */}
          <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center font-bold text-base text-indigo-600 dark:text-indigo-400 shrink-0">
            {initials || 'AL'}
          </div>

          <div className="flex flex-col items-end gap-1">
            {/* Match Confidence Badge */}
            <span
              className={`text-[11px] font-semibold tracking-tight px-2 py-0.5 rounded-lg neu-inset flex items-center gap-1 ${
                alumni.confidence === 'high'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              <CheckCircle2 size={11} />
              <span>{alumni.confidence === 'high' ? 'High Match' : 'Medium Match'}</span>
            </span>

            {/* Self-registered indicator if applicable */}
            {alumni.source === 'self_registered' && (
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                Verified Alum
              </span>
            )}
          </div>
        </div>

        {/* Name and Headline */}
        <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight line-clamp-1">
          {alumni.name}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
          {alumni.headline || `${alumni.current_role || 'Professional'} · ${alumni.company || alumni.college}`}
        </p>

        {/* Role, Company, Location */}
        <div className="mt-3.5 pt-3 border-t border-black/5 dark:border-white/5 flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          {(alumni.current_role || alumni.company) && (
            <div className="flex items-center gap-1.5 truncate">
              <Building2 size={13} className="shrink-0 text-slate-400" />
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                {alumni.current_role || 'Role'}
                {alumni.current_role && alumni.company ? ' · ' : ''}
                {alumni.company}
              </span>
            </div>
          )}

          {alumni.location && (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin size={13} className="shrink-0 text-slate-400" />
              <span className="truncate">{alumni.location}</span>
            </div>
          )}

          {/* Academic Match Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {hasCollegeMatch && (
              <span className="px-2 py-0.5 rounded-md neu-inset text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={alumni.college}>
                {alumni.college}
              </span>
            )}
            {hasYearMatch && (
              <span className="px-2 py-0.5 rounded-md neu-inset text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
                Class of {alumni.passout_year}
              </span>
            )}
            {hasBranchMatch && (
              <span className="px-2 py-0.5 rounded-md neu-inset text-[10px] font-medium text-slate-700 dark:text-slate-300">
                {alumni.branch}
              </span>
            )}
          </div>
        </div>

        {/* Small note on every card as required: "AI-found from public search results. Please verify on LinkedIn." */}
        <div className="mt-3 py-1.5 px-2.5 rounded-lg neu-inset flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
          <Sparkles size={11} className="shrink-0 text-indigo-500" />
          <span>AI-found from public search results. Please verify on LinkedIn.</span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2">
          {/* View on LinkedIn button (opens in a new tab) */}
          <a
            href={alumni.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <NeuButton size="sm" variant="subtle" className="w-full text-xs">
              <ExternalLink size={13} />
              <span>View on LinkedIn</span>
            </NeuButton>
          </a>

          {/* Save / Bookmark Button */}
          <NeuButton
            size="sm"
            variant={isBookmarked ? 'inset' : 'default'}
            onClick={() => onToggleBookmark(alumni)}
            className="w-full text-xs"
          >
            <Bookmark size={13} className={isBookmarked ? 'fill-current' : ''} />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </NeuButton>
        </div>

        {/* Connect Action Button */}
        <NeuButton
          size="sm"
          variant="primary"
          onClick={() => onConnect(alumni)}
          className="w-full text-xs"
        >
          <UserCheck size={14} />
          <span>{alumni.source === 'self_registered' ? 'Connect via Kaye' : 'Connect on LinkedIn'}</span>
        </NeuButton>

        {/* "Remove my profile" link that opens the opt-out flow */}
        <div className="text-center pt-0.5">
          <button
            onClick={() => onOptOut(alumni.linkedin_url)}
            className="text-[10px] text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors inline-flex items-center gap-1 outline-none"
          >
            <ShieldAlert size={10} />
            <span>Remove my profile</span>
          </button>
        </div>
      </div>
    </NeuCard>
  );
};
