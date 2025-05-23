import { renderHook, act } from '@testing-library/react';
import { useOpenAI } from '../useOpenAI'; // Update path as necessary
import type { Resume, JobInfo, ResumeSection } from '../../utils/promptTemplates';

// Mock the OpenAI service functions
const mockServiceTailorResume = jest.fn();
const mockServiceGenerateCoverLetter = jest.fn();
const mockServiceAnswerJobQuestion = jest.fn();
const mockServiceExtractJobInformation = jest.fn();
const mockServiceReviseResumeSection = jest.fn();

jest.mock('../../services/openai', () => ({
  __esModule: true,
  tailorResume: (...args: any[]) => mockServiceTailorResume(...args),
  generateCoverLetter: (...args: any[]) => mockServiceGenerateCoverLetter(...args),
  answerJobQuestion: (...args: any[]) => mockServiceAnswerJobQuestion(...args),
  extractJobInformation: (...args: any[]) => mockServiceExtractJobInformation(...args),
  reviseResumeSection: (...args: any[]) => mockServiceReviseResumeSection(...args),
}));

describe('useOpenAI Hook', () => {
  const sampleResume: Resume = { summary: 'A dev' };
  const sampleJobInfo: JobInfo = { title: 'Dev' };
  const sampleResumeSection: ResumeSection = { content: 'A section' };

  beforeEach(() => {
    mockServiceTailorResume.mockClear();
    mockServiceGenerateCoverLetter.mockClear();
    mockServiceAnswerJobQuestion.mockClear();
    mockServiceExtractJobInformation.mockClear();
    mockServiceReviseResumeSection.mockClear();
  });

  describe('callTailorResume', () => {
    it('should handle successful resume tailoring', async () => {
      const mockTailoredResume: Resume = { summary: 'Tailored resume' };
      mockServiceTailorResume.mockResolvedValue(mockTailoredResume);

      const { result } = renderHook(() => useOpenAI());

      expect(result.current.tailoringResumeLoading).toBe(false);
      expect(result.current.tailoredResume).toBeNull();

      // Use act to wrap state updates
      await act(async () => {
        await result.current.callTailorResume(sampleResume, sampleJobInfo);
      });
      
      expect(result.current.tailoringResumeLoading).toBe(false);
      expect(result.current.tailoredResume).toEqual(mockTailoredResume);
      expect(result.current.tailoringResumeError).toBeNull();
      expect(mockServiceTailorResume).toHaveBeenCalledWith(sampleResume, sampleJobInfo);
    });

    it('should handle errors during resume tailoring', async () => {
      const errorMessage = 'Failed to tailor';
      mockServiceTailorResume.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useOpenAI());
      
      await act(async () => {
        await result.current.callTailorResume(sampleResume, sampleJobInfo);
      });

      expect(result.current.tailoringResumeLoading).toBe(false);
      expect(result.current.tailoredResume).toBeNull();
      expect(result.current.tailoringResumeError).toBeInstanceOf(Error);
      expect(result.current.tailoringResumeError?.message).toContain(errorMessage);
    });
  });

  describe('callGenerateCoverLetter', () => {
    const companyName = 'TestCo';
    const jobTitle = 'Tester';

    it('should handle successful cover letter generation', async () => {
      const mockCoverLetter = 'Dear Sir/Madam...';
      mockServiceGenerateCoverLetter.mockResolvedValue(mockCoverLetter);
      
      const { result } = renderHook(() => useOpenAI());

      await act(async () => {
        await result.current.callGenerateCoverLetter(sampleResume, sampleJobInfo, companyName, jobTitle);
      });

      expect(result.current.generatingCoverLetterLoading).toBe(false);
      expect(result.current.coverLetter).toBe(mockCoverLetter);
      expect(result.current.generatingCoverLetterError).toBeNull();
      expect(mockServiceGenerateCoverLetter).toHaveBeenCalledWith(sampleResume, sampleJobInfo, companyName, jobTitle);
    });

    it('should handle errors during cover letter generation', async () => {
      const errorMessage = 'Cover letter fail';
      mockServiceGenerateCoverLetter.mockRejectedValue(new Error(errorMessage));
      const { result } = renderHook(() => useOpenAI());

      await act(async () => {
        await result.current.callGenerateCoverLetter(sampleResume, sampleJobInfo, companyName, jobTitle);
      });
      
      expect(result.current.generatingCoverLetterLoading).toBe(false);
      expect(result.current.coverLetter).toBeNull();
      expect(result.current.generatingCoverLetterError?.message).toContain(errorMessage);
    });
  });

   describe('callAnswerJobQuestion', () => {
    const question = "Why us?";
    const prevAnswers = ["Answer1"];

    it('should handle successful question answering', async () => {
      const mockAnswer = "Because...";
      mockServiceAnswerJobQuestion.mockResolvedValue(mockAnswer);
      const { result } = renderHook(() => useOpenAI());

      await act(async () => {
        await result.current.callAnswerJobQuestion(sampleResume, sampleJobInfo, question, prevAnswers);
      });
      
      expect(result.current.answeringJobQuestionLoading).toBe(false);
      expect(result.current.jobQuestionAnswer).toBe(mockAnswer);
      expect(result.current.answeringJobQuestionError).toBeNull();
      expect(mockServiceAnswerJobQuestion).toHaveBeenCalledWith(sampleResume, sampleJobInfo, question, prevAnswers);
    });

    it('should handle errors during question answering', async () => {
      const errorMessage = 'Answer fail';
      mockServiceAnswerJobQuestion.mockRejectedValue(new Error(errorMessage));
      const { result } = renderHook(() => useOpenAI());

      await act(async () => {
        await result.current.callAnswerJobQuestion(sampleResume, sampleJobInfo, question, prevAnswers);
      });

      expect(result.current.answeringJobQuestionLoading).toBe(false);
      expect(result.current.jobQuestionAnswer).toBeNull();
      expect(result.current.answeringJobQuestionError?.message).toContain(errorMessage);
    });
  });

  describe('callExtractJobInformation', () => {
    const jobDescText = "A job description";

    it('should handle successful job info extraction', async () => {
      const mockJobInfo: JobInfo = { title: 'Extracted Dev', company: 'Extracted Co.' };
      mockServiceExtractJobInformation.mockResolvedValue(mockJobInfo);
      const { result } = renderHook(() => useOpenAI());

      await act(async () => {
        await result.current.callExtractJobInformation(jobDescText);
      });
      
      expect(result.current.extractingJobInfoLoading).toBe(false);
      expect(result.current.extractedJobInfo).toEqual(mockJobInfo);
      expect(result.current.extractingJobInfoError).toBeNull();
      expect(mockServiceExtractJobInformation).toHaveBeenCalledWith(jobDescText);
    });

    it('should handle errors during job info extraction', async () => {
      const errorMessage = 'Extract fail';
      mockServiceExtractJobInformation.mockRejectedValue(new Error(errorMessage));
      const { result } = renderHook(() => useOpenAI());

      await act(async () => {
        await result.current.callExtractJobInformation(jobDescText);
      });

      expect(result.current.extractingJobInfoLoading).toBe(false);
      expect(result.current.extractedJobInfo).toBeNull();
      expect(result.current.extractingJobInfoError?.message).toContain(errorMessage);
    });
  });

  describe('callReviseResumeSection', () => {
    const sectionName = "Summary";
    const feedback = "Make it pop";

    it('should handle successful section revision', async () => {
      const mockRevisedSection: ResumeSection = { content: 'Revised content' };
      mockServiceReviseResumeSection.mockResolvedValue(mockRevisedSection);
      const { result } = renderHook(() => useOpenAI());

      await act(async () => {
        await result.current.callReviseResumeSection(sampleResumeSection, sectionName, sampleJobInfo, feedback);
      });
      
      expect(result.current.revisingSectionLoading).toBe(false);
      expect(result.current.revisedSection).toEqual(mockRevisedSection);
      expect(result.current.revisingSectionError).toBeNull();
      expect(mockServiceReviseResumeSection).toHaveBeenCalledWith(sampleResumeSection, sectionName, sampleJobInfo, feedback);
    });

    it('should handle errors during section revision', async () => {
      const errorMessage = 'Revise fail';
      mockServiceReviseResumeSection.mockRejectedValue(new Error(errorMessage));
      const { result } = renderHook(() => useOpenAI());

      await act(async () => {
        await result.current.callReviseResumeSection(sampleResumeSection, sectionName, sampleJobInfo, feedback);
      });
      
      expect(result.current.revisingSectionLoading).toBe(false);
      expect(result.current.revisedSection).toBeNull();
      expect(result.current.revisingSectionError?.message).toContain(errorMessage);
    });
  });
});
