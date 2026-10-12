import React, { useState } from 'react';
import { NeuCard } from '../ui/NeuCard';
import { NeuButton } from '../ui/NeuButton';
import { AlumniProfile, ConnectionRequest } from '../../types';
import { storageService } from '../../services/storageService';
import { UserCheck, Pause, Play, Trash2, CheckCircle2, XCircle, Mail, Clock, MessageSquare, Plus } from 'lucide-react';

interface AlumniDashboardPageProps {
  requests: ConnectionRequest[];
  onRefresh: () => void;
  onOpenRegister: () => void;
}

export const AlumniDashboardPage: React.FC<AlumniDashboardPageProps> = ({
  requests,
  onRefresh,
  onOpenRegister,
}) => {
  const registeredProfiles = storageService.getSelfRegisteredAlumni();
  const profile = registeredProfiles[0] || null;

  const [isPaused, setIsPaused] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleDeleteProfile = () => {
    if (profile) {
      storageService.deleteSelfRegisteredProfile(profile.id);
      setDeleteConfirm(false);
      onRefresh();
    }
  };

  const handleRespond = (requestId: string, status: 'accepted' | 'declined') => {
    storageService.respondConnectionRequest(requestId, status);
    onRefresh();
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Alumni Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your mentorship profile, pause discovery, and respond to student inquiries.
          </p>
        </div>

        {!profile && (
          <NeuButton size="sm" variant="primary" onClick={onOpenRegister}>
            <Plus size={14} />
            <span>Register Profile</span>
          </NeuButton>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Controls */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <NeuCard className="p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Your Public Listing
            </h3>

            {profile ? (
              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-xl neu-inset">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {profile.name}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {profile.current_role} {profile.company ? `at ${profile.company}` : ''}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {profile.college} · {profile.branch} ({profile.passout_year})
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl neu-inset text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    Status: {isPaused ? 'Discovery Paused' : 'Active & Discoverable'}
                  </span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isPaused ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>

                {/* Pause / Resume button */}
                <NeuButton
                  size="sm"
                  variant="subtle"
                  onClick={handleTogglePause}
                  className="w-full text-xs"
                >
                  {isPaused ? <Play size={13} /> : <Pause size={13} />}
                  <span>{isPaused ? 'Resume Mentorship' : 'Pause Discovery'}</span>
                </NeuButton>

                {/* Delete profile option */}
                {!deleteConfirm ? (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="text-[11px] text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors mt-2 text-center"
                  >
                    Delete my profile and erase all data
                  </button>
                ) : (
                  <div className="p-3 rounded-xl neu-inset flex flex-col gap-2 mt-2">
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium leading-tight">
                      Permanently erase your alumni account and data?
                    </p>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="text-xs text-slate-500 px-2 py-1"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteProfile}
                        className="text-xs text-rose-600 font-bold px-2 py-1 neu-btn rounded-md"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                You haven't registered an alumni profile yet. Click "Register Profile" above to get started.
              </div>
            )}
          </NeuCard>

          {/* Privacy Notice Card */}
          <NeuCard className="p-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Privacy Guarantee
            </span>
            Your email is never visible in public search results. When a student requests a connection, your email is revealed <strong>only</strong> if you click "Accept".
          </NeuCard>
        </div>

        {/* Right Column: Connection Requests */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Mentorship & Connection Inquiries
            </h3>
            <span className="text-xs text-slate-500">
              {requests.length} total
            </span>
          </div>

          {requests.length === 0 ? (
            <NeuCard className="p-8 text-center flex flex-col items-center justify-center">
              <MessageSquare size={24} className="text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No connection requests yet
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                When students reach out through Kaye, their respectful messages will appear here for you to review and accept.
              </p>
            </NeuCard>
          ) : (
            <div className="flex flex-col gap-4">
              {requests.map((r) => (
                <NeuCard key={r.id} className="p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        Inquiry from Student
                      </span>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        {r.from_user_name}
                      </h4>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={11} />
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Status indicator */}
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg neu-inset ${
                        r.status === 'accepted'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : r.status === 'declined'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {r.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Message body */}
                  <div className="p-3.5 rounded-xl neu-inset text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    "{r.message}"
                  </div>

                  {/* If accepted, show contact detail revealed */}
                  {r.status === 'accepted' && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <Mail size={13} />
                      <span>Contact email exchanged: <strong>student.fellow@campus.edu</strong></span>
                    </div>
                  )}

                  {/* Action buttons if pending */}
                  {r.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/5 dark:border-white/5">
                      <NeuButton
                        size="sm"
                        variant="subtle"
                        onClick={() => handleRespond(r.id, 'declined')}
                        className="text-xs"
                      >
                        <XCircle size={14} className="text-rose-500" />
                        <span>Decline</span>
                      </NeuButton>
                      <NeuButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleRespond(r.id, 'accepted')}
                        className="text-xs"
                      >
                        <CheckCircle2 size={14} />
                        <span>Accept & Share Email</span>
                      </NeuButton>
                    </div>
                  )}
                </NeuCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
