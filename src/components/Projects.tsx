import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Code, Database, Cloud } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useCms } from '../contexts/CmsContext';

export default function Projects() {
  const { settings } = useSettings();
  const { content } = useCms();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-12 px-4 md:px-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-6">
          <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm">
            <ArrowLeft size={16} /> Back to Home
          </a>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            Network Projects
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            {content.projects_headline}
          </p>
        </div>

        {/* Empty State / Coming Soon */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center text-gray-400 flex flex-col items-center justify-center min-h-[40vh] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent blur-[100px] z-0 pointer-events-none"></div>

          <Code size={64} className="text-gray-600 mb-6 relative z-10" />
          <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Projects Coming Soon</h2>
          <p className="max-w-md mx-auto text-gray-400 relative z-10 leading-relaxed">
            {content.projects_coming_soon}
          </p>
        </div>

        {/* Future Layout Concept (Hidden/Placeholder) */}
        <div className="opacity-30 pointer-events-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12">
          <div className="bg-[#131B2F]/80 border border-white/5 rounded-2xl p-6 space-y-4">
            <Database className="text-purple-400" size={32} />
            <h3 className="text-xl font-bold text-white">Project Alpha</h3>
            <p className="text-sm text-gray-400">A decentralized data sharing platform built on web3 technologies.</p>
          </div>
          <div className="bg-[#131B2F]/80 border border-white/5 rounded-2xl p-6 space-y-4">
            <Cloud className="text-cyan-400" size={32} />
            <h3 className="text-xl font-bold text-white">CloudScale</h3>
            <p className="text-sm text-gray-400">An open-source serverless deployment pipeline utility.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
