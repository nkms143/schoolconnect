import React, { useEffect, useState } from 'react';
import { BarChart3, Plus, Sparkles, Loader2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { PollCard } from '../components/polls/PollCard';
import { CreatePollModal } from '../components/polls/CreatePollModal';
import { pollService } from '../services/pollService';
import { Poll } from '../types';
import { Button } from '../components/common/Button';

export const PollsPage: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL');

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const data = await pollService.getPolls();
      setPolls(data);
    } catch (err) {
      console.error('Failed to load polls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handlePollCreated = (newPoll: Poll) => {
    setPolls(prev => [newPoll, ...prev]);
  };

  const filteredPolls = polls.filter((p) => {
    if (filter === 'ACTIVE') return !p.isClosed;
    if (filter === 'CLOSED') return p.isClosed;
    return true;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-3xl p-6 sm:p-8 text-white relative shadow-lg">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Student Voice & Democracy
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              School Polls & Voting
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-purple-100 leading-relaxed">
              Every student gets one vote. Cast your ballot on upcoming school themes, event dates,
              and club initiatives with live transparent result graphics.
            </p>
          </div>

          <div className="mt-4 sm:mt-0 sm:absolute sm:top-8 sm:right-8">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create New Poll
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['ALL', 'ACTIVE', 'CLOSED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {f === 'ALL' ? 'All Polls' : f === 'ACTIVE' ? 'Active Voting' : 'Concluded'}
            </button>
          ))}
        </div>

        {/* Polls List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-xs font-semibold">Loading school polls...</p>
          </div>
        ) : filteredPolls.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No polls found in this category.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVoted={(updated) => {
                  setPolls(prev => prev.map(p => p.id === updated.id ? updated : p));
                }}
              />
            ))}
          </div>
        )}
      </div>

      <CreatePollModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onPollCreated={handlePollCreated}
      />
    </Layout>
  );
};
