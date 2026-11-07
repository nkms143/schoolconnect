import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { MobileNav } from './MobileNav';

interface LayoutProps {
  children: React.ReactNode;
  showRightSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showRightSidebar = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        <div className="flex gap-6 items-start">
          {/* Main Sidebar */}
          <Sidebar />

          {/* Main Center Content */}
          <main className="flex-1 min-w-0">{children}</main>

          {/* Right Sidebar */}
          {showRightSidebar && <RightSidebar />}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};
