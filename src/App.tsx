/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import ThreeBackground from './components/ThreeBackground';
import TvnHub from "./components/TvnHub";
import JoinModal from "./components/JoinModal";
import AdminLogin from "./components/AdminLogin";
import Blog from "./components/Blog";
import UserDashboard from "./components/UserDashboard";
import PublicProfile from "./components/PublicProfile";
import { SettingsProvider } from "./contexts/SettingsContext";
import { CmsProvider } from "./contexts/CmsContext";
import AnnouncementBanner from "./components/AnnouncementBanner";

export default function App() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isBlogRoute, setIsBlogRoute] = useState(false);
  const [isDashboardRoute, setIsDashboardRoute] = useState(false);
  const [isProfileRoute, setIsProfileRoute] = useState(false);

  useEffect(() => {
    // Simple path-based routing
    const path = window.location.pathname;
    if (path === '/admin') {
      setIsAdminRoute(true);
    } else if (path === '/blog' || path === '/updates') {
      setIsBlogRoute(true);
    } else if (path === '/dashboard') {
      setIsDashboardRoute(true);
    } else if (path.startsWith('/u/')) {
      setIsProfileRoute(true);
      setIsBlogRoute(true);
    }
  }, []);

  if (isDashboardRoute) {
    return (
      <SettingsProvider>
        <CmsProvider>
          <UserDashboard />
        </CmsProvider>
      </SettingsProvider>
    );
  }
  if (isProfileRoute) {
    return (
      <SettingsProvider>
        <CmsProvider>
          <PublicProfile />
        </CmsProvider>
      </SettingsProvider>
    );
  }

  if (isBlogRoute) {
    return (
      <SettingsProvider>
        <CmsProvider>
          <Blog />
        </CmsProvider>
      </SettingsProvider>
    );
  }

  if (isAdminRoute) {
    return (
      <SettingsProvider>
        <CmsProvider>
          <AdminLogin />
        </CmsProvider>
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
      <CmsProvider>
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
          <AnnouncementBanner />
          <ThreeBackground />

          {/* Main Content */}
          <main className="relative z-10 w-full min-h-screen flex flex-col items-center justify-start">
            <TvnHub onJoinClick={() => setIsJoinModalOpen(true)} />
          </main>

          {/* Join Modal */}
          <JoinModal
            isOpen={isJoinModalOpen}
            onClose={() => setIsJoinModalOpen(false)}
          />
        </div>
      </CmsProvider>
    </SettingsProvider>
  );
}
