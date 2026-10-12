import React, { useState } from 'react';
import { NeuCard } from '../ui/NeuCard';
import { NeuButton } from '../ui/NeuButton';
import { AlumniProfile, Bookmark } from '../../types';
import { storageService } from '../../services/storageService';
import { Bookmark as BookmarkIcon, Download, Trash2, Edit3, Check, ExternalLink, Building2, MapPin } from 'lucide-react';

interface SavedPageProps {
  bookmarks: Bookmark[];
  onRefresh: () => void;
  onConnect: (alumni: AlumniProfile) => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({
  bookmarks,
  onRefresh,
  onConnect,
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const handleStartEdit = (b: Bookmark) => {
    setEditingNoteId(b.alumni_profile_id);
    setNoteText(b.note || '');
  };

  const handleSaveNote = (alumniId: string) => {
    storageService.updateBookmarkNote(alumniId, noteText.trim());
    setEditingNoteId(null);
    onRefresh();
  };

  const handleRemove = (alumniId: string) => {
    storageService.removeBookmark(alumniId);
    onRefresh();
  };

  // Export saved to CSV strictly adhering to spec: name, role, company, profile URL only
  const handleExportCSV = () => {
    if (bookmarks.length === 0) return;

    const headers = ['Name', 'Current Role', 'Company', 'Profile URL', 'Personal Note'];
    const rows = bookmarks.map((b) => {
      const a = b.alumni;
      return [
        `"${(a?.name || '').replace(/"/g, '""')}"`,
        `"${(a?.current_role || '').replace(/"/g, '""')}"`,
        `"${(a?.company || '').replace(/"/g, '""')}"`,
        `"${(a?.linkedin_url || '').replace(/"/g, '""')}"`,
        `"${(b.note || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kaye_saved_alumni_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Saved Alumni
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {bookmarks.length} bookmarked {bookmarks.length === 1 ? 'profile' : 'profiles'} with private mentorship notes.
          </p>
        </div>

        {bookmarks.length > 0 && (
          <NeuButton size="sm" variant="subtle" onClick={handleExportCSV}>
            <Download size={14} />
            <span>Export to CSV</span>
          </NeuButton>
        )}
      </div>

      {/* Empty State */}
      {bookmarks.length === 0 ? (
        <NeuCard className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl neu-inset flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
            <BookmarkIcon size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            No saved alumni yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1 mb-6">
            When browsing search results, click "Save" to bookmark alumni you would like to follow up with or ask for referral advice.
          </p>
        </NeuCard>
      ) : (
        /* Grid of Bookmarked Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookmarks.map((b) => {
            const a = b.alumni;
            if (!a) return null;
            const initials = a.name
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0].toUpperCase())
              .join('');

            const isEditing = editingNoteId === a.id;

            return (
              <NeuCard key={a.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center font-bold text-sm text-indigo-600 dark:text-indigo-400">
                      {initials}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={a.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg neu-btn text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        title="View Public Profile"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        onClick={() => handleRemove(a.id)}
                        className="p-1.5 rounded-lg neu-btn text-rose-500 hover:text-rose-600"
                        title="Remove Bookmark"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {a.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {a.headline}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex flex-col gap-1 text-xs text-slate-500">
                    {a.company && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 size={12} className="text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                          {a.current_role} at {a.company}
                        </span>
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400">
                      {a.college} · Class of {a.passout_year} · {a.branch}
                    </div>
                  </div>

                  {/* Private Note Field */}
                  <div className="mt-4 p-3 rounded-xl neu-inset">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Personal Note
                      </span>
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(b)}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Edit3 size={11} />
                          <span>{b.note ? 'Edit' : 'Add Note'}</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="e.g. Discussed SDE-2 referral; followup after final semester."
                          rows={2}
                          className="w-full text-xs p-2 rounded-lg bg-transparent border border-indigo-500/30 text-slate-800 dark:text-slate-100 outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="text-xs text-slate-400 px-2 py-1"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNote(a.id)}
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 px-2 py-1 neu-btn rounded-md flex items-center gap-1"
                          >
                            <Check size={12} />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic min-h-[1.5rem]">
                        {b.note || 'No notes added yet.'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                  <NeuButton
                    size="sm"
                    variant="primary"
                    className="w-full text-xs"
                    onClick={() => onConnect(a)}
                  >
                    <span>Connect Request</span>
                  </NeuButton>
                </div>
              </NeuCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
