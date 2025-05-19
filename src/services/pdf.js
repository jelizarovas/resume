// src/services/pdf.js
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { ResumePDFDocument } from "../components/pdf/ResumePDFDocument";
import { CoverLetterPDFDocument } from "../components/pdf/CoverLetterPDFDocument";
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Generate and download a PDF locally
export const generatePDF = async (type, data, filename) => {
  try {
    let document;

    if (type === "resume") {
      document = <ResumePDFDocument resumeData={data} />;
    } else if (type === "coverLetter") {
      document = <CoverLetterPDFDocument coverLetterData={data} />;
    } else {
      throw new Error(`Unsupported PDF type: ${type}`);
    }

    const blob = await pdf(document).toBlob();
    saveAs(blob, filename);

    return blob;
  } catch (error) {
    console.error(`Error generating ${type} PDF:`, error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

// Generate and upload a PDF to Firebase Storage
export const generateAndUploadPDF = async (userId, type, data, jobId) => {
  try {
    let document;
    let path;

    if (type === "resume") {
      document = <ResumePDFDocument resumeData={data} />;
      path = `users/${userId}/resumes/${jobId}.pdf`;
    } else if (type === "coverLetter") {
      document = <CoverLetterPDFDocument coverLetterData={data} />;
      path = `users/${userId}/coverLetters/${jobId}.pdf`;
    } else {
      throw new Error(`Unsupported PDF type: ${type}`);
    }

    const blob = await pdf(document).toBlob();

    // Upload to Firebase Storage
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    return {
      success: true,
      downloadURL,
    };
  } catch (error) {
    console.error(`Error generating and uploading ${type} PDF:`, error);
    throw new Error(`Failed to generate and upload PDF: ${error.message}`);
  }
};
