import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ExternalLink,
  Award,
  AlertCircle,
  FileText,
  Clock,
  Save
} from 'lucide-react';
import { AssignmentDetail, AssignmentSubmission } from '../../types/academic';
import { assignmentService } from '../../services/assignmentService';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

interface AssignmentGradeDrawerProps {
  assignment: AssignmentDetail;
  isOpen: boolean;
  onClose: () => void;
  onGraded: () => void;
}

export const AssignmentGradeDrawer: React.FC<AssignmentGradeDrawerProps> = ({
  assignment,
  isOpen,
  onClose,
  onGraded
}) => {
  const [selectedSub, setSelectedSub] = useState<AssignmentSubmission | null>(
    assignment.submissions && assignment.submissions.length > 0
      ? assignment.submissions[0]
      : null
  );
  const [gradeInput, setGradeInput] = useState<number>(selectedSub?.grade ?? 0);
  const [feedbackInput, setFeedbackInput] = useState<string>(selectedSub?.feedback ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectSubmission = (sub: AssignmentSubmission) => {
    setSelectedSub(sub);
    setGradeInput(sub.grade ?? assignment.maxPoints);
    setFeedbackInput(sub.feedback ?? '');
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSaveGrade = async () => {
    if (!selectedSub) return;
    try {
      setIsSaving(true);
      setErrorMsg('');
      await assignmentService.gradeSubmission(selectedSub.id, {
        grade: Number(gradeInput),
        feedback: feedbackInput
      });
      setSuccessMsg('Grade and feedback saved successfully!');
      onGraded();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save grade.');
    } finally {
      setIsSaving(false);
    }
  };

  const submissions = assignment.submissions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {assignment.subject}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Max {assignment.maxPoints} pts
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
              Grading Portal: {assignment.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Submissions List Sidebar */}
          <div className="w-full md:w-72 border-r border-slate-100 dark:border-slate-800 overflow-y-auto p-4 space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Student Submissions ({submissions.length})
            </h4>

            {submissions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No submissions turned in yet.
              </p>
            ) : (
              submissions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                const isGraded = sub.status === 'GRADED';
                const isLate = sub.status === 'LATE';

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSelectSubmission(sub)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                    }`}
                  >
                    <Avatar
                      src={sub.student?.profile?.avatarUrl}
                      name={sub.student?.profile?.fullName || 'Student'}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {sub.student?.profile?.fullName || sub.student?.email}
                      </h5>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isGraded ? (
                          <span className="text-[10px] font-bold text-emerald-600">
                            {sub.grade}/{assignment.maxPoints} pts
                          </span>
                        ) : isLate ? (
                          <span className="text-[10px] font-bold text-amber-600">
                            Turned in Late
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">
                            Pending Grade
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Submission Details & Grading Controls */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {selectedSub ? (
              <>
                {successMsg && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Student Info Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={selectedSub.student?.profile?.avatarUrl}
                      name={selectedSub.student?.profile?.fullName || 'Student'}
                      size="md"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {selectedSub.student?.profile?.fullName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {selectedSub.student?.profile?.grade} {selectedSub.student?.profile?.section && `• ${selectedSub.student.profile.section}`}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Submitted: {new Date(selectedSub.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Submitted Work Text */}
                <div className="space-y-1.5">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Student Written Response:
                  </h5>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-200/80 dark:border-slate-700/60 font-mono">
                    {selectedSub.content || '(No written text submitted)'}
                  </div>
                </div>

                {/* Attachment Link */}
                {selectedSub.attachmentUrl && (
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Submitted File / Document Link:
                    </h5>
                    <a
                      href={selectedSub.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline border border-blue-200 dark:border-blue-900"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Student Attachment Link
                    </a>
                  </div>
                )}

                {/* Grading Form */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    Assign Grade & Teacher Feedback
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Score (Out of {assignment.maxPoints})
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={assignment.maxPoints}
                        value={gradeInput}
                        onChange={(e) => setGradeInput(Number(e.target.value))}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Teacher Constructive Feedback
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Add commendations, areas for improvement, or corrections..."
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 resize-none font-medium"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleSaveGrade}
                      isLoading={isSaving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      rightIcon={<Save className="w-4 h-4" />}
                    >
                      Save Grade & Feedback
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-xs font-semibold text-slate-400">
                Select a student submission from the left panel to review and grade.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

