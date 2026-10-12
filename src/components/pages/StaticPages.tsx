import React from 'react';
import { NeuCard } from '../ui/NeuCard';
import { NeuButton } from '../ui/NeuButton';
import { ShieldCheck, Lock, HelpCircle, FileText, Mail, ArrowLeft } from 'lucide-react';

interface StaticPagesProps {
  page: 'privacy' | 'terms' | 'about' | 'contact' | 'faq';
  onBack: () => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ page, onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <NeuButton size="sm" variant="subtle" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Back to Search</span>
        </NeuButton>
      </div>

      {page === 'faq' && (
        <NeuCard className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <HelpCircle size={22} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h1>
          </div>

          <div className="flex flex-col gap-5 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-xl neu-inset">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                Why can't I get emails or phone numbers on Kaye?
              </h3>
              <p className="leading-relaxed text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Kaye strictly prohibits the scraping, guessing, or sharing of private contact credentials (such as emails or personal phone numbers). We comply fully with India's Digital Personal Data Protection (DPDP) Act 2023 and the GDPR. Contact details are private personal data. When networking with seniors, respectful outreach should occur via public platforms or through Kaye's mutual-consent Connect flow, where an alumnus chooses whether to share their email after reading your message.
              </p>
            </div>

            <div className="p-4 rounded-xl neu-inset">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                How does Kaye find alumni without scraping LinkedIn?
              </h3>
              <p className="leading-relaxed text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Kaye uses Google's official Programmable Search API to query public web indices for indexed snippets. We do not use headless browsers, automated bots, or logged-in LinkedIn sessions. Structured details are extracted only from the public title and snippet provided by search engines.
              </p>
            </div>

            <div className="p-4 rounded-xl neu-inset">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                How do I remove my profile if I don't want to be listed?
              </h3>
              <p className="leading-relaxed text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                You can visit our <strong>Opt-Out page</strong> anytime or click "Remove my profile" directly on any result card. Enter your LinkedIn URL and our system will immediately and permanently exclude your profile from all future results and cache entries.
              </p>
            </div>

            <div className="p-4 rounded-xl neu-inset">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                Why is there a limit of 5 connection requests per day?
              </h3>
              <p className="leading-relaxed text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Alumni are busy professionals generously giving their time. A daily limit encourages thoughtful, customized messages and prevents automated mass-outreach spam.
              </p>
            </div>
          </div>
        </NeuCard>
      )}

      {page === 'privacy' && (
        <NeuCard className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Lock size={22} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>

          <div className="flex flex-col gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              Kaye is committed to protecting user privacy and operating with the highest ethical standards in student networking. This Privacy Policy outlines our data minimization principles in accordance with India's DPDP Act 2023 and GDPR guidelines.
            </p>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2">
              1. Information Displayed
            </h3>
            <p>
              We display only publicly indexed professional information: Name, headline, role, company, city, and college affiliation. We do not store or collect personal telephone numbers, home addresses, or private emails.
            </p>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2">
              2. Consent-Based Outreach
            </h3>
            <p>
              Connection requests through our platform are delivered only to alumni who have chosen to self-register. Contact emails are never released publicly and are only shared between the parties after an alumnus explicitly accepts a connection request.
            </p>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2">
              3. Right to Erasure & Immediate Opt-Out
            </h3>
            <p>
              Any person may submit their profile URL on our Opt-Out page. Opt-outs are processed immediately without requiring account creation or verification fees.
            </p>
          </div>
        </NeuCard>
      )}

      {page === 'terms' && (
        <NeuCard className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <FileText size={22} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Terms of Use
            </h1>
          </div>

          <div className="flex flex-col gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              By accessing Kaye, you agree to these Terms of Use. Kaye is intended exclusively for educational guidance, career mentorship, and collegial networking.
            </p>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2">
              1. Anti-Spam & Respectful Conduct
            </h3>
            <p>
              Users agree not to use Kaye for commercial solicitation, mass recruitment scraping, harassment, or high-volume automated messaging. Violations result in immediate permanent blocking.
            </p>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2">
              2. Third-Party Disclaimer
            </h3>
            <p>
              Kaye is an independent educational tool. Kaye is NOT affiliated with, sponsored by, or endorsed by LinkedIn Corporation or any academic institution. LinkedIn and its logos are trademarks of LinkedIn Corporation.
            </p>
          </div>
        </NeuCard>
      )}

      {page === 'contact' && (
        <NeuCard className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Mail size={22} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Contact Us
            </h1>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex flex-col gap-4">
            <p>
              Have feedback, campus partnership ideas, or privacy inquiries? We'd love to hear from students, college placement cells, and alumni associations.
            </p>
            <div className="p-4 rounded-xl neu-inset flex flex-col gap-2">
              <div>
                <strong>Support & Inquiries:</strong> support@kaye-alumni.org
              </div>
              <div>
                <strong>Privacy & Opt-Out Desk:</strong> privacy@kaye-alumni.org
              </div>
              <div>
                <strong>Campus Outreach:</strong> campus@kaye-alumni.org
              </div>
            </div>
          </div>
        </NeuCard>
      )}
    </div>
  );
};
