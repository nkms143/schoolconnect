import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, UserPlus, Users, MessageSquare, Trash2, Check, X, Loader2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Avatar } from '../components/common/Avatar';
import { RoleBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { friendService } from '../services/friendService';
import { Friend, FriendRequest } from '../types';

export const FriendsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'suggestions'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingReceived, setPendingReceived] = useState<FriendRequest[]>([]);
  const [pendingSent, setPendingSent] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [friendsData, requestsData, suggestionsData] = await Promise.all([
        friendService.getFriends(),
        friendService.getPendingRequests(),
        friendService.getSuggestions()
      ]);
      setFriends(friendsData);
      setPendingReceived(requestsData.received || []);
      setPendingSent(requestsData.sent || []);
      setSuggestions(suggestionsData);
    } catch (err) {
      console.error('Failed to load friends data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      await friendService.acceptRequest(requestId);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await friendService.rejectRequest(requestId);
      setPendingReceived(prev => prev.filter(r => r.id !== requestId));
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await friendService.sendRequest(userId);
      setSuggestions(prev => prev.filter(s => s.id !== userId));
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to send request');
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    if (!window.confirm('Remove this classmate connection?')) return;
    try {
      await friendService.removeFriend(friendshipId);
      setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId));
    } catch (err: any) {
      alert(err.message || 'Failed to remove connection');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            School Friends & Connections
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build your peer network, find project teammates, and chat with classmates.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('friends')}
            className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
              activeTab === 'friends'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>My Connections ({friends.length})</span>
            {activeTab === 'friends' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pending Requests ({pendingReceived.length})</span>
            {pendingReceived.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
            {activeTab === 'pending' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('suggestions')}
            className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
              activeTab === 'suggestions'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Suggested Classmates ({suggestions.length})</span>
            {activeTab === 'suggestions' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Tab 1: My Friends */}
        {activeTab === 'friends' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friends.length === 0 ? (
              <div className="col-span-2 p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                You have not connected with any classmates yet. Check out Suggested Classmates!
              </div>
            ) : (
              friends.map((f) => (
                <div
                  key={f.friendshipId}
                  className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3"
                >
                  <Link to={`/profile/${f.user.id}`} className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={f.user.profile?.avatarUrl}
                      name={f.user.profile?.fullName || f.user.email}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate hover:underline">
                        {f.user.profile?.fullName || f.user.email}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {f.user.profile?.grade} {f.user.profile?.section && `• ${f.user.profile.section}`}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/messages?chatWith=${f.user.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors"
                      title="Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleRemoveFriend(f.friendshipId)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                      title="Remove Connection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Pending Requests */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Received Connection Requests ({pendingReceived.length})
              </h3>
              {pendingReceived.length === 0 ? (
                <p className="text-xs text-slate-400 p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  No pending requests waiting for your approval.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pendingReceived.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          src={req.sender?.profile?.avatarUrl}
                          name={req.sender?.profile?.fullName || 'Student'}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {req.sender?.profile?.fullName}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {req.sender?.profile?.grade} • {req.sender?.profile?.section}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAccept(req.id)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pendingSent.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Sent Requests ({pendingSent.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pendingSent.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span>Sent to: <strong>{req.receiver?.profile?.fullName}</strong></span>
                      <span className="text-amber-600 font-semibold">Pending Response</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Suggested Classmates */}
        {activeTab === 'suggestions' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.length === 0 ? (
              <div className="col-span-3 p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                No suggested classmates right now.
              </div>
            ) : (
              suggestions.map((student) => (
                <div
                  key={student.id}
                  className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={student.profile?.avatarUrl}
                      name={student.profile?.fullName || student.email}
                      size="md"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/profile/${student.id}`}
                        className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate block hover:underline"
                      >
                        {student.profile?.fullName}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {student.profile?.grade} {student.profile?.section && `• ${student.profile.section}`}
                      </p>
                      {student.clubs && student.clubs.length > 0 && (
                        <p className="text-[11px] text-blue-500 font-medium truncate mt-1">
                          Club: {student.clubs.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleSendRequest(student.id)}
                      leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
