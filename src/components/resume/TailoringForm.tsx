import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, Send, X } from 'lucide-react';
import { useOpenAI } from '../../hooks/useOpenAI';
import type { Resume, JobInfo } from '../../utils/promptTemplates';

interface TailoringFormProps {
  originalResume: Resume;
  jobDescription: JobInfo;
  onSubmit: (tailoredResume: Resume) => void;
  onCancel?: () => void;
}

export const TailoringForm: React.FC<TailoringFormProps> = ({
  originalResume,
  jobDescription,
  onSubmit,
  onCancel,
}) => {
  const [highlightSkills, setHighlightSkills] = useState<string>('');
  const [targetJobTitleInput, setTargetJobTitleInput] = useState<string>(jobDescription.title || '');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const {
    // Use specific state from useOpenAI for tailoring
    tailoredResume: aiTailoredResume, 
    tailoringResumeLoading,
    tailoringResumeError,
    callTailorResume,
  } = useOpenAI();

  useEffect(() => {
    // When aiTailoredResume data arrives from the hook, call the parent's onSubmit
    if (aiTailoredResume && !tailoringResumeLoading && !tailoringResumeError) {
      onSubmit(aiTailoredResume);
    }
    // Do not include onSubmit in dependencies to prevent potential infinite loops if parent re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiTailoredResume, tailoringResumeLoading, tailoringResumeError]);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Log current form values for future enhancement reference
    console.log("User tailoring preferences:", {
      highlightSkills,
      targetJobTitle: targetJobTitleInput,
      additionalNotes,
    });

    // For now, the callTailorResume function and its underlying prompt
    // primarily use originalResume and jobDescription.
    // The form fields (highlightSkills, targetJobTitleInput, additionalNotes)
    // are collected but not yet used to modify the prompt or parameters to callTailorResume.
    // This setup allows for future enhancements where these preferences could be
    // incorporated into a more sophisticated prompt or API call structure.
    
    await callTailorResume(originalResume, jobDescription);
    // The useEffect hook above will handle calling onSubmit when aiTailoredResume is updated.
  }, [callTailorResume, originalResume, jobDescription, highlightSkills, targetJobTitleInput, additionalNotes]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Tailor Your Resume with AI</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="targetJobTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Target Job Title <span className="text-xs text-gray-500">(if different from JD)</span>
          </label>
          <input
            type="text"
            id="targetJobTitle"
            value={targetJobTitleInput}
            onChange={(e) => setTargetJobTitleInput(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
            placeholder={jobDescription.title || "e.g., Senior Software Engineer"}
            disabled={tailoringResumeLoading}
          />
        </div>

        <div>
          <label htmlFor="highlightSkills" className="block text-sm font-medium text-gray-700 mb-1">
            Specific skills or experiences to emphasize
          </label>
          <textarea
            id="highlightSkills"
            value={highlightSkills}
            onChange={(e) => setHighlightSkills(e.target.value)}
            rows={3}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
            placeholder="e.g., My experience with cloud platforms, particularly AWS and Azure."
            disabled={tailoringResumeLoading}
          />
        </div>

        <div>
          <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes or Desired Tone
          </label>
          <textarea
            id="additionalNotes"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={3}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
            placeholder="e.g., Aim for a highly professional and confident tone. Focus on leadership qualities."
            disabled={tailoringResumeLoading}
          />
        </div>

        {tailoringResumeError && (
          <div className="my-4 p-3 text-sm text-red-700 bg-red-100 rounded-md flex items-start shadow-md">
            <AlertTriangle size={20} className="mr-2 flex-shrink-0 text-red-500" />
            <div>
              <span className="font-semibold block">Error Tailoring Resume:</span> 
              <span className="block">{tailoringResumeError.message}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={tailoringResumeLoading}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 border border-gray-400 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-60"
            >
              <X size={16} className="mr-2" />
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={tailoringResumeLoading}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {tailoringResumeLoading ? (
              <>
                <RefreshCw size={16} className="mr-2 animate-spin" />
                Tailoring...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Tailor with AI
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TailoringForm;
