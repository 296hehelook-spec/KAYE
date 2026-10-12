import React, { useState } from 'react';
import { NeuCard } from '../ui/NeuCard';
import { NeuButton } from '../ui/NeuButton';
import { AlumniProfile } from '../../types';
import { storageService } from '../../services/storageService';
import { X, ExternalLink, Send, ShieldCheck, AlertCircle } from 'lucide-react';

interface ConnectModalProps {
  alumni: AlumniProfile;
  onClose: () => void;
  onSuccess: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  alumni,
  onClose,
  onSuccess,
}) => {
  const [message, setMessage] = useState(
    `Hi ${alumni.name.split(' ')[0]}, I am a student at ${alumni.college} interested in ${alumni.company ? alumni.company : 'your domain'}. I would love to connect for brief mentorship or guidance.`
  );
  const [respectPledge, setRespectPledge] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelfRegistered = alumni.source === 'self_registered';

  const handleSendRequest = () => {
    if (!respectPledge) {
      setError('You must accept the respectful conduct pledge.');
      return;
    }
    if (!message.trim()) {
      setError('Please write a brief note.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = storageService.createConnectionRequest(alumni, message.trim());
    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Failed to send request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <NeuCard className="w-full max-w-lg p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl neu-btn text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pr-8">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {isSelfRegistered ? 'Direct Mentorship Request' : 'Public Profile Connection'}
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Connect with {alumni.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {alumni.headline}
          </p>
        </div>

        {isSelfRegistered ? (
          /* Consent-First Direct Connect Form for Self-Registered Alumni */
          <div className="flex flex-col gap-4">
            <div className="p-3.5 rounded-xl neu-inset text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <span>
                {alumni.name} is a verified self-registered alum on Kaye. Your request will appear in their dashboard. Email is revealed <strong>only</strong> if they accept.
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl neu-inset text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Personal Note (max 500 chars)</span>
                <span className="text-[11px] text-slate-400">{message.length}/500</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                rows={4}
                className="w-full rounded-xl neu-inset p-3.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                placeholder="Introduce yourself, mention shared college background, and state your specific question."
              />
            </div>

            {/* Respectful conduct pledge */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={respectPledge}
                onChange={(e) => setRespectPledge(e.target.checked)}
                className="mt-1 rounded accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                I pledge to be respectful, courteous, and concise. I understand spamming or commercial solicitation leads to an immediate account suspension (limit 5 requests/day).
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t border-black/5 dark:border-white/5">
              <NeuButton size="sm" variant="subtle" onClick={onClose}>
                Cancel
              </NeuButton>
              <NeuButton
                size="sm"
                variant="primary"
                onClick={handleSendRequest}
                disabled={isSubmitting || !respectPledge}
              >
                <Send size={14} />
                <span>{isSubmitting ? 'Sending...' : 'Send Connect Request'}</span>
              </NeuButton>
            </div>
          </div>
        ) : (
          /* Public Search Match: Redirect to LinkedIn */
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl neu-inset text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex flex-col gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">
                    Public Web Search Result
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    This profile was found in public web search results. To respect user privacy and avoid unsolicited messages, connection requests on Kaye are delivered <strong>strictly</strong> to alumni who have explicitly self-registered.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-black/5 dark:border-white/5">
                You can reach out directly through their official public LinkedIn profile link below.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-2">
              <NeuButton size="sm" variant="subtle" onClick={onClose}>
                Close
              </NeuButton>
              <a
                href={alumni.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <NeuButton size="sm" variant="primary">
                  <ExternalLink size={14} />
                  <span>Connect on LinkedIn</span>
                </NeuButton>
              </a>
            </div>
          </div>
        )}
      </NeuCard>
    </div>
  );
};
