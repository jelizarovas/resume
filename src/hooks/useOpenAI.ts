import { useState, useCallback } from 'react';
import {
  tailorResume as serviceTailorResume,
  generateCoverLetter as serviceGenerateCoverLetter,
  answerJobQuestion as serviceAnswerJobQuestion,
  extractJobInformation as serviceExtractJobInformation,
  reviseResumeSection as serviceReviseResumeSection,
} from '../services/openai';
import type { Resume, JobInfo, ResumeSection } from '../utils/promptTemplates';

// Define the possible data types the hook can manage
type OpenAIData = Resume | JobInfo | ResumeSection | string;

interface UseOpenAIState<T extends OpenAIData | null> {
  data: T;
  loading: boolean;
  error: Error | null;
}

// Define the return type of the hook, making it more specific
// by not using a generic T for the whole hook, but rather for specific operations.
export interface UseOpenAIResult {
  // State for TailorResume
  tailoredResume: Resume | null;
  tailoringResumeLoading: boolean;
  tailoringResumeError: Error | null;
  callTailorResume: (originalResume: Resume, jobDescription: JobInfo) => Promise<Resume | null>;

  // State for GenerateCoverLetter
  coverLetter: string | null;
  generatingCoverLetterLoading: boolean;
  generatingCoverLetterError: Error | null;
  callGenerateCoverLetter: (resume: Resume, jobDescription: JobInfo, companyName: string, jobTitle: string) => Promise<string | null>;

  // State for AnswerJobQuestion
  jobQuestionAnswer: string | null;
  answeringJobQuestionLoading: boolean;
  answeringJobQuestionError: Error | null;
  callAnswerJobQuestion: (resume: Resume, jobDescription: JobInfo, question: string, previousAnswers?: string[]) => Promise<string | null>;

  // State for ExtractJobInformation
  extractedJobInfo: JobInfo | null;
  extractingJobInfoLoading: boolean;
  extractingJobInfoError: Error | null;
  callExtractJobInformation: (jobDescriptionText: string) => Promise<JobInfo | null>;

  // State for ReviseResumeSection
  revisedSection: ResumeSection | null;
  revisingSectionLoading: boolean;
  revisingSectionError: Error | null;
  callReviseResumeSection: (resumeSection: ResumeSection, sectionName: string, jobDescription: JobInfo, userFeedback: string) => Promise<ResumeSection | null>;
}

