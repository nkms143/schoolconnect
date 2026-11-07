import React, { useEffect, useState } from 'react';
import { Bell, Plus, Sparkles, Filter, Loader2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { NoticeCard } from '../components/notices/NoticeCard';
import { CreateNoticeModal } from '../components/notices/CreateNoticeModal';
import { noticeService } from '../services/noticeService';
import { Announcement } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const NoticeBoardPage: React.FC = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [category, setCategory] = useState('ALL');
  const [priority, setPriority] = useState('ALL');

  const canPublish = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await noticeService.getAnnouncements(
        category !== 'ALL' ? category : undefined,
        priority !== 'ALL' ? priority : undefined
      );
      setNotices(data);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [category, priority]);

  const handleNoticeCreated = (newNotice: Announcement) => {
    setNotices(prev => [newNotice, ...prev]);
  };

  const handleNoticeDeleted = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  const categories = [
    { label: 'All Notices', value: 'ALL' },
    { label: '📢 Circulars', value: 'CIRCULAR' },
    { label: '📝 Exam Schedules', value: 'EXAM_SCHEDULE' },
    { label: '🎉 Events', value: 'EVENT' },
    { label: '🏖️ Holiday Notices', value: 'HOLIDAY_NOTICE' }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-sky-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white relative shadow-lg">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Official School Board
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              School Notice Board
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-sky-100 leading-relaxed">
              Official circulars, exam dates, holiday schedules, and campus alerts published by
              school faculty and administration.
            </p>
          </div>

          {canPublish && (
            <div className="mt-4 sm:mt-0 sm:absolute sm:top-8 sm:right-8">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Publish New Notice
              </Button>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  category === cat.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent Only</option>
              <option value="IMPORTANT">Important Only</option>
            </select>
          </div>
        </div>

        {/* Notices Cards List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-xs font-semibold">Loading school notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No announcements found matching the selected filters.
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                onDeleted={handleNoticeDeleted}
              />
            ))}
          </div>
        )}
      </div>

      <CreateNoticeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onNoticeCreated={handleNoticeCreated}
      />
    </Layout>
  );
};
