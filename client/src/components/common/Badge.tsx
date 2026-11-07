import React from 'react';
import { Role, NoticeCategory, NoticePriority } from '../../types';

interface RoleBadgeProps {
  role: Role | string;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (role === 'ADMIN') {
    return (
      <span className={`inline-flex items-center font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900 ${sizeClass}`}>
        ★ Administrator
      </span>
    );
  }

  if (role === 'TEACHER') {
    return (
      <span className={`inline-flex items-center font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900 ${sizeClass}`}>
        👨‍🏫 Faculty / Teacher
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900 ${sizeClass}`}>
      🎓 Student
    </span>
  );
};

interface NoticeBadgeProps {
  category: NoticeCategory;
}

export const NoticeBadge: React.FC<NoticeBadgeProps> = ({ category }) => {
  switch (category) {
    case 'EXAM_SCHEDULE':
      return (
        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          📝 Exam Schedule
        </span>
      );
    case 'EVENT':
      return (
        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          🎉 School Event
        </span>
      );
    case 'HOLIDAY_NOTICE':
      return (
        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          🏖️ Holiday Notice
        </span>
      );
    case 'CIRCULAR':
    default:
      return (
        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          📢 Official Circular
        </span>
      );
  }
};

export const PriorityBadge: React.FC<{ priority: NoticePriority }> = ({ priority }) => {
  if (priority === 'URGENT') {
    return (
      <span className="animate-pulse px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white shadow-sm">
        URGENT
      </span>
    );
  }
  if (priority === 'IMPORTANT') {
    return (
      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500 text-white">
        IMPORTANT
      </span>
    );
  }
  return null;
};
