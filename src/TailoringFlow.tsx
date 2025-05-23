import React, { useState, useEffect, useCallback } from "react"; // Removed useContext if AuthContext is not used
import { useNavigate } from "react-router-dom";

import { useOpenAI } from '../hooks/useOpenAI'; // Corrected path
import type { Resume, JobInfo } from '../utils/promptTemplates'; // Corrected path

// New components to be integrated
import { TailoringForm } from '../components/resume/TailoringForm'; // Corrected path
import { ResumeEditor } from '../components/resume/ResumeEditor'; // Corrected path

// Existing UI components (assuming they are TS-compatible or will be updated)
import JobUrlInput from "./JobUrlInput"; // Assuming this is a TS/TSX file or will be converted
import JobDetailsForm from "./JobDetailsForm"; // Assuming this is a TS/TSX file or will be converted
import TailoringProgress from "./TailoringProgress"; // Assuming this is a TS/TSX file or will be converted
// import ResumePreview from "../resume/ResumePreview"; // Replaced by ResumeEditor
import CoverLetterPreview from "../coverLetter/CoverLetterPreview"; // Assuming this is a TS/TSX file or will be converted
import QuestionList from "../questions/QuestionList"; // Corrected import path
import Button from "../ui/Button"; // Assuming this is a TS/TSX file or will be converted
import Toast from "../ui/Toast"; // Assuming this is a TS/TSX file or will be converted
import SpinnerLoader from "../ui/SpinnerLoader"; // Assuming this is a TS/TSX file or will be converted


// Define Flow Steps Enum
export enum FlowStep {
  JOB_URL,
  JOB_DETAILS,
  PRE_TAILORING_CUSTOMIZATION, // New step for TailoringForm
  TAILORING_AI_PROCESSING, // Step for showing loading while AI tailors resume
  REVIEW_RESUME,
  GENERATE_COVER_LETTER_AI_PROCESSING, // Step for showing loading for Cover Letter
  REVIEW_COVER_LETTER,
  ANSWER_JOB_QUESTIONS_AI_PROCESSING, // Step for showing loading for Job Questions
  REVIEW_JOB_QUESTIONS,
  COMPLETED,
}

interface QuestionAnswer {
  id?: string; // Optional if not yet saved
  question: string;
  answer: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'info' | 'success' | 'error';
}

