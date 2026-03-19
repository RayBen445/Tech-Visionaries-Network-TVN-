import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Github, Code, Users } from 'lucide-react';
import PeopleDiscovery from './PeopleDiscovery';

const TvnHub: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="max-w-4xl w-full text-center space-y-16 py-12"
    >
      {/* SECTION 1 - HEADER */}
      <section className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-purple-200">
          Tech Visionaries Network (TVN)
        </h1>
        <p className="text-xl md:text-2xl text-cyan-400 font-medium">
          Africa’s Tech Builders Network
        </p>
      </section>

      {/* SECTION 2 - ABOUT */}
      <section className="max-w-2xl mx-auto">
        <p className="text-lg text-gray-400 leading-relaxed">
          A network of developers, innovators, and builders collaborating to build real-world technology.
        </p>
      </section>

      {/* SECTION 3 - ENTRY POINTS */}
      <section className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a
          href="https://chat.whatsapp.com/Kx56TOXN1NT4xqcThPmeAI?mode=gi_t"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white py-4 px-8 rounded-xl font-bold transition-all hover:scale-105 hover:shadow-cyan-500/25 shadow-lg"
        >
          <Users size={20} />
          Join Community
        </a>
        <a
          href="https://github.com/tvnetwork/tvn-core"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 px-8 rounded-xl font-medium transition-all hover:scale-105"
        >
          <Github size={20} />
          View GitHub
        </a>
      </section>

      {/* SECTION 4 - BUILDERS (Interactive) */}
      <section className="w-full">
        <PeopleDiscovery />
      </section>

      {/* SECTION 5 - PROJECTS */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto border-dashed">
        <p className="text-gray-400 italic">
          Projects coming soon. Be part of the first builds.
        </p>
      </section>
    </motion.div>
  );
};

export default TvnHub;
