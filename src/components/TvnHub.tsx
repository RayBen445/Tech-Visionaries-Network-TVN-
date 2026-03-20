import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Code, Network, Lightbulb, TrendingUp, Compass, UserPlus, PlayCircle, Zap, Shield, Mail, Twitter, Linkedin, Github } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useCms } from '../contexts/CmsContext';
import PeopleDiscovery from './PeopleDiscovery';

interface TvnHubProps {
  onJoinClick: () => void;
}

const TvnHub: React.FC<TvnHubProps> = ({ onJoinClick }) => {
  const { settings } = useSettings();
  const { content, features } = useCms();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full text-center py-12 px-4 md:px-8 space-y-32"
    >
      {/* 1. HERO SECTION */}
      <section className="space-y-8 max-w-4xl mx-auto pt-16">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium tracking-wider uppercase mb-4"
        >
          Tech Visionaries Network
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-purple-200">
          {content.hero_headline}
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {content.hero_subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <button
            onClick={onJoinClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white py-4 px-10 rounded-xl font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(34,211,255,0.2)] hover:shadow-[0_0_30px_rgba(34,211,255,0.4)]"
          >
            Join the Network <ArrowRight size={20} />
          </button>
          <a
            href="/explore"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 px-10 rounded-xl font-medium transition-all hover:scale-105"
          >
            Explore <Compass size={20} />
          </a>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section id="about" className="max-w-3xl mx-auto scroll-mt-32">
        <h2 className="text-3xl font-bold mb-6 text-white">What is TVN?</h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          {content.about_text}
        </p>
      </section>

      {features.show_value_props && (
      <>
      {/* 3. VALUE PROPOSITION (4 Cards) */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-white">Why Join Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ValueCard
            icon={<Code size={32} className="text-cyan-400" />}
            title="Projects & Collaboration"
            desc="Team up with other skilled builders to create real-world solutions and open-source projects."
          />
          <ValueCard
            icon={<Lightbulb size={32} className="text-purple-400" />}
            title="Learning & Growth"
            desc="Access curated resources, mentorship, and peer-to-peer knowledge sharing to level up faster."
          />
          <ValueCard
            icon={<Network size={32} className="text-blue-400" />}
            title="Network & Exposure"
            desc="Showcase your skills, expand your professional circle, and get noticed by industry leaders."
          />
          <ValueCard
            icon={<TrendingUp size={32} className="text-green-400" />}
            title="Opportunities"
            desc="Gain early access to job opportunities, hackathons, and exclusive community events."
          />
        </div>
      </section>

            </>
      )}

      {features.show_how_it_works && (
      <>
      {/* 4. HOW IT WORKS */}
      <section className="max-w-5xl mx-auto relative">
        <h2 className="text-3xl font-bold mb-16 text-white">How It Works</h2>

        {/* Connecting Line */}
        <div className="hidden md:block absolute top-[180px] left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent -z-10"></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <StepCard number="01" icon={<UserPlus />} title="Join" desc="Apply to join the early access list." />
          <StepCard number="02" icon={<Shield />} title="Get Access" desc="Receive your magic link & profile." />
          <StepCard number="03" icon={<Zap />} title="Start Building" desc="Connect with peers and start creating." />
          <StepCard number="04" icon={<TrendingUp />} title="Grow" desc="Elevate your career and skills." />
        </div>
      </section>

            </>
      )}

      {features.show_community && (
      <>
      {/* 5. COMMUNITY PREVIEW */}
      <section className="w-full">
        <PeopleDiscovery />
      </section>

            </>
      )}

      {/* 6. CTA SECTION */}
      <section className="max-w-4xl mx-auto bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-12 md:p-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-cyan-500/5 blur-[100px] z-0"></div>
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">{content.cta_title}</h2>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            {content.cta_subtitle}
          </p>
          <button
            onClick={onJoinClick}
            className="bg-white text-[#0B0F19] hover:bg-gray-200 py-4 px-10 rounded-xl font-bold transition-all hover:scale-105 shadow-xl text-lg flex items-center gap-2 mx-auto"
          >
            Join TVN Today <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="max-w-6xl mx-auto pt-20 pb-8 border-t border-white/10 mt-32 text-left grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            {settings.logo_url && <img src={settings.logo_url} alt="Logo" className="h-8 w-auto object-contain" />}
            {settings.site_name || 'TVN'}
          </div>
          <p className="text-gray-400 max-w-sm">
            Africa's Tech Builders Network. Empowering the next generation of digital innovators.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"><Twitter size={18} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"><Linkedin size={18} /></a>
            <a href="https://github.com/tvnetwork" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"><Github size={18} /></a>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-semibold">Platform</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="/about" className="hover:text-cyan-400 transition-colors">About</a></li>
            <li><a href="/projects" className="hover:text-cyan-400 transition-colors">Projects</a></li>
            {features.show_blog && (
              <li><a href="/blog" className="hover:text-cyan-400 transition-colors">Blog</a></li>
            )}
            <li><a href="/community" className="hover:text-cyan-400 transition-colors">Community</a></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-semibold">Legal</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
            <li><a href="/conduct" className="hover:text-cyan-400 transition-colors">Code of Conduct</a></li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-4 text-center mt-12 pt-8 border-t border-white/5 text-gray-500 text-sm font-mono tracking-widest uppercase">
          © {new Date().getFullYear()} {settings.site_name}
        </div>
      </footer>
    </motion.div>
  );
};

// Sub-components
const ValueCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 text-left group">
    <div className="w-14 h-14 bg-[#0B0F19] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

const StepCard = ({ number, icon, title, desc }: { number: string, icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex flex-col items-center text-center space-y-4 relative z-10">
    <div className="text-cyan-500/50 font-mono text-xl font-bold">{number}</div>
    <div className="w-16 h-16 bg-[#0B0F19] border-2 border-white/10 rounded-full flex items-center justify-center text-white shadow-xl">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-white">{title}</h3>
    <p className="text-sm text-gray-400">{desc}</p>
  </div>
);

export default TvnHub;
