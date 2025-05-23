// Define interfaces for common data structures

export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  portfolio?: string; // Added portfolio
  github?: string; // Added github
}

export interface ResumeHeader {
  name?: string;
  title?: string;
  contact?: ContactInfo;
}

export interface Resume {
  header?: ResumeHeader;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  certificates?: string[]; // Added certificates
  // Add other relevant resume sections
}

export interface Experience {
  id?: string; // Added id
  title?: string;
  company?: string;
  location?: string; // Added location to experience
  startDate?: string;
  endDate?: string | 'Present';
  achievements?: string[]; // Standardized to achievements
  // Add other relevant experience fields
}

export interface Education {
  id?: string; // Added id
  degree?: string;
  institution?: string;
  graduationDate?: string;
  location?: string; // Added location to education
  // Add other relevant education fields
}

// This interface can be used for the jobDescription parameter
// and for the return type of extractJobInfoPrompt (implicitly, as it's a JSON string)
export interface JobInfo {
  title?: string;
  company?: string;
  location?: string;
  keyRequirements?: string[];
  responsibilities?: string[];
  preferredQualifications?: string[];
  benefits?: string[];
  employmentType?: string;
  experienceLevel?: string;
  // Add other relevant job description fields
}

// Represents a generic section of a resume, could be experience, education, etc.
// Using a more specific type if possible is better, but this is a fallback.
export interface ResumeSection {
  [key: string]: any;
}

// 1. Resume Tailoring Prompt

export const generateTailoredResumePrompt = (originalResume: Resume, jobDescription: JobInfo): string => `
You are an expert resume tailoring assistant. Your task is to tailor the provided resume to perfectly match the job description while maintaining honesty and authenticity.

JOB DESCRIPTION:
${JSON.stringify(jobDescription, null, 2)}

ORIGINAL RESUME (JSON format):
${JSON.stringify(originalResume, null, 2)}

INSTRUCTIONS:
1. Analyze the job description to identify key requirements, skills, and qualifications.
2. Modify the resume JSON to emphasize relevant experiences and skills that match these requirements.
3. Adjust the summary statement to align with the job position.
4. Reorder skills to prioritize those mentioned in the job description.
5. Rewrite work experience highlights to focus on achievements relevant to this specific role.
6. Do NOT invent experiences or skills that are not in the original resume.
7. Do NOT change basic facts like employment dates, company names, or education details.
8. Return ONLY a valid JSON object following the same structure as the original resume.

Focus especially on:
- Making the summary directly relevant to the job requirements
- Prioritizing the most relevant skills
- Highlighting achievements that demonstrate ability to perform the job's key responsibilities
- Using similar language/keywords from the job posting where appropriate

TAILORED RESUME:
`;

// 2. Cover Letter Generation Prompt

export const generateCoverLetterPrompt = (resume: Resume, jobDescription: JobInfo, companyName: string, jobTitle: string): string => `
You are a professional cover letter writer. Create a personalized cover letter for the following job that highlights relevant skills and experience from the resume.

JOB TITLE: ${jobTitle}
COMPANY: ${companyName}
JOB DESCRIPTION:
${JSON.stringify(jobDescription, null, 2)}

APPLICANT'S RESUME:
${JSON.stringify(resume, null, 2)}

INSTRUCTIONS:
1. Write a professional, concise cover letter (approximately 300-400 words).
2. Address the specific requirements of the job.
3. Highlight 2-3 most relevant achievements from the resume.
4. Connect the applicant's experience directly to the needs of the role.
5. Show enthusiasm for the specific company and position.
6. Maintain a confident but not arrogant tone.
7. Close with a call to action.
8. Do not use generic phrases like "I am writing to apply for the position."

The cover letter should follow this structure:
- Opening paragraph: Brief introduction and statement of interest in the specific position
- Middle paragraphs: Highlight relevant experience and specific achievements tied to job requirements
- Closing paragraph: Express enthusiasm and include a call to action

COVER LETTER:
`;

// 3. Job Question Response Generator Prompt

export const generateJobQuestionResponsePrompt = (
  resume: Resume,
  jobDescription: JobInfo,
  question: string,
  previousAnswers: string[] = []
): string => `
You are an expert job application coach. Generate a strong response to a job application question that highlights relevant background from the resume.

JOB DESCRIPTION:
${JSON.stringify(jobDescription, null, 2)}

APPLICANT'S RESUME:
${JSON.stringify(resume, null, 2)}

QUESTION: "${question}"

${
  previousAnswers.length > 0
    ? `PREVIOUS ANSWERS TO OTHER QUESTIONS:
${JSON.stringify(previousAnswers, null, 2)}`
    : ""
}

INSTRUCTIONS:
1. Create a concise, specific response (100-200 words).
2. Highlight relevant experience, skills, and achievements from the resume.
3. Use specific examples when possible.
4. Align the response with the job requirements.
5. Maintain a confident, professional tone.
6. Be honest - don't invent qualifications not in the resume.
7. If the question asks for a negative (e.g., "describe a failure"), include growth or learning.
8. For technical questions, demonstrate understanding without being overly complex.
9. For behavioral questions, use the STAR method (Situation, Task, Action, Result).

RESPONSE:
`;

// 4. Job Description Extraction Prompt
// The prompt asks for a JSON *string* result, so the return type is string.
// The content of this string is expected to conform to JobInfo.
export const extractJobInfoPrompt = (jobDescriptionText: string): string => `
You are a job description analyzer. Extract the key information from the following job description in a structured JSON format.

JOB DESCRIPTION:
${jobDescriptionText}

INSTRUCTIONS:
Extract and return a JSON object with the following properties:
1. "title": The job title
2. "company": The company name
3. "location": Work location (city/state or remote status)
4. "keyRequirements": An array of 5-8 key skills and requirements
5. "responsibilities": An array of 3-5 main responsibilities
6. "preferredQualifications": An array of any preferred (non-required) qualifications
7. "benefits": Any mentioned benefits or perks
8. "employmentType": Full-time, part-time, contract, etc.
9. "experienceLevel": Entry, mid, senior level, etc.

If any information is not available in the job description, use null for that field.
Only extract information actually present in the job description; do not make assumptions.

JSON RESULT:
`;

// 5. Resume Section Revision Prompt

export const reviseResumeSectionPrompt = (
  resumeSection: ResumeSection, // This is a generic resume section
  sectionName: string,
  jobDescription: JobInfo,
  userFeedback: string
): string => `
You are an expert resume writer. Focus on improving just the "${sectionName}" section of a resume to better match a job description.

JOB DESCRIPTION:
${JSON.stringify(jobDescription, null, 2)}

CURRENT "${sectionName.toUpperCase()}" SECTION:
${JSON.stringify(resumeSection, null, 2)}

USER FEEDBACK:
${userFeedback}

INSTRUCTIONS:
1. Revise ONLY the provided section to better align with the job requirements.
2. Address the specific user feedback provided.
3. Maintain truthfulness - do not invent new experiences or skills.
4. Use strong action verbs and quantify achievements where possible.
5. Incorporate relevant keywords from the job description.
6. Focus on clarity, impact, and relevance to the target position.
7. Return the revised section in the same JSON structure as provided.

REVISED SECTION:
`;
