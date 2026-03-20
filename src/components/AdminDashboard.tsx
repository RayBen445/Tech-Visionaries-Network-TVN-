import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Edit3, FileText, ToggleLeft, Megaphone, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminSettings from './AdminSettings';
// Placeholders for the other sections
import AdminContent from './AdminContent';
import AdminPosts from './AdminPosts';
import AdminFeatures from './AdminFeatures';
import AdminAnnouncements from './AdminAnnouncements';

type Tab = 'settings' | 'content' | 'posts' | 'features' | 'announcements';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('settings');

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'settings':
        return <AdminSettings />;
      case 'content':
        return <AdminContent />;
      case 'posts':
        return <AdminPosts />;
      case 'features':
        return <AdminFeatures />;
      case 'announcements':
        return <AdminAnnouncements />;
      default:
        return <AdminSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#131B2F] border-r border-white/10 md:min-h-screen flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center">
            <Settings size={16} />
          </div>
          <span className="font-bold text-lg tracking-tight">Admin Console</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <TabButton
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            icon={<Settings size={18} />}
            label="Site Settings"
          />
          <TabButton
            active={activeTab === 'content'}
            onClick={() => setActiveTab('content')}
            icon={<Edit3 size={18} />}
            label="Page Content"
          />
          <TabButton
            active={activeTab === 'posts'}
            onClick={() => setActiveTab('posts')}
            icon={<FileText size={18} />}
            label="Blog Posts"
          />
          <TabButton
            active={activeTab === 'features'}
            onClick={() => setActiveTab('features')}
            icon={<ToggleLeft size={18} />}
            label="Feature Flags"
          />
          <TabButton
            active={activeTab === 'announcements'}
            onClick={() => setActiveTab('announcements')}
            icon={<Megaphone size={18} />}
            label="Announcements"
          />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {/* We reuse the AdminSettings component styling, so we don't need inner padding here for the settings tab */}
        {/* But we will add padding for the other tabs in their respective components */}
        <div className="h-full w-full overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active
        ? 'bg-cyan-500/10 text-cyan-400 font-medium'
        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
