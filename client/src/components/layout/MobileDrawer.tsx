import React, { useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  X,
  Home,
  Users2,
  BarChart3,
  ClipboardList,
  UserCheck,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  LogOut,
  User as UserIcon,
  Search,
  HelpCircle,
  Trophy,
  FileText,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { RoleBadge } from '../common/Badge';
import { ThemeToggle } from '../common/ThemeToggle';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navItems = [
    { label: 'Social Feed', path: '/', icon: Home },
    { label: 'School Clubs', path: '/clubs', icon: Users2 },
    { label: 'Polls & Voting', path: '/polls', icon: BarChart3 },
    { label: 'Notice Board', path: '/notices', icon: ClipboardList },
    { label: 'Friends & Classmates', path: '/friends', icon: UserCheck },
    { label: 'Messages & Chat', path: '/messages', icon: MessageSquare }
  ];

  const academicItems = [
    { label: 'Quiz Competitions', path: '/quizzes', icon: HelpCircle },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Assignments', path: '/assignments', icon: FileText },
    { label: 'Study Notes', path: '/notes', icon: BookOpen }
  ];

  if (user?.role === 'ADMIN' || user?.role === 'TEACHER') {
    navItems.push({
      label: user.role === 'ADMIN' ? 'Admin Dashboard' : 'Teacher Moderation',
      path: '/admin',
      icon: ShieldAlert
    });
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Side Pane */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto md:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Navigation Drawer"
      >
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  SchoolConnect
                </span>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 -mt-1">
                  Student Network
                </p>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Quick Card (Mobile) */}
          {user ? (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/60">
              <Link
                to={`/profile/${user.id}`}
                onClick={onClose}
                className="flex items-center gap-3 group"
              >
                <Avatar
                  src={user.profile?.avatarUrl}
                  name={user.profile?.fullName || user.email}
                  size="md"
                  isOnline={true}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                    {user.profile?.fullName || 'Student'}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {user.profile?.grade || 'Member'} • {user.profile?.section || 'School'}
                  </p>
                  <div className="mt-1">
                    <RoleBadge role={user.role} size="sm" />
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/50 flex flex-col gap-2">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                Join your school's digital campus
              </p>
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="flex-1 py-1.5 text-center text-xs font-bold text-blue-600 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={onClose}
                  className="flex-1 py-1.5 text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Join School
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
              Main Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
                Academics & Learning
              </p>
              {academicItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-bold shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* School Clubs Section */}
          <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:from-indigo-950/40 dark:to-purple-950/20 rounded-2xl p-3.5 border border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-bold text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core School Clubs</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li>
                <Link
                  to="/clubs/science-club"
                  onClick={onClose}
                  className="flex items-center gap-2 hover:underline"
                >
                  <span>🔬</span> <span>Science Club</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/clubs/eco-club"
                  onClick={onClose}
                  className="flex items-center gap-2 hover:underline"
                >
                  <span>🌱</span> <span>Eco Club</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/clubs/coding-club"
                  onClick={onClose}
                  className="flex items-center gap-2 hover:underline"
                >
                  <span>💻</span> <span>Coding Club</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/clubs/sports-club"
                  onClick={onClose}
                  className="flex items-center gap-2 hover:underline"
                >
                  <span>⚽</span> <span>Sports Club</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/clubs/arts-club"
                  onClick={onClose}
                  className="flex items-center gap-2 hover:underline"
                >
                  <span>🎨</span> <span>Arts Club</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Drawer Bottom Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-500">Theme</span>
            <ThemeToggle />
          </div>

          {user && (
            <div className="space-y-1 pt-1">
              <Link
                to={`/profile/${user.id}`}
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>View Full Profile</span>
              </Link>
              <button
                onClick={() => {
                  onClose();
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

