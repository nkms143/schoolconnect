import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users2,
  BarChart3,
  ClipboardList,
  UserCheck,
  MessageSquare,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { RoleBadge } from '../common/Badge';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Social Feed', path: '/', icon: Home },
    { label: 'School Clubs', path: '/clubs', icon: Users2 },
    { label: 'Polls & Voting', path: '/polls', icon: BarChart3 },
    { label: 'Notice Board', path: '/notices', icon: ClipboardList },
    { label: 'Friends', path: '/friends', icon: UserCheck },
    { label: 'Messages', path: '/messages', icon: MessageSquare }
  ];

  if (user?.role === 'ADMIN' || user?.role === 'TEACHER') {
    navItems.push({
      label: user.role === 'ADMIN' ? 'Admin Panel' : 'Moderation',
      path: '/admin',
      icon: ShieldAlert
    });
  }

  return (
    <aside className="hidden md:flex flex-col w-64 flex-shrink-0 gap-4">
      {/* User Quick Card */}
      {user && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <Avatar
              src={user.profile?.avatarUrl}
              name={user.profile?.fullName || user.email}
              size="md"
              isOnline={true}
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {user.profile?.fullName || 'Student'}
              </h4>
              <p className="text-xs text-slate-500 truncate">
                {user.profile?.grade} • {user.profile?.section}
              </p>
              <div className="mt-1">
                <RoleBadge role={user.role} size="sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* School Clubs Quick Access */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:from-indigo-950/40 dark:to-purple-950/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/50">
        <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Core School Clubs</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <li className="flex items-center gap-2">
            <span>🔬</span> <NavLink to="/clubs/science-club" className="hover:underline">Science Club</NavLink>
          </li>
          <li className="flex items-center gap-2">
            <span>🌱</span> <NavLink to="/clubs/eco-club" className="hover:underline">Eco Club</NavLink>
          </li>
          <li className="flex items-center gap-2">
            <span>💻</span> <NavLink to="/clubs/coding-club" className="hover:underline">Coding Club</NavLink>
          </li>
          <li className="flex items-center gap-2">
            <span>⚽</span> <NavLink to="/clubs/sports-club" className="hover:underline">Sports Club</NavLink>
          </li>
          <li className="flex items-center gap-2">
            <span>🎨</span> <NavLink to="/clubs/arts-club" className="hover:underline">Arts Club</NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
};
