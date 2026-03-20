import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { optimizeImage } from '../lib/imageUtils';
import { Save, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    site_name: '',
    primary_color: '',
    secondary_color: '',
  });

  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [faviconPreview, setFaviconPreview] = useState<string>('');
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        throw error;
      }

      if (data) {
        setFormData({
          id: data.id || '',
          site_name: data.site_name || '',
          primary_color: data.primary_color || '',
          secondary_color: data.secondary_color || '',
        });
        setLogoPreview(data.logo_url || '');
        setFaviconPreview(data.favicon_url || '');
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Optimize logo for dimensions, favicon usually needs smaller optimization or just keep as is
      const optimized = type === 'logo' ? await optimizeImage(file, 400) : await optimizeImage(file, 64);

      const objectUrl = URL.createObjectURL(optimized);

      if (type === 'logo') {
        setLogoFile(optimized);
        setLogoPreview(objectUrl);
      } else {
        setFaviconFile(optimized);
        setFaviconPreview(objectUrl);
      }
    } catch (err) {
      console.error('Error optimizing image:', err);
      setMessage({ type: 'error', text: 'Failed to process image.' });
    }
  };

  const uploadAsset = async (file: File, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('assets')
      .upload(path, file, { upsert: true, cacheControl: '3600' });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: publicData } = supabase.storage
      .from('assets')
      .getPublicUrl(path);

    // Append timestamp to bust cache
    return `${publicData.publicUrl}?t=${Date.now()}`;
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      let finalLogoUrl = logoPreview;
      let finalFaviconUrl = faviconPreview;

      // Ensure bucket exists or create it (requires admin privileges, usually done manually in dashboard)
      // For this task, we assume the bucket 'assets' is created and public

      if (logoFile) {
        finalLogoUrl = (await uploadAsset(logoFile, 'logo/logo.png')) || '';
      }

      if (faviconFile) {
        finalFaviconUrl = (await uploadAsset(faviconFile, 'favicon/favicon.png')) || '';
      }

      const payload = {
        site_name: formData.site_name,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        logo_url: finalLogoUrl,
        favicon_url: finalFaviconUrl,
        updated_at: new Date().toISOString()
      };

      let query;
      if (formData.id) {
        query = supabase.from('site_settings').update(payload).eq('id', formData.id);
      } else {
        query = supabase.from('site_settings').insert([payload]);
      }

      const { error } = await query;

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Settings updated successfully!' });

      // Cleanup Object URLs to avoid memory leaks
      if (logoFile) URL.revokeObjectURL(logoPreview);
      if (faviconFile) URL.revokeObjectURL(faviconPreview);

      setLogoFile(null);
      setFaviconFile(null);

      // Force reload context or page to apply new settings
      setTimeout(() => window.location.reload(), 1500);

    } catch (err: any) {
      console.error('Error saving settings:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save settings. Please verify your Supabase configuration and Storage bucket.' });
    } finally {
      setSaving(false);
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            Admin Settings
          </h1>
          <p className="text-gray-400 mt-2">Manage your platform's branding and core details.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* General Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
              <h2 className="text-xl font-bold border-b border-white/10 pb-4">General Configuration</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Site Name</label>
                  <input
                    type="text"
                    value={formData.site_name}
                    onChange={(e) => setFormData({...formData, site_name: e.target.value})}
                    placeholder="Tech Visionaries Network"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.primary_color || '#00D1FF'}
                        onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                        className="w-12 h-12 rounded bg-transparent cursor-pointer border-none"
                      />
                      <input
                        type="text"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                        placeholder="#00D1FF"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Secondary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.secondary_color || '#7C3AED'}
                        onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                        className="w-12 h-12 rounded bg-transparent cursor-pointer border-none"
                      />
                      <input
                        type="text"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                        placeholder="#7C3AED"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Branding Uploads */}
          <div className="space-y-6">
            {/* Logo Upload */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center space-y-4">
              <h3 className="text-lg font-medium w-full text-left">Logo</h3>

              <div className="w-full aspect-video bg-black/30 rounded-xl border border-dashed border-gray-600 flex items-center justify-center overflow-hidden relative group">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain p-4" />
                ) : (
                  <span className="text-gray-500">No Logo</span>
                )}

                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="text-white mb-2" size={24} />
                  <span className="text-sm font-medium text-white">Upload Logo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} />
                </label>
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center space-y-4">
              <h3 className="text-lg font-medium w-full text-left">Favicon</h3>

              <div className="w-24 h-24 bg-black/30 rounded-xl border border-dashed border-gray-600 flex items-center justify-center overflow-hidden relative group">
                {faviconPreview ? (
                  <img src={faviconPreview} alt="Favicon preview" className="w-16 h-16 object-contain" />
                ) : (
                  <span className="text-gray-500 text-xs">No Icon</span>
                )}

                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="text-white mb-1" size={16} />
                  <span className="text-xs font-medium text-white">Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'favicon')} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-4 w-full bg-[#131B2F]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex justify-end shadow-2xl">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(34,211,255,0.2)] transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
