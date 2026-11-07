import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users2, BarChart3, ClipboardList, MessageSquare } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const links = [
    { label: 'Feed', path: '/', icon: Home },
    { label: 'Clubs', path: '/clubs', icon: Users2 },
    { label: 'Polls', path: '/polls', icon: BarChart3 },
    { label: 'Notices', path: '/notices', icon: ClipboardList },
    { label: 'Chat', path: '/messages', icon: MessageSquare }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2">
      <div className="flex justify-around items-center">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
