import {
  tailorResume,
  generateCoverLetter,
  answerJobQuestion,
  extractJobInformation,
  reviseResumeSection,
} from '../openai'; // Update path as necessary
import * as prompts from '../../utils/promptTemplates'; // To spy on prompt generation
import type { Resume, JobInfo, ResumeSection } from '../../utils/promptTemplates';

// Mock the OpenAI client
const mockCreateChatCompletion = jest.fn();
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: mockCreateChatCompletion,
          },
        },
      };
    }),
  };
});

describe('OpenAI Service', () => {
  const sampleResume: Resume = { summary: 'A great developer.' };
  const sampleJobInfo: JobInfo = { title: 'Developer', company: 'Tech Co', description: 'Develop things.' };
  const sampleResumeSection: ResumeSection = { content: 'Some section content.' };

  beforeEach(() => {
    // Clear mock call history and implementations before each test
    mockCreateChatCompletion.mockClear();
  });

  describe('tailorResume', () => {
    it('should call OpenAI API and parse the JSON response', async () => {
      const mockResponseJson = { tailored: 'resume data' };
      mockCreateChatCompletion.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockResponseJson) } }],
      });

      const result = await tailorResume(sampleResume, sampleJobInfo);

      expect(mockCreateChatCompletion).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: expect.any(String) },
          { role: 'user', content: prompts.generateTailoredResumePrompt(sampleResume, sampleJobInfo) },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });
      expect(result).toEqual(mockResponseJson);
    });

    it('should throw an error if API response is empty', async () => {
      mockCreateChatCompletion.mockResolvedValueOnce({ choices: [{ message: { content: null } }] });
      await expect(tailorResume(sampleResume, sampleJobInfo)).rejects.toThrow('OpenAI API response was empty or malformed.');
    });
    
    it('should throw an error if JSON parsing fails', async () => {
      mockCreateChatCompletion.mockResolvedValueOnce({ choices: [{ message: { content: "invalid json" } }] });
      await expect(tailorResume(sampleResume, sampleJobInfo)).rejects.toThrow(/Failed to tailor resume: Unexpected token/);
    });

    it('should throw an error if API call fails', async () => {
      mockCreateChatCompletion.mockRejectedValueOnce(new Error('Network error'));
      await expect(tailorResume(sampleResume, sampleJobInfo)).rejects.toThrow('Failed to tailor resume: Network error');
    });
  });

  describe('generateCoverLetter', () => {
    const companyName = 'Tech Co';
    const jobTitle = 'Developer';

    it('should call OpenAI API and return the string response', async () => {
      const mockResponseText = 'This is a cover letter.';
      mockCreateChatCompletion.mockResolvedValueOnce({
        choices: [{ message: { content: mockResponseText } }],
      });

      const result = await generateCoverLetter(sampleResume, sampleJobInfo, companyName, jobTitle);

      expect(mockCreateChatCompletion).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: expect.any(String) },
          { role: 'user', content: prompts.generateCoverLetterPrompt(sampleResume, sampleJobInfo, companyName, jobTitle) },
        ],
        temperature: 0.7,
      });
      expect(result).toBe(mockResponseText);
    });
    
    it('should throw an error if API response is empty', async () => {
        mockCreateChatCompletion.mockResolvedValueOnce({ choices: [{ message: { content: null } }] });
        await expect(generateCoverLetter(sampleResume, sampleJobInfo, companyName, jobTitle)).rejects.toThrow('OpenAI API response was empty or malformed.');
    });

    it('should throw an error if API call fails', async () => {
      mockCreateChatCompletion.mockRejectedValueOnce(new Error('API error'));
      await expect(generateCoverLetter(sampleResume, sampleJobInfo, companyName, jobTitle)).rejects.toThrow('Failed to generate cover letter: API error');
    });
  });

  describe('answerJobQuestion', () => {
    const question = 'Why you?';
    const previousAnswers = ['Previous answer.'];

    it('should call OpenAI API and return the string response', async () => {
      const mockResponseText = 'This is the answer.';
      mockCreateChatCompletion.mockResolvedValueOnce({
        choices: [{ message: { content: mockResponseText } }],
      });

      const result = await answerJobQuestion(sampleResume, sampleJobInfo, question, previousAnswers);

      expect(mockCreateChatCompletion).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: expect.any(String) },
          { role: 'user', content: prompts.generateJobQuestionResponsePrompt(sampleResume, sampleJobInfo, question, previousAnswers) },
        ],
        temperature: 0.6,
      });
      expect(result).toBe(mockResponseText);
    });
    
    it('should throw an error if API response is empty', async () => {
        mockCreateChatCompletion.mockResolvedValueOnce({ choices: [{ message: { content: null } }] });
        await expect(answerJobQuestion(sampleResume, sampleJobInfo, question, previousAnswers)).rejects.toThrow('OpenAI API response was empty or malformed.');
    });

    it('should throw an error if API call fails', async () => {
      mockCreateChatCompletion.mockRejectedValueOnce(new Error('Network issue'));
      await expect(answerJobQuestion(sampleResume, sampleJobInfo, question, previousAnswers)).rejects.toThrow('Failed to generate answer: Network issue');
    });
  });

  describe('extractJobInformation', () => {
    const jobDescriptionText = 'A job description.';

    it('should call OpenAI API and parse the JSON response', async () => {
      const mockResponseJson = { title: 'Developer', company: 'Tech Co' };
      mockCreateChatCompletion.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockResponseJson) } }],
      });

      const result = await extractJobInformation(jobDescriptionText);

      expect(mockCreateChatCompletion).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: expect.any(String) },
          { role: 'user', content: prompts.extractJobInfoPrompt(jobDescriptionText) },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });
      expect(result).toEqual(mockResponseJson);
    });
    
    it('should throw an error if API response is empty', async () => {
        mockCreateChatCompletion.mockResolvedValueOnce({ choices: [{ message: { content: null } }] });
        await expect(extractJobInformation(jobDescriptionText)).rejects.toThrow('OpenAI API response was empty or malformed.');
    });
    
    it('should throw an error if JSON parsing fails', async () => {
      mockCreateChatCompletion.mockResolvedValueOnce({ choices: [{ message: { content: "not json" } }] });
      await expect(extractJobInformation(jobDescriptionText)).rejects.toThrow(/Failed to extract job information: Unexpected token/);
    });

    it('should throw an error if API call fails', async () => {
      mockCreateChatCompletion.mockRejectedValueOnce(new Error('Server error'));
      await expect(extractJobInformation(jobDescriptionText)).rejects.toThrow('Failed to extract job information: Server error');
    });
  });

  describe('reviseResumeSection', () => {
    const sectionName = 'Summary';
    const userFeedback = 'Make it better.';

    it('should call OpenAI API and parse the JSON response', async () => {
      const mockResponseJson = { revisedContent: 'Revised summary.' };
      mockCreateChatCompletion.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockResponseJson) } }],
      });

      const result = await reviseResumeSection(sampleResumeSection, sectionName, sampleJobInfo, userFeedback);

      expect(mockCreateChatCompletion).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: expect.any(String) },
          { role: 'user', content: prompts.reviseResumeSectionPrompt(sampleResumeSection, sectionName, sampleJobInfo, userFeedback) },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });
      expect(result).toEqual(mockResponseJson);
    });

    it('should throw an error if API response is empty', async () => {
        mockCreateChatCompletion.mockResolvedValueOnce({ choices: [{ message: { content: null } }] });
        await expect(reviseResumeSection(sampleResumeSection, sectionName, sampleJobInfo, userFeedback)).rejects.toThrow('OpenAI API response was empty or malformed.');
    });
    
    it('should throw an error if JSON parsing fails', async () => {
      mockCreateChatCompletion.mockResolvedValueOnce({ choices: [{ message: { content: "{ invalid json" } }] });
      await expect(reviseResumeSection(sampleResumeSection, sectionName, sampleJobInfo, userFeedback)).rejects.toThrow(/Failed to revise resume section: Unexpected token/);
    });

    it('should throw an error if API call fails', async () => {
      mockCreateChatCompletion.mockRejectedValueOnce(new Error('Service unavailable'));
      await expect(reviseResumeSection(sampleResumeSection, sectionName, sampleJobInfo, userFeedback)).rejects.toThrow('Failed to revise resume section: Service unavailable');
    });
  });
});
