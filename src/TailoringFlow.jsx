import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useResume } from "../../hooks/useResume";
import { useJobs } from "../../hooks/useJobs";
import { AuthContext } from "../../context/AuthContext";
import JobUrlInput from "./JobUrlInput";
import JobDetailsForm from "./JobDetailsForm";
import TailoringProgress from "./TailoringProgress";
import ResumePreview from "../resume/ResumePreview";
import CoverLetterPreview from "../coverLetter/CoverLetterPreview";
import QuestionsList from "../questions/QuestionsList";
import Button from "../ui/Button";
import Toast from "../ui/Toast";
import SpinnerLoader from "../ui/SpinnerLoader";

// Steps in the tailoring flow
const STEPS = {
  JOB_URL: 0,
  JOB_DETAILS: 1,
  TAILORING: 2,
  REVIEW_RESUME: 3,
  REVIEW_LETTER: 4,
  QUESTIONS: 5,
  COMPLETE: 6,
};

const TailoringFlow = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { getDefaultResume, createTailoredResume } = useResume();
  const { addJobFromUrl, addJobManually, generateJobCoverLetter, generateQuestionAnswer } = useJobs();

  // State management
  const [step, setStep] = useState(STEPS.JOB_URL);
  const [jobUrl, setJobUrl] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [originalResume, setOriginalResume] = useState(null);
  const [tailoredResume, setTailoredResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [commonQuestions, setCommonQuestions] = useState([]);
  const [generatedAnswers, setGeneratedAnswers] = useState([]);

  // Load user's default resume
  useEffect(() => {
    const loadDefaultResume = async () => {
      try {
        const resume = await getDefaultResume();
        setOriginalResume(resume);
      } catch (err) {
        setError("Failed to load your default resume. Please try again.");
      }
    };

    if (currentUser) {
      loadDefaultResume();
    }
  }, [currentUser, getDefaultResume]);

  // Handle URL submission
  const handleUrlSubmit = async (url) => {
    try {
      setLoading(true);
      setError(null);

      const result = await addJobFromUrl(url);

      if (!result.success) {
        // If scraping failed, move to manual entry with pre-filled URL
        setJobUrl(url);
        setStep(STEPS.JOB_DETAILS);
        return;
      }

      // Success - job was scraped and added
      setJobDetails({
        title: result.title,
        company: result.company,
        description: result.description,
        url: result.url,
        location: result.location,
      });

      setJobId(result.id);
      setStep(STEPS.TAILORING);

      // Start tailoring process automatically
      await startTailoring(result.id, result.description);
    } catch (err) {
      setError(err.message || "Failed to process job URL");
    } finally {
      setLoading(false);
    }
  };

  // Handle manual job details submission
  const handleJobDetailsSubmit = async (details) => {
    try {
      setLoading(true);
      setError(null);

      const result = await addJobManually(details);
      setJobDetails(details);
      setJobId(result.id);
      setStep(STEPS.TAILORING);

      // Start tailoring process automatically
      await startTailoring(result.id, details.description);
    } catch (err) {
      setError(err.message || "Failed to add job details");
    } finally {
      setLoading(false);
    }
  };

  // Start the tailoring process
  const startTailoring = async (id, description) => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Generate tailored resume
      const tailoredResult = await createTailoredResume(originalResume.id, description, id);

      setTailoredResume(tailoredResult);

      // Step 2: Generate cover letter
      const coverLetterResult = await generateJobCoverLetter(id, tailoredResult.jsonData);

      setCoverLetter(coverLetterResult);

      // Step 3: Generate common question answers (for predefined questions)
      const answers = await Promise.all(
        commonQuestions.map((q) => generateQuestionAnswer(id, q.question, tailoredResult.jsonData))
      );

      setGeneratedAnswers(answers);

      // Move to review resume step
      setStep(STEPS.REVIEW_RESUME);
      setToast({
        show: true,
        message: "Tailoring complete! Review your resume.",
        type: "success",
      });
    } catch (err) {
      setError(err.message || "Failed to tailor your application materials");
    } finally {
      setLoading(false);
    }
  };

  // Handle resume section edit
  const handleSectionEdit = (sectionName) => {
    // Open resume section editor for the specified section
    navigate(`/resume-editor/${tailoredResume.id}/${sectionName}`);
  };

  // Handle cover letter edit
  const handleCoverLetterEdit = () => {
    // Open cover letter editor
    navigate(`/cover-letter-editor/${coverLetter.id}`);
  };

  // Navigation to next step
  const goToNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  // Navigation to previous step
  const goToPreviousStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  // Complete the tailoring process
  const handleComplete = () => {
    navigate(`/jobs/${jobId}`);
  };

  // Render based on current step
  const renderCurrentStep = () => {
    switch (step) {
      case STEPS.JOB_URL:
        return <JobUrlInput onSubmit={handleUrlSubmit} onManualEntry={() => setStep(STEPS.JOB_DETAILS)} />;

      case STEPS.JOB_DETAILS:
        return (
          <JobDetailsForm
            initialValues={{ url: jobUrl }}
            onSubmit={handleJobDetailsSubmit}
            onCancel={() => setStep(STEPS.JOB_URL)}
          />
        );

      case STEPS.TAILORING:
        return <TailoringProgress jobTitle={jobDetails?.title} company={jobDetails?.company} />;

      case STEPS.REVIEW_RESUME:
        return (
          <>
            <ResumePreview resumeData={tailoredResume.jsonData} onSectionEdit={handleSectionEdit} />
            <div className="flex justify-between mt-4">
              <Button variant="secondary" onClick={goToPreviousStep}>
                Back
              </Button>
              <Button onClick={goToNextStep}>Continue to Cover Letter</Button>
            </div>
          </>
        );

      case STEPS.REVIEW_LETTER:
        return (
          <>
            <CoverLetterPreview coverLetterData={coverLetter} onEdit={handleCoverLetterEdit} />
            <div className="flex justify-between mt-4">
              <Button variant="secondary" onClick={goToPreviousStep}>
                Back to Resume
              </Button>
              <Button onClick={goToNextStep}>Continue to Questions</Button>
            </div>
          </>
        );

      case STEPS.QUESTIONS:
        return (
          <>
            <QuestionsList questions={generatedAnswers} jobId={jobId} />
            <div className="flex justify-between mt-4">
              <Button variant="secondary" onClick={goToPreviousStep}>
                Back to Cover Letter
              </Button>
              <Button onClick={goToNextStep}>Complete</Button>
            </div>
          </>
        );

      case STEPS.COMPLETE:
        return (
          <div className="text-center p-4">
            <h2 className="text-xl font-bold mb-4">All Done!</h2>
            <p className="mb-4">Your tailored resume and cover letter are ready for submission.</p>
            <Button onClick={handleComplete}>Go to Job Application</Button>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {Object.values(STEPS).map((stepValue) => (
            <div
              key={stepValue}
              className={`h-2 flex-1 rounded-full mx-1 ${
                stepValue < step ? "bg-blue-600" : stepValue === step ? "bg-blue-400" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <div className="text-center text-sm text-gray-600">
          Step {step + 1} of {Object.keys(STEPS).length}
        </div>
      </div>

      {/* Error message */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Loading spinner */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <SpinnerLoader size="lg" />
        </div>
      ) : (
        renderCurrentStep()
      )}

      {/* Toast notification */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
    </div>
  );
};

export default TailoringFlow;
