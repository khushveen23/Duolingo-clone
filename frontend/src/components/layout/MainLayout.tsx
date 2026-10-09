"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { RightPanel } from "./RightPanel";

interface MainLayoutProps {
  children: React.ReactNode;
  showRightPanel?: boolean;
}

export function MainLayout({
  children,
  showRightPanel = true,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Navigation Sidebar (Desktop Left, Mobile Bottom) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-56 flex flex-col min-h-screen">
        {/* Sticky Top Stats Bar */}
        <TopBar />

        {/* Center & Right Column Container */}
        <main className="flex-1 flex justify-center pb-20 md:pb-8 pt-2 px-3 sm:px-6 w-full max-w-full overflow-x-hidden">
          <div className="w-full max-w-5xl flex justify-center gap-8 min-w-0">
            {/* Center Content */}
            <div className="flex-1 max-w-2xl min-w-0 w-full">{children}</div>

            {/* Right Side Widgets (Desktop) */}
            {showRightPanel && <RightPanel />}
          </div>
        </main>
      </div>
    </div>
  );
}
