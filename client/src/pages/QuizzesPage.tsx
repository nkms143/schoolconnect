import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Plus,
  Trophy,
  Calendar,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  Trash2,
  Filter,
  PlayCircle
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { Quiz, QuizDetail } from '../types/academic';
import { quizService } from '../services/quizService';
import { Button } from '../components/common/Button';
import { QuizTakeModal } from '../components/quizzes/QuizTakeModal';
import { QuizCreateModal } from '../components/quizzes/QuizCreateModal';

export const QuizzesPage: React.FC = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  // Modals
  const [selectedQuiz, setSelectedQuiz] = useState<QuizDetail | null>(null);
  const [isTakeOpen, setIsTakeOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [takingLoading, setTakingLoading] = useState(false);

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getQuizzes({
        status: statusFilter,
        subject: subjectFilter
      });
      setQuizzes(data);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [statusFilter, subjectFilter]);

  const handleStartQuiz = async (quizId: string) => {
    try {
      setTakingLoading(true);
      const details = await quizService.getQuizById(quizId);
      if (details) {
        setSelectedQuiz(details);
        setIsTakeOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to load quiz questions.');
    } finally {
      setTakingLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await quizService.deleteQuiz(quizId);
      fetchQuizzes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete quiz.');
    }
  };

  const subjects = [
    'ALL',
    'Science',
    'Mathematics',
    'Coding',
    'English',
    'Social Studies',
    'General Knowledge'
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Academic Competitions & Quizzes
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                School Quiz Competitions
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
                Compete in untimed Olympiad challenges, master subject concepts, and see your name on the school-wide competition leaderboard!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-bold transition-all shadow-sm"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                Quiz Leaderboard
              </Link>

              {isTeacherOrAdmin && (
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-md font-bold"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Conduct New Quiz
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
            {[
              { id: 'ALL', label: 'All Competitions' },
              { id: 'ACTIVE', label: '🟢 Live Now' },
              { id: 'UPCOMING', label: '⏳ Upcoming' },
              { id: 'ENDED', label: '🏆 Results Announced' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
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

        {/* Quizzes List */}
        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-slate-400">
            Loading competitions...
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No Quiz Competitions Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no competitions matching your current filters. Check back soon or switch filters!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {quizzes.map((quiz) => {
              const isUpcoming = quiz.status === 'UPCOMING';
              const isLive = quiz.status === 'ACTIVE';
              const isEnded = quiz.status === 'ENDED';

              return (
                <div
                  key={quiz.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Card Header Tags */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {quiz.subject}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {quiz.grade}
                        </span>
                      </div>

                      {/* Status Tag */}
                      {isLive && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 animate-pulse">
                          🟢 Live Contest
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          ⏳ Upcoming
                        </span>
                      )}
                      {isEnded && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          🏆 Results Out
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {quiz.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {quiz.description}
                      </p>
                    </div>

                    {/* Timeline & Metadata */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="block font-bold text-slate-400 text-[10px] uppercase">
                          Opens
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                          {new Date(quiz.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div>
                        <span className="block font-bold text-slate-400 text-[10px] uppercase">
                          Results Revealed
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                          {new Date(quiz.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
                      <span>{quiz.questionsCount} Questions • {quiz.totalPoints} Pts</span>
                      <span>{quiz.submissionsCount} Participants</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <Link
                      to={`/quizzes/${quiz.id}/leaderboard`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Award className="w-4 h-4" />
                      Leaderboard
                    </Link>

                    <div className="flex items-center gap-2">
                      {isTeacherOrAdmin && (
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Quiz"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {quiz.hasSubmitted ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isEnded
                            ? `Score: ${quiz.userScore}/${quiz.userMaxScore}`
                            : 'Submitted'}
                        </div>
                      ) : isLive ? (
                        <Button
                          size="sm"
                          onClick={() => handleStartQuiz(quiz.id)}
                          isLoading={takingLoading && selectedQuiz?.id === quiz.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                          rightIcon={<PlayCircle className="w-4 h-4" />}
                        >
                          Take Quiz
                        </Button>
                      ) : isUpcoming ? (
                        <span className="text-[11px] font-bold text-slate-400 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                          Locked
                        </span>
                      ) : (
                        <Link
                          to={`/quizzes/${quiz.id}/leaderboard`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition-colors"
                        >
                          View Results
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Untimed Quiz Take Modal */}
      {selectedQuiz && (
        <QuizTakeModal
          quiz={selectedQuiz}
          isOpen={isTakeOpen}
          onClose={() => {
            setIsTakeOpen(false);
            setSelectedQuiz(null);
          }}
          onSubmitted={() => {
            fetchQuizzes();
          }}
        />
      )}

      {/* Teacher Quiz Creator Modal */}
      <QuizCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          fetchQuizzes();
        }}
      />
    </Layout>
  );
};

