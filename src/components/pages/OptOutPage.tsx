import React, { useState, useEffect } from 'react';
import { NeuCard } from '../ui/NeuCard';
import { NeuButton } from '../ui/NeuButton';
import { NeuInput } from '../ui/NeuInput';
import { storageService } from '../../services/storageService';
import { ShieldCheck, ShieldAlert, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';

interface OptOutPageProps {
  initialUrl?: string;
  onBackToSearch: () => void;
}

export const OptOutPage: React.FC<OptOutPageProps> = ({
  initialUrl,
  onBackToSearch,
}) => {
  const [linkedinUrl, setLinkedinUrl] = useState(initialUrl || '');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('Personal privacy preference');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialUrl) {
      setLinkedinUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = linkedinUrl.trim();
    if (!clean || !clean.includes('linkedin.com/in/')) {
      setError('Please provide a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username).');
      return;
    }

    storageService.addOptOut(clean, email.trim() || undefined, reason);
    setIsSubmitted(true);
    setError(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto py-6">
      <NeuCard className="p-6 sm:p-8">
        {!isSubmitted ? (
          <div>
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 mb-2">
              <ShieldAlert size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Permanent Privacy Suppression
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Opt-Out / Remove Profile
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              If your public web profile appears in Kaye search results and you prefer not to be discoverable by students, enter your LinkedIn URL below.
            </p>

            <div className="my-5 p-3.5 rounded-xl neu-inset text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5 leading-relaxed">
              <Lock size={15} className="shrink-0 text-indigo-500 mt-0.5" />
              <span>
                <strong>Instant Effect:</strong> Submitting your profile URL immediately purges it from all active search caches and excludes it permanently from future search agent results.
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl neu-inset text-xs text-rose-600 dark:text-rose-400 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <NeuInput
                label="LinkedIn Profile URL to Exclude"
                placeholder="https://www.linkedin.com/in/yourname"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                required
              />

              <NeuInput
                label="Confirmation Email (Optional)"
                placeholder="you@domain.com (used solely for opt-out audit confirmation)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Reason for Opt-Out (Optional)
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl neu-inset px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 bg-transparent outline-none cursor-pointer"
                >
                  <option value="Personal privacy preference" className="bg-[#eaf0f6] dark:bg-[#141720]">Personal privacy preference</option>
                  <option value="Not interested in mentorship inquiries" className="bg-[#eaf0f6] dark:bg-[#141720]">Not interested in mentorship inquiries</option>
                  <option value="Incorrect college affiliation indexed" className="bg-[#eaf0f6] dark:bg-[#141720]">Incorrect college affiliation indexed</option>
                  <option value="Other" className="bg-[#eaf0f6] dark:bg-[#141720]">Other reason</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={onBackToSearch}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  <ArrowLeft size={13} />
                  <span>Return to Search</span>
                </button>

                <NeuButton type="submit" variant="primary" size="md">
                  <ShieldCheck size={16} />
                  <span>Confirm Opt-Out</span>
                </NeuButton>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="text-center py-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl neu-inset flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <CheckCircle2 size={32} />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Profile Excluded Successfully
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-sm leading-relaxed">
              The LinkedIn URL <strong>{linkedinUrl}</strong> has been permanently added to the exclusion ledger. It will never appear in future search results or cached queries.
            </p>

            <div className="mt-8 flex gap-3">
              <NeuButton size="sm" variant="subtle" onClick={() => setIsSubmitted(false)}>
                Exclude Another URL
              </NeuButton>
              <NeuButton size="sm" variant="primary" onClick={onBackToSearch}>
                Return to Search
              </NeuButton>
            </div>
          </div>
        )}
      </NeuCard>
    </div>
  );
};
