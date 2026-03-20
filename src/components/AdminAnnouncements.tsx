import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useCms } from '../contexts/CmsContext';
import { Save, Loader2, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

export default function AdminAnnouncements() {
  const { announcement, refreshCms } = useCms();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    message: '',
    type: 'info',
    is_active: false
  });

  useEffect(() => {
    if (announcement) {
      setFormData({
        id: announcement.id || '',
        message: announcement.message,
        type: announcement.type,
        is_active: announcement.is_active
      });
    } else {
      setFormData({
        id: '',
        message: '',
        type: 'info',
        is_active: false
      });
    }
  }, [announcement]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // If we are enabling an announcement, first we might want to disable others if we only support one
      // But we just query the latest true anyway, so it's fine.

      const payload = {
        message: formData.message,
        type: formData.type.toLowerCase(),
        is_active: formData.is_active,
        created_at: new Date().toISOString()
      };

      let query;
      if (formData.id) {
        query = supabase.from('announcements').update(payload).eq('id', formData.id);
      } else {
        query = supabase.from('announcements').insert([payload]);
      }

      const { error } = await query;

      if (error) throw error;

      setMessage({ type: 'success', text: 'Announcement updated successfully!' });
      await refreshCms();

    } catch (err: any) {
      console.error('Error saving announcement:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save announcement.' });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setFormData({ id: '', message: '', type: 'info', is_active: false });
  };

  return (
    <div className="p-8 md:p-12 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Announcements</h1>
        <p className="text-gray-400 mt-2">Manage the global banner displayed at the top of the site.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold">Current Banner</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Status</span>
            <button
              onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? 'bg-cyan-500' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Message</label>
            <input
              type="text"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="e.g. Join us for our next Hackathon on Oct 12th!"
              className="w-full bg-[#0B0F19]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="space-y-2 relative">
             <label className="text-sm font-medium text-gray-300">Type</label>
             <select
               value={formData.type}
               onChange={(e) => setFormData({...formData, type: e.target.value})}
               className="w-full bg-[#0B0F19]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
             >
               <option value="info">Info (Cyan)</option>
               <option value="success">Success (Green)</option>
               <option value="warning">Warning (Amber)</option>
             </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={handleClear}
          className="text-gray-400 hover:text-white px-4 py-2 transition-colors flex gap-2 items-center"
        >
          <Trash2 size={16} /> Clear Form
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !formData.message}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(34,211,255,0.2)] transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Announcement'}
        </button>
      </div>
    </div>
  );
}
