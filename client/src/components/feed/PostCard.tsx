import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
  Flag,
  Send,
  Users
} from 'lucide-react';
import { Post, Comment } from '../../types';
import { Avatar } from '../common/Avatar';
import { RoleBadge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { adminService } from '../../services/adminService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const canDelete =
    user?.id === post.author.id ||
    user?.role === 'ADMIN' ||
    user?.role === 'TEACHER';

  const handleLike = async () => {
    if (!user) return;
    // Optimistic UI
    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await postService.toggleLike(post.id);
      if (res) {
        setIsLiked(res.isLiked);
        setLikesCount(res.likesCount);
      }
    } catch (err) {
      // Revert if failed
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const res = await postService.addComment(post.id, newComment.trim());
      if (res) {
        setComments(prev => [...prev, res.comment]);
        setCommentsCount(res.commentsCount);
        setNewComment('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postService.deletePost(post.id);
      onPostDeleted?.(post.id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete post');
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    try {
      setIsReporting(true);
      await adminService.reportContent('POST', post.id, reportReason.trim());
      setReportModalOpen(false);
      setReportReason('');
      alert('Thank you. The post has been flagged for school moderation.');
    } catch (err: any) {
      alert(err.message || 'Report submission failed');
    } finally {
      setIsReporting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/#post-${post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <article
      id={`post-${post.id}`}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors"
    >
      {/* Post Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.author.id}`}>
              <Avatar
                src={post.author.profile?.avatarUrl}
                name={post.author.profile?.fullName || post.author.email}
                size="md"
              />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={`/profile/${post.author.id}`}
                  className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {post.author.profile?.fullName || post.author.email}
                </Link>
                <RoleBadge role={post.author.role} size="sm" />
              </div>
              <p className="text-xs text-slate-400">
                {post.author.profile?.grade} {post.author.profile?.section && `• ${post.author.profile.section}`} • {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          {/* More actions menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowMenu(false)}
              >
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Post
                  </button>
                )}
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-left"
                >
                  <Flag className="w-4 h-4" /> Report Inappropriate
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Club Tag if posted inside a club */}
        {post.club && (
          <Link
            to={`/clubs/${post.club.slug}`}
            className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 hover:bg-indigo-100 transition-colors"
          >
            <Users className="w-3 h-3" />
            <span>{post.club.name}</span>
          </Link>
        )}

        {/* Post Text Content */}
        <p className="mt-3 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
          {post.content}
        </p>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {post.hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="mt-2 bg-slate-100 dark:bg-slate-950">
          <img
            src={post.imageUrl}
            alt="Post media"
            className="w-full max-h-[500px] object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Post Actions Stats & Buttons */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold transition-all active:scale-90 ${
              isLiked
                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{commentsCount}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Copy link"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Comments Drawer / Section */}
      {showComments && (
        <div className="px-5 pb-4 pt-2 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800">
          {/* Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <Avatar
              src={user?.profile?.avatarUrl}
              name={user?.profile?.fullName || 'User'}
              size="sm"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Write a constructive, respectful comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 text-xs">
                  <Avatar
                    src={c.author.profile?.avatarUrl}
                    name={c.author.profile?.fullName || 'Student'}
                    size="xs"
                  />
                  <div className="flex-1 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-slate-100 mr-2">
                      {c.author.profile?.fullName || 'Student'}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{c.content}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Content to School Moderator"
      >
        <form onSubmit={handleReport} className="space-y-4">
          <p className="text-xs text-slate-500">
            Greenfield SchoolConnect is a protected educational environment. Please specify why this
            post violates school community guidelines.
          </p>
          <textarea
            required
            rows={3}
            placeholder="Reason (e.g. bullying, inappropriate language, false exam information)..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={isReporting}>
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </article>
  );
};
