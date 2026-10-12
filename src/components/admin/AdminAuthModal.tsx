import React, { useState } from 'react';
import { NeuCard } from '../ui/NeuCard';
import { NeuButton } from '../ui/NeuButton';
import { NeuInput } from '../ui/NeuInput';
import { storageService } from '../../services/storageService';
import { Lock, ShieldAlert, KeyRound, X, Sparkles } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the owner passkey.');
      return;
    }

    const ok = storageService.unlockAdmin(passcode.trim());
    if (ok) {
      storageService.switchRole('admin');
      onSuccess();
      onClose();
    } else {
      setError('Access Denied. Admin panel is restricted exclusively to the platform owner (@nothing).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <NeuCard className="w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl neu-btn text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 mb-2">
          <Lock size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">
            Owner Authentication
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Admin Access Restricted
        </h2>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          The Admin Console is private and reserved strictly for the platform owner/developer (<strong className="text-slate-700 dark:text-slate-300">@nothing</strong>).
        </p>

        {error && (
          <div className="my-4 p-3 rounded-xl neu-inset text-xs text-rose-600 dark:text-rose-400 font-medium flex items-start gap-2">
            <ShieldAlert size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="mt-4 flex flex-col gap-4">
          <NeuInput
            label="Owner Passkey"
            placeholder="Enter passkey (e.g. nothing)"
            type="password"
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value);
              if (error) setError(null);
            }}
            icon={<KeyRound size={16} />}
            autoFocus
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] text-slate-400 font-mono">
              Key: "nothing"
            </span>
            <div className="flex gap-2">
              <NeuButton type="button" size="sm" variant="subtle" onClick={onClose}>
                Cancel
              </NeuButton>
              <NeuButton type="submit" size="sm" variant="primary">
                <Sparkles size={14} />
                <span>Unlock Console</span>
              </NeuButton>
            </div>
          </div>
        </form>
      </NeuCard>
    </div>
  );
};
