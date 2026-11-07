import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Search, Shield, Loader2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Avatar } from '../components/common/Avatar';
import { ChatWindow } from '../components/chat/ChatWindow';
import { messageService } from '../services/messageService';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { Conversation } from '../types';

export const MessagesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const chatWithId = searchParams.get('chatWith');
  const { isOnline } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);

      if (chatWithId) {
        // Fetch target user directly if not in existing conversations
        const match = data.find(c => c.user.id === chatWithId);
        if (match) {
          setActiveUser(match.user);
        } else {
          const res = await api.get<any>(`/api/v1/users/${chatWithId}`);
          if (res.data) {
            setActiveUser({
              id: res.data.id,
              email: res.data.email,
              role: res.data.role,
              profile: res.data.profile
            });
          }
        }
      } else if (data.length > 0 && !activeUser) {
        setActiveUser(data[0].user);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [chatWithId]);

  const filteredConversations = conversations.filter(c =>
    (c.user.profile?.fullName || c.user.email).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout showRightSidebar={false}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row h-[700px] transition-colors">
        {/* Left List of Conversations */}
        <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center justify-between">
              <span>Messages</span>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {conversations.length} chats
              </span>
            </h2>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading chats...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active conversations yet. Visit the Friends page to start a chat!
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = activeUser?.id === c.user.id;
                const online = isOnline(c.user.id);

                return (
                  <div
                    key={c.user.id}
                    onClick={() => setActiveUser(c.user)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-blue-50/80 dark:bg-blue-950/40'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Avatar
                      src={c.user.profile?.avatarUrl}
                      name={c.user.profile?.fullName || c.user.email}
                      size="md"
                      isOnline={online}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {c.user.profile?.fullName || c.user.email}
                        </p>
                        {c.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {c.lastMessage?.content || 'No messages'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Chat Window */}
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900">
          {activeUser ? (
            <ChatWindow targetUser={activeUser} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Your Direct Conversations
              </h3>
              <p className="text-xs max-w-sm mt-1">
                Select a classmate from the left list to view your chat history or start typing.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