const TailoringFlow: React.FC = () => {
  const navigate = useNavigate();

  // --- OpenAI Hook Integration ---
  const {
    // Resume Tailoring
    tailoredResume: aiTailoredResume,
    tailoringResumeLoading,
    tailoringResumeError,
    callTailorResume,
    // Cover Letter Generation
    coverLetter: aiGeneratedCoverLetter,
    generatingCoverLetterLoading,
    generatingCoverLetterError,
    callGenerateCoverLetter,
    // Job Question Answering
    jobQuestionAnswer: aiJobQuestionAnswer, // Assuming one question at a time for now
    answeringJobQuestionLoading,
    answeringJobQuestionError,
    callAnswerJobQuestion,
  } = useOpenAI();

  // --- State Management with Types ---
  const [step, setStep] = useState<FlowStep>(FlowStep.JOB_URL);
  const [jobUrl, setJobUrl] = useState<string>("");
  const [jobDetails, setJobDetails] = useState<JobInfo | null>(null);
  const [originalResume, setOriginalResume] = useState<Resume | null>(null); // Loaded from user's defaults
  const [tailoredResumeState, setTailoredResumeState] = useState<Resume | null>(null); // Stores the output of callTailorResume or edits from ResumeEditor
  const [coverLetterState, setCoverLetterState] = useState<string | null>(null); // Stores the output of callGenerateCoverLetter
  
  const [jobId, setJobId] = useState<string | null>(null); // Assuming job ID is a string, from backend
  
  // General loading for non-AI specific tasks (e.g., fetching initial resume)
  const [legacyLoading, setLegacyLoading] = useState<boolean>(false); 
  // General error for non-AI specific tasks
  const [legacyError, setLegacyError] = useState<string | null>(null); 
  
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "info" });
  
  // TODO: Define how questions are sourced and managed
  const [jobQuestions, setJobQuestions] = useState<string[]>(["Tell me about yourself.", "Why are you interested in this role?"]); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<QuestionAnswer[]>([]);


  // --- Effects ---

  // Effect to load user's default resume (placeholder logic)
  useEffect(() => {
    const loadDefaultResume = async () => {
      setLegacyLoading(true);
      try {
        // Placeholder: Simulate fetching a resume. Replace with actual API call.
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        const fetchedResume: Resume = { 
          header: { name: "Your Name", title: "Your Title", contact: { email: "email@example.com", phone: "123-456-7890", location: "City, ST", linkedin: "linkedin.com/in/yourprofile"}},
          summary: "A brief summary about your professional background. This is your default resume summary.",
          skills: ["Default Skill 1", "Default Skill 2", "TypeScript", "React"],
          experience: [
            { id:"exp1", title: "Previous Role", company: "Previous Company", location: "City, ST", startDate: "Jan 2020", endDate: "Dec 2022", highlights: ["Achieved X by doing Y.", "Led a team to success."] }
          ],
          education: [
            { id:"edu1", degree: "B.S. in Computer Science", institution: "University of Example", graduationDate: "May 2019"}
          ],
          certificates: ["Certified Cloud Practitioner"],
        };
        setOriginalResume(fetchedResume);
        setLegacyError(null);
      } catch (err) {
        console.error("Failed to load default resume:", err);
        setLegacyError("Failed to load your default resume. Please ensure you have one set up.");
        setToast({ show: true, message: "Could not load your default resume.", type: "error" });
      } finally {
        setLegacyLoading(false);
      }
    };
    loadDefaultResume();
  }, []);


  // Effect to handle successful resume tailoring from AI
  useEffect(() => {
    if (aiTailoredResume && !tailoringResumeLoading && !tailoringResumeError) {
      setTailoredResumeState(aiTailoredResume);
      setStep(FlowStep.REVIEW_RESUME);
      setToast({ show: true, message: "AI tailoring complete! Review your new resume.", type: "success" });
    }
  }, [aiTailoredResume, tailoringResumeLoading, tailoringResumeError]);

  // Effect to handle successful cover letter generation from AI
  useEffect(() => {
    if (aiGeneratedCoverLetter && !generatingCoverLetterLoading && !generatingCoverLetterError) {
      setCoverLetterState(aiGeneratedCoverLetter);
      setStep(FlowStep.REVIEW_COVER_LETTER);
      setToast({ show: true, message: "AI has generated your cover letter!", type: "success" });
    }
  }, [aiGeneratedCoverLetter, generatingCoverLetterLoading, generatingCoverLetterError]);
  
  // Effect to handle successful job question answer from AI
  useEffect(() => {
    if (aiJobQuestionAnswer && !answeringJobQuestionLoading && !answeringJobQuestionError && jobQuestions[currentQuestionIndex]) {
      setAnsweredQuestions(prevAnswers => [
        ...prevAnswers,
        { question: jobQuestions[currentQuestionIndex], answer: aiJobQuestionAnswer }
      ]);
      // Optionally move to next question or a review step after each answer
      if (currentQuestionIndex < jobQuestions.length - 1) {
         // setStep(FlowStep.REVIEW_JOB_QUESTIONS); // Or directly to next question
      } else {
        setStep(FlowStep.REVIEW_JOB_QUESTIONS); // All questions answered
        setToast({ show: true, message: "All questions answered!", type: "success" });
      }
    }
  }, [aiJobQuestionAnswer, answeringJobQuestionLoading, answeringJobQuestionError, currentQuestionIndex, jobQuestions]);


  // --- Event Handlers for Original Steps (Job URL, Job Details) ---
  // These will need to be adapted to use JobInfo type and integrate with the new flow.

  const handleUrlSubmit = useCallback(async (url: string) => {
    setLegacyLoading(true);
    setLegacyError(null);
    try {
      // Placeholder for actual URL processing (e.g., scraping)
      // const result = await addJobFromUrl(url); // Old hook
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      const scrapedJobDetails: JobInfo = { // Example structure
        title: "Software Engineer",
        company: "Tech Solutions Inc.",
        description: "Looking for a skilled software engineer to develop cutting-edge applications.",
        location: "Remote",
        keyRequirements: ["React", "Node.js", "TypeScript"],
        // url: url, // if you have it
      };
      
      // Assuming scraping is successful:
      setJobDetails(scrapedJobDetails);
      // setJobId(result.id); // If you get an ID from backend
      setStep(FlowStep.PRE_TAILORING_CUSTOMIZATION); // Move to the new TailoringForm step
      setToast({ show: true, message: "Job details fetched successfully!", type: "success" });

    } catch (err: any) {
      console.error("Error processing job URL:", err);
      setLegacyError(err.message || "Failed to process job URL. You can enter details manually.");
      setToast({ show: true, message: err.message || "Failed to process job URL.", type: "error" });
      setJobUrl(url); // Keep URL for manual form
      setStep(FlowStep.JOB_DETAILS); // Fallback to manual entry
    } finally {
      setLegacyLoading(false);
    }
  }, []);

  const handleJobDetailsSubmit = useCallback(async (details: JobInfo) => {
    setLegacyLoading(true);
    setLegacyError(null);
    try {
      // Placeholder for saving manual job details
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      // const result = await someApi.saveJobDetails(details); // Example actual call
      // setJobId(result.id); // If you get an ID from backend
      setJobDetails(details); 
      setStep(FlowStep.PRE_TAILORING_CUSTOMIZATION); 
      setToast({ show: true, message: "Job details saved!", type: "success" });

    } catch (err: any) {
      console.error("Error saving job details:", err);
      setLegacyError(err.message || "Failed to save job details.");
      setToast({ show: true, message: err.message || "Failed to save job details.", type: "error" });
    } finally {
      setLegacyLoading(false);
    }
  }, []);

  // --- Handlers for New Component Integrations ---

  const handleTailoringFormSubmit = useCallback((aiResume: Resume) => {
    // This is called by TailoringForm when callTailorResume is successful
    // The useEffect for aiTailoredResume already handles setting tailoredResumeState and step
    // So, this function might not need to do much other than logging or minor state adjustments if any.
    console.log("TailoringForm submitted, AI resume received in TailoringFlow:", aiResume);
    // Step transition is handled by the useEffect watching aiTailoredResume
    setStep(FlowStep.TAILORING_AI_PROCESSING); // Show a loading/processing screen
  }, []);
  
  const handleResumeEditorSave = useCallback((updatedResume: Resume) => {
    setTailoredResumeState(updatedResume);
    setToast({ show: true, message: "Resume updated successfully!", type: "success" });
    // Potentially save to backend here if needed
  }, []);

  // --- AI Operation Triggers ---
  
  const triggerGenerateCoverLetter = useCallback(async () => {
    if (!tailoredResumeState || !jobDetails) {
      setToast({ show: true, message: "Cannot generate cover letter without resume and job details.", type: "error" });
      return;
    }
    setStep(FlowStep.GENERATE_COVER_LETTER_AI_PROCESSING);
    await callGenerateCoverLetter(tailoredResumeState, jobDetails, jobDetails.company || "the company", jobDetails.title || "the role");
    // useEffect for aiGeneratedCoverLetter will handle step transition and success toast
  }, [tailoredResumeState, jobDetails, callGenerateCoverLetter]);

  const triggerAnswerNextQuestion = useCallback(async () => {
    if (!tailoredResumeState || !jobDetails || !jobQuestions[currentQuestionIndex]) {
       setToast({ show: true, message: "Cannot answer question without resume, job details, or question.", type: "error" });
      return;
    }
    setStep(FlowStep.ANSWER_JOB_QUESTIONS_AI_PROCESSING);
    const questionToAnswer = jobQuestions[currentQuestionIndex];
    const previousAnswersForContext = answeredQuestions.map(aq => `Q: ${aq.question}\nA: ${aq.answer}`);
    
    await callAnswerJobQuestion(tailoredResumeState, jobDetails, questionToAnswer, previousAnswersForContext);
    // useEffect for aiJobQuestionAnswer will handle setting state and toast
    // We might need to advance currentQuestionIndex here or in the effect
  }, [tailoredResumeState, jobDetails, jobQuestions, currentQuestionIndex, answeredQuestions, callAnswerJobQuestion]);


  // --- Navigation ---
  const goToNextStep = useCallback(() => {
    setStep(prev => {
      // Handle specific transitions that trigger AI ops or have conditions
      if (prev === FlowStep.REVIEW_RESUME) {
        triggerGenerateCoverLetter(); // This will set its own loading step
        return prev; // Stay on current step visually, triggerGenerateCoverLetter changes it
      }
      if (prev === FlowStep.REVIEW_COVER_LETTER) {
         if (jobQuestions.length > 0 && currentQuestionIndex < jobQuestions.length) {
            triggerAnswerNextQuestion(); // This will set its own loading step
            return prev; // Stay, triggerAnswerNextQuestion changes it
         } else {
            return FlowStep.COMPLETED; // No questions or all answered
         }
      }
      if (prev === FlowStep.REVIEW_JOB_QUESTIONS) {
        if (currentQuestionIndex < jobQuestions.length - 1) {
          setCurrentQuestionIndex(idx => idx + 1);
          triggerAnswerNextQuestion(); // Answer next question
          return prev; // Stay, triggerAnswerNextQuestion changes it
        } else {
          return FlowStep.COMPLETED; // All questions answered
        }
      }
      // Default: just go to next numerical step if defined
      const nextStepValue = prev + 1;
      return Object.values(FlowStep).includes(nextStepValue) ? nextStepValue : prev;
    });
  }, [triggerGenerateCoverLetter, triggerAnswerNextQuestion, jobQuestions, currentQuestionIndex]);

  const goToPreviousStep = useCallback(() => {
    setStep(prev => {
      const prevStepValue = prev - 1;
      // Add any specific back navigation logic if needed, e.g., from AI processing back to form
      if (prev === FlowStep.PRE_TAILORING_CUSTOMIZATION) return FlowStep.JOB_DETAILS; // Or JOB_URL based on context
      if (prev === FlowStep.REVIEW_RESUME) return FlowStep.PRE_TAILORING_CUSTOMIZATION; // Or TAILORING_AI_PROCESSING if you want to show it
      // Default: just go to previous numerical step
      return prevStepValue >= 0 ? prevStepValue : prev;
    });
  }, []);
  
  const handleComplete = useCallback(() => {
    // navigate(`/jobs/${jobId}`); // Navigate to a relevant page
    navigate('/'); // Or home for now
    setToast({ show: true, message: "Process completed!", type: "success" });
  }, [navigate]);


  // --- Render Logic ---
  const renderCurrentStep = () => {
    // Consolidate loading and error display for AI operations
    let currentAiLoading = false;
    let currentAiError: Error | null = null;

    if (step === FlowStep.TAILORING_AI_PROCESSING || step === FlowStep.PRE_TAILORING_CUSTOMIZATION && tailoringResumeLoading) {
        currentAiLoading = tailoringResumeLoading;
        currentAiError = tailoringResumeError;
    } else if (step === FlowStep.GENERATE_COVER_LETTER_AI_PROCESSING && generatingCoverLetterLoading) {
        currentAiLoading = generatingCoverLetterLoading;
        currentAiError = generatingCoverLetterError;
    } else if (step === FlowStep.ANSWER_JOB_QUESTIONS_AI_PROCESSING && answeringJobQuestionLoading) {
        currentAiLoading = answeringJobQuestionLoading;
        currentAiError = answeringJobQuestionError;
    }
    
    if (legacyLoading || currentAiLoading) {
      // More specific loading message based on current step
      let loadingMessage = "Loading...";
      if (step === FlowStep.TAILORING_AI_PROCESSING || tailoringResumeLoading && step === FlowStep.PRE_TAILORING_CUSTOMIZATION) loadingMessage = "Tailoring your resume with AI...";
      if (step === FlowStep.GENERATE_COVER_LETTER_AI_PROCESSING) loadingMessage = "Generating your cover letter with AI...";
      if (step === FlowStep.ANSWER_JOB_QUESTIONS_AI_PROCESSING) loadingMessage = "Generating answer with AI...";
      return <TailoringProgress message={loadingMessage} />;
    }

    if (legacyError) { // Display general errors prominently
        return <div className="text-red-500 p-4 bg-red-100 rounded-md">Error: {legacyError} <Button onClick={() => setLegacyError(null)}>Dismiss</Button></div>;
    }
    if (currentAiError) { // Display AI errors prominently for current operation
        return <div className="text-red-500 p-4 bg-red-100 rounded-md">AI Error: {currentAiError.message} <Button onClick={goToPreviousStep}>Back</Button></div>;
    }


    switch (step) {
      case FlowStep.JOB_URL:
        return <JobUrlInput onSubmit={handleUrlSubmit} onManualEntry={() => setStep(FlowStep.JOB_DETAILS)} />;

      case FlowStep.JOB_DETAILS:
        return (
          <JobDetailsForm
            initialValues={{ url: jobUrl, title: '', company: '', description: '', location: '' }} // Ensure all fields for JobInfo
            onSubmit={handleJobDetailsSubmit}
            onCancel={() => setStep(FlowStep.JOB_URL)}
          />
        );
      
      case FlowStep.PRE_TAILORING_CUSTOMIZATION:
        if (!originalResume || !jobDetails) {
          return <SpinnerLoader message="Loading prerequisites for tailoring..." />;
        }
        return (
          <TailoringForm
            originalResume={originalResume}
            jobDescription={jobDetails}
            onSubmit={handleTailoringFormSubmit} // This will trigger callTailorResume
            onCancel={goToPreviousStep}
          />
        );

      // TAILORING_AI_PROCESSING is handled by global loading check above

      case FlowStep.REVIEW_RESUME:
        if (!tailoredResumeState || !jobDetails) {
          return <SpinnerLoader message="Loading resume for review..." />;
        }
        return (
          <>
            <ResumeEditor
              initialResumeData={tailoredResumeState}
              jobDescription={jobDetails}
              onSave={handleResumeEditorSave}
            />
            <div className="flex flex-col sm:flex-row justify-between mt-6 space-y-3 sm:space-y-0">
              <Button variant="secondary" onClick={goToPreviousStep} className="w-full sm:w-auto">
                Back to Tailoring Options
              </Button>
              <Button onClick={goToNextStep} className="w-full sm:w-auto">Next: Generate Cover Letter</Button>
            </div>
          </>
        );
      
      // GENERATE_COVER_LETTER_AI_PROCESSING is handled by global loading check

      case FlowStep.REVIEW_COVER_LETTER:
        if (!coverLetterState) {
          return <SpinnerLoader message="Loading cover letter..." />;
        }
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Review Your Cover Letter</h2>
            {/* Assuming CoverLetterPreview takes string content.
                A dedicated CoverLetterEditor component would be better for edits. */}
            <CoverLetterPreview 
              coverLetterData={{ content: coverLetterState, id: jobId || "temp-cl-id" }} 
              onEdit={() => setToast({show: true, message: "Cover letter editing coming soon!", type: "info"})} 
            />
            <div className="flex flex-col sm:flex-row justify-between mt-6 space-y-3 sm:space-y-0">
              <Button variant="secondary" onClick={goToPreviousStep} className="w-full sm:w-auto">
                Back to Resume Review
              </Button>
              <Button onClick={goToNextStep} className="w-full sm:w-auto">Next: Answer Job Questions</Button>
            </div>
          </>
        );

      // ANSWER_JOB_QUESTIONS_AI_PROCESSING is handled by global loading check

      case FlowStep.REVIEW_JOB_QUESTIONS:
        if (!answeredQuestions || answeredQuestions.length === 0 && currentQuestionIndex === 0 && !answeringJobQuestionLoading) {
           // This case implies we are about to answer the first question or no questions are defined.
           // If jobQuestions is empty, goToNextStep from REVIEW_COVER_LETTER should skip to COMPLETED.
           // If jobQuestions is not empty, triggerAnswerNextQuestion should be called.
           // For safety, if we land here and answeredQuestions is empty, and not loading, try to trigger.
            if (jobQuestions.length > 0 && !answeringJobQuestionLoading) {
                triggerAnswerNextQuestion(); // Attempt to answer the first question if not already.
                return <TailoringProgress message="Preparing job questions..." />;
            }
             return <SpinnerLoader message="Loading questions..." />;
        }
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Review Generated Answers</h2>
            <QuestionList 
              questions={answeredQuestions.map(aq => ({...aq, jobId: jobId || "temp-job-id"}))} 
              jobId={jobId || "temp-job-id"} 
              // onAnswerEdit, onRegenerateAnswer could be added here
            />
            <div className="flex flex-col sm:flex-row justify-between mt-6 space-y-3 sm:space-y-0">
              <Button variant="secondary" onClick={goToPreviousStep} className="w-full sm:w-auto">
                Back to Cover Letter
              </Button>
              <Button 
                onClick={goToNextStep} 
                disabled={answeringJobQuestionLoading} 
                className="w-full sm:w-auto"
              >
                {currentQuestionIndex < jobQuestions.length - 1 ? "Next Question" : "Finish & View Overview"}
              </Button>
            </div>
          </>
        );

      case FlowStep.COMPLETED:
        return (
          <div className="text-center p-4">
            <h2 className="text-xl font-bold mb-4">All Done!</h2>
            <p className="mb-4">Your tailored application materials are ready.</p>
            <Button onClick={handleComplete}>View Application Overview</Button>
          </div>
        );

      default:
        return <div>Unknown step or loading...</div>;
    }
  };

  // Calculate current step index for progress bar
  const currentStepIndex = Object.values(FlowStep).indexOf(step);
  const totalSteps = Object.values(FlowStep).filter(s => typeof s === 'number').length;


  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6"> {/* Increased max-width */}
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-1">
          {Object.values(FlowStep).filter(s => typeof s === 'number').map((stepValue) => (
            <div
              key={stepValue as number}
              className={`h-2.5 flex-1 rounded-full mx-0.5 transition-colors duration-300 ${
                (stepValue as number) < step ? "bg-indigo-600" : (stepValue as number) === step ? "bg-indigo-400" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <div className="text-center text-xs text-gray-500">
          Step {currentStepIndex + 1} of {totalSteps}: {FlowStep[step]}
        </div>
      </div>

      {/* Global Toast notification */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
      
      {renderCurrentStep()}
    </div>
  );
};

export default TailoringFlow;
