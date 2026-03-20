import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface SiteSettings {
  id?: string;
  site_name: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  updated_at?: string;
}

const defaultSettings: SiteSettings = {
  site_name: 'Tech Visionaries Network',
  logo_url: '',
  favicon_url: '/favicon.ico',
  primary_color: '#00D1FF', // Cyan
  secondary_color: '#7C3AED' // Purple
};

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        console.error('Error fetching site settings:', error);
      } else if (data) {
        setSettings(prev => ({ ...prev, ...data }));

        // Update document title
        if (data.site_name) {
          document.title = data.site_name;
        }

        // Update favicon dynamically
        if (data.favicon_url) {
          let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
          if (!link) {
            link = document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            document.head.appendChild(link);
          }
          link.href = data.favicon_url;
        }

        // Update root CSS variables for colors if provided
        const root = document.documentElement;
        if (data.primary_color) {
          // This allows overriding tailwind colors dynamically if implemented with css vars
          root.style.setProperty('--primary-color', data.primary_color);
        }
        if (data.secondary_color) {
          root.style.setProperty('--secondary-color', data.secondary_color);
        }
      }
    } catch (err) {
      console.warn('Could not fetch settings (Supabase might not be fully configured)', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
