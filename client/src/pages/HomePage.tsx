import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { CreatePostCard } from '../components/feed/CreatePostCard';
import { PostCard } from '../components/feed/PostCard';
import { postService } from '../services/postService';
import { Post } from '../types';
import { Sparkles, Hash, Loader2 } from 'lucide-react';

const POPULAR_TAGS = ['All', '#CodingClub', '#ScienceFair', '#EcoClub', '#SportsDay', '#SchoolLife'];

export const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');

  const fetchFeed = async (tag?: string) => {
    try {
      setLoading(true);
      const hashtag = tag && tag !== 'All' ? tag.replace('#', '') : undefined;
      const data = await postService.getFeed({ hashtag });
      setPosts(data);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(selectedTag);
  }, [selectedTag]);

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <Layout>
      <div className="space-y-5">
        {/* Post Creation Box */}
        <CreatePostCard onPostCreated={handlePostCreated} />

        {/* Filter by Hashtag Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
            <Hash className="w-3.5 h-3.5" />
            <span>Feed Filter:</span>
          </div>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-xs font-semibold">Loading school posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
            <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No posts found {selectedTag !== 'All' && `for ${selectedTag}`}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Be the first student to publish a thought, project showcase, or club update!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
