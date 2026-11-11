import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  ShieldCheck,
  Sparkles,
  Trophy,
  HelpCircle,
  FileText,
  BookOpen,
  Users2,
  ClipboardList,
  BarChart3,
  Heart
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { analyticsService } from '../../services/analyticsService';

interface FooterProps {
  compact?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ compact = false }) => {
  const [visitorCount, setVisitorCount] = useState<number>(() => analyticsService.getCachedVisitCount());
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    analyticsService
      .getOrRecordVisit()
      .then((count) => {
        if (isMounted) {
          setVisitorCount(count);
          setIsSyncing(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsSyncing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentYear = new Date().getFullYear();

  // Compact variant for login / register / standalone pages
  if (compact) {
    return (
      <footer className="w-full py-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3">
        {/* Dynamic Visitor Counter Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-700 dark:text-slate-300 font-medium">
          <span className="relative flex h-2 w-2">
            {isSyncing && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>
            {visitorCount.toLocaleString()} Cumulative Visits
          </span>
        </div>

        {/* Development & Mentorship Credit */}
        <p className="font-semibold text-slate-700 dark:text-slate-300 max-w-xl mx-auto px-4 leading-relaxed">
          Developed by Team Nicholas using AI under the Mentorship of The Levelup Company
        </p>

        {/* Copyright Notice */}
        <p className="text-[11px] text-slate-400">
          © {currentYear} SchoolConnect. All rights reserved. Proprietary student social & academic platform.
        </p>
      </footer>
    );
  }

  // Full comprehensive footer for Main Layout
  return (
    <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
          {/* Column 1: Brand & Overview */}
          <div className="space-y-4 md:col-span-1">
            <Logo size="md" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              A modern, safe school social interaction and academic Olympiad platform designed specifically for students, faculty, and collaborative school clubs.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified School Environment</span>
            </div>
          </div>

          {/* Column 2: Academic Suite Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              Academic Suite
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/quizzes" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                  Quiz Competitions
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Quiz Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/assignments" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  Homework & Assignments
                </Link>
              </li>
              <li>
                <Link to="/notes" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                  Study Notes & Revision Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Campus Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Campus Life
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/clubs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <Users2 className="w-3.5 h-3.5 text-teal-500" />
                  Student Clubs & Groups
                </Link>
              </li>
              <li>
                <Link to="/notices" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-rose-500" />
                  Official Circulars & Notices
                </Link>
              </li>
              <li>
                <Link to="/polls" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-500" />
                  Polls & Student Voting
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Dynamic Visitor Counter Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-500" />
              Live Traffic Analytics
            </h4>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    {isSyncing && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Campus Visits
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wider font-extrabold">
                  {isSyncing ? 'Syncing...' : 'Live Counter'}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {visitorCount.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Cumulative unique website visits recorded across school sessions.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Mentorship Attribution & Copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          {/* Prominent Mentorship Credit Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border border-blue-200 dark:border-slate-700 shadow-sm text-xs font-bold text-slate-800 dark:text-slate-200">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Developed by Team Nicholas using AI under the Mentorship of The Levelup Company</span>
          </div>

          {/* Legal Copyright Notice */}
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              © {currentYear} SchoolConnect. All rights reserved.
            </p>
            <p className="text-[11px] text-slate-400">
              Protected by copyright and intellectual property laws.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

