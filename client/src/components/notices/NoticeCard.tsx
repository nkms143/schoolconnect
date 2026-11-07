import React from 'react';
import { Calendar, Trash2, ShieldCheck } from 'lucide-react';
import { Announcement } from '../../types';
import { NoticeBadge, PriorityBadge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { noticeService } from '../../services/noticeService';

interface NoticeCardProps {
  notice: Announcement;
  onDeleted?: (id: string) => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice, onDeleted }) => {
  const { user } = useAuth();
  const canDelete = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const handleDelete = async () => {
    if (!window.confirm('Delete this notice from the board?')) return;
    try {
      await noticeService.deleteAnnouncement(notice.id);
      onDeleted?.(notice.id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete notice');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
      {/* Priority accent border if Urgent */}
      {notice.priority === 'URGENT' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
      )}
      {notice.priority === 'IMPORTANT' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
      )}

      {/* Badges Row */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <div className="flex items-center gap-2">
          <NoticeBadge category={notice.category} />
          <PriorityBadge priority={notice.priority} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(notice.createdAt)}
          </span>

          {canDelete && (
            <button
              onClick={handleDelete}
              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
              title="Delete announcement"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
        {notice.title}
      </h3>

      {/* Content */}
      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
        {notice.content}
      </p>

      {/* Publisher Details */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {notice.author.profile?.fullName || 'School Administration'}
          </span>
          <span className="text-slate-400">({notice.author.role})</span>
        </div>

        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
          Audience: {notice.targetGrade || 'All Grades'}
        </span>
      </div>
    </div>
  );
};
