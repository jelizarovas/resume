import {
  generateTailoredResumePrompt,
  generateCoverLetterPrompt,
  generateJobQuestionResponsePrompt,
  extractJobInfoPrompt,
  reviseResumeSectionPrompt,
} from '../promptTemplates';
import type { Resume, JobInfo, ResumeSection, Experience, Education } from '../promptTemplates';

describe('Prompt Generation Utilities', () => {
  const sampleResume: Resume = {
    header: { name: 'John Doe', title: 'Software Engineer', contact: { email: 'john.doe@email.com', phone: '123-456-7890', location: 'Anytown, USA' } },
    summary: 'Experienced software engineer with a passion for building scalable web applications.',
    skills: ['TypeScript', 'React', 'Node.js'],
    experience: [
      { id: 'exp1', title: 'Senior Developer', company: 'Tech Corp', startDate: '2020', endDate: 'Present', highlights: ['Led a team', 'Developed new features'] },
    ],
    education: [
      { id: 'edu1', degree: 'B.S. Computer Science', institution: 'State University', graduationDate: '2019' },
    ],
    certificates: ['AWS Certified Developer'],
  };

  const sampleJobInfo: JobInfo = {
    title: 'Frontend Developer',
    company: 'Innovate Ltd.',
    description: 'Looking for a skilled Frontend Developer to join our dynamic team. Responsibilities include developing user interfaces and collaborating with backend developers. Key requirements: React, CSS, HTML.',
    location: 'Remote',
    keyRequirements: ['React', 'CSS', 'HTML5', 'JavaScript'],
    responsibilities: ['Develop UIs', 'Collaborate with backend'],
    employmentType: 'Full-time',
    experienceLevel: 'Mid-level'
  };

  describe('generateTailoredResumePrompt', () => {
    it('should generate a prompt containing job description and original resume details', () => {
      const prompt = generateTailoredResumePrompt(sampleResume, sampleJobInfo);
      expect(prompt).toContain('JOB DESCRIPTION:');
      expect(prompt).toContain(JSON.stringify(sampleJobInfo, null, 2));
      expect(prompt).toContain('ORIGINAL RESUME (JSON format):');
      expect(prompt).toContain(JSON.stringify(sampleResume, null, 2));
      expect(prompt).toContain('TAILORED RESUME:');
    });

    it('should handle minimal resume and job info', () => {
      const minimalResume: Resume = { summary: 'A dev' };
      const minimalJobInfo: JobInfo = { title: 'Dev Role' };
      const prompt = generateTailoredResumePrompt(minimalResume, minimalJobInfo);
      expect(prompt).toContain(JSON.stringify(minimalJobInfo, null, 2));
      expect(prompt).toContain(JSON.stringify(minimalResume, null, 2));
      expect(prompt).toBeTruthy();
    });
  });

  describe('generateCoverLetterPrompt', () => {
    it('should generate a prompt with job, company, and resume details', () => {
      const companyName = 'Innovate Ltd.';
      const jobTitle = 'Frontend Developer';
      const prompt = generateCoverLetterPrompt(sampleResume, sampleJobInfo, companyName, jobTitle);
      expect(prompt).toContain(`JOB TITLE: ${jobTitle}`);
      expect(prompt).toContain(`COMPANY: ${companyName}`);
      expect(prompt).toContain('JOB DESCRIPTION:');
      expect(prompt).toContain(JSON.stringify(sampleJobInfo, null, 2));
      expect(prompt).toContain("APPLICANT'S RESUME:");
      expect(prompt).toContain(JSON.stringify(sampleResume, null, 2));
      expect(prompt).toContain('COVER LETTER:');
    });
  });

  describe('generateJobQuestionResponsePrompt', () => {
    const question = 'Why are you a good fit for this role?';

    it('should generate a prompt with resume, job description, and question', () => {
      const prompt = generateJobQuestionResponsePrompt(sampleResume, sampleJobInfo, question);
      expect(prompt).toContain('JOB DESCRIPTION:');
      expect(prompt).toContain(JSON.stringify(sampleJobInfo, null, 2));
      expect(prompt).toContain("APPLICANT'S RESUME:");
      expect(prompt).toContain(JSON.stringify(sampleResume, null, 2));
      expect(prompt).toContain(`QUESTION: "${question}"`);
      expect(prompt).toContain('RESPONSE:');
      expect(prompt).not.toContain('PREVIOUS ANSWERS');
    });

    it('should include previous answers if provided', () => {
      const previousAnswers = ['Answer to Q1', 'Answer to Q2'];
      const prompt = generateJobQuestionResponsePrompt(sampleResume, sampleJobInfo, question, previousAnswers);
      expect(prompt).toContain('PREVIOUS ANSWERS TO OTHER QUESTIONS:');
      expect(prompt).toContain(JSON.stringify(previousAnswers, null, 2));
    });
  });

  describe('extractJobInfoPrompt', () => {
    it('should generate a prompt with the job description text', () => {
      const jobDescriptionText = 'Senior Software Engineer at Google. Skills: Java, Python.';
      const prompt = extractJobInfoPrompt(jobDescriptionText);
      expect(prompt).toContain('JOB DESCRIPTION:');
      expect(prompt).toContain(jobDescriptionText);
      expect(prompt).toContain('JSON RESULT:');
      expect(prompt).toContain('"title": The job title'); // Check for instruction presence
    });
  });

  describe('reviseResumeSectionPrompt', () => {
    const sectionName = 'Summary';
    const userFeedback = 'Make it more impactful.';

    it('should generate a prompt for revising a string section (summary)', () => {
      const summarySection: ResumeSection = { content: sampleResume.summary || '' };
      const prompt = reviseResumeSectionPrompt(summarySection, sectionName, sampleJobInfo, userFeedback);
      
      expect(prompt).toContain(`Focus on improving just the "${sectionName}" section`);
      expect(prompt).toContain('JOB DESCRIPTION:');
      expect(prompt).toContain(JSON.stringify(sampleJobInfo, null, 2));
      expect(prompt).toContain(`CURRENT "${sectionName.toUpperCase()}" SECTION:`);
      expect(prompt).toContain(JSON.stringify(summarySection, null, 2));
      expect(prompt).toContain('USER FEEDBACK:');
      expect(prompt).toContain(userFeedback);
      expect(prompt).toContain('REVISED SECTION:');
    });
    
    it('should generate a prompt for revising an array section (skills)', () => {
        const skillsSectionName = 'Skills';
        const skillsSection: ResumeSection = { items: sampleResume.skills || [] };
        const prompt = reviseResumeSectionPrompt(skillsSection, skillsSectionName, sampleJobInfo, userFeedback);
        
        expect(prompt).toContain(`Focus on improving just the "${skillsSectionName}" section`);
        expect(prompt).toContain(JSON.stringify(sampleJobInfo, null, 2));
        expect(prompt).toContain(`CURRENT "${skillsSectionName.toUpperCase()}" SECTION:`);
        expect(prompt).toContain(JSON.stringify(skillsSection, null, 2));
        expect(prompt).toContain(userFeedback);
        expect(prompt).toContain('REVISED SECTION:');
      });
  });
});
