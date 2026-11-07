import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit3,
  UserPlus,
  MessageSquare,
  BookOpen,
  Calendar,
  Sparkles,
  Check,
  Clock,
  Layers,
  Users
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Avatar } from '../components/common/Avatar';
import { RoleBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { PostCard } from '../components/feed/PostCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { friendService } from '../services/friendService';
import { postService } from '../services/postService';
import { Post } from '../types';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const targetId = userId || currentUser?.id;
  const isMe = currentUser?.id === targetId;

  const [profileData, setProfileData] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'clubs'>('posts');
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<string>('NONE');
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchProfile = async () => {
    if (!targetId) return;
    try {
      setLoading(true);
      const res = await api.get<any>(`/api/v1/users/${targetId}`);
      if (res.data) {
        setProfileData(res.data);
        setConnectionStatus(res.data.connectionStatus);

        setFullName(res.data.profile?.fullName || '');
        setGrade(res.data.profile?.grade || '');
        setSection(res.data.profile?.section || '');
        setBio(res.data.profile?.bio || '');
        setInterests(res.data.profile?.interests || '');
        setAvatarUrl(res.data.profile?.avatarUrl || '');
      }

      // Fetch user's posts
      const userPosts = await postService.getFeed({ authorId: targetId });
      setPosts(userPosts);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetId]);

  const handleConnect = async () => {
    if (!targetId || isConnecting) return;
    try {
      setIsConnecting(true);
      await friendService.sendRequest(targetId);
      setConnectionStatus('REQUEST_SENT');
    } catch (err: any) {
      alert(err.message || 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.put('/api/v1/users/profile', {
        fullName,
        grade,
        section,
        bio,
        interests,
        avatarUrl
      });
      setEditModalOpen(false);
      await refreshUser();
      await fetchProfile();
    } catch (err: any) {
      alert(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !profileData) {
    return (
      <Layout>
        <div className="py-20 text-center text-slate-400">Loading student profile...</div>
      </Layout>
    );
  }

  const interestTags = profileData.profile?.interests
    ? profileData.profile.interests.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Profile Header Banner Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="h-36 sm:h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4 text-center sm:text-left">
              <Avatar
                src={profileData.profile?.avatarUrl}
                name={profileData.profile?.fullName || profileData.email}
                size="xl"
                className="ring-4 ring-white dark:ring-slate-900 shadow-lg"
              />

              <div className="flex items-center gap-2">
                {isMe ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditModalOpen(true)}
                    leftIcon={<Edit3 className="w-4 h-4" />}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    {connectionStatus === 'FRIENDS' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <Check className="w-3.5 h-3.5" /> Classmates Connected
                      </span>
                    )}

                    {connectionStatus === 'REQUEST_SENT' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        <Clock className="w-3.5 h-3.5" /> Request Pending
                      </span>
                    )}

                    {connectionStatus === 'NONE' && (
                      <Button
                        size="sm"
                        onClick={handleConnect}
                        isLoading={isConnecting}
                        leftIcon={<UserPlus className="w-4 h-4" />}
                      >
                        Connect
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/messages?chatWith=${profileData.id}`)}
                      leftIcon={<MessageSquare className="w-4 h-4" />}
                    >
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                  {profileData.profile?.fullName || profileData.email}
                </h1>
                <RoleBadge role={profileData.role} size="md" />
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap justify-center sm:justify-start">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  {profileData.profile?.grade || 'Class'} • {profileData.profile?.section || 'Section'}
                </span>
                <span>•</span>
                <span>{profileData.email}</span>
              </div>

              {profileData.profile?.bio && (
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed pt-1">
                  {profileData.profile.bio}
                </p>
              )}

              {/* Interests & Hobbies Tags */}
              {interestTags.length > 0 && (
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Interests & Hobbies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {interestTags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Counters */}
              <div className="flex gap-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="font-black text-slate-900 dark:text-slate-100 text-sm">
                    {profileData.stats?.postsCount || 0}
                  </span>{' '}
                  <span className="text-slate-500">Posts</span>
                </div>
                <div>
                  <span className="font-black text-slate-900 dark:text-slate-100 text-sm">
                    {profileData.stats?.friendsCount || 0}
                  </span>{' '}
                  <span className="text-slate-500">Connections</span>
                </div>
                <div>
                  <span className="font-black text-slate-900 dark:text-slate-100 text-sm">
                    {profileData.clubs?.length || 0}
                  </span>{' '}
                  <span className="text-slate-500">Clubs Joined</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'posts'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Posts ({posts.length})
            {activeTab === 'posts' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('clubs')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'clubs'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Clubs ({profileData.clubs?.length || 0})
            {activeTab === 'clubs' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' ? (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                No posts shared yet by this student.
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
                />
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profileData.clubs?.map((club: any) => (
              <div
                key={club.id}
                onClick={() => navigate(`/clubs/${club.slug}`)}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 cursor-pointer shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{club.name}</h4>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                    {club.role || 'Member'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{club.category}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Student Profile">
        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Class / Grade
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. 10th"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Section
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. Section A"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other students about your goals, passions, and background..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Interests & Hobbies (Comma separated)
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Robotics, Chess, Physics, Watercolor, Football"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Profile Photo URL
            </label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSaving}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
