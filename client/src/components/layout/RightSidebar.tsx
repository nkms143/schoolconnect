import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BarChart2, UserPlus, ArrowRight } from 'lucide-react';
import { noticeService } from '../../services/noticeService';
import { pollService } from '../../services/pollService';
import { friendService } from '../../services/friendService';
import { Announcement, Poll } from '../../types';
import { Avatar } from '../common/Avatar';
import { NoticeBadge } from '../common/Badge';

export const RightSidebar: React.FC = () => {
  const [notices, setNotices] = useState<Announcement[]>([]);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    noticeService.getAnnouncements().then(data => {
      setNotices(data.slice(0, 2));
    }).catch(() => {});

    pollService.getPolls().then(polls => {
      const openPoll = polls.find(p => !p.isClosed);
      if (openPoll) setActivePoll(openPoll);
    }).catch(() => {});

    friendService.getSuggestions().then(data => {
      setSuggestions(data.slice(0, 3));
    }).catch(() => {});
  }, []);

  const handleVote = async (optionId: string) => {
    if (!activePoll || activePoll.hasVoted || voting) return;
    try {
      setVoting(true);
      const res = await pollService.vote(activePoll.id, optionId);
      if (res) {
        setActivePoll(prev => prev ? {
          ...prev,
          hasVoted: true,
          totalVotes: res.totalVotes,
          userVotedOptionId: optionId,
          options: res.options
        } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Voting failed');
    } finally {
      setVoting(false);
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      await friendService.sendRequest(userId);
      setSuggestions(prev => prev.filter(s => s.id !== userId));
    } catch (err: any) {
      alert(err.message || 'Failed to send request');
    }
  };

  return (
    <aside className="hidden xl:flex flex-col w-80 flex-shrink-0 gap-5">
      {/* Notice Board Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
            <Bell className="w-4 h-4 text-blue-600" />
            <span>School Notices</span>
          </div>
          <Link
            to="/notices"
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1"
          >
            All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="mt-3 space-y-3">
          {notices.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No active notices.</p>
          ) : (
            notices.map((n) => (
              <div key={n.id} className="text-xs space-y-1">
                <NoticeBadge category={n.category} />
                <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 mt-1">
                  {n.title}
                </p>
                <p className="text-[11px] text-slate-400">
                  By {n.author.profile?.fullName || 'Faculty'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Featured Poll Widget */}
      {activePoll && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
              <BarChart2 className="w-4 h-4 text-purple-600" />
              <span>Campus Poll</span>
            </div>
            <Link
              to="/polls"
              className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 font-semibold"
            >
              View
            </Link>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3">
              {activePoll.question}
            </p>

            <div className="space-y-2">
              {activePoll.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  disabled={activePoll.hasVoted || voting}
                  className={`w-full text-left p-2 rounded-xl text-xs relative overflow-hidden transition-all border ${
                    activePoll.userVotedOptionId === opt.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {/* Progress bar background */}
                  {activePoll.hasVoted && (
                    <div
                      className="absolute inset-y-0 left-0 bg-purple-200/50 dark:bg-purple-900/40 transition-all duration-500"
                      style={{ width: `${opt.percentage}%` }}
                    />
                  )}
                  <div className="relative flex justify-between items-center z-10">
                    <span className="truncate pr-2">{opt.text}</span>
                    {activePoll.hasVoted && (
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                        {opt.percentage}%
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 mt-2 text-center">
              {activePoll.hasVoted ? '✓ You have voted' : '1 vote per student'} • {activePoll.totalVotes} total votes
            </p>
          </div>
        </div>
      )}

      {/* Suggested Classmates Widget */}
      {suggestions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Suggested Classmates</span>
            </div>
            <Link
              to="/friends"
              className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold"
            >
              See all
            </Link>
          </div>

          <div className="mt-3 space-y-3">
            {suggestions.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <Link to={`/profile/${item.id}`} className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    src={item.profile?.avatarUrl}
                    name={item.profile?.fullName || item.email}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate hover:underline">
                      {item.profile?.fullName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.profile?.grade} {item.profile?.section && `• ${item.profile.section}`}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={() => handleConnect(item.id)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100 transition-colors flex-shrink-0"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
