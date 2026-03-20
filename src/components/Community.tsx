import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MessageSquare, Users, Globe, UserPlus } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useCms } from '../contexts/CmsContext';

export default function Community() {
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
            Community Guidelines
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            {content.community_headline}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-cyan-500/30 transition-colors shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity"></div>
            <MessageSquare size={48} className="text-cyan-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Communication</h3>
            <p className="text-gray-400 leading-relaxed">
              {content.community_communication}
            </p>
          </div>

          <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-purple-500/30 transition-colors shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity"></div>
            <Users size={48} className="text-purple-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Collaboration</h3>
            <p className="text-gray-400 leading-relaxed">
              {content.community_collaboration}
            </p>
          </div>

          <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-green-500/30 transition-colors shadow-2xl relative overflow-hidden group md:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-cyan-500/5 blur-[50px] z-0 pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <Globe size={64} className="text-green-400 shrink-0" />
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-2xl font-bold text-white">Join the Global Conversation</h3>
                <p className="text-gray-400 leading-relaxed max-w-2xl">
                  {content.community_global}
                </p>
                <div className="pt-4">
                  <a href="/explore" className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all hover:scale-105">
                    Explore the Network <UserPlus size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
