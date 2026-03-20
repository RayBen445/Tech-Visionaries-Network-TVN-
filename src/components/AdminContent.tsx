import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useCms, SiteContent } from '../contexts/CmsContext';
import { Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminContent() {
  const { content, refreshCms } = useCms();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Local state to track form changes
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize form with current context
    setFormData({ ...content });
  }, [content]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Create updates array
      const updates = Object.keys(formData).map(key => ({
        key,
        value: formData[key],
        updated_at: new Date().toISOString()
      }));

      // Upsert into supabase
      const { error } = await supabase
        .from('site_content')
        .upsert(updates, { onConflict: 'key' });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Content updated successfully!' });

      // Refresh CMS context so the rest of the app updates
      await refreshCms();

    } catch (err: any) {
      console.error('Error saving content:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save content.' });
    } finally {
      setSaving(false);
    }
  };

    const fieldGroups = [
    {
      title: "Landing Page (Home)",
      fields: [
        { key: 'hero_headline', label: 'Hero Headline', type: 'text' },
        { key: 'hero_subheadline', label: 'Hero Subheadline', type: 'textarea' },
        { key: 'about_text', label: 'About Text', type: 'textarea' },
        { key: 'cta_title', label: 'CTA Title', type: 'text' },
        { key: 'cta_subtitle', label: 'CTA Subtitle', type: 'textarea' }
      ]
    },
    {
      title: "About Page",
      fields: [
        { key: 'about_page_headline', label: 'About Page Headline', type: 'textarea' },
        { key: 'about_mission', label: 'Our Mission', type: 'textarea' },
        { key: 'about_who_we_are', label: 'Who We Are', type: 'textarea' }
      ]
    },
    {
      title: "Projects Page",
      fields: [
        { key: 'projects_headline', label: 'Projects Headline', type: 'textarea' },
        { key: 'projects_coming_soon', label: 'Coming Soon Text', type: 'textarea' }
      ]
    },
    {
      title: "Community Page",
      fields: [
        { key: 'community_headline', label: 'Community Headline', type: 'textarea' },
        { key: 'community_communication', label: 'Communication Text', type: 'textarea' },
        { key: 'community_collaboration', label: 'Collaboration Text', type: 'textarea' },
        { key: 'community_global', label: 'Global Mission Text', type: 'textarea' }
      ]
    },
    {
      title: "Legal Pages (Supports HTML)",
      fields: [
        { key: 'legal_privacy_policy', label: 'Privacy Policy', type: 'textarea' },
        { key: 'legal_terms_of_service', label: 'Terms of Service', type: 'textarea' },
        { key: 'legal_code_of_conduct', label: 'Code of Conduct', type: 'textarea' }
      ]
    }
  ];

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin text-cyan-400 mx-auto" /></div>;

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Page Content</h1>
        <p className="text-gray-400 mt-2">Update the text shown on the landing page.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {fieldGroups.map(group => (
          <div key={group.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold border-b border-white/10 pb-4 text-cyan-400">{group.title}</h2>
            {group.fields.map(field => (
              <div key={field.key} className="space-y-2">
                <label className="text-sm font-medium text-gray-300">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    rows={field.key.startsWith('legal_') ? 8 : 4}
                    className="w-full bg-[#0B0F19]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 resize-y font-mono text-sm"
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full bg-[#0B0F19]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(34,211,255,0.2)] transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Content'}
        </button>
      </div>
    </div>
  );
}
