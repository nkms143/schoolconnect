import React, { useState, useEffect, useRef } from 'react';
import { Send, Shield } from 'lucide-react';
import { Message } from '../../types';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { messageService } from '../../services/messageService';

interface ChatWindowProps {
  targetUser: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string;
      grade?: string;
      section?: string;
    };
  };
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ targetUser }) => {
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!targetUser?.id) return;

    messageService.getMessages(targetUser.id).then((data) => {
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    });

    if (socket) {
      const handleReceive = (msg: Message) => {
        if (msg.senderId === targetUser.id) {
          setMessages((prev) => [...prev, msg]);
          scrollToBottom();
        }
      };

      const handleTyping = (data: { senderId: string }) => {
        if (data.senderId === targetUser.id) {
          setIsTyping(true);
        }
      };

      const handleStopTyping = (data: { senderId: string }) => {
        if (data.senderId === targetUser.id) {
          setIsTyping(false);
        }
      };

      socket.on('receive_message', handleReceive);
      socket.on('user_typing', handleTyping);
      socket.on('user_stopped_typing', handleStopTyping);

      return () => {
        socket.off('receive_message', handleReceive);
        socket.off('user_typing', handleTyping);
        socket.off('user_stopped_typing', handleStopTyping);
      };
    }
  }, [targetUser?.id, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user || isSending) return;

    const messageText = content.trim();
    setContent('');

    try {
      setIsSending(true);
      const sent = await messageService.sendMessage(targetUser.id, messageText);
      if (sent) {
        setMessages((prev) => [...prev, sent]);

        // Broadcast to receiver via socket
        if (socket) {
          socket.emit('private_message', {
            receiverId: targetUser.id,
            message: sent
          });
          socket.emit('typing_stop', { receiverId: targetUser.id });
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    if (socket && targetUser) {
      if (e.target.value.length > 0) {
        socket.emit('typing_start', { receiverId: targetUser.id });
      } else {
        socket.emit('typing_stop', { receiverId: targetUser.id });
      }
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const recipientOnline = isOnline(targetUser.id);

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <Avatar
            src={targetUser.profile?.avatarUrl}
            name={targetUser.profile?.fullName || targetUser.email}
            size="md"
            isOnline={recipientOnline}
          />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {targetUser.profile?.fullName || targetUser.email}
            </h3>
            <p className="text-xs text-slate-400">
              {recipientOnline ? (
                <span className="text-emerald-500 font-semibold">Active now</span>
              ) : (
                'Offline'
              )}{' '}
              {targetUser.profile?.grade && `• ${targetUser.profile.grade}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          <Shield className="w-3.5 h-3.5 text-blue-500" />
          <span>Encrypted School Chat</span>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-slate-950/20">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
            <Avatar
              src={targetUser.profile?.avatarUrl}
              name={targetUser.profile?.fullName || targetUser.email}
              size="lg"
            />
            <h4 className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              {targetUser.profile?.fullName}
            </h4>
            <p className="text-xs max-w-xs mt-1">
              Start a friendly conversation with your classmate. Remember to follow school guidelines!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {formatTime(msg.createdAt)} {isMe && (msg.isRead ? '• Read' : '• Sent')}
                </span>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
            <span>{targetUser.profile?.fullName?.split(' ')[0]} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 items-center"
      >
        <input
          type="text"
          placeholder="Type a message to your classmate..."
          value={content}
          onChange={handleInputChange}
          className="flex-1 px-4 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!content.trim() || isSending}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-sm"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
