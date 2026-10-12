import React, { useState } from 'react';
import { NeuCard } from '../ui/NeuCard';
import { NeuButton } from '../ui/NeuButton';
import { NeuInput } from '../ui/NeuInput';
import { storageService } from '../../services/storageService';
import { Star, MessageSquareHeart, CheckCircle2, Send, Sparkles, User, GraduationCap } from 'lucide-react';

interface FeedbackSectionProps {
  onFeedbackSubmitted?: () => void;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({ onFeedbackSubmitted }) => {
  const [name, setName] = useState('');
  const [collegeOrRole, setCollegeOrRole] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<'feature' | 'bug' | 'mentorship' | 'general'>('general');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name or nickname.');
      return;
    }
    if (!message.trim()) {
      setError('Please share your thoughts or feedback.');
      return;
    }

    storageService.addFeedback({
      name: name.trim(),
      college_or_role: collegeOrRole.trim() || undefined,
      rating,
      category,
      message: message.trim(),
    });

    setIsSubmitted(true);
    setError(null);
    if (onFeedbackSubmitted) onFeedbackSubmitted();
  };

  const resetForm = () => {
    setName('');
    setCollegeOrRole('');
    setRating(5);
    setCategory('general');
    setMessage('');
    setIsSubmitted(false);
  };

  return (
    <section className="w-full max-w-3xl mx-auto mt-14 mb-8 px-4" id="feedback-section">
      <NeuCard className="p-6 sm:p-8">
        {!isSubmitted ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <MessageSquareHeart size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Share Your Feedback
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Help us improve Kaye for all college students & seniors.
                  </p>
                </div>
              </div>

              {/* Developer attribution tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl neu-inset text-xs font-semibold text-indigo-600 dark:text-indigo-400 self-start sm:self-auto">
                <Sparkles size={13} />
                <span>Crafted by @nothing</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl neu-inset text-xs text-rose-600 dark:text-rose-400 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Rating selection (tactile stars) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Overall Experience
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        rating >= star
                          ? 'neu-flat text-amber-500 shadow-sm scale-105'
                          : 'neu-inset text-slate-300 dark:text-slate-600'
                      }`}
                      aria-label={`Rate ${star} star`}
                    >
                      <Star size={18} className={rating >= star ? 'fill-current' : ''} />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-2">
                    {rating === 5
                      ? '5/5 · Excellent!'
                      : rating === 4
                      ? '4/5 · Great'
                      : rating === 3
                      ? '3/5 · Good'
                      : '2/5 · Needs Improvement'}
                  </span>
                </div>
              </div>

              {/* Name & College/Role Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NeuInput
                  label="Your Name / Handle"
                  placeholder="e.g. Yash, Priyanshi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User size={15} />}
                  required
                />
                <NeuInput
                  label="College or Role (Optional)"
                  placeholder="e.g. Student @ IITJ / SDE @ CRED"
                  value={collegeOrRole}
                  onChange={(e) => setCollegeOrRole(e.target.value)}
                  icon={<GraduationCap size={15} />}
                />
              </div>

              {/* Feedback Category Tabs */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Topic / Category
                </label>
                <div className="p-1 rounded-xl neu-inset grid grid-cols-2 sm:grid-cols-4 gap-1">
                  {[
                    { id: 'general', label: 'General' },
                    { id: 'mentorship', label: 'Mentorship' },
                    { id: 'feature', label: 'Feature Idea' },
                    { id: 'bug', label: 'Bug Report' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                        category === cat.id
                          ? 'neu-flat text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Your Message
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your experience, feature ideas, or college request..."
                  className="w-full rounded-xl neu-inset p-3.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Feedback is shared directly with developer <strong className="text-slate-700 dark:text-slate-300">@nothing</strong>.
                </span>
                <NeuButton type="submit" variant="primary" size="md">
                  <Send size={15} />
                  <span>Send Feedback</span>
                </NeuButton>
              </div>
            </form>
          </div>
        ) : (
          /* Thank You Screen */
          <div className="text-center py-6 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Thank You for Your Feedback!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-md leading-relaxed">
              Your feedback has been recorded and delivered to <strong>@nothing</strong>. We appreciate you helping make Kaye better!
            </p>
            <div className="mt-5">
              <NeuButton size="sm" variant="subtle" onClick={resetForm}>
                Send Another Note
              </NeuButton>
            </div>
          </div>
        )}
      </NeuCard>
    </section>
  );
};
