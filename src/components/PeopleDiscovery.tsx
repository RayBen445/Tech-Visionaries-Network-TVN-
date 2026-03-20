import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { User, Briefcase, MapPin, ExternalLink } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  role: string;
  description: string;
  avatarUrl: string;
  location: string;
  githubUrl?: string;
}

const SAMPLE_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Heritage Oladoye',
    role: 'Full Stack Developer',
    description: 'Building scalable web applications and decentralized systems.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Heritage',
    location: 'Lagos, Nigeria',
    githubUrl: 'https://github.com/heritageoladoye'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    role: 'UI/UX Designer',
    description: 'Crafting intuitive interfaces and motion-driven experiences.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    location: 'Nairobi, Kenya'
  },
  {
    id: '3',
    name: 'Kobe Mensah',
    role: 'Blockchain Engineer',
    description: 'Smart contract development and Web3 infrastructure.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kobe',
    location: 'Accra, Ghana'
  },
  {
    id: '4',
    name: 'Amara Diop',
    role: 'Data Scientist',
    description: 'Machine learning models for financial inclusion.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amara',
    location: 'Dakar, Senegal'
  },
  {
    id: '5',
    name: 'Tunde Afolabi',
    role: 'DevOps Engineer',
    description: 'Automating deployments and cloud infrastructure.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tunde',
    location: 'Abuja, Nigeria'
  }
];

// 1. Profile Card Component
interface ProfileCardProps {
  profile: Profile;
  index: number;
  totalCards: number;
  isExpanded: boolean;
  isFocused: boolean;
  focusedId: string | null;
  onFocus: (id: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  index,
  totalCards,
  isExpanded,
  isFocused,
  focusedId,
  onFocus
}) => {
  // Calculate stacked position (when not expanded)
  // Top card is index 0
  const isTopCard = index === 0 && !isExpanded;

  // Calculate position in circle when expanded
  const angle = (index / totalCards) * Math.PI * 2 - Math.PI / 2; // Start from top (-90deg)
  const radius = 180; // Distance from center

  const expandedX = Math.cos(angle) * radius;
  const expandedY = Math.sin(angle) * radius;

  // Determine variants based on state
  const getVariants = () => {
    // State 1: A card is focused, and it's NOT this one
    if (focusedId && !isFocused) {
      return {
        opacity: 0,
        scale: 0.8,
        x: expandedX * 1.5, // Push further out
        y: expandedY * 1.5,
        rotate: 0,
        zIndex: 0
      };
    }

    // State 2: This card is focused
    if (isFocused) {
      return {
        opacity: 1,
        scale: 1.1,
        x: 0,
        y: -20,
        rotate: 0,
        zIndex: 50,
        boxShadow: "0 20px 40px -10px rgba(34, 211, 255, 0.3)"
      };
    }

    // State 3: Expanded mode (circular layout)
    if (isExpanded) {
      return {
        opacity: 1,
        scale: 1,
        x: expandedX,
        y: expandedY,
        rotate: (angle * 180) / Math.PI + 90, // Orient towards center or straight up
        zIndex: 10
      };
    }

    // State 4: Stacked mode (initial)
    const yOffset = index * 15;
    const scaleOffset = 1 - (index * 0.05);
    const zIndex = totalCards - index;

    // Create a slight fan effect
    const rotateOffset = index === 0 ? 0 : (index % 2 === 0 ? index * 2 : -index * 2);

    return {
      opacity: 1 - (index * 0.15),
      scale: scaleOffset,
      y: yOffset,
      x: 0,
      rotate: rotateOffset,
      zIndex: zIndex,
      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)"
    };
  };

  return (
    <motion.div
      layout
      onClick={() => onFocus(profile.id)}
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={getVariants()}
      whileHover={
        (!isExpanded && !focusedId && index === 0)
          ? { y: -10, scale: 1.02 }
          : (isExpanded && !focusedId)
            ? { scale: 1.05, cursor: 'pointer' }
            : {}
      }
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 1,
        delay: !isExpanded && !focusedId ? index * 0.1 : 0 // Stagger only on initial load
      }}
      className={`absolute origin-center bg-[#131B2F] border border-white/10 rounded-2xl p-6 w-64 md:w-72 overflow-hidden shadow-xl
        ${isFocused ? 'cursor-default ring-1 ring-cyan-500/50' : 'cursor-pointer hover:border-white/20'}`}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Glow background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-[2px] shrink-0">
          <div className="w-full h-full rounded-full bg-[#0B0F19] overflow-hidden">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover bg-white/5"
              loading="lazy"
            />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1 w-full">
          <h3 className="text-lg font-bold text-white tracking-tight truncate">
            {profile.name}
          </h3>
          <p className="text-cyan-400 text-sm font-medium flex items-center justify-center gap-1.5 truncate">
            <Briefcase size={14} />
            {profile.role}
          </p>
        </div>

        {/* Detailed Info (Visible mainly when focused or expanded) */}
        <motion.div
          initial={false}
          animate={{
            opacity: isFocused ? 1 : (isExpanded ? 0.8 : 0),
            height: isFocused ? 'auto' : (isExpanded ? 'auto' : 0)
          }}
          className="text-sm text-gray-400 leading-relaxed overflow-hidden"
        >
          <p className="mt-2">{profile.description}</p>

          {isFocused && (
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={12} /> {profile.location}
              </span>
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={12} /> Profile
                </a>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// 2. Card Stack Component
interface CardStackProps {
  profiles: Profile[];
  isExpanded: boolean;
  focusedId: string | null;
  onFocus: (id: string) => void;
}

const CardStack: React.FC<CardStackProps> = ({ profiles, isExpanded, focusedId, onFocus }) => {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center perspective-[1000px]">
      {profiles.map((profile, index) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          index={index}
          totalCards={profiles.length}
          isExpanded={isExpanded}
          isFocused={focusedId === profile.id}
          focusedId={focusedId}
          onFocus={onFocus}
        />
      ))}
    </div>
  );
};

