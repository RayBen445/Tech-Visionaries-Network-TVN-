/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import ThreeBackground from './components/ThreeBackground';
import TvnHub from "./components/TvnHub";
import JoinModal from "./components/JoinModal";
import AdminLogin from "./components/AdminLogin";
import { SettingsProvider } from "./contexts/SettingsContext";

export default function App() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    // Simple path-based routing
    if (window.location.pathname === '/admin') {
      setIsAdminRoute(true);
    }
  }, []);

  if (isAdminRoute) {
    return (
      <SettingsProvider>
        <AdminLogin />
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
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
    </SettingsProvider>
  );
}