export const useOpenAI = (): UseOpenAIResult => {
  // State for TailorResume
  const [tailoredResume, setTailoredResume] = useState<Resume | null>(null);
  const [tailoringResumeLoading, setTailoringResumeLoading] = useState<boolean>(false);
  const [tailoringResumeError, setTailoringResumeError] = useState<Error | null>(null);

  // State for GenerateCoverLetter
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [generatingCoverLetterLoading, setGeneratingCoverLetterLoading] = useState<boolean>(false);
  const [generatingCoverLetterError, setGeneratingCoverLetterError] = useState<Error | null>(null);

  // State for AnswerJobQuestion
  const [jobQuestionAnswer, setJobQuestionAnswer] = useState<string | null>(null);
  const [answeringJobQuestionLoading, setAnsweringJobQuestionLoading] = useState<boolean>(false);
  const [answeringJobQuestionError, setAnsweringJobQuestionError] = useState<Error | null>(null);

  // State for ExtractJobInformation
  const [extractedJobInfo, setExtractedJobInfo] = useState<JobInfo | null>(null);
  const [extractingJobInfoLoading, setExtractingJobInfoLoading] = useState<boolean>(false);
  const [extractingJobInfoError, setExtractingJobInfoError] = useState<Error | null>(null);

  // State for ReviseResumeSection
  const [revisedSection, setRevisedSection] = useState<ResumeSection | null>(null);
  const [revisingSectionLoading, setRevisingSectionLoading] = useState<boolean>(false);
  const [revisingSectionError, setRevisingSectionError] = useState<Error | null>(null);

  const callTailorResume = useCallback(async (originalResume: Resume, jobDescription: JobInfo): Promise<Resume | null> => {
    setTailoringResumeLoading(true);
    setTailoringResumeError(null);
    setTailoredResume(null);
    try {
      const result = await serviceTailorResume(originalResume, jobDescription);
      setTailoredResume(result);
      setTailoringResumeLoading(false);
      return result;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err.message || 'Failed to tailor resume'));
      setTailoringResumeError(error);
      setTailoringResumeLoading(false);
      console.error("Error tailoring resume:", error);
      return null;
    }
  }, []);

  const callGenerateCoverLetter = useCallback(async (resume: Resume, jobDescription: JobInfo, companyName: string, jobTitle: string): Promise<string | null> => {
    setGeneratingCoverLetterLoading(true);
    setGeneratingCoverLetterError(null);
    setCoverLetter(null);
    try {
      const result = await serviceGenerateCoverLetter(resume, jobDescription, companyName, jobTitle);
      setCoverLetter(result);
      setGeneratingCoverLetterLoading(false);
      return result;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err.message || 'Failed to generate cover letter'));
      setGeneratingCoverLetterError(error);
      setGeneratingCoverLetterLoading(false);
      console.error("Error generating cover letter:", error);
      return null;
    }
  }, []);

  const callAnswerJobQuestion = useCallback(async (resume: Resume, jobDescription: JobInfo, question: string, previousAnswers: string[] = []): Promise<string | null> => {
    setAnsweringJobQuestionLoading(true);
    setAnsweringJobQuestionError(null);
    setJobQuestionAnswer(null);
    try {
      const result = await serviceAnswerJobQuestion(resume, jobDescription, question, previousAnswers);
      setJobQuestionAnswer(result);
      setAnsweringJobQuestionLoading(false);
      return result;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err.message || 'Failed to answer job question'));
      setAnsweringJobQuestionError(error);
      setAnsweringJobQuestionLoading(false);
      console.error("Error answering job question:", error);
      return null;
    }
  }, []);

  const callExtractJobInformation = useCallback(async (jobDescriptionText: string): Promise<JobInfo | null> => {
    setExtractingJobInfoLoading(true);
    setExtractingJobInfoError(null);
    setExtractedJobInfo(null);
    try {
      const result = await serviceExtractJobInformation(jobDescriptionText);
      setExtractedJobInfo(result);
      setExtractingJobInfoLoading(false);
      return result;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err.message || 'Failed to extract job information'));
      setExtractingJobInfoError(error);
      setExtractingJobInfoLoading(false);
      console.error("Error extracting job information:", error);
      return null;
    }
  }, []);

  const callReviseResumeSection = useCallback(async (resumeSection: ResumeSection, sectionName: string, jobDescription: JobInfo, userFeedback: string): Promise<ResumeSection | null> => {
    setRevisingSectionLoading(true);
    setRevisingSectionError(null);
    setRevisedSection(null);
    try {
      const result = await serviceReviseResumeSection(resumeSection, sectionName, jobDescription, userFeedback);
      setRevisedSection(result);
      setRevisingSectionLoading(false);
      return result;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err.message || 'Failed to revise resume section'));
      setRevisingSectionError(error);
      setRevisingSectionLoading(false);
      console.error("Error revising resume section:", error);
      return null;
    }
  }, []);

  return {
    tailoredResume,
    tailoringResumeLoading,
    tailoringResumeError,
    callTailorResume,

    coverLetter,
    generatingCoverLetterLoading,
    generatingCoverLetterError,
    callGenerateCoverLetter,

    jobQuestionAnswer,
    answeringJobQuestionLoading,
    answeringJobQuestionError,
    callAnswerJobQuestion,

    extractedJobInfo,
    extractingJobInfoLoading,
    extractingJobInfoError,
    callExtractJobInformation,

    revisedSection,
    revisingSectionLoading,
    revisingSectionError,
    callReviseResumeSection,
  };
};

// Example Usage (for illustration):
/*
import React from 'react';
import { useOpenAI } from './useOpenAI'; // Adjust path as needed
import type { Resume, JobInfo, ResumeSection } from '../utils/promptTemplates'; // Adjust path

const MyResumeEditor: React.FC = () => {
  const {
    tailoredResume, tailoringResumeLoading, tailoringResumeError, callTailorResume,
    extractedJobInfo, extractingJobInfoLoading, extractingJobInfoError, callExtractJobInformation,
  } = useOpenAI();

  const handleTailorMyResume = async () => {
    const currentResume: Resume = { summary: "My current summary...", skills: ["React", "TypeScript"] };
    const jobDesc: JobInfo = { title: "Software Engineer", keyRequirements: ["React", "Node.js"] };
    
    const result = await callTailorResume(currentResume, jobDesc);
    if (result) {
      console.log("Tailored Resume:", result);
    }
  };

  const handleExtractInfo = async (jdText: string) => {
    const info = await callExtractJobInformation(jdText);
    if (info) {
      console.log("Extracted Job Info:", info);
    }
  };

  return (
    <div>
      <button onClick={handleTailorMyResume} disabled={tailoringResumeLoading}>
        {tailoringResumeLoading ? 'Tailoring...' : 'Tailor My Resume'}
      </button>
      {tailoringResumeError && <p style={{ color: 'red' }}>Error: {tailoringResumeError.message}</p>}
      {tailoredResume && <div><h3>Tailored Resume:</h3><pre>{JSON.stringify(tailoredResume, null, 2)}</pre></div>}

      <button onClick={() => handleExtractInfo("Job Title: Dev, Skills: JS, TS")} disabled={extractingJobInfoLoading}>
        {extractingJobInfoLoading ? 'Extracting...' : 'Extract Job Info'}
      </button>
      {extractingJobInfoError && <p style={{ color: 'red' }}>Error: {extractingJobInfoError.message}</p>}
      {extractedJobInfo && <div><h3>Extracted Info:</h3><pre>{JSON.stringify(extractedJobInfo, null, 2)}</pre></div>}
    </div>
  );
};
*/
