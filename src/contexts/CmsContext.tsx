import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface SiteContent {
  id?: string;
  key: string;
  value: string;
}

export interface FeatureFlag {
  id?: string;
  feature_name: string;
  enabled: boolean;
}

export interface Announcement {
  id?: string;
  message: string;
  type: string;
  is_active: boolean;
}

export interface ContentPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string;
  status: 'draft' | 'published';
  publish_to_social: boolean;
  created_at?: string;
}

interface CmsContextType {
  content: Record<string, string>;
  features: Record<string, boolean>;
  announcement: Announcement | null;
  loading: boolean;
  refreshCms: () => Promise<void>;
}

const defaultContent: Record<string, string> = {
  hero_headline: "Africa’s Premier Tech Builders Network",
  hero_subheadline: "For developers, builders, and tech enthusiasts shaping the future of African innovation.",
  about_text: "Tech Visionaries Network (TVN) is an exclusive ecosystem designed to connect the brightest minds in African tech. We bridge the gap between learning and building by fostering a community where innovators collaborate on real-world projects, share resources, and accelerate their careers.",
  cta_title: "Ready to shape the future?",
  cta_subtitle: "Spots are limited for our founding member cohort. Apply now to secure your place."
};

const defaultFeatures: Record<string, boolean> = {
  show_value_props: true,
  show_how_it_works: true,
  show_community: true,
  show_blog: false,
};

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export const useCms = () => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};

export const CmsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<Record<string, string>>(defaultContent);
  const [features, setFeatures] = useState<Record<string, boolean>>(defaultFeatures);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCmsData = async () => {
    try {
      // 1. Fetch Site Content
      const { data: contentData, error: contentError } = await supabase
        .from('site_content')
        .select('*');

      if (!contentError && contentData) {
        const contentMap: Record<string, string> = { ...defaultContent };
        contentData.forEach((item: SiteContent) => {
          contentMap[item.key] = item.value;
        });
        setContent(contentMap);
      }

      // 2. Fetch Feature Flags
      const { data: featureData, error: featureError } = await supabase
        .from('feature_flags')
        .select('*');

      if (!featureError && featureData) {
        const featureMap: Record<string, boolean> = { ...defaultFeatures };
        featureData.forEach((item: FeatureFlag) => {
          featureMap[item.feature_name] = item.enabled;
        });
        setFeatures(featureMap);
      }

      // 3. Fetch Active Announcement
      const { data: announcementData, error: announcementError } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!announcementError && announcementData) {
        setAnnouncement(announcementData as Announcement);
      } else {
        setAnnouncement(null);
      }

    } catch (err) {
      console.warn('Could not fetch CMS data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  return (
    <CmsContext.Provider value={{ content, features, announcement, loading, refreshCms: fetchCmsData }}>
      {children}
    </CmsContext.Provider>
  );
};
