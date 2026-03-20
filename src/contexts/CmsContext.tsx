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
  // Home Page
  hero_headline: "Africa’s Premier Tech Builders Network",
  hero_subheadline: "For developers, builders, and tech enthusiasts shaping the future of African innovation.",
  about_text: "Tech Visionaries Network (TVN) is an exclusive ecosystem designed to connect the brightest minds in African tech. We bridge the gap between learning and building by fostering a community where innovators collaborate on real-world projects, share resources, and accelerate their careers.",
  cta_title: "Ready to shape the future?",
  cta_subtitle: "Spots are limited for our founding member cohort. Apply now to secure your place.",

  // About Page
  about_page_headline: "We are building Africa's most dynamic network for tech innovators, developers, and builders.",
  about_mission: "To bridge the gap between learning and building by creating a collaborative ecosystem where African tech talent can thrive, build real-world solutions, and gain global exposure.",
  about_who_we_are: "is more than just a community; it's a launchpad. We are a collective of software engineers, product designers, data scientists, and founders who believe that the future of technology is being built right here in Africa.",

  // Projects Page
  projects_headline: "Discover what the community is building right now.",
  projects_coming_soon: "Our builders are currently hard at work. This section will feature open-source initiatives, community startups, and featured portfolios from our members. Check back soon!",

  // Community Page
  community_headline: "Welcome to the family. Here’s how we operate, connect, and build together.",
  community_communication: "We communicate actively through our core channels (Discord, WhatsApp, and the Platform). Keep discussions constructive, technical, and respectful. Avoid spam and always search before asking common questions.",
  community_collaboration: "The strength of our network lies in its members. Use the Explore Builders page to find teammates for your next startup, hackathon, or open-source project. Share your knowledge freely.",
  community_global: "While our roots are African, our ambitions are global. We encourage builders to think beyond borders, create scalable solutions, and represent the network globally. By joining, you commit to elevating the standard of African tech.",

  // Legal Pages (HTML content)
  legal_privacy_policy: "<p>Welcome to our Privacy Policy. Your privacy is critically important to us. This document outlines how we collect, use, and protect your personal data when you interact with our network.</p><h3>1. Information We Collect</h3><p>When you join, we collect information that identifies you as an individual. This includes your name, email address, physical location, professional role, skills, and any avatar or bio you provide.</p>",
  legal_terms_of_service: "<p>These Terms of Service govern your use of our website and any related services provided by us.</p><p>By accessing our platform, you agree to abide by these Terms of Service and to comply with all applicable laws and regulations.</p><h3>1. Limitations of Use</h3><p>By using this website, you warrant on behalf of yourself, your users, and other parties you represent that you will not modify, copy, prepare derivative works of, decompile, or reverse engineer any materials and software contained on this website.</p>",
  legal_code_of_conduct: "<p>We are committed to providing a friendly, safe, and welcoming environment for all, regardless of level of experience, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, nationality, or other similar characteristic.</p><h3>Our Pledge</h3><p>In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to making participation in our project and our community a harassment-free experience for everyone.</p>"
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
