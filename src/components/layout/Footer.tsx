import React from 'react';
import { KayeLogo } from '../logo/KayeLogo';
import { Shield, Lock, FileText, HelpCircle, Mail, MessageSquareHeart, Code, Sparkles } from 'lucide-react';

interface FooterProps {
  onOpenPage: (page: string) => void;
  onOpenAdminAuth?: () => void;
  isAdminUnlocked?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPage, onOpenAdminAuth, isAdminUnlocked }) => {
  return (
    <footer className="mt-20 border-t border-white/60 dark:border-white/5 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        
        {/* Left: Brand with exact same Kaye Logo & Developer Tag */}
        <div className="flex flex-col gap-2.5 max-w-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg neu-flat flex items-center justify-center p-1 text-black dark:text-white shrink-0">
              <KayeLogo size={20} />
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Kaye AlumniFinder
            </span>

            {/* Developer Credit @nothing */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg neu-inset text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              <Code size={11} />
              <span>Dev: @nothing</span>
            </span>
          </div>

          <p className="leading-relaxed">
            Results come exclusively from publicly available web snippets indexed via official search APIs.
            Kaye is an independent networking tool and is <strong className="text-slate-700 dark:text-slate-300 font-semibold">not affiliated with or endorsed by LinkedIn</strong>.
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Adheres strictly to India's DPDP Act 2023 and GDPR minimization rules. Zero private email or telephone scraping.
          </p>
        </div>

        {/* Right: Policy & Information Links */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href="#feedback-section"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 font-medium text-indigo-600 dark:text-indigo-400"
          >
            <MessageSquareHeart size={13} />
            <span>Give Feedback</span>
          </a>
          <button
            onClick={() => onOpenPage('privacy')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
          >
            <Lock size={13} />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => onOpenPage('terms')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
          >
            <FileText size={13} />
            <span>Terms of Use</span>
          </button>
          <button
            onClick={() => onOpenPage('faq')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
          >
            <HelpCircle size={13} />
            <span>FAQ & No-Email Rule</span>
          </button>
          <button
            onClick={() => onOpenPage('opt-out')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300"
          >
            <Shield size={13} />
            <span>Opt-Out Ledger</span>
          </button>
          <button
            onClick={() => onOpenPage('contact')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
          >
            <Mail size={13} />
            <span>Contact</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span>© 2026 Kaye Technologies. Developed by <strong className="text-slate-700 dark:text-slate-200">@nothing</strong>.</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Built with tactile neumorphism.</span>
          {onOpenAdminAuth && (
            <button
              onClick={onOpenAdminAuth}
              className="hover:text-amber-500 transition-colors opacity-60 hover:opacity-100"
              title="Private Console"
            >
              {isAdminUnlocked ? "● Owner Session Active" : "Owner Gateway"}
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

