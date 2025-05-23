// src/services/openai.ts
import OpenAI from "openai";
import {
  generateTailoredResumePrompt,
  generateCoverLetterPrompt,
  generateJobQuestionResponsePrompt,
  extractJobInfoPrompt,
  reviseResumeSectionPrompt,
} from "../utils/promptTemplates"; // Corrected path
import type { Resume, JobInfo, ResumeSection } from "../utils/promptTemplates"; // Corrected path

// Initialize OpenAI client
// Ensure REACT_APP_OPENAI_API_KEY is set in your environment variables
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage in browser environments
});

// Main service functions

/**
 * Tailors a resume to a job description.
 * @param originalResume The original resume data.
 * @param jobDescription The job description data.
 * @returns A Promise resolving to the tailored resume data.
 */
export const tailorResume = async (originalResume: Resume, jobDescription: JobInfo): Promise<Resume> => {
  try {
    const prompt = generateTailoredResumePrompt(originalResume, jobDescription);

    const response = await openai.chat.completions.create({
      model: "gpt-4", // Consider making this configurable
      messages: [
        {
          role: "system",
          content: "You are an expert resume tailoring assistant designed to produce accurate, valid JSON output.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error("OpenAI API response was empty or malformed.");
    }

    return JSON.parse(messageContent.trim()) as Resume;
  } catch (error: any) {
    console.error("Error tailoring resume:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Check for specific OpenAI API errors if available, e.g., error.response.data.error.message
    throw new Error(`Failed to tailor resume: ${errorMessage}`);
  }
};

/**
 * Generates a cover letter based on a resume and job description.
 * @param resume The applicant's resume data.
 * @param jobDescription The job description data.
 * @param companyName The name of the company.
 * @param jobTitle The job title.
 * @returns A Promise resolving to the generated cover letter text.
 */
export const generateCoverLetter = async (
  resume: Resume,
  jobDescription: JobInfo,
  companyName: string,
  jobTitle: string
): Promise<string> => {
  try {
    const prompt = generateCoverLetterPrompt(resume, jobDescription, companyName, jobTitle);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional cover letter writer.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error("OpenAI API response was empty or malformed.");
    }
    return messageContent.trim();
  } catch (error: any) {
    console.error("Error generating cover letter:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate cover letter: ${errorMessage}`);
  }
};

/**
 * Generates an answer to a job application question.
 * @param resume The applicant's resume data.
 * @param jobDescription The job description data.
 * @param question The job application question.
 * @param previousAnswers Optional array of previous answers.
 * @returns A Promise resolving to the generated answer text.
 */
export const answerJobQuestion = async (
  resume: Resume,
  jobDescription: JobInfo,
  question: string,
  previousAnswers: string[] = []
): Promise<string> => {
  try {
    const prompt = generateJobQuestionResponsePrompt(resume, jobDescription, question, previousAnswers);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert job application coach.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.6,
    });
    
    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error("OpenAI API response was empty or malformed.");
    }
    return messageContent.trim();
  } catch (error: any) {
    console.error("Error generating question response:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate answer: ${errorMessage}`);
  }
};

/**
 * Extracts structured information from a job description text.
 * @param jobDescriptionText The raw text of the job description.
 * @returns A Promise resolving to the extracted job information.
 */
export const extractJobInformation = async (jobDescriptionText: string): Promise<JobInfo> => {
  try {
    const prompt = extractJobInfoPrompt(jobDescriptionText);

    const response = await openai.chat.completions.create({
      model: "gpt-4", 
      messages: [
        {
          role: "system",
          content: "You are a job description analyzer designed to produce structured, valid JSON output.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error("OpenAI API response was empty or malformed.");
    }
    return JSON.parse(messageContent.trim()) as JobInfo;
  } catch (error: any) {
    console.error("Error extracting job info:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to extract job information: ${errorMessage}`);
  }
};

/**
 * Revises a specific section of a resume.
 * @param resumeSection The resume section to revise.
 * @param sectionName The name of the section being revised.
 * @param jobDescription The target job description.
 * @param userFeedback Specific feedback for revision.
 * @returns A Promise resolving to the revised resume section.
 */
export const reviseResumeSection = async (
  resumeSection: ResumeSection,
  sectionName: string,
  jobDescription: JobInfo,
  userFeedback: string
): Promise<ResumeSection> => {
  try {
    const prompt = reviseResumeSectionPrompt(resumeSection, sectionName, jobDescription, userFeedback);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert resume section editor designed to produce valid JSON output.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error("OpenAI API response was empty or malformed.");
    }
    return JSON.parse(messageContent.trim()) as ResumeSection;
  } catch (error: any) {
    console.error("Error revising resume section:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to revise resume section: ${errorMessage}`);
  }
};
