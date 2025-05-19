// src/hooks/useJobs.js
import { useState, useCallback, useContext } from "react";
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, orderBy, where, limit } from "firebase/firestore";
import { db } from "../services/firebase";
import { AuthContext } from "../context/AuthContext";
import { scrapeJobPage } from "../services/scraper";
import { extractJobInformation, generateCoverLetter, answerJobQuestion } from "../services/openai";
import { generateAndUploadPDF } from "../services/pdf";

export const useJobs = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add a new job from URL
  const addJobFromUrl = useCallback(
    async (url) => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        setLoading(true);
        setError(null);

        // Attempt to scrape job data
        const scrapedData = await scrapeJobPage(url);

        if (!scrapedData.success) {
          // If scraping failed, return object indicating manual input is needed
          return {
            success: false,
            requiresManualInput: true,
            url,
          };
        }

        // Extract structured information using OpenAI
        const jobInfo = await extractJobInformation(scrapedData.description);

        // Create new job document
        const jobRef = doc(collection(db, "users", currentUser.uid, "jobs"));

        await setDoc(jobRef, {
          title: jobInfo.title || "Untitled Position",
          company: jobInfo.company || "Unknown Company",
          location: jobInfo.location || "Unknown Location",
          description: scrapedData.description,
          url: url,
          status: "interested",
          keyRequirements: jobInfo.keyRequirements || [],
          responsibilities: jobInfo.responsibilities || [],
          preferredQualifications: jobInfo.preferredQualifications || [],
          benefits: jobInfo.benefits || [],
          employmentType: jobInfo.employmentType || null,
          experienceLevel: jobInfo.experienceLevel || null,
          appliedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
          notes: "",
        });

        return {
          id: jobRef.id,
          ...jobInfo,
          description: scrapedData.description,
          url,
          success: true,
        };
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  // Add a job manually
  const addJobManually = useCallback(
    async (jobData) => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        setLoading(true);
        setError(null);

        // Create new job document
        const jobRef = doc(collection(db, "users", currentUser.uid, "jobs"));

        // Extract structured information using OpenAI if we have a description
        let structuredInfo = {};
        if (jobData.description) {
          structuredInfo = await extractJobInformation(jobData.description);
        }

        await setDoc(jobRef, {
          title: jobData.title || "Untitled Position",
          company: jobData.company || "Unknown Company",
          location: jobData.location || "Unknown Location",
          description: jobData.description || "",
          url: jobData.url || "",
          status: "interested",
          keyRequirements: structuredInfo.keyRequirements || [],
          responsibilities: structuredInfo.responsibilities || [],
          preferredQualifications: structuredInfo.preferredQualifications || [],
          benefits: structuredInfo.benefits || [],
          employmentType: structuredInfo.employmentType || null,
          experienceLevel: structuredInfo.experienceLevel || null,
          appliedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
          notes: jobData.notes || "",
        });

        return { id: jobRef.id, ...jobData };
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  // Generate cover letter for a job
  const generateJobCoverLetter = useCallback(
    async (jobId, resumeData) => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        setLoading(true);
        setError(null);

        // Get the job data
        const jobRef = doc(db, "users", currentUser.uid, "jobs", jobId);
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
          throw new Error("Job not found");
        }

        const jobData = jobSnap.data();

        // Generate cover letter with OpenAI
        const coverLetterContent = await generateCoverLetter(
          resumeData,
          jobData.description,
          jobData.company,
          jobData.title
        );

        // Save the cover letter
        const coverLetterRef = doc(collection(db, "users", currentUser.uid, "coverLetters"));

        await setDoc(coverLetterRef, {
          jobId,
          content: coverLetterContent,
          createdAt: new Date(),
          approved: false,
        });

        // Generate PDF
        const pdfResult = await generateAndUploadPDF(
          currentUser.uid,
          "coverLetter",
          {
            content: coverLetterContent,
            jobTitle: jobData.title,
            company: jobData.company,
            applicantName: resumeData.basics.name,
            applicantEmail: resumeData.basics.email,
            applicantPhone: resumeData.basics.phone,
          },
          coverLetterRef.id
        );

        // Update job with coverLetterId
        await updateDoc(jobRef, {
          tailoredCoverLetterId: coverLetterRef.id,
          updatedAt: new Date(),
        });

        return {
          id: coverLetterRef.id,
          content: coverLetterContent,
          pdfUrl: pdfResult.downloadURL,
        };
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  // Generate answer to job application question
  const generateQuestionAnswer = useCallback(
    async (jobId, question, resumeData) => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        setLoading(true);
        setError(null);

        // Get the job data
        const jobRef = doc(db, "users", currentUser.uid, "jobs", jobId);
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
          throw new Error("Job not found");
        }

        const jobData = jobSnap.data();

        // Get previously answered questions for context
        const previousAnswers = jobData.questions || [];

        // Generate answer with OpenAI
        const answer = await answerJobQuestion(resumeData, jobData.description, question, previousAnswers);

        // Add to job's questions array
        const updatedQuestions = [
          ...previousAnswers,
          {
            question,
            answer,
            generatedByAI: true,
            timestamp: new Date(),
          },
        ];

        // Update job document
        await updateDoc(jobRef, {
          questions: updatedQuestions,
          updatedAt: new Date(),
        });

        return {
          question,
          answer,
          success: true,
        };
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  // Update job status
  const updateJobStatus = useCallback(
    async (jobId, status) => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        setLoading(true);
        setError(null);

        const jobRef = doc(db, "users", currentUser.uid, "jobs", jobId);

        // Update appliedAt timestamp if status is changing to "applied"
        if (status === "applied") {
          await updateDoc(jobRef, {
            status,
            appliedAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          await updateDoc(jobRef, {
            status,
            updatedAt: new Date(),
          });
        }

        return { success: true, status };
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  // Get all jobs
  const getAllJobs = useCallback(
    async (statusFilter = null, limit = 30) => {
      if (!currentUser) return [];

      try {
        setLoading(true);
        setError(null);

        const jobsRef = collection(db, "users", currentUser.uid, "jobs");
        let q;

        if (statusFilter) {
          q = query(jobsRef, where("status", "==", statusFilter), orderBy("updatedAt", "desc"), limit(limit));
        } else {
          q = query(jobsRef, orderBy("updatedAt", "desc"), limit(limit));
        }

        const querySnapshot = await getDocs(q);
        const jobs = [];

        querySnapshot.forEach((doc) => {
          jobs.push({ id: doc.id, ...doc.data() });
        });

        return jobs;
      } catch (err) {
        setError(err.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  // Get job by ID
  const getJobById = useCallback(
    async (jobId) => {
      if (!currentUser) return null;

      try {
        setLoading(true);
        setError(null);

        const jobRef = doc(db, "users", currentUser.uid, "jobs", jobId);
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
          return null;
        }

        return { id: jobId, ...jobSnap.data() };
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  return {
    loading,
    error,
    addJobFromUrl,
    addJobManually,
    generateJobCoverLetter,
    generateQuestionAnswer,
    updateJobStatus,
    getAllJobs,
    getJobById,
  };
};
