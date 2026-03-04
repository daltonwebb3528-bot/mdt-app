"use client";

import { useEffect, useState } from "react";
import { AlertFeed } from "@/components/alerts/AlertFeed";
import { TopBar } from "@/components/layout/TopBar";
import { TabBar } from "@/components/layout/TabBar";
import { MainContent } from "@/components/layout/MainContent";

export default function Home() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if user has completed setup
    const unit = localStorage.getItem("mdt_unit");
    
    if (!unit) {
      // No unit set - redirect to login/setup page
      window.location.replace("/auth/login");
      return;
    }

    setIsReady(true);
  }, []);

  // Show nothing while checking (prevents flash)
  if (!isReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-mdt-bg">
        <div className="text-center">
          <div className="text-4xl mb-4">🚔</div>
          <p className="text-mdt-muted">Loading MDT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Top Bar */}
      <TopBar />

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Alert Feed Sidebar */}
        <AlertFeed />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <TabBar />

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <MainContent />
          </div>
        </div>
      </div>
    </div>
  );
}