// 3. Main Container Component
const PeopleDiscovery: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [realProfiles, setRealProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .not('username', 'is', null)
          .limit(5);

        if (error && error.code !== '42P01') throw error;

        if (data && data.length > 0) {
          const mapped: Profile[] = data.map((p: any) => ({
            id: p.id,
            name: p.full_name || p.username,
            role: p.role || 'Member',
            description: p.bio || 'No bio provided.',
            avatarUrl: p.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + p.username,
            location: p.location || 'Unknown Location'
          }));
          setRealProfiles(mapped);
        } else {
          setRealProfiles(SAMPLE_PROFILES);
        }
      } catch (err) {
        console.warn('Could not fetch real profiles', err);
        setRealProfiles(SAMPLE_PROFILES);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);


  // Auto-expand after a short delay if user hasn't interacted
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isExpanded && !focusedId) {
        setIsExpanded(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isExpanded, focusedId]);

  const handleFocus = (id: string) => {
    if (focusedId === id) {
      // Unfocus if clicking the already focused card
      setFocusedId(null);
      setIsExpanded(true); // Return to expanded view
    } else {
      setFocusedId(id);
      setIsExpanded(true); // Ensure we're considered "expanded" structurally
    }
  };

  const handleContainerClick = () => {
    // If clicking outside cards, return to expanded view or stacked view
    if (focusedId) {
      setFocusedId(null);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center mb-8 space-y-4 max-w-2xl mx-auto z-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Meet the Builders
        </h2>
        <p className="text-gray-400 text-lg">
          Discover developers, designers, and innovators building the future of Africa.
        </p>
      </div>

      {/* Interactive Area */}
      <div
        className="w-full max-w-4xl mx-auto cursor-pointer"
        onClick={handleContainerClick}
      >
        <CardStack
          profiles={realProfiles.length > 0 ? realProfiles : SAMPLE_PROFILES}
          isExpanded={isExpanded}
          focusedId={focusedId}
          onFocus={handleFocus}
        />
      </div>

      {/* Final State UI / CTA */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center space-y-6 flex flex-col items-center z-10"
          >
            <p className="text-xl font-medium text-cyan-400/80">
              Start finding the people you need
            </p>
            <a href="/explore" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(34,211,255,0.2)] hover:shadow-[0_0_30px_rgba(34,211,255,0.4)] transition-all hover:scale-105 group flex items-center gap-2">
              <User size={18} className="group-hover:-translate-y-0.5 transition-transform" />
              Explore All Builders
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PeopleDiscovery;
