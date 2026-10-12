import React, { useState, useEffect } from 'react';
import { NeuCard } from '../ui/NeuCard';
import { SearchFilters } from '../../types';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Database,
  ShieldCheck,
  Cpu,
  Terminal,
  Loader2,
} from 'lucide-react';

interface LoadingSkeletonProps {
  filters?: SearchFilters;
}

interface StepItem {
  id: number;
  title: string;
  detail: string;
  icon: React.ElementType;
}

const SEARCH_STEPS: StepItem[] = [
  {
    id: 1,
    title: 'Normalizing Campus & Branch Terms',
    detail: 'Standardizing college acronyms, degree variations, and department names',
    icon: Database,
  },
  {
    id: 2,
    title: 'Building Precision Queries',
    detail: 'Constructing 4–6 targeted search strings for public LinkedIn profiles',
    icon: Search,
  },
  {
    id: 3,
    title: 'Fetching Public Web Results',
    detail: 'Querying official Google Programmable Search API & indexing snippets',
    icon: Cpu,
  },
  {
    id: 4,
    title: 'Analyzing Profiles with AI Agent',
    detail: 'Extracting current role, employer, and location with Gemini & Claude',
    icon: Sparkles,
  },
  {
    id: 5,
    title: 'Evaluating Match Confidence',
    detail: 'Verifying graduation year and department alignment (High/Medium match)',
    icon: CheckCircle2,
  },
  {
    id: 6,
    title: 'Applying Privacy & Opt-Out Filters',
    detail: 'Checking against permanent suppression ledger & assembling results',
    icon: ShieldCheck,
  },
];

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ filters }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(12);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Smooth elapsed timer
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Step progression simulation (timed to complete around ~1.8 - 2.5s)
  useEffect(() => {
    const stepTimers = [
      setTimeout(() => { setCurrentStep(2); setProgress(32); }, 350),
      setTimeout(() => { setCurrentStep(3); setProgress(52); }, 750),
      setTimeout(() => { setCurrentStep(4); setProgress(74); }, 1250),
      setTimeout(() => { setCurrentStep(5); setProgress(88); }, 1750),
      setTimeout(() => { setCurrentStep(6); setProgress(96); }, 2200),
    ];

    return () => {
      stepTimers.forEach(clearTimeout);
    };
  }, []);

  const collegeName = filters?.college || 'Selected University';
  const passoutYear = filters?.passout_year || 2020;
  const branchName = filters?.branch || 'Engineering';

  return (
    <div className="w-full max-w-4xl mx-auto py-4 flex flex-col gap-6 animate-in fade-in duration-200">
      
      {/* Top Main Progress Console */}
      <NeuCard className="p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-black/5 dark:border-white/5">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Loader2 size={14} className="animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>Searching public profiles...</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              Locating Alumni for {collegeName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target: Class of {passoutYear} · {branchName} · Grounded with Google Search
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2.5 rounded-xl neu-inset flex items-center gap-1.5 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
              <Clock size={13} className="text-slate-400" />
              <span>{(elapsedMs / 1000).toFixed(1)}s elapsed</span>
            </div>
            <div className="p-2.5 rounded-xl neu-flat text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {progress}%
            </div>
          </div>
        </div>

        {/* Tactile Sunken Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              Step {currentStep} of {SEARCH_STEPS.length}: {SEARCH_STEPS[currentStep - 1]?.title}
            </span>
            <span className="font-mono text-slate-400 text-[11px]">{progress}% Complete</span>
          </div>

          <div className="h-3.5 w-full rounded-full neu-inset p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-500 transition-all duration-300 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </NeuCard>

      {/* Step-by-Step Interactive Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {SEARCH_STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isPending = currentStep < step.id;
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-4 rounded-2xl transition-all duration-200 flex items-start gap-3.5 ${
                isCurrent
                  ? 'neu-flat ring-1 ring-indigo-500/40 -translate-y-0.5'
                  : isDone
                  ? 'neu-flat bg-slate-50/60 dark:bg-slate-900/40 opacity-90'
                  : 'neu-inset opacity-55'
              }`}
            >
              {/* Step Status Icon */}
              <div
                className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center transition-all ${
                  isDone
                    ? 'neu-inset text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                    : isCurrent
                    ? 'neu-inset text-indigo-600 dark:text-indigo-400 bg-indigo-500/15'
                    : 'neu-inset text-slate-400 dark:text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 size={18} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <StepIcon size={16} />
                )}
              </div>

              {/* Step Info */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold truncate ${
                      isCurrent
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : isDone
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.id}. {step.title}
                  </span>
                  {isDone && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Done
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
                      Processing...
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Query Activity Terminal */}
      <NeuCard variant="inset" className="p-4 sm:p-5 flex flex-col gap-2 font-mono text-[11px]">
        <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-semibold">
            <Terminal size={13} />
            <span>Agent Pipeline Activity Log</span>
          </div>
          <span className="text-[10px] text-indigo-500">Official API · Zero Scraping</span>
        </div>

        <div className="flex flex-col gap-1 text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
            <span>&gt;</span>
            <span className="truncate">
              Target: "{collegeName}" "{branchName}" "{passoutYear}"
            </span>
          </div>
          {currentStep >= 2 && (
            <div className="flex items-center gap-2 text-slate-500 truncate">
              <span>&gt;</span>
              <span>site:linkedin.com/in "{collegeName}" "B.Tech" {passoutYear}</span>
            </div>
          )}
          {currentStep >= 3 && (
            <div className="flex items-center gap-2 text-slate-500">
              <span>&gt;</span>
              <span>Querying Google Programmable Search JSON API (200 OK)</span>
            </div>
          )}
          {currentStep >= 4 && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <span>&gt;</span>
              <span>Structured extraction active: Gemini &amp; Claude batch parsing</span>
            </div>
          )}
          {currentStep >= 5 && (
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <span>&gt;</span>
              <span>Evaluating department matches &amp; confidence scores...</span>
            </div>
          )}
          {currentStep >= 6 && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>&gt;</span>
              <span>Zero opted-out records detected. Preparing results card grid...</span>
            </div>
          )}
        </div>
      </NeuCard>

    </div>
  );
};
