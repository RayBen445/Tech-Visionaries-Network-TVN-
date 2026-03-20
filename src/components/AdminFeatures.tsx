import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useCms } from '../contexts/CmsContext';
import { Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminFeatures() {
  const { features, refreshCms } = useCms();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [localFeatures, setLocalFeatures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLocalFeatures({ ...features });
  }, [features]);

  const handleToggle = (key: string) => {
    setLocalFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const updates = Object.keys(localFeatures).map(key => ({
        feature_name: key,
        enabled: localFeatures[key]
      }));

      const { error } = await supabase
        .from('feature_flags')
        .upsert(updates, { onConflict: 'feature_name' });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Features updated successfully!' });
      await refreshCms();

    } catch (err: any) {
      console.error('Error saving features:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save features.' });
    } finally {
      setSaving(false);
    }
  };

  const featureList = [
    { key: 'show_value_props', label: 'Show Value Propositions' },
    { key: 'show_how_it_works', label: 'Show How It Works Section' },
    { key: 'show_community', label: 'Show Community Section' },
    { key: 'show_blog', label: 'Show Blog Link in Navigation' }
  ];

  return (
    <div className="p-8 md:p-12 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Feature Flags</h1>
        <p className="text-gray-400 mt-2">Enable or disable platform features dynamically.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-4">
        {featureList.map(feature => (
          <div key={feature.key} className="flex items-center justify-between p-4 bg-[#0B0F19]/50 border border-white/5 rounded-xl">
            <span className="font-medium text-gray-300">{feature.label}</span>
            <button
              onClick={() => handleToggle(feature.key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localFeatures[feature.key] ? 'bg-cyan-500' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localFeatures[feature.key] ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
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
          {saving ? 'Saving...' : 'Save Features'}
        </button>
      </div>
    </div>
  );
}
