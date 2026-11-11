import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { Club } from '../../types';
import { clubService } from '../../services/clubService';
import { Button } from '../common/Button';

interface ClubCardProps {
  club: Club;
  onStatusChange?: (clubId: string, isMember: boolean) => void;
}

export const ClubCard: React.FC<ClubCardProps> = ({ club, onStatusChange }) => {
  const [isMember, setIsMember] = useState(club.isMember || false);
  const [membersCount, setMembersCount] = useState(club.membersCount);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      if (isMember) {
        const res = await clubService.leaveClub(club.id);
        setIsMember(false);
        setMembersCount(res.membersCount);
        onStatusChange?.(club.id, false);
      } else {
        const res = await clubService.joinClub(club.id);
        setIsMember(true);
        setMembersCount(res.membersCount);
        onStatusChange?.(club.id, true);
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const isIconImage = Boolean(
    club.iconUrl &&
    (club.iconUrl.startsWith('http://') ||
     club.iconUrl.startsWith('https://') ||
     club.iconUrl.startsWith('/'))
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-md">
      {/* Banner */}
      <div className="relative h-32 bg-slate-200 dark:bg-slate-800 overflow-hidden">
        {club.bannerUrl ? (
          <img
            src={club.bannerUrl}
            alt={club.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600" />
        )}
        <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex items-center justify-center text-xl shadow-md overflow-hidden border border-white/20">
          {isIconImage ? (
            <img
              src={club.iconUrl}
              alt={club.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span>{club.iconUrl || '🏫'}</span>
          )}
        </div>
        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
          {club.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
            {club.name}
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {club.description}
          </p>

          {/* Stats icons */}
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              {membersCount} members
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              {club.eventsCount} events
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
              {club.discussionsCount} talks
            </span>
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant={isMember ? 'outline' : 'primary'}
            isLoading={isUpdating}
            onClick={handleToggleJoin}
          >
            {isMember ? 'Joined ✓' : 'Join Club'}
          </Button>

          <Link
            to={`/clubs/${club.slug}`}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
          >
            Club Room <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
