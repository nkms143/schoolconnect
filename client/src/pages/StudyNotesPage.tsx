import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  ThumbsUp,
  ExternalLink,
  Download,
  Trash2,
  Filter,
  Sparkles,
  FileText
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { StudyNote } from '../types/academic';
import { noteService } from '../services/noteService';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { NoteUploadModal } from '../components/notes/NoteUploadModal';

export const StudyNotesPage: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'helpful' | 'recent'>('helpful');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await noteService.getNotes({
        subject: subjectFilter,
        grade: gradeFilter,
        search,
        sortBy
      });
      setNotes(data);
    } catch (err) {
      console.error('Failed to load study notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes();
    }, 200);
    return () => clearTimeout(timer);
  }, [subjectFilter, gradeFilter, search, sortBy]);

  const handleToggleVote = async (noteId: string) => {
    try {
      // Optimistic update
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== noteId) return n;
          const newVoted = !n.hasVoted;
          const newCount = newVoted ? n.helpfulCount + 1 : Math.max(0, n.helpfulCount - 1);
          return { ...n, hasVoted: newVoted, helpfulCount: newCount };
        })
      );
      await noteService.toggleHelpfulVote(noteId);
    } catch (err) {
      console.error('Vote failed:', err);
      fetchNotes();
    }
  };

  const handleDeleteNote = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await noteService.deleteNote(id);
      fetchNotes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete note.');
    }
  };

  const subjects = [
    'ALL',
    'Science',
    'Mathematics',
    'Coding',
    'English',
    'Social Studies'
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 p-6 sm:p-8 text-white shadow-xl shadow-purple-500/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                Digital Learning Library & Study Guides
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Study Notes & Revision Hub
              </h1>
              <p className="text-xs sm:text-sm text-purple-100 mt-1 leading-relaxed">
                Access chapter summaries, exam cheat-sheets, and curated formulas shared by teachers and top classmates. Upvote the most helpful guides!
              </p>
            </div>

            <Button
              onClick={() => setIsUploadOpen(true)}
              className="bg-white text-purple-600 hover:bg-purple-50 shadow-md font-bold self-start md:self-auto"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Share Revision Notes
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by chapter, topic, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold self-start sm:self-auto">
              <button
                onClick={() => setSortBy('helpful')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  sortBy === 'helpful'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                👍 Most Helpful
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  sortBy === 'recent'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                ✨ Newest
              </button>
            </div>
          </div>

          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Subject:
            </span>
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSubjectFilter(sub)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  subjectFilter === sub
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-slate-400">
            Loading study notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No Study Notes Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No revision guides match your query. Be the first to share notes with your classmates!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Tags */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {note.subject}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {note.fileType}
                    </span>
                  </div>

                  {/* Title & Chapter */}
                  <div>
                    {note.chapter && (
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block mb-0.5 truncate">
                        {note.chapter}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {note.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-3">
                      {note.description}
                    </p>
                  </div>

                  {/* Author Card */}
                  <div className="flex items-center gap-2 pt-1">
                    <Avatar
                      src={note.author.profile?.avatarUrl}
                      name={note.author.profile?.fullName || note.author.email}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {note.author.profile?.fullName || 'Teacher / Student'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {note.author.profile?.grade || note.grade}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {/* Helpful Vote Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleVote(note.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      note.hasVoted
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${
                        note.hasVoted ? 'fill-purple-600 dark:fill-purple-400' : ''
                      }`}
                    />
                    <span>{note.helpfulCount} Helpful</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {(user?.id === note.author.id || user?.role === 'ADMIN') && (
                      <button
                        onClick={() => handleDeleteNote(note.id, note.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <a
                      href={note.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Note
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Note Modal */}
      <NoteUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={() => {
          fetchNotes();
        }}
      />
    </Layout>
  );
};

