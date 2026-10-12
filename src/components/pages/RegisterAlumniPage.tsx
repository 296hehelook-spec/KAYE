import React, { useState } from 'react';
import { NeuCard } from '../ui/NeuCard';
import { NeuButton } from '../ui/NeuButton';
import { NeuInput } from '../ui/NeuInput';
import { NeuSelect } from '../ui/NeuSelect';
import { COLLEGES, BRANCH_OPTIONS } from '../../data/colleges';
import { AlumniProfile } from '../../types';
import { storageService } from '../../services/storageService';
import { Check, ShieldCheck, UserCheck, Eye, EyeOff, Building2, MapPin, Linkedin } from 'lucide-react';

interface RegisterAlumniPageProps {
  onSuccess: (profile: AlumniProfile) => void;
  onCancel: () => void;
}

export const RegisterAlumniPage: React.FC<RegisterAlumniPageProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [college, setCollege] = useState('Indian Institute of Technology Jodhpur');
  const [passoutYear, setPassoutYear] = useState<number>(2020);
  const [branch, setBranch] = useState('Computer Science');
  const [currentRole, setCurrentRole] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [shortBio, setShortBio] = useState('');
  
  // Visibility toggles
  const [showCompany, setShowCompany] = useState(true);
  const [showRole, setShowRole] = useState(true);
  const [showLocation, setShowLocation] = useState(true);

  // Consent checkbox
  const [consentGiven, setConsentGiven] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const yearOptions = Array.from({ length: 2030 - 1995 + 1 }, (_, i) => 2030 - i).map((y) => ({
    value: y,
    label: `Class of ${y}`,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!linkedinUrl.trim() || !linkedinUrl.includes('linkedin.com/in/')) {
      setError('Please provide a valid LinkedIn personal profile URL (e.g. https://www.linkedin.com/in/yourname).');
      return;
    }
    if (!consentGiven) {
      setError('You must provide explicit consent to list your profile for student mentorship.');
      return;
    }

    const newProfile = storageService.saveSelfRegisteredProfile({
      name: name.trim(),
      headline: `${currentRole || 'Alumnus'} ${company ? `at ${company}` : ''} | ${college} ${passoutYear}`,
      current_role: currentRole.trim() || null,
      company: company.trim() || null,
      location: city.trim() || null,
      college,
      passout_year: passoutYear,
      branch,
      linkedin_url: linkedinUrl.trim(),
      short_bio: shortBio.trim() || undefined,
      visibility: {
        show_company: showCompany,
        show_role: showRole,
        show_location: showLocation,
      },
    });

    onSuccess(newProfile);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Alumni Self-Registration
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
          Help current students and juniors from your college navigate careers and interview prep on your own terms.
        </p>
      </div>

      <NeuCard className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 rounded-xl neu-inset text-xs text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          <NeuInput
            label="Full Name"
            placeholder="e.g. Pooja Kashyap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeuSelect
              label="College"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              options={COLLEGES.map((c) => ({ value: c.name, label: c.short_name }))}
            />

            <NeuSelect
              label="Passout Year"
              value={passoutYear}
              onChange={(e) => setPassoutYear(Number(e.target.value))}
              options={yearOptions}
            />
          </div>

          <NeuSelect
            label="Branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            options={BRANCH_OPTIONS}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeuInput
              label="Current Job Role"
              placeholder="e.g. Senior Software Engineer"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
            />

            <NeuInput
              label="Current Company / Organization"
              placeholder="e.g. Microsoft"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeuInput
              label="Current City / Region"
              placeholder="e.g. Bengaluru, India"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            <NeuInput
              label="Public LinkedIn Profile URL"
              placeholder="https://www.linkedin.com/in/username"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Short Bio / Mentorship Focus (Optional)
            </label>
            <textarea
              rows={3}
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              placeholder="What topics are you open to discussing? (e.g. MS applications, product management transition, system design)"
              className="w-full rounded-xl neu-inset p-3 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none resize-none"
            />
          </div>

          {/* Granular Field Visibility Controls */}
          <div className="p-4 rounded-xl neu-inset flex flex-col gap-2.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Privacy & Visibility Preferences
            </span>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCompany}
                  onChange={(e) => setShowCompany(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                <span>Show Company</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRole}
                  onChange={(e) => setShowRole(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                <span>Show Job Role</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLocation}
                  onChange={(e) => setShowLocation(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                <span>Show Location</span>
              </label>
            </div>
          </div>

          {/* Required Explicit Consent Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1 rounded accent-indigo-600 cursor-pointer"
              required
            />
            <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
              I consent to having my public alumni profile listed on Kaye for educational networking. I understand I can pause visibility or delete my account and data at any time from my dashboard.
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
            <NeuButton type="button" variant="subtle" onClick={onCancel}>
              Cancel
            </NeuButton>
            <NeuButton type="submit" variant="primary" disabled={!consentGiven}>
              <UserCheck size={16} />
              <span>Register as Alumni</span>
            </NeuButton>
          </div>
        </form>
      </NeuCard>
    </div>
  );
};
