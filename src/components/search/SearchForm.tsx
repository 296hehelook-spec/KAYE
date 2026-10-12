import React, { useState, useRef, useEffect } from 'react';
import { NeuCard } from '../ui/NeuCard';
import { NeuButton } from '../ui/NeuButton';
import { NeuInput } from '../ui/NeuInput';
import { NeuSelect } from '../ui/NeuSelect';
import { COLLEGES, BRANCH_OPTIONS } from '../../data/colleges';
import { SearchFilters } from '../../types';
import { Search, SlidersHorizontal, ChevronDown, ChevronUp, Building2, MapPin, Briefcase, GraduationCap } from 'lucide-react';

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
  initialFilters?: SearchFilters;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  isLoading,
  initialFilters,
}) => {
  // Form State
  const [collegeInput, setCollegeInput] = useState(initialFilters?.college || 'Indian Institute of Technology Jodhpur');
  const [collegeSuggestions, setCollegeSuggestions] = useState<typeof COLLEGES>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [passoutYear, setPassoutYear] = useState<number>(initialFilters?.passout_year || 2020);
  const [branch, setBranch] = useState<string>(initialFilters?.branch || 'Computer Science');
  const [customBranch, setCustomBranch] = useState('');
  const [alumniCount, setAlumniCount] = useState<number>(initialFilters?.count || 10);
  
  // Collapsible Filters
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [company, setCompany] = useState(initialFilters?.company || '');
  const [city, setCity] = useState(initialFilters?.city || '');
  const [role, setRole] = useState(initialFilters?.role || '');

  // Errors
  const [errors, setErrors] = useState<{ college?: string; branch?: string }>({});

  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Generate Year Options: 2030 down to 1995
  const yearOptions = Array.from({ length: 2030 - 1995 + 1 }, (_, i) => 2030 - i).map((y) => ({
    value: y,
    label: `Class of ${y}`,
  }));

  // Handle college input change with suggestions
  const handleCollegeChange = (val: string) => {
    setCollegeInput(val);
    if (errors.college) setErrors((prev) => ({ ...prev, college: undefined }));

    if (val.trim().length > 1) {
      const q = val.toLowerCase();
      const matches = COLLEGES.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.short_name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      ).slice(0, 6);
      setCollegeSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setCollegeSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectCollege = (name: string) => {
    setCollegeInput(name);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { college?: string; branch?: string } = {};

    if (!collegeInput.trim()) {
      newErrors.college = 'Please enter or select a college name.';
    }

    const effectiveBranch = branch === 'Other' ? customBranch.trim() : branch;
    if (branch === 'Other' && !customBranch.trim()) {
      newErrors.branch = 'Please specify your branch/department.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSearch({
      college: collegeInput.trim(),
      passout_year: passoutYear,
      branch: effectiveBranch,
      count: alumniCount,
      company: company.trim() || undefined,
      city: city.trim() || undefined,
      role: role.trim() || undefined,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Find Alumni. Connect With Purpose.
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          Search verified public profiles of your college seniors for career guidance, mock interviews, and referral advice.
        </p>
      </div>

      {/* Tactile Neumorphic Search Card */}
      <NeuCard className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* College Combobox */}
          <div className="relative" ref={suggestionsRef}>
            <NeuInput
              label="College or University"
              value={collegeInput}
              onChange={(e) => handleCollegeChange(e.target.value)}
              onFocus={() => collegeInput.trim().length > 1 && setShowSuggestions(true)}
              placeholder="e.g. IIT Jodhpur, BITS Pilani, NIT Trichy"
              error={errors.college}
              icon={<GraduationCap size={18} />}
              autoComplete="off"
            />
            {showSuggestions && collegeSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl neu-flat p-2 flex flex-col gap-1 max-h-56 overflow-y-auto">
                {collegeSuggestions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCollege(c.name)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-500/10 text-xs sm:text-sm text-slate-800 dark:text-slate-100 flex items-center justify-between transition-colors"
                  >
                    <span className="font-medium truncate">{c.name}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-2 shrink-0">
                      {c.short_name} · {c.city}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Passout Year & Branch Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeuSelect
              label="Passout Year"
              value={passoutYear}
              onChange={(e) => setPassoutYear(Number(e.target.value))}
              options={yearOptions}
            />

            <NeuSelect
              label="Branch / Department"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              options={BRANCH_OPTIONS}
              error={errors.branch}
            />
          </div>

          {/* Custom Branch input when 'Other' selected */}
          {branch === 'Other' && (
            <NeuInput
              label="Specify Branch Name"
              value={customBranch}
              onChange={(e) => setCustomBranch(e.target.value)}
              placeholder="e.g. Industrial Design, Materials Engineering"
              error={errors.branch}
            />
          )}

          {/* Number of Alumni Segmented Control */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Number of Alumni Matches
            </label>
            <div className="p-1 rounded-xl neu-inset grid grid-cols-3 gap-1">
              {[10, 25, 50].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setAlumniCount(num)}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    alumniCount === num
                      ? 'neu-flat text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {num} Alumni
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible More Filters */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors outline-none"
            >
              <SlidersHorizontal size={14} />
              <span>{showMoreFilters ? 'Hide refine filters' : 'Refine by company, city, or job role'}</span>
              {showMoreFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showMoreFilters && (
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <NeuInput
                  label="Target Company"
                  placeholder="e.g. Google, Zepto"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  icon={<Building2 size={15} />}
                />
                <NeuInput
                  label="City / Location"
                  placeholder="e.g. Bengaluru, London"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  icon={<MapPin size={15} />}
                />
                <NeuInput
                  label="Job Role / Title"
                  placeholder="e.g. Product Manager, SDE"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  icon={<Briefcase size={15} />}
                />
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <NeuButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2"
            >
              <Search size={18} />
              <span>{isLoading ? 'Searching Public Web...' : 'Find Alumni'}</span>
            </NeuButton>
          </div>

          {/* Compliance Footer Note */}
          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
            Results come from publicly indexed web pages via Google Programmable Search. Not affiliated with LinkedIn.
          </p>
        </form>
      </NeuCard>
    </div>
  );
};
