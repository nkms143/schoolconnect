import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Award,
  Calendar,
  Check,
  Send
} from 'lucide-react';
import { QuizDetail } from '../../types/academic';
import { quizService } from '../../services/quizService';
import { Button } from '../common/Button';

interface QuizTakeModalProps {
  quiz: QuizDetail;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export const QuizTakeModal: React.FC<QuizTakeModalProps> = ({
  quiz,
  isOpen,
  onClose,
  onSubmitted
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    score: number;
    maxScore: number;
    isResultsReleased: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentQ = quiz.questions[currentIdx];
  const totalQ = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIdx + 1) / totalQ) * 100);

  const handleSelectOption = (optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIdx
    }));
  };

  const handleSubmit = async () => {
    if (answeredCount < totalQ) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${totalQ} questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const payload = Object.entries(selectedAnswers).map(([questionId, selectedIndex]) => ({
        questionId,
        selectedIndex
      }));

      const res = await quizService.submitQuiz(quiz.id, payload);
      setSubmitResult({
        score: res.data?.score ?? 0,
        maxScore: res.data?.maxScore ?? quiz.totalPoints,
        isResultsReleased: Boolean(res.data?.isResultsReleased),
        message: res.message || 'Quiz submitted successfully!'
      });
      onSubmitted();
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                {quiz.subject}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {quiz.grade}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 truncate max-w-md">
              {quiz.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {submitResult ? (
            /* Post-Submission Result State */
            <div className="text-center py-8 px-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-slate-100">
                  {submitResult.isResultsReleased
                    ? 'Quiz Results Released!'
                    : 'Competition Answers Submitted!'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {submitResult.message}
                </p>
              </div>

              {submitResult.isResultsReleased ? (
                <div className="inline-flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Your Final Score</p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {submitResult.score} / {submitResult.maxScore}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Percentage</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {submitResult.maxScore > 0
                        ? Math.round((submitResult.score / submitResult.maxScore) * 100)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 max-w-md mx-auto text-left flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                      Results Scheduled Announcement
                    </h5>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                      To keep the competition fair while other students participate, the final leaderboard and correct answers will be published on{' '}
                      <strong>{new Date(quiz.endDate).toLocaleString()}</strong>.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-center gap-3">
                <Button onClick={onClose} variant="secondary">
                  Close Window
                </Button>
                <a
                  href={`/quizzes/${quiz.id}/leaderboard`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Award className="w-4 h-4" />
                  View Competition Leaderboard
                </a>
              </div>
            </div>
          ) : (
            /* Active Untimed Answering State */
            <>
              {/* Progress Bar & Counter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>
                    Question <strong className="text-slate-900 dark:text-slate-100">{currentIdx + 1}</strong> of {totalQ}
                  </span>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    {answeredCount} of {totalQ} Answered
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Question #{currentIdx + 1}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                    +{currentQ.points} Points
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {currentQ.questionText}
                </h4>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select your answer (Untimed):
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {currentQ.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentQ.id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(oIdx)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 dark:border-blue-500 shadow-sm ring-1 ring-blue-500/50'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-semibold transition-colors ${
                              isSelected
                                ? 'text-blue-900 dark:text-blue-100 font-bold'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {opt}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!submitResult && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {currentIdx < totalQ - 1 ? (
                <Button
                  onClick={() => setCurrentIdx((prev) => Math.min(totalQ - 1, prev + 1))}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

