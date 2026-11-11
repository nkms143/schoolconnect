import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  MessageSquare,
  Plus,
  MapPin,
  Clock,
  ArrowLeft,
  Shield,
  Loader2
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Avatar } from '../components/common/Avatar';
import { RoleBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { clubService } from '../services/clubService';
import { useAuth } from '../context/AuthContext';

export const ClubDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discussions' | 'events' | 'members'>('discussions');

  // New discussion modal
  const [discussionModalOpen, setDiscussionModalOpen] = useState(false);
  const [discussionTitle, setDiscussionTitle] = useState('');
  const [discussionContent, setDiscussionContent] = useState('');
  const [isSubmittingDiscussion, setIsSubmittingDiscussion] = useState(false);

  // New event modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // Join/Leave
  const [isUpdatingMembership, setIsUpdatingMembership] = useState(false);

  const fetchClub = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const data = await clubService.getClubBySlug(slug);
      setClub(data);
    } catch (err) {
      console.error('Failed to load club:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClub();
  }, [slug]);

  const handleToggleJoin = async () => {
    if (!club) return;
    try {
      setIsUpdatingMembership(true);
      if (club.isMember) {
        await clubService.leaveClub(club.id);
      } else {
        await clubService.joinClub(club.id);
      }
      await fetchClub();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsUpdatingMembership(false);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionTitle.trim() || !discussionContent.trim()) return;

    try {
      setIsSubmittingDiscussion(true);
      await clubService.createDiscussion(club.id, discussionTitle.trim(), discussionContent.trim());
      setDiscussionModalOpen(false);
      setDiscussionTitle('');
      setDiscussionContent('');
      await fetchClub();
    } catch (err: any) {
      alert(err.message || 'Failed to create discussion');
    } finally {
      setIsSubmittingDiscussion(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate || !eventLocation.trim()) return;

    try {
      setIsSubmittingEvent(true);
      await clubService.createEvent(club.id, {
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        eventDate,
        location: eventLocation.trim()
      });
      setEventModalOpen(false);
      setEventTitle('');
      setEventDescription('');
      setEventDate('');
      setEventLocation('');
      await fetchClub();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule event');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  if (loading || !club) {
    return (
      <Layout>
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs font-semibold">Loading club room...</p>
        </div>
      </Layout>
    );
  }

  const formatEventDate = (dStr: string) => {
    const d = new Date(dStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isIconImage = Boolean(
    club.iconUrl &&
    (club.iconUrl.startsWith('http://') ||
     club.iconUrl.startsWith('https://') ||
     club.iconUrl.startsWith('/'))
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          to="/clubs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Clubs
        </Link>

        {/* Club Banner Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="h-44 sm:h-56 relative bg-slate-200 dark:bg-slate-800">
            {club.bannerUrl ? (
              <img src={club.bannerUrl} alt={club.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 flex items-center justify-center text-3xl shadow-xl backdrop-blur-md overflow-hidden border border-white/20 flex-shrink-0">
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
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                    {club.category}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black mt-0.5">{club.name}</h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={club.isMember ? 'outline' : 'primary'}
                  isLoading={isUpdatingMembership}
                  onClick={handleToggleJoin}
                  className={club.isMember ? 'bg-white/20 text-white border-white/30 hover:bg-white/30' : ''}
                >
                  {club.isMember ? 'Joined (Member) ✓' : 'Join Club'}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
              {club.description}
            </p>

            {/* Club Leadership */}
            {club.leader && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Club Leadership:</span>
                <Link
                  to={`/profile/${club.leader.id}`}
                  className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:underline"
                >
                  <Avatar
                    src={club.leader.profile?.avatarUrl}
                    name={club.leader.profile?.fullName || 'Leader'}
                    size="xs"
                  />
                  <span>{club.leader.profile?.fullName}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Club Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-6 text-sm font-bold">
            <button
              onClick={() => setActiveTab('discussions')}
              className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
                activeTab === 'discussions'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Discussions ({club.discussions?.length || 0})</span>
              {activeTab === 'discussions' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
                activeTab === 'events'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Events ({club.events?.length || 0})</span>
              {activeTab === 'events' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
                activeTab === 'members'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Members ({club._count?.members || 0})</span>
              {activeTab === 'members' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>

          <div>
            {activeTab === 'discussions' && (
              <Button
                size="sm"
                onClick={() => setDiscussionModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Start Discussion
              </Button>
            )}
            {activeTab === 'events' && (
              <Button
                size="sm"
                onClick={() => setEventModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Schedule Event
              </Button>
            )}
          </div>
        </div>

        {/* Tab 1: Discussions */}
        {activeTab === 'discussions' && (
          <div className="space-y-4">
            {club.discussions?.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                No active discussions yet in this club. Start the conversation!
              </div>
            ) : (
              club.discussions.map((d: any) => (
                <div
                  key={d.id}
                  className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar
                      src={d.author.profile?.avatarUrl}
                      name={d.author.profile?.fullName || 'Student'}
                      size="xs"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {d.author.profile?.fullName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {d.title}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {d.content}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Events */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {club.events?.length === 0 ? (
              <div className="col-span-2 p-10 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                No upcoming events scheduled for this club yet.
              </div>
            ) : (
              club.events.map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {ev.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      Scheduled
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {ev.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>{formatEventDate(ev.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{ev.location}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Members */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {club.members?.map((m: any) => (
              <Link
                key={m.id}
                to={`/profile/${m.user.id}`}
                className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 hover:border-blue-400 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    src={m.user.profile?.avatarUrl}
                    name={m.user.profile?.fullName || m.user.email}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {m.user.profile?.fullName || m.user.email}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {m.user.profile?.grade} {m.user.profile?.section && `• ${m.user.profile.section}`}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0">
                  {m.role}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Discussion Modal */}
      <Modal
        isOpen={discussionModalOpen}
        onClose={() => setDiscussionModalOpen(false)}
        title="Start Club Discussion"
      >
        <form onSubmit={handleCreateDiscussion} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Discussion Topic / Question
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Brainstorming ideas for the science exhibition"
              value={discussionTitle}
              onChange={(e) => setDiscussionTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Details & Context
            </label>
            <textarea
              required
              rows={4}
              placeholder="Share what you'd like the club members to discuss..."
              value={discussionContent}
              onChange={(e) => setDiscussionContent(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setDiscussionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmittingDiscussion}>
              Post to Club
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Event Modal */}
      <Modal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        title="Schedule Club Event"
      >
        <form onSubmit={handleCreateEvent} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Weekend Robotics Build Workshop"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Campus Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lab 3 / Quad"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Event Description
            </label>
            <textarea
              rows={3}
              placeholder="What students should bring or prepare..."
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setEventModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmittingEvent}>
              Schedule Event
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
