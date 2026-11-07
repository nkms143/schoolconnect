import React, { useState } from 'react';
import { Image, Tag, Send, Users, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { postService } from '../../services/postService';
import { Post } from '../../types';

interface CreatePostCardProps {
  onPostCreated: (post: Post) => void;
  defaultClubId?: string;
}

const COMMON_TAGS = ['#SchoolLife', '#CodingClub', '#ScienceFair', '#EcoCampus', '#SportsDay', '#ArtsExhibition'];

export const CreatePostCard: React.FC<CreatePostCardProps> = ({ onPostCreated, defaultClubId }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedClub, setSelectedClub] = useState(defaultClubId || '');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (!user) return null;

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      const uploadedUrl = await postService.uploadImage(file);
      setImageUrl(uploadedUrl);
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;

    try {
      setIsSubmitting(true);
      const hashtagsString = selectedTags.length > 0 ? selectedTags.join(',') : undefined;

      const newPost = await postService.createPost({
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        clubId: selectedClub || undefined,
        hashtags: hashtagsString
      });

      if (newPost) {
        onPostCreated(newPost);
        setContent('');
        setImageUrl('');
        setShowImageInput(false);
        setSelectedTags([]);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex gap-3">
        <Avatar
          src={user.profile?.avatarUrl}
          name={user.profile?.fullName || user.email}
          size="md"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's happening at school, ${user.profile?.fullName?.split(' ')[0] || 'student'}?`}
            rows={3}
            className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 p-3 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-sm resize-none"
          />

          {/* Image preview */}
          {imageUrl && (
            <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-60 bg-black/5">
              <img src={imageUrl} alt="Upload preview" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/70 text-white rounded-full hover:bg-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Optional Direct URL Input */}
          {showImageInput && !imageUrl && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Paste image URL (e.g. Unsplash or web link)..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowImageInput(false)}
                className="text-xs text-slate-400 hover:text-slate-600 px-2"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Quick Hashtags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {COMMON_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              {/* Photo Upload via File */}
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors">
                <Image className="w-4 h-4 text-emerald-500" />
                <span>Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Photo by URL button */}
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                (or Image Link)
              </button>

              {/* Club selector if user has clubs */}
              {user.clubs && user.clubs.length > 0 && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-2.5 py-1 text-xs">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="bg-transparent text-slate-700 dark:text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="">General Feed</option>
                    {user.clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={(!content.trim() && !imageUrl) || isSubmitting}
              isLoading={isSubmitting}
              size="sm"
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
