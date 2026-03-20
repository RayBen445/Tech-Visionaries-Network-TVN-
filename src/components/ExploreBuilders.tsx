import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Search, Filter, User, MapPin, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  role: string;
  bio: string;
  skills: string[];
  location: string;
  created_at?: string;
}

export default function ExploreBuilders() {
  const { settings } = useSettings();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      // Fetch only valid users with usernames, limit initially to 50
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('username', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error && error.code !== '42P01') throw error;

      if (data) {
        const fetchedProfiles = data as UserProfile[];
        setProfiles(fetchedProfiles);

        // Extract unique roles for the filter dropdown
        const roles = Array.from(new Set(fetchedProfiles.map(p => p.role).filter(Boolean))) as string[];
        setAvailableRoles(roles.sort());
      }
    } catch (err) {
      console.error('Error fetching builders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic combined with search
  const filteredProfiles = profiles.filter(profile => {
    const matchesRole = selectedRole === '' || profile.role === selectedRole;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      (profile.full_name && profile.full_name.toLowerCase().includes(searchLower)) ||
      (profile.username && profile.username.toLowerCase().includes(searchLower)) ||
      (profile.skills && profile.skills.some(skill => skill.toLowerCase().includes(searchLower))) ||
      (profile.bio && profile.bio.toLowerCase().includes(searchLower));

    return matchesRole && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-12 px-4 md:px-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Navigation & Header */}
        <div className="space-y-6">
          <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm">
            <ArrowLeft size={16} /> Back to Home
          </a>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                Explore Builders
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl">
                Discover developers, designers, and innovators in the {settings.site_name} network.
              </p>
            </div>

            {/* Realtime Stats (Optional) */}
            {!loading && (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium text-cyan-400">
                <User size={16} />
                {filteredProfiles.length} Builders found
              </div>
            )}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row gap-4 items-center z-20 relative">

          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, username, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0F19]/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          <div className="relative w-full md:w-64 shrink-0 flex items-center gap-3">
            <Filter className="text-gray-400 shrink-0" size={20} />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-[#0B0F19]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer transition-colors"
            >
              <option value="">All Roles</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Builders Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#131B2F]/40 border border-white/5 rounded-3xl p-6 h-80 animate-pulse flex flex-col items-center">
                <div className="w-24 h-24 bg-white/10 rounded-full mb-6"></div>
                <div className="w-3/4 h-6 bg-white/10 rounded-lg mb-3"></div>
                <div className="w-1/2 h-4 bg-white/10 rounded-lg mb-6"></div>
                <div className="w-full h-16 bg-white/5 rounded-lg mt-auto"></div>
              </div>
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center text-gray-400 flex flex-col items-center justify-center min-h-[40vh]">
            <Search size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No builders found</h3>
            <p>Try adjusting your search query or filters.</p>
            {(searchQuery || selectedRole) && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedRole(''); }}
                className="mt-6 text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-4"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProfiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,255,0.15)] transition-all group flex flex-col items-center text-center h-full relative overflow-hidden"
                >
                  {/* Subtle Glow Background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                  <div className="w-24 h-24 rounded-full border-2 border-white/10 bg-[#0B0F19] flex items-center justify-center overflow-hidden mb-5 shrink-0 group-hover:border-cyan-500/50 transition-colors z-10 shadow-lg">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name || profile.username} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <User size={40} className="text-gray-500" />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 tracking-tight line-clamp-1 w-full z-10">
                    {profile.full_name || profile.username}
                  </h3>

                  <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-cyan-400 mb-4 w-full z-10">
                    {profile.role ? (
                      <><Briefcase size={14} /> <span className="line-clamp-1">{profile.role}</span></>
                    ) : (
                      <span className="text-gray-500">@{profile.username}</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-3 mb-6 flex-1 w-full z-10">
                    {profile.bio || "No bio provided."}
                  </p>

                  <div className="w-full space-y-4 mt-auto z-10">
                    {profile.skills && profile.skills.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {profile.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-gray-300 whitespace-nowrap">
                            {skill}
                          </span>
                        ))}
                        {profile.skills.length > 3 && (
                          <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-gray-400">
                            +{profile.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <a
                      href={`/u/${profile.username}`}
                      className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 text-white hover:text-cyan-400 py-3 rounded-xl font-bold transition-all group-hover:shadow-[0_0_15px_rgba(34,211,255,0.2)]"
                    >
                      View Profile <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
