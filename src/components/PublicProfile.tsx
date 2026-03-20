import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Loader2, User, MapPin, Briefcase, Calendar, Code, ArrowLeft, UserPlus, Clock, Check, X } from 'lucide-react';
import { Connection } from './UserDashboard';

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

export default function PublicProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Extract username from /u/:username
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const username = window.location.pathname.split('/').pop();
    if (username) {
      fetchProfile(username);
    } else {
      setError('Invalid profile URL');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session && profile) {
      fetchConnectionStatus();
    }
  }, [session, profile]);


  const fetchConnectionStatus = async () => {
    if (!session || !profile) return;
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`and(requester_id.eq.${session.user.id},receiver_id.eq.${profile.id}),and(requester_id.eq.${profile.id},receiver_id.eq.${session.user.id})`)
        .maybeSingle();

      if (error && error.code !== 'PGRST116' && error.code !== '42P01') throw error;
      if (data) setConnection(data as Connection);
    } catch (err) {
      console.error('Error fetching connection:', err);
    }
  };

  const handleConnect = async () => {
    if (!session || !profile) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('connections')
        .insert([{ requester_id: session.user.id, receiver_id: profile.id, status: 'pending' }]);
      if (error) throw error;
      await fetchConnectionStatus();
    } catch (err) {
      console.error('Error sending request:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (status: 'accepted' | 'rejected') => {
    if (!connection) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status })
        .eq('id', connection.id);
      if (error) throw error;
      await fetchConnectionStatus();
    } catch (err) {
      console.error('Error updating request:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchProfile = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data as UserProfile);
    } catch (err: any) {
      console.error('Error fetching public profile:', err);
      setError('Profile not found or is private.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" size={48} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <User size={64} className="mx-auto text-gray-600" />
          <h1 className="text-2xl font-bold">User Not Found</h1>
          <p className="text-gray-400">{error || "This profile doesn't exist."}</p>
          <div className="pt-4">
            <a href="/" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              <ArrowLeft size={16} /> Return Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-12 px-4 md:px-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Navigation */}
        <div className="mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm">
            <ArrowLeft size={16} /> Home
          </a>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
        >
          {/* Header Banner */}
          <div className="h-32 md:h-48 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 w-full relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          </div>

          <div className="px-6 md:px-10 pb-10 relative">
            {/* Avatar */}
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20 mb-6">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#131B2F] bg-[#0B0F19] flex items-center justify-center overflow-hidden shrink-0 relative z-10 shadow-xl">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-gray-500" />
                )}
              </div>
              <div className="flex-1 pb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-cyan-400 font-medium text-lg flex items-center gap-2 mt-1">
                  @{profile.username}
                </p>
              </div>
                {/* Connection Action */}
                {session && session.user.id !== profile.id && (
                  <div className="mt-2 md:mt-0 md:ml-auto">
                    {connection?.status === 'accepted' ? (
                      <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-2 rounded-xl font-medium flex items-center gap-2">
                        <Check size={18} /> Connected
                      </div>
                    ) : connection?.status === 'pending' ? (
                      connection.requester_id === session.user.id ? (
                        <div className="bg-white/5 border border-white/10 text-gray-400 px-4 py-2 rounded-xl font-medium flex items-center gap-2">
                          <Clock size={18} /> Pending
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => handleAction('rejected')} disabled={actionLoading} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl transition-colors font-medium flex items-center justify-center disabled:opacity-50">
                            Reject
                          </button>
                          <button onClick={() => handleAction('accepted')} disabled={actionLoading} className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-xl transition-colors font-medium flex items-center justify-center disabled:opacity-50">
                            Accept
                          </button>
                        </div>
                      )
                    ) : (
                      <button onClick={handleConnect} disabled={actionLoading} className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-6 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:hover:scale-100">
                        {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />} Connect
                      </button>
                    )}
                  </div>
                )}

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              {/* Left Column (Meta info) */}
              <div className="space-y-6 md:col-span-1">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-4">
                  {profile.role && (
                    <div className="flex items-start gap-3 text-gray-300">
                      <Briefcase size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Role</div>
                        <div className="font-medium">{profile.role}</div>
                      </div>
                    </div>
                  )}

                  {profile.location && (
                    <div className="flex items-start gap-3 text-gray-300">
                      <MapPin size={18} className="text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Location</div>
                        <div className="font-medium">{profile.location}</div>
                      </div>
                    </div>
                  )}

                  {profile.created_at && (
                    <div className="flex items-start gap-3 text-gray-300">
                      <Calendar size={18} className="text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Joined</div>
                        <div className="font-medium">{new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (Bio & Skills) */}
              <div className="space-y-8 md:col-span-2">

                {/* About / Bio */}
                {profile.bio && (
                  <div>
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4">About</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                      <Code size={18} className="text-cyan-400" /> Technical Skills
                    </h3>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-lg text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!profile.bio && (!profile.skills || profile.skills.length === 0) && (
                  <div className="text-center p-8 bg-white/5 border border-white/5 rounded-2xl">
                    <p className="text-gray-500 italic">This user hasn't added a bio or skills yet.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}
