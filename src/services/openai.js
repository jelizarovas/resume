// src/services/openai.js
import { Configuration, OpenAIApi } from "openai";
import {
  generateTailoredResumePrompt,
  generateCoverLetterPrompt,
  generateJobQuestionResponsePrompt,
  extractJobInfoPrompt,
  reviseResumeSectionPrompt,
} from "../utils/promptTemplates";

// Initialize OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Main service functions
export const tailorResume = async (originalResume, jobDescription) => {
  try {
    const prompt = generateTailoredResumePrompt(originalResume, jobDescription);

    const response = await openai.createChatCompletion({
      model: "gpt-4", // Could be configurable
      messages: [
        {
          role: "system",
          content: "You are an expert resume tailoring assistant that produces accurate, valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5, // Lower temperature for more focused output
    });

    // Parse the JSON response
    const jsonString = response.data.choices[0].message.content.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error tailoring resume:", error);
    throw new Error(`Failed to tailor resume: ${error.message}`);
  }
};

export const generateCoverLetter = async (resume, jobDescription, companyName, jobTitle) => {
  try {
    const prompt = generateCoverLetterPrompt(resume, jobDescription, companyName, jobTitle);

    const response = await openai.createChatCompletion({
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
      temperature: 0.7, // Slightly higher for more creative writing
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error(`Failed to generate cover letter: ${error.message}`);
  }
};

export const answerJobQuestion = async (resume, jobDescription, question, previousAnswers = []) => {
  try {
    const prompt = generateJobQuestionResponsePrompt(resume, jobDescription, question, previousAnswers);

    const response = await openai.createChatCompletion({
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

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating question response:", error);
    throw new Error(`Failed to generate answer: ${error.message}`);
  }
};

export const extractJobInformation = async (jobDescription) => {
  try {
    const prompt = extractJobInfoPrompt(jobDescription);

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a job description analyzer that produces structured JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Low temperature for factual extraction
    });

    // Parse the JSON response
    const jsonString = response.data.choices[0].message.content.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error extracting job info:", error);
    throw new Error(`Failed to extract job information: ${error.message}`);
  }
};

export const reviseResumeSection = async (resumeSection, sectionName, jobDescription, userFeedback) => {
  try {
    const prompt = reviseResumeSectionPrompt(resumeSection, sectionName, jobDescription, userFeedback);

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert resume section editor that produces valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
    });

    // Parse the JSON response
    const jsonString = response.data.choices[0].message.content.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error revising resume section:", error);
    throw new Error(`Failed to revise resume section: ${error.message}`);
  }
};
