const fs = require("fs");
const path = require("path");

const structure = {
  src: {
    components: {
      layout: ["AppLayout.tsx", "NavBar.tsx", "BottomNav.tsx"],
      auth: ["LoginForm.tsx", "RegisterForm.tsx", "ProfileForm.tsx"],
      resume: ["ResumePreview.tsx", "ResumeEditor.tsx", "ResumeSectionEditor.tsx", "TailoringForm.tsx"],
      jobs: ["JobList.tsx", "JobCard.tsx", "JobForm.tsx", "JobDetail.tsx", "StatusUpdater.tsx"],
      coverLetter: ["CoverLetterPreview.tsx", "CoverLetterEditor.tsx"],
      questions: ["QuestionList.tsx", "QuestionForm.tsx", "QuestionBankManager.tsx"],
      ui: ["Button.tsx", "Input.tsx", "Modal.tsx", "SpinnerLoader.tsx", "Toast.tsx", "ActionSheet.tsx"],
    },
    context: ["AuthContext.tsx", "ResumeContext.tsx", "JobContext.tsx", "UIContext.tsx"],
    hooks: ["useAuth.ts", "useResume.ts", "useJobs.ts", "useOpenAI.ts", "usePDF.ts", "useScraper.ts"],
    services: ["firebase.ts", "openai.ts", "pdf.ts", "scraper.ts"],
    pages: [
      "HomePage.tsx",
      "AuthPage.tsx",
      "ProfilePage.tsx",
      "ResumePage.tsx",
      "JobsPage.tsx",
      "JobDetailPage.tsx",
      "TailorPage.tsx",
      "QuestionBankPage.tsx",
    ],
    utils: ["constants.ts", "formatters.ts", "validators.ts", "promptTemplates.ts", "dateHelpers.ts"],
  },
  baseFiles: ["App.tsx", "index.tsx"],
};

function createFileIfNotExists(filePath, defaultContent = "// TODO: Implement\n") {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent, "utf8");
    console.log(`✅ Created file: ${filePath}`);
  }
}

function createStructure(basePath, obj) {
  Object.entries(obj).forEach(([key, value]) => {
    const currentPath = path.join(basePath, key);
    if (Array.isArray(value)) {
      // value is a list of files
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath, { recursive: true });
        console.log(`📁 Created directory: ${currentPath}`);
      }
      value.forEach((filename) => {
        const filePath = path.join(currentPath, filename);
        createFileIfNotExists(filePath);
      });
    } else {
      // value is another directory
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath, { recursive: true });
        console.log(`📁 Created directory: ${currentPath}`);
      }
      createStructure(currentPath, value);
    }
  });
}

// Main logic
const srcPath = path.join(__dirname, "src");
if (!fs.existsSync(srcPath)) {
  fs.mkdirSync(srcPath);
  console.log("📁 Created root /src directory");
}
createStructure(__dirname, { src: structure.src });

// Create base files in /src
structure.baseFiles.forEach((file) => {
  const fullPath = path.join(srcPath, file);
  createFileIfNotExists(fullPath);
});
