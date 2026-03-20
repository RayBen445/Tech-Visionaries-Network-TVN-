import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Lightbulb, Zap } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useCms } from '../contexts/CmsContext';

export default function About() {
  const { settings } = useSettings();
  const { content } = useCms();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-12 px-4 md:px-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-6">
          <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm">
            <ArrowLeft size={16} /> Back to Home
          </a>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            About {settings.site_name}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            {content.about_page_headline}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <section className="space-y-4 relative z-10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Lightbulb className="text-cyan-400" /> Our Mission
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {content.about_mission}
            </p>
          </section>

          <section className="space-y-4 relative z-10 border-t border-white/10 pt-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="text-purple-400" /> Who We Are
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {settings.site_name} {content.about_who_we_are}
            </p>
          </section>

          <section className="space-y-4 relative z-10 border-t border-white/10 pt-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Zap className="text-amber-400" /> What We Do
            </h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Foster peer-to-peer collaboration on open-source and commercial projects.</li>
              <li>Provide a platform for builders to showcase their portfolios and skills.</li>
              <li>Host exclusive hackathons, technical workshops, and networking events.</li>
              <li>Connect top talent with early-stage opportunities and startups.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
