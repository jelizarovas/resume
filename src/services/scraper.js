// src/services/scraper.js
export const scrapeJobPage = async (url) => {
  // This would normally be a Firebase Function
  // Here's a client-side implementation for development:
  try {
    // In production, this would call a Firebase Function
    const response = await fetch("/api/scrapeJob", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error("Job scraping failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error scraping job page:", error);

    // Return a flag indicating manual input is needed
    return {
      success: false,
      error: error.message,
      requiresManualInput: true,
    };
  }
};
