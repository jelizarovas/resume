import React, { useState, useEffect, useCallback } from 'react';
import { Edit2, Save, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useOpenAI } from '../../hooks/useOpenAI';
import type { Resume, JobInfo, Experience as ResumeExperience, Education as ResumeEducation, ResumeSection } from '../../utils/promptTemplates';

interface ResumeEditorProps {
  initialResumeData?: Resume; // Make it optional to handle cases where it might not be immediately available
  jobDescription: JobInfo;
  onSave?: (updatedResume: Resume) => void;
}

const createDefaultResume = (): Resume => ({
  header: { name: '', title: '', contact: { email: '', phone: '', location: '', linkedin: ''} },
  summary: '',
  skills: [],
  experience: [],
  education: [],
  certificates: [],
});

export const ResumeEditor: React.FC<ResumeEditorProps> = ({ initialResumeData, jobDescription, onSave }) => {
  const [resume, setResume] = useState<Resume>(initialResumeData || createDefaultResume());
  const [editingSectionKey, setEditingSectionKey] = useState<string | null>(null); // e.g., "summary", "skills", "experience.0.achievements"
  const [editContent, setEditContent] = useState<string>('');
  // To track which section was specifically targeted for AI revision and show success/error messages
  const [aiRevisedSectionKey, setAiRevisedSectionKey] = useState<string | null>(null);


  const {
    revisedSection, // This is the actual data returned by the AI
    revisingSectionLoading,
    revisingSectionError,
    callReviseResumeSection,
  } = useOpenAI();

  useEffect(() => {
    if (initialResumeData) {
      setResume(initialResumeData);
    }
  }, [initialResumeData]);

  useEffect(() => {
    if (revisedSection && aiRevisedSectionKey) { // Check if aiRevisedSectionKey is set
      setResume(prevResume => {
        let updatedResume = { ...prevResume };
        const structuredContent = revisedSection as any; // Assuming revisedSection is an object like { content: "..." } or { items: ["..."] }

        if (aiRevisedSectionKey === 'summary') {
          updatedResume.summary = structuredContent?.content ?? prevResume.summary;
        } else if (aiRevisedSectionKey === 'skills') {
          updatedResume.skills = Array.isArray(structuredContent?.items) ? structuredContent.items : prevResume.skills;
        } else if (aiRevisedSectionKey.startsWith('experience.') && aiRevisedSectionKey.endsWith('.achievements')) {
          const parts = aiRevisedSectionKey.split('.');
          const expIndex = parseInt(parts[1], 10);
          if (updatedResume.experience && updatedResume.experience[expIndex] !== undefined) {
            updatedResume.experience[expIndex].achievements = Array.isArray(structuredContent?.items) ? structuredContent.items : updatedResume.experience[expIndex].achievements;
          }
        }
        return updatedResume;
      });
      // Do not nullify editingSectionKey here, user might want to further edit or save.
      // Let user explicitly close editing mode or save.
      // Reset aiRevisedSectionKey so this effect doesn't run again with the same revisedSection data
      // setAiRevisedSectionKey(null); // This will be reset when a new AI call starts
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revisedSection]); // Keep aiRevisedSectionKey out of deps to avoid loops if it's set in handleRegenerate


  const handleEdit = useCallback((sectionKey: string, currentContent: string | string[]) => {
    setEditingSectionKey(sectionKey);
    setAiRevisedSectionKey(null); // Clear AI revision status
    if (Array.isArray(currentContent)) {
      setEditContent(JSON.stringify(currentContent, null, 2));
    } else {
      setEditContent(currentContent || '');
    }
  }, []);

  const handleCancelEdit = () => {
    setEditingSectionKey(null);
    setEditContent('');
    setAiRevisedSectionKey(null); // Clear AI status on cancel
  }

  const handleSaveLocal = useCallback(() => {
    if (!editingSectionKey) return;

    setResume(prevResume => {
      let updatedResume = { ...prevResume };
      try {
        if (editingSectionKey === 'summary') {
          updatedResume.summary = editContent;
        } else if (editingSectionKey === 'skills') {
          const parsedSkills = JSON.parse(editContent);
          updatedResume.skills = Array.isArray(parsedSkills) ? parsedSkills : prevResume.skills;
        } else if (editingSectionKey.startsWith('experience.') && editingSectionKey.endsWith('.achievements')) {
          const parts = editingSectionKey.split('.');
          const expIndex = parseInt(parts[1], 10);
          if (updatedResume.experience && updatedResume.experience[expIndex] !== undefined) {
            const parsedAchievements = JSON.parse(editContent);
            updatedResume.experience[expIndex].achievements = Array.isArray(parsedAchievements) ? parsedAchievements : updatedResume.experience[expIndex].achievements;
          }
        }
        // Add more field updates here (e.g. experience title, company) if general editing is expanded

        if (onSave) {
          onSave(updatedResume);
        }
      } catch (error) {
        console.error('Error parsing or saving content:', error);
        // TODO: Set a user-facing error state for parsing errors
        return prevResume; // Return previous state if error
      }
      return updatedResume;
    });
    setEditingSectionKey(null);
    setEditContent('');
  }, [editingSectionKey, editContent, onSave]);

  const handleRegenerate = useCallback(async (sectionKey: string) => {
    setEditingSectionKey(sectionKey); // Keep section in edit mode or set it
    setAiRevisedSectionKey(sectionKey); // Mark this section for AI update
    
    let sectionToRevise: ResumeSection;
    let sectionNameUserFriendly = '';

    const currentExperience = resume.experience || [];

    if (sectionKey === 'summary') {
      sectionToRevise = { content: resume.summary || '' };
      sectionNameUserFriendly = 'Professional Summary';
    } else if (sectionKey === 'skills') {
      sectionToRevise = { items: resume.skills || [] };
      sectionNameUserFriendly = 'Skills List';
    } else if (sectionKey.startsWith('experience.') && sectionKey.endsWith('.achievements')) {
      const parts = sectionKey.split('.');
      const expIndex = parseInt(parts[1], 10);
      if (currentExperience[expIndex]) {
        sectionToRevise = { items: currentExperience[expIndex].achievements || [] };
        sectionNameUserFriendly = `Key Achievements for ${currentExperience[expIndex].title || 'this experience entry'}`;
      } else {
        return;
      }
    } else {
      console.warn('Regeneration not implemented for this section:', sectionKey);
      setAiRevisedSectionKey(null);
      return;
    }
    
    const userFeedback = `Revise this section to be more impactful and tailored for the job: ${jobDescription.title || 'the target role'}. Emphasize relevance to the job description. Ensure output is valid JSON format for the section.`;
    
    await callReviseResumeSection(sectionToRevise, sectionNameUserFriendly, jobDescription, userFeedback);
    // The useEffect hook for 'revisedSection' will handle updating the resume state.
    // If successful, 'revisedSection' will update, and the useEffect will trigger.
    // If error, 'revisingSectionError' will be set.
  }, [resume, jobDescription, callReviseResumeSection]);
  
  const renderEditableSection = (
    sectionKey: string,
    content: string | string[] | undefined, // Content can be undefined if resume section is empty
    label: string
  ) => {
    const isCurrentlyEditingThisSection = editingSectionKey === sectionKey;
    const isAiRevisingThisSection = revisingSectionLoading && aiRevisedSectionKey === sectionKey;
    const aiErrorForThisSection = revisingSectionError && aiRevisedSectionKey === sectionKey ? revisingSectionError : null;
    // Check if AI revision was successful for *this specific section*
    const aiSuccessForThisSection = !revisingSectionLoading && !aiErrorForThisSection && revisedSection && aiRevisedSectionKey === sectionKey;

    const currentDisplayContent = content || (Array.isArray(content) ? [] : '');


    return (
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4 transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-semibold text-gray-700">{label}</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleRegenerate(sectionKey)}
              className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full disabled:opacity-50"
              disabled={revisingSectionLoading} 
              title="Regenerate with AI"
            >
              {isAiRevisingThisSection ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            </button>
            <button
              onClick={() => isCurrentlyEditingThisSection ? handleCancelEdit() : handleEdit(sectionKey, currentDisplayContent)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full disabled:opacity-50"
              disabled={revisingSectionLoading && !isAiRevisingThisSection} // Disable if other AI op is running
              title={isCurrentlyEditingThisSection ? "Cancel Edit" : "Edit"}
            >
              {isCurrentlyEditingThisSection ? <XCircle size={16} /> : <Edit2 size={16} />}
            </button>
          </div>
        </div>

        {aiErrorForThisSection && (
          <div className="my-2 p-3 text-sm text-red-700 bg-red-100 rounded-md flex items-center shadow">
            <AlertTriangle size={18} className="mr-2 flex-shrink-0" /> Error: {aiErrorForThisSection.message}
          </div>
        )}
        {aiSuccessForThisSection && !isCurrentlyEditingThisSection && ( // Show success only if not actively editing
            <div className="my-2 p-3 text-sm text-green-700 bg-green-100 rounded-md flex items-center shadow">
                <CheckCircle size={18} className="mr-2 flex-shrink-0" /> AI revision successful! You can save or edit further.
            </div>
        )}

        {isCurrentlyEditingThisSection ? (
          <div className="mt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              rows={Array.isArray(currentDisplayContent) ? 8 : 4}
              disabled={isAiRevisingThisSection}
            />
            <div className="mt-3 flex justify-end space-x-2">
              <button
                onClick={handleCancelEdit}
                className="text-gray-700 py-2 px-4 rounded-md hover:bg-gray-100 text-sm"
                disabled={isAiRevisingThisSection}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLocal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center text-sm shadow-sm disabled:bg-indigo-300"
                disabled={isAiRevisingThisSection}
              >
                <Save size={14} className="mr-1.5" /> Save Section
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1 prose prose-sm max-w-none text-gray-800">
            {Array.isArray(currentDisplayContent) ? (
              currentDisplayContent.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {currentDisplayContent.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : <p className="text-gray-500 italic">No items in this section yet.</p>
            ) : (
              currentDisplayContent ? <p>{currentDisplayContent}</p> : <p className="text-gray-500 italic">This section is empty.</p>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6">
      <div className="bg-gray-50 rounded-xl shadow-2xl p-6 sm:p-8 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center">Resume Editor</h2>

        {resume.header && (
            <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-indigo-700">{resume.header.name}</h1>
                <h2 className="text-lg sm:text-xl text-gray-700 text-center mt-1">{resume.header.title}</h2>
                {resume.header.contact && (
                    <div className="text-xs sm:text-sm text-gray-600 mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
                        <span>{resume.header.contact.email}</span>
                        <span>{resume.header.contact.phone}</span>
                        <span>{resume.header.contact.location}</span>
                        {resume.header.contact.linkedin && <span>{resume.header.contact.linkedin}</span>}
                    </div>
                )}
            </div>
        )}

        {renderEditableSection('summary', resume.summary, 'Professional Summary')}
        {renderEditableSection('skills', resume.skills, 'Skills')}

        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mt-8 mb-6">Work Experience</h3>
        {(resume.experience || []).map((exp, index) => (
          <div key={exp.id || index} className="mb-6 bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
              <div className="mb-2 sm:mb-0">
                <h4 className="text-lg font-semibold text-indigo-700">{exp.title}</h4>
                <p className="text-md text-gray-700">{exp.company} - {exp.location}</p>
              </div>
              <p className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">{exp.startDate} - {exp.endDate || 'Present'}</p>
            </div>
            {renderEditableSection(`experience.${index}.achievements`, exp.achievements, 'Key Achievements')}
          </div>
        ))}
        
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mt-8 mb-6">Education</h3>
        {(resume.education || []).map((edu, index) => (
          <div key={edu.id || index} className="mb-4 bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start">
               <div className="mb-2 sm:mb-0">
                <h4 className="text-lg font-semibold text-indigo-700">{edu.degree}</h4>
                <p className="text-md text-gray-700">{edu.institution}</p>
              </div>
              <p className="text-sm text-gray-500">{edu.graduationDate}</p>
            </div>
          </div>
        ))}

        {(resume.certificates || []).length > 0 && (
            <>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mt-8 mb-6">Certifications</h3>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        {resume.certificates!.map((cert, index) => ( // Added non-null assertion as we checked length
                            <li key={index}>{cert}</li>
                        ))}
                    </ul>
                </div>
            </>
        )}
        
        {onSave && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => onSave(resume)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-xl text-lg transition-transform transform hover:scale-105"
            >
              Save Full Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeEditor;
