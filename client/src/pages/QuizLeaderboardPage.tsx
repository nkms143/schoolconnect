import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  Medal,
  Award,
  Calendar,
  ArrowLeft,
  Users,
  Search,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { quizService } from '../services/quizService';
import {
  QuizLeaderboardResponse,
  GlobalLeaderboardEntry,
  Quiz
} from '../types/academic';
import { Avatar } from '../components/common/Avatar';

export const QuizLeaderboardPage: React.FC = () => {
  const { quizId } = useParams<{ quizId?: string }>();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>(quizId || '');
  const [leaderboardData, setLeaderboardData] = useState<QuizLeaderboardResponse | null>(null);
  const [globalLeaders, setGlobalLeaders] = useState<GlobalLeaderboardEntry[]>([]);
  const [viewMode, setViewMode] = useState<'QUIZ' | 'GLOBAL'>(quizId ? 'QUIZ' : 'GLOBAL');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Load quizzes list for dropdown selector
  useEffect(() => {
    quizService.getQuizzes().then((res) => {
      setQuizzes(res);
      if (!selectedQuizId && res.length > 0) {
        // default to first ended quiz or first quiz
        const ended = res.find((q) => q.status === 'ENDED');
        setSelectedQuizId(ended ? ended.id : res[0].id);
      }
    });
  }, []);

  // Fetch leaderboard when quizId or viewMode changes
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        if (viewMode === 'QUIZ' && selectedQuizId) {
          const data = await quizService.getQuizLeaderboard(selectedQuizId);
          setLeaderboardData(data || null);
        } else if (viewMode === 'GLOBAL') {
          const data = await quizService.getGlobalLeaderboard();
          setGlobalLeaders(data);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedQuizId, viewMode]);

  const filteredQuizParticipants = (leaderboardData?.participants || []).filter((p) =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (p.grade && p.grade.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredGlobalLeaders = globalLeaders.filter((g) =>
    g.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (g.grade && g.grade.toLowerCase().includes(search.toLowerCase()))
  );

  const topThree = filteredQuizParticipants.slice(0, 3);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/quizzes"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Quizzes
          </Link>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setViewMode('QUIZ')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                viewMode === 'QUIZ'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Competition Results
            </button>
            <button
              onClick={() => setViewMode('GLOBAL')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                viewMode === 'GLOBAL'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Overall Academic Hall of Fame
            </button>
          </div>
        </div>

        {/* Hero Podium Header */}
        <div className="rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-2">
                <Trophy className="w-3.5 h-3.5 text-amber-200" />
                Official School Leaderboard
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Academic Competition Leaderboard
              </h1>
              <p className="text-xs sm:text-sm text-orange-100 mt-1 max-w-xl">
                Celebrating academic excellence, speed, and dedication across all student participants.
              </p>
            </div>

            {viewMode === 'QUIZ' && quizzes.length > 0 && (
              <div className="bg-white/20 backdrop-blur-md p-2 rounded-2xl border border-white/20">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-100 mb-1 px-1">
                  Select Quiz:
                </label>
                <select
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-xs rounded-xl px-3 py-2 border-none focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer max-w-xs"
                >
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title} ({q.status})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 text-center text-xs font-semibold text-slate-400">
            Loading rankings and results...
          </div>
        ) : viewMode === 'QUIZ' && leaderboardData?.isCompetitionActive ? (
          /* Active Competition Announcement Guard */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-4 max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Competition In Progress
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                To guarantee equal fairness and prevent answer sharing among students, the official leaderboard and answer breakdown for{' '}
                <strong>"{leaderboardData.quizTitle}"</strong> will be announced on:
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-blue-600 dark:text-blue-400">
                <Calendar className="w-4 h-4" />
                {new Date(leaderboardData.endDate).toLocaleString([], {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Total participants so far: <strong>{leaderboardData.totalParticipants} students</strong>
            </p>
          </div>
        ) : viewMode === 'QUIZ' ? (
          /* Official Concluded Quiz Leaderboard */
          <div className="space-y-6">
            {/* Top 3 Winners Podium Cards */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-4">
                {/* 2nd Place */}
                {topThree[1] && (
                  <div className="order-2 sm:order-1 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm text-center relative overflow-hidden flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-300 mb-2">
                      🥈 2nd
                    </div>
                    <Avatar
                      src={topThree[1].avatarUrl}
                      name={topThree[1].fullName}
                      size="lg"
                    />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2 truncate max-w-full">
                      {topThree[1].fullName}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {topThree[1].grade} {topThree[1].section && `• ${topThree[1].section}`}
                    </p>
                    <div className="mt-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-300">
                      {topThree[1].score} pts ({topThree[1].percentage}%)
                    </div>
                  </div>
                )}

                {/* 1st Place (Champion) */}
                {topThree[0] && (
                  <div className="order-1 sm:order-2 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900 rounded-3xl p-6 border-2 border-amber-400 dark:border-amber-600 shadow-lg text-center relative overflow-hidden flex flex-col items-center sm:-translate-y-2">
                    <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-sm font-black shadow-md mb-2">
                      🥇 1st
                    </div>
                    <Avatar
                      src={topThree[0].avatarUrl}
                      name={topThree[0].fullName}
                      size="xl"
                    />
                    <h4 className="text-base font-black text-slate-900 dark:text-slate-100 mt-2 truncate max-w-full">
                      {topThree[0].fullName}
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-bold">
                      Winner & Champion • {topThree[0].grade}
                    </p>
                    <div className="mt-3 px-4 py-1.5 rounded-2xl bg-amber-400 text-slate-950 text-sm font-black shadow-sm">
                      {topThree[0].score} pts ({topThree[0].percentage}%)
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <div className="order-3 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm text-center relative overflow-hidden flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950 border border-orange-300 dark:border-orange-800 flex items-center justify-center text-xs font-black text-orange-700 dark:text-orange-300 mb-2">
                      🥉 3rd
                    </div>
                    <Avatar
                      src={topThree[2].avatarUrl}
                      name={topThree[2].fullName}
                      size="lg"
                    />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2 truncate max-w-full">
                      {topThree[2].fullName}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {topThree[2].grade} {topThree[2].section && `• ${topThree[2].section}`}
                    </p>
                    <div className="mt-2 px-3 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-xs font-black text-orange-700 dark:text-orange-300">
                      {topThree[2].score} pts ({topThree[2].percentage}%)
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Complete Participant Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    All Participants Ranking ({filteredQuizParticipants.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Showing full rankings for every student who submitted answers.
                  </p>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search participant..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {filteredQuizParticipants.length === 0 ? (
                <div className="py-12 text-center text-xs font-semibold text-slate-400">
                  No participants found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Grade / Section</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Percentage</th>
                        <th className="py-3 px-4">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredQuizParticipants.map((p) => (
                        <tr
                          key={p.submissionId}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-black">
                            {p.rank === 1 ? (
                              <span className="text-amber-500 font-extrabold flex items-center gap-1">
                                🥇 #1
                              </span>
                            ) : p.rank === 2 ? (
                              <span className="text-slate-500 font-extrabold flex items-center gap-1">
                                🥈 #2
                              </span>
                            ) : p.rank === 3 ? (
                              <span className="text-orange-600 font-extrabold flex items-center gap-1">
                                🥉 #3
                              </span>
                            ) : (
                              <span className="text-slate-500">#{p.rank}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Link
                              to={`/profile/${p.studentId}`}
                              className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors"
                            >
                              <Avatar src={p.avatarUrl} name={p.fullName} size="sm" />
                              <span>{p.fullName}</span>
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-medium">
                            {p.grade || '—'} {p.section && `(${p.section})`}
                          </td>
                          <td className="py-3 px-4 font-black text-blue-600 dark:text-blue-400">
                            {p.score} / {p.maxScore}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              {p.percentage}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {new Date(p.completedAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Global Academic Hall of Fame Table */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Global School Competition Hall of Fame
                </h3>
                <p className="text-xs text-slate-500">
                  Overall points accumulated across all completed school competitions.
                </p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            {filteredGlobalLeaders.length === 0 ? (
              <div className="py-12 text-center text-xs font-semibold text-slate-400">
                No rankings recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4">Total Points</th>
                      <th className="py-3 px-4">Contests Attempted</th>
                      <th className="py-3 px-4">Top Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredGlobalLeaders.map((lead) => (
                      <tr
                        key={lead.studentId}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-black">
                          {lead.rank === 1 ? (
                            <span className="text-amber-500 font-extrabold">🥇 #1</span>
                          ) : lead.rank === 2 ? (
                            <span className="text-slate-500 font-extrabold">🥈 #2</span>
                          ) : lead.rank === 3 ? (
                            <span className="text-orange-600 font-extrabold">🥉 #3</span>
                          ) : (
                            <span className="text-slate-500">#{lead.rank}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/profile/${lead.studentId}`}
                            className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors"
                          >
                            <Avatar src={lead.avatarUrl} name={lead.fullName} size="sm" />
                            <span>{lead.fullName}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium">
                          {lead.grade || 'Student'}
                        </td>
                        <td className="py-3 px-4 font-black text-amber-600 dark:text-amber-400">
                          {lead.totalPoints} pts
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">
                          {lead.quizzesTaken}
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-600">
                          {lead.topScore} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

