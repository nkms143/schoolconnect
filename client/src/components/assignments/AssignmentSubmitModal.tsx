import React, { useState } from 'react';
import { X, Send, Link as LinkIcon, FileText, AlertCircle } from 'lucide-react';
import { Assignment } from '../../types/academic';
import { assignmentService } from '../../services/assignmentService';
import { Button } from '../common/Button';

interface AssignmentSubmitModalProps {
  assignment: Assignment;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export const AssignmentSubmitModal: React.FC<AssignmentSubmitModalProps> = ({
  assignment,
  isOpen,
  onClose,
  onSubmitted
}) => {
  const [content, setContent] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !attachmentUrl.trim()) {
      setError('Please provide either your written answer or a file/document link.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await assignmentService.submitAssignment(assignment.id, {
        content: content.trim(),
        attachmentUrl: attachmentUrl.trim() || undefined
      });
      onSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit assignment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {assignment.subject}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 truncate max-w-sm">
              Turn In: {assignment.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Your Written Response / Solution
            </label>
            <textarea
              rows={5}
              placeholder="Type your answer, formulas, essay, or summary here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 resize-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
              Attachment URL (Google Drive / Doc / PDF)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/file/..."
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Ensure Google Drive links have "Anyone with the link can view" permissions enabled.
            </p>
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              rightIcon={<Send className="w-4 h-4" />}
            >
              Turn In Assignment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

