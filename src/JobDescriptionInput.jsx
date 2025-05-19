import { useState } from "react";
import { Clipboard, Link, Upload, ArrowRight } from "lucide-react";

export default function JobDescriptionInput() {
  const [inputMethod, setInputMethod] = useState("paste");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setIsLoading(true);
    setError("");

    try {
      if (inputMethod === "url") {
        // Call scraping function
        // const result = await window.scrapeJobUrl(jobUrl);
        // setJobDescription(result.description);
        console.log("Scraping URL:", jobUrl);
        // Simulating API call
        setTimeout(() => {
          setJobDescription("This is a scraped job description for Software Engineer...");
          setIsLoading(false);
        }, 1500);
      } else {
        // Process the pasted job description
        console.log("Processing pasted description");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Failed to process job description. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Add Job Description</h2>

      {/* Input Method Selector */}
      <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
            inputMethod === "paste" ? "bg-white shadow-sm" : "text-gray-600"
          }`}
          onClick={() => setInputMethod("paste")}
        >
          <div className="flex items-center justify-center">
            <Clipboard size={16} className="mr-2" />
            <span>Paste Text</span>
          </div>
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
            inputMethod === "url" ? "bg-white shadow-sm" : "text-gray-600"
          }`}
          onClick={() => setInputMethod("url")}
        >
          <div className="flex items-center justify-center">
            <Link size={16} className="mr-2" />
            <span>Job URL</span>
          </div>
        </button>
      </div>

      <div>
        {inputMethod === "url" ? (
          <div className="mb-4">
            <label htmlFor="jobUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Job Listing URL
            </label>
            <input
              id="jobUrl"
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://company.com/jobs/position"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex justify-between items-center">
          <button
            type="button"
            className="flex items-center text-gray-600 px-4 py-2 rounded-md text-sm hover:bg-gray-100"
          >
            <Upload size={16} className="mr-2" />
            Upload PDF
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center">
                Continue <ArrowRight size={16} className="ml-2" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
