import { useState } from "react";
import { Edit2, Save, RefreshCw } from "lucide-react";

export default function ResumeEditor() {
  const [resume, setResume] = useState({
    header: {
      name: "Jane Doe",
      title: "Senior Full Stack Developer",
      contact: {
        email: "jane.doe@example.com",
        phone: "(555) 123-4567",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/janedoe",
      },
    },
    summary:
      "Versatile Full Stack Developer with 7+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud architecture with a track record of delivering high-performance solutions that drive business growth.",
    skills: [
      "JavaScript/TypeScript",
      "React",
      "Node.js",
      "Python",
      "AWS",
      "Docker",
      "GraphQL",
      "CI/CD",
      "MongoDB",
      "PostgreSQL",
    ],
    experience: [
      {
        title: "Senior Full Stack Developer",
        company: "Tech Innovations Inc.",
        location: "San Francisco, CA",
        dates: "2020 - Present",
        achievements: [
          "Led development of a customer-facing portal that increased user engagement by 45%",
          "Architected and implemented microservices infrastructure reducing deployment time by 60%",
          "Mentored junior developers, implementing code reviews and best practices",
        ],
      },
      {
        title: "Full Stack Developer",
        company: "Digital Solutions LLC",
        location: "Oakland, CA",
        dates: "2017 - 2020",
        achievements: [
          "Developed RESTful APIs serving 10M+ requests daily with 99.9% uptime",
          "Reduced page load time by 35% through frontend optimizations and lazy loading",
          "Implemented automated testing increasing code coverage from 65% to 92%",
        ],
      },
    ],
    education: [
      {
        degree: "B.S. Computer Science",
        institution: "University of California, Berkeley",
        dates: "2013 - 2017",
      },
    ],
    certificates: ["AWS Certified Solutions Architect", "Google Cloud Professional Developer"],
  });

  const [editingSection, setEditingSection] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleEdit = (section, content) => {
    setEditingSection(section);
    setEditContent(typeof content === "object" ? JSON.stringify(content, null, 2) : content);
  };

  const handleSave = () => {
    try {
      let updatedResume = { ...resume };

      // Handle different section types
      if (editingSection === "summary") {
        updatedResume.summary = editContent;
      } else if (editingSection === "skills") {
        updatedResume.skills = JSON.parse(editContent);
      } else if (editingSection.startsWith("experience")) {
        const expIndex = parseInt(editingSection.split(".")[1]);
        const expField = editingSection.split(".")[2];

        if (expField === "achievements") {
          updatedResume.experience[expIndex].achievements = JSON.parse(editContent);
        } else {
          updatedResume.experience[expIndex][expField] = editContent;
        }
      }

      setResume(updatedResume);
      setEditingSection(null);
    } catch (error) {
      console.error("Error saving content:", error);
      // Show error message to user
    }
  };

  const handleRegenerate = (section) => {
    setIsRegenerating(true);

    // Simulate AI regeneration
    setTimeout(() => {
      let updatedResume = { ...resume };

      if (section === "summary") {
        updatedResume.summary =
          "Results-driven Full Stack Developer with 7+ years of experience specializing in modern JavaScript frameworks and cloud services. Proven track record of delivering scalable, high-performance web applications that exceed client expectations and drive business metrics.";
      } else if (section === "skills") {
        updatedResume.skills = [
          "React/Redux",
          "Node.js",
          "TypeScript",
          "RESTful APIs",
          "AWS/Azure",
          "Docker/Kubernetes",
          "CI/CD",
          "MongoDB",
          "PostgreSQL",
          "Agile Methodologies",
        ];
      } else if (section.startsWith("experience")) {
        const expIndex = parseInt(section.split(".")[1]);
        updatedResume.experience[expIndex].achievements = [
          "Architected and developed a scalable customer portal that increased user engagement by 45% and reduced support tickets by 30%",
          "Led migration from monolith to microservices, reducing deployment time by 60% and improving system reliability",
          "Implemented automated testing and CI/CD pipelines, increasing release frequency by 3x while maintaining quality",
        ];
      }

      setResume(updatedResume);
      setIsRegenerating(false);
    }, 1500);
  };

  const renderSectionContent = (section, content, label) => {
    return (
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-semibold text-gray-700">{label}</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleRegenerate(section)}
              className="text-blue-500 hover:text-blue-700 p-1 rounded-full"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => handleEdit(section, content)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full"
            >
              <Edit2 size={16} />
            </button>
          </div>
        </div>

        {editingSection === section ? (
          <div className="mt-2">
            {typeof content === "object" ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={6}
              />
            ) : (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            )}
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded-md flex items-center"
              >
                <Save size={16} className="mr-1" /> Save
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1">
            {typeof content === "object" ? (
              Array.isArray(content) ? (
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {content.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-700">{JSON.stringify(content)}</div>
              )
            ) : (
              <p className="text-sm text-gray-700">{content}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Tailored Resume</h2>

        {/* Resume Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{resume.header.name}</h1>
          <h2 className="text-lg text-gray-700">{resume.header.title}</h2>
          <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-x-4">
            <span>{resume.header.contact.email}</span>
            <span>{resume.header.contact.phone}</span>
            <span>{resume.header.contact.location}</span>
          </div>
        </div>

        {/* Summary Section */}
        {renderSectionContent("summary", resume.summary, "Professional Summary")}

        {/* Skills Section */}
        {renderSectionContent("skills", resume.skills, "Skills")}

        {/* Experience Sections */}
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Work Experience</h3>
        {resume.experience.map((exp, index) => (
          <div key={index} className="mb-4 bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold">{exp.title}</h4>
                <div className="text-sm text-gray-700">
                  {exp.company}, {exp.location}
                </div>
              </div>
              <div className="text-sm text-gray-600">{exp.dates}</div>
            </div>

            {renderSectionContent(`experience.${index}.achievements`, exp.achievements, "Achievements")}
          </div>
        ))}

        {/* Education Section */}
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Education</h3>
        {resume.education.map((edu, index) => (
          <div key={index} className="mb-4 bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold">{edu.degree}</h4>
                <div className="text-sm text-gray-700">{edu.institution}</div>
              </div>
              <div className="text-sm text-gray-600">{edu.dates}</div>
            </div>
          </div>
        ))}

        {/* Certifications Section */}
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Certifications</h3>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            {resume.certificates.map((cert, index) => (
              <li key={index}>{cert}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
