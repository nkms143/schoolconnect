import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Award,
  Trash2,
  Filter,
  Send
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { Assignment, AssignmentDetail } from '../types/academic';
import { assignmentService } from '../services/assignmentService';
import { Button } from '../components/common/Button';
import { AssignmentSubmitModal } from '../components/assignments/AssignmentSubmitModal';
import { AssignmentCreateModal } from '../components/assignments/AssignmentCreateModal';
import { AssignmentGradeDrawer } from '../components/assignments/AssignmentGradeDrawer';

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [statusTab, setStatusTab] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED'>('ALL');

  // Modals
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [assignmentDetail, setAssignmentDetail] = useState<AssignmentDetail | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGradeDrawerOpen, setIsGradeDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await assignmentService.getAssignments({
        subject: subjectFilter,
        grade: gradeFilter
      });
      setAssignments(data);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [subjectFilter, gradeFilter]);

  const handleOpenSubmit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmitOpen(true);
  };

  const handleOpenGradePortal = async (assignmentId: string) => {
    try {
      setDetailLoading(true);
      const detail = await assignmentService.getAssignmentById(assignmentId);
      if (detail) {
        setAssignmentDetail(detail);
        setIsGradeDrawerOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to load assignment submissions.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteAssignment = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await assignmentService.deleteAssignment(id);
      fetchAssignments();
    } catch (err: any) {
      alert(err.message || 'Failed to delete assignment.');
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (statusTab === 'PENDING') return !a.hasSubmitted;
    if (statusTab === 'SUBMITTED') return a.hasSubmitted && a.submissionStatus !== 'GRADED';
    if (statusTab === 'GRADED') return a.submissionStatus === 'GRADED';
    return true;
  });

  const subjects = [
    'ALL',
    'Mathematics',
    'Science',
    'Coding',
    'English',
    'Social Studies'
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-2">
                <FileText className="w-3.5 h-3.5" />
                Academic Homework & Coursework
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Assignments & Homework Portal
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1 leading-relaxed">
                Stay on top of homework deadlines, submit your work online, and receive direct grading and feedback from your teachers.
              </p>
            </div>

            {isTeacherOrAdmin && (
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-md font-bold self-start md:self-auto"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Post New Assignment
              </Button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
            {[
              { id: 'ALL', label: 'All Assignments' },
              { id: 'PENDING', label: '⏳ Due / Pending' },
              { id: 'SUBMITTED', label: '📥 Turned In' },
              { id: 'GRADED', label: '✅ Graded & Feedback' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  statusTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Subject Filter Pills */}
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

        {/* Assignments List */}
        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-slate-400">
            Loading assignments...
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No Assignments Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no assignments matching your current filter. You're completely up to date!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAssignments.map((assignment) => {
              const isPastDue = new Date() > new Date(assignment.dueDate);
              const daysLeft = Math.ceil(
                (new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={assignment.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header Tags */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {assignment.subject}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {assignment.grade}
                        </span>
                      </div>

                      {/* Status Badges */}
                      {assignment.submissionStatus === 'GRADED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Graded: {assignment.userGrade}/{assignment.maxPoints} pts
                        </span>
                      ) : assignment.hasSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Turned In
                        </span>
                      ) : isPastDue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                          Past Due
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          {daysLeft <= 1 ? 'Due Tomorrow' : `Due in ${daysLeft} days`}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {assignment.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-3">
                        {assignment.description}
                      </p>
                    </div>

                    {/* Due Date & Attachment */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span>
                          Due: <strong className="text-slate-800 dark:text-slate-200">{new Date(assignment.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                        </span>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {assignment.maxPoints} Points
                      </span>
                    </div>

                    {assignment.attachmentUrl && (
                      <a
                        href={assignment.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Attached Worksheet / Resource
                      </a>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold text-slate-400">
                      {isTeacherOrAdmin
                        ? `${assignment.totalSubmissions} Student Submissions`
                        : `Assigned by ${assignment.creator?.profile?.fullName || 'Faculty'}`}
                    </span>

                    <div className="flex items-center gap-2">
                      {isTeacherOrAdmin && (
                        <>
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Delete Assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <Button
                            size="sm"
                            onClick={() => handleOpenGradePortal(assignment.id)}
                            isLoading={detailLoading && assignmentDetail?.id === assignment.id}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                            leftIcon={<Award className="w-4 h-4" />}
                          >
                            Review & Grade ({assignment.totalSubmissions})
                          </Button>
                        </>
                      )}

                      {!isTeacherOrAdmin && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenSubmit(assignment)}
                          className={
                            assignment.hasSubmitted
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                              : 'bg-blue-600 hover:bg-blue-700 text-white font-bold'
                          }
                          rightIcon={<Send className="w-4 h-4" />}
                        >
                          {assignment.hasSubmitted ? 'Resubmit / Edit' : 'Turn In Work'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Student Turn In Modal */}
      {selectedAssignment && (
        <AssignmentSubmitModal
          assignment={selectedAssignment}
          isOpen={isSubmitOpen}
          onClose={() => {
            setIsSubmitOpen(false);
            setSelectedAssignment(null);
          }}
          onSubmitted={() => {
            fetchAssignments();
          }}
        />
      )}

      {/* Teacher Create Assignment Modal */}
      <AssignmentCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          fetchAssignments();
        }}
      />

      {/* Teacher Grading Drawer */}
      {assignmentDetail && (
        <AssignmentGradeDrawer
          assignment={assignmentDetail}
          isOpen={isGradeDrawerOpen}
          onClose={() => {
            setIsGradeDrawerOpen(false);
            setAssignmentDetail(null);
          }}
          onGraded={() => {
            fetchAssignments();
          }}
        />
      )}
    </Layout>
  );
};

