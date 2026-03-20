import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useCms } from '../contexts/CmsContext';

// Reusable Legal Document Component to dry up the code
const LegalDoc = ({ title, date, htmlContent }: { title: string, date: string, htmlContent: string }) => {
  return (
    <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-600"></div>

      <div className="space-y-4 border-b border-white/10 pb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Last Updated: {date}</p>
      </div>

      <div
        className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-a:text-cyan-400 max-w-none prose-lg"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

export function PrivacyPolicy() {
  const { settings } = useSettings();
  const { content } = useCms();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-12 px-4 md:px-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm">
          <ArrowLeft size={16} /> Back to Home
        </a>

        <LegalDoc title="Privacy Policy" date="March 2026" htmlContent={content.legal_privacy_policy} />
      </div>
    </div>
  );
}

export function TermsOfService() {
  const { settings } = useSettings();
  const { content } = useCms();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-12 px-4 md:px-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm">
          <ArrowLeft size={16} /> Back to Home
        </a>

        <LegalDoc title="Terms of Service" date="March 2026" htmlContent={content.legal_terms_of_service} />
      </div>
    </div>
  );
}

export function CodeOfConduct() {
  const { settings } = useSettings();
  const { content } = useCms();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-12 px-4 md:px-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm">
          <ArrowLeft size={16} /> Back to Home
        </a>

        <LegalDoc title="Code of Conduct" date="March 2026" htmlContent={content.legal_code_of_conduct} />
      </div>
    </div>
  );
}
