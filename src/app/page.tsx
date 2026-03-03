"use client";

import { AlertFeed } from "@/components/alerts/AlertFeed";
import { TopBar } from "@/components/layout/TopBar";
import { TabBar } from "@/components/layout/TabBar";
import { MainContent } from "@/components/layout/MainContent";

export default function Home() {
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
