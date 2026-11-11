import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { MobileNav } from './MobileNav';
import { MobileDrawer } from './MobileDrawer';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showRightSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showRightSidebar = true }) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onOpenMobileMenu={() => setIsMobileDrawerOpen(true)} />

      {/* Slide-over Mobile Side Pane (Drawer) */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">
          {/* Main Sidebar (Desktop) */}
          <Sidebar />

          {/* Main Center Content */}
          <main className="flex-1 min-w-0">{children}</main>

          {/* Right Sidebar */}
          {showRightSidebar && <RightSidebar />}
        </div>
      </div>

      {/* Universal Website Footer Module */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenMenu={() => setIsMobileDrawerOpen(true)} />
    </div>
  );
};
