import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { optimizeImage } from '../lib/imageUtils';
import { motion } from 'motion/react';
import { Save, Loader2, Upload, User, AlertCircle, CheckCircle, LogOut, ArrowLeft, Users, Clock, Send, Check, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
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

export default function UserDashboard() {
  const { settings } = useSettings();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'network'>('profile');
  const [networkTab, setNetworkTab] = useState<'accepted' | 'received' | 'sent'>('accepted');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [networkLoading, setNetworkLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && activeTab === 'network') {
      fetchConnections();
    }
  }, [activeTab, session]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data as UserProfile);
        setFormData(data as UserProfile);
        setAvatarPreview(data.avatar_url || '');
      } else {
        const defaultProfile = { id: userId, full_name: '', username: '', role: '', bio: '', skills: [], location: '', avatar_url: '' };
        setFormData(defaultProfile);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    if (!session) return;
    setNetworkLoading(true);
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`);

      if (error && error.code !== '42P01') throw error;

      if (data) {
        const connectionsWithProfiles = await Promise.all(data.map(async (conn: any) => {
          const otherUserId = conn.requester_id === session.user.id ? conn.receiver_id : conn.requester_id;
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherUserId)
            .single();

          return { ...conn, profile: profileData };
        }));

        setConnections(connectionsWithProfiles as Connection[]);
      }
    } catch (err) {
      console.error('Error fetching connections:', err);
    } finally {
      setNetworkLoading(false);
    }
  };

  const handleConnectionAction = async (connectionId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status })
        .eq('id', connectionId);

      if (error) throw error;

      setConnections(prev => prev.map(c => c.id === connectionId ? { ...c, status } : c));
      setMessage({ type: 'success', text: `Request ${status} successfully.` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Error updating connection:', err);
      setMessage({ type: 'error', text: 'Failed to update connection status.' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimized = await optimizeImage(file, 400);
      setAvatarFile(optimized);
      setAvatarPreview(URL.createObjectURL(optimized));
    } catch (err) {
      console.error('Error optimizing image:', err);
      setMessage({ type: 'error', text: 'Failed to process image.' });
    }
  };

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    const filename = `${userId}-${Date.now()}.png`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filename, file, { upsert: true, cacheControl: '3600' });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: publicData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filename);

    return publicData.publicUrl;
  };

  const handleSave = async () => {
    if (!session) return;

    setSaving(true);
    setMessage(null);

    try {
      let finalAvatarUrl = avatarPreview;

      if (avatarFile) {
        finalAvatarUrl = (await uploadAvatar(avatarFile, session.user.id)) || '';
      }

      const payload = {
        full_name: formData.full_name,
        username: formData.username,
        role: formData.role,
        bio: formData.bio,
        skills: typeof formData.skills === 'string'
          ? (formData.skills as string).split(',').map(s => s.trim()).filter(Boolean)
          : formData.skills,
        location: formData.location,
        avatar_url: finalAvatarUrl,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: session.user.id, ...payload });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      if (avatarFile) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(null);

      await fetchProfile(session.user.id);

    } catch (err: any) {
      console.error('Error saving profile:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!loading && !session) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent blur-[100px] z-0"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10 text-center"
        >
          <User size={48} className="text-cyan-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Member Dashboard</h1>
          <p className="text-gray-400 mb-6">Please sign in via the magic link sent to your email during registration to access your profile.</p>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transition-transform"
          >
            <ArrowLeft size={18} /> Back to Home
          </a>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-12 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-4 text-sm font-medium">
              <ArrowLeft size={16} /> Back to {settings.site_name}
            </a>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              Your Dashboard
            </h1>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'profile' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab('network')}
                className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'network' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                My Network
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            {profile?.username && (
              <a
                href={`/u/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl transition-colors font-medium flex items-center justify-center"
              >
                View Public Profile
              </a>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        {activeTab === 'network' && (
          <div className="space-y-6 w-full">
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit overflow-x-auto max-w-full">
              <button
                onClick={() => setNetworkTab('accepted')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${networkTab === 'accepted' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
              >
                <Users size={16} /> Connections
              </button>
              <button
                onClick={() => setNetworkTab('received')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${networkTab === 'received' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
              >
                <Clock size={16} /> Pending Requests
                {connections.filter(c => c.status === 'pending' && c.receiver_id === session?.user?.id).length > 0 && (
                  <span className="bg-cyan-500 text-[#0B0F19] text-xs px-1.5 py-0.5 rounded-full">
                    {connections.filter(c => c.status === 'pending' && c.receiver_id === session?.user?.id).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setNetworkTab('sent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${networkTab === 'sent' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
              >
                <Send size={16} /> Sent Requests
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
              {networkLoading ? (
                <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>
              ) : (
                <div className="space-y-4">
                  {networkTab === 'accepted' && (
                    <div>
                      {connections.filter(c => c.status === 'accepted').length === 0 ? (
                        <div className="text-center py-12 text-gray-500">You don't have any connections yet.</div>
                      ) : (
                        connections.filter(c => c.status === 'accepted').map(conn => (
                          <div key={conn.id} className="flex items-center justify-between p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden shrink-0">
                                {conn.profile?.avatar_url ? <img src={conn.profile.avatar_url} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-gray-500" />}
                              </div>
                              <div>
                                <div className="font-bold text-white">{conn.profile?.full_name || conn.profile?.username}</div>
                                <div className="text-sm text-gray-400">@{conn.profile?.username} • {conn.profile?.role}</div>
                              </div>
                            </div>
                            <a href={`/u/${conn.profile?.username}`} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors hidden sm:block">
                              View Profile
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {networkTab === 'received' && (
                    <div>
                      {connections.filter(c => c.status === 'pending' && c.receiver_id === session?.user?.id).length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No pending requests received.</div>
                      ) : (
                        connections.filter(c => c.status === 'pending' && c.receiver_id === session?.user?.id).map(conn => (
                          <div key={conn.id} className="flex items-center justify-between p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden shrink-0">
                                {conn.profile?.avatar_url ? <img src={conn.profile.avatar_url} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-gray-500" />}
                              </div>
                              <div>
                                <div className="font-bold text-white">{conn.profile?.full_name || conn.profile?.username}</div>
                                <div className="text-sm text-gray-400">Wants to connect</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleConnectionAction(conn.id, 'rejected')} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                <X size={20} />
                              </button>
                              <button onClick={() => handleConnectionAction(conn.id, 'accepted')} className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors">
                                <Check size={20} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {networkTab === 'sent' && (
                    <div>
                      {connections.filter(c => c.status === 'pending' && c.requester_id === session?.user?.id).length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No pending requests sent.</div>
                      ) : (
                        connections.filter(c => c.status === 'pending' && c.requester_id === session?.user?.id).map(conn => (
                          <div key={conn.id} className="flex items-center justify-between p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5 opacity-70 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden shrink-0">
                                {conn.profile?.avatar_url ? <img src={conn.profile.avatar_url} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-gray-500" />}
                              </div>
                              <div>
                                <div className="font-bold text-white">{conn.profile?.full_name || conn.profile?.username}</div>
                                <div className="text-sm text-gray-400">Request Sent</div>
                              </div>
                            </div>
                            <div className="px-3 py-1 bg-white/5 rounded text-xs text-gray-400 font-medium">
                              Pending
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center space-y-4">
                <h3 className="text-lg font-medium w-full text-left">Avatar</h3>
                <div className="w-40 h-40 bg-[#0B0F19] rounded-full border border-dashed border-gray-600 flex items-center justify-center overflow-hidden relative group">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-gray-500" />
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                    <Upload className="text-white mb-2" size={24} />
                    <span className="text-xs font-medium text-white">Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-xs text-gray-400 text-center">Click to upload a new profile picture. Recommended 400x400px.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-sm text-gray-400 leading-relaxed">
                  Your profile is public and allows other builders in the {settings.site_name} network to find and collaborate with you.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name || ''}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full bg-[#0B0F19]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Username (Unique)</label>
                    <input
                      type="text"
                      value={formData.username || ''}
                      onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                      className="w-full bg-[#0B0F19]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                    <p className="text-xs text-gray-500">Only lowercase letters, numbers, and underscores.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Role / Title</label>
                    <input
                      type="text"
                      value={formData.role || ''}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      placeholder="e.g. Full Stack Developer"
                      className="w-full bg-[#0B0F19]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Location</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g. Lagos, Nigeria"
                      className="w-full bg-[#0B0F19]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Bio</label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={4}
                    placeholder="Tell the community about yourself..."
                    className="w-full bg-[#0B0F19]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills || ''}
                    onChange={(e) => setFormData({...formData, skills: e.target.value as any})}
                    placeholder="e.g. React, Node.js, Python, UI/UX"
                    className="w-full bg-[#0B0F19]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="sticky bottom-4 w-full bg-[#131B2F]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex justify-end shadow-2xl z-50">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(34,211,255,0.2)] transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
