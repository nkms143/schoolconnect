import React, { useState } from 'react';
import { BarChart3, CheckCircle2, Clock } from 'lucide-react';
import { Poll } from '../../types';
import { Avatar } from '../common/Avatar';
import { RoleBadge } from '../common/Badge';
import { pollService } from '../../services/pollService';

interface PollCardProps {
  poll: Poll;
  onVoted?: (updatedPoll: Poll) => void;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, onVoted }) => {
  const [currentPoll, setCurrentPoll] = useState<Poll>(poll);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (optionId: string) => {
    if (currentPoll.hasVoted || currentPoll.isClosed || isVoting) return;

    try {
      setIsVoting(true);
      const res = await pollService.vote(currentPoll.id, optionId);
      if (res) {
        const updated = {
          ...currentPoll,
          hasVoted: true,
          userVotedOptionId: optionId,
          totalVotes: res.totalVotes,
          options: res.options
        };
        setCurrentPoll(updated);
        onVoted?.(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Voting failed');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar
            src={currentPoll.creator.profile?.avatarUrl}
            name={currentPoll.creator.profile?.fullName || 'Creator'}
            size="sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {currentPoll.creator.profile?.fullName || 'School Community'}
              </span>
              <RoleBadge role={currentPoll.creator.role} size="sm" />
            </div>
            <p className="text-[11px] text-slate-400">Created a school poll</p>
          </div>
        </div>

        {currentPoll.isClosed ? (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Concluded
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Active
          </span>
        )}
      </div>

      {/* Question */}
      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-3 mb-4 leading-snug">
        {currentPoll.question}
      </h3>

      {/* Options */}
      <div className="space-y-2.5">
        {currentPoll.options.map((option) => {
          const isSelected = currentPoll.userVotedOptionId === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={currentPoll.hasVoted || currentPoll.isClosed || isVoting}
              className={`w-full text-left relative overflow-hidden rounded-xl border p-3 text-xs sm:text-sm font-medium transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                  : currentPoll.hasVoted
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer'
              }`}
            >
              {/* Animated Progress Bar */}
              {currentPoll.hasVoted && (
                <div
                  className="absolute inset-y-0 left-0 bg-blue-500/15 dark:bg-blue-500/25 transition-all duration-700 ease-out"
                  style={{ width: `${option.percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between z-10">
                <div className="flex items-center gap-2 truncate pr-2">
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                  <span className={isSelected ? 'font-bold text-blue-700 dark:text-blue-300' : ''}>
                    {option.text}
                  </span>
                </div>

                {currentPoll.hasVoted && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400">({option.votesCount})</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {option.percentage}%
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Details */}
      <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <span>{currentPoll.totalVotes} total votes</span>
        <span>
          {currentPoll.hasVoted ? '✓ You have voted' : '1 vote per student'}
        </span>
      </div>
    </div>
  );
};
