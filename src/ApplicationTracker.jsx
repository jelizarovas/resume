import { useState } from "react";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Edit2,
  FileText,
  Filter,
  MessageSquare,
  Search,
  Star,
  UserCheck,
  X,
} from "lucide-react";

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([
    {
      id: "1",
      company: "TechCorp",
      position: "Senior Frontend Developer",
      location: "Remote",
      salary: "$120,000 - $150,000",
      status: "applied",
      dateApplied: "2025-05-10",
      lastActivity: "2025-05-15",
      notes: "Recruiter reached out via LinkedIn. Applied through their portal.",
      nextStep: "Follow up by 5/22 if no response",
    },
    {
      id: "2",
      company: "InnovateSoft",
      position: "Full Stack Engineer",
      location: "San Francisco, CA",
      salary: "$140,000 - $180,000",
      status: "interview",
      dateApplied: "2025-05-07",
      lastActivity: "2025-05-14",
      notes: "First-round technical interview completed. Waiting for next steps.",
      nextStep: "Technical challenge due 5/21",
    },
    {
      id: "3",
      company: "DataDynamics",
      position: "Backend Developer",
      location: "Austin, TX",
      salary: "$110,000 - $130,000",
      status: "interested",
      dateApplied: null,
      lastActivity: "2025-05-12",
      notes: "Job looks interesting, need to tailor resume",
      nextStep: "Apply by 5/20",
    },
    {
      id: "4",
      company: "Cloud Systems Inc",
      position: "DevOps Engineer",
      location: "Chicago, IL (Hybrid)",
      salary: "$125,000 - $155,000",
      status: "offer",
      dateApplied: "2025-04-25",
      lastActivity: "2025-05-16",
      notes: "Received offer: $145K base + benefits, 4 weeks PTO",
      nextStep: "Decide by 5/23",
    },
    {
      id: "5",
      company: "Startup Vision",
      position: "Full Stack Developer",
      location: "New York, NY",
      salary: "$115,000 - $135,000",
      status: "rejected",
      dateApplied: "2025-05-01",
      lastActivity: "2025-05-13",
      notes: "Rejected after technical interview. Feedback: need more experience with their specific tech stack.",
      nextStep: null,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      interested: { icon: Star, color: "bg-yellow-100 text-yellow-800", text: "Interested" },
      applied: { icon: CheckCircle, color: "bg-blue-100 text-blue-800", text: "Applied" },
      interview: { icon: UserCheck, color: "bg-purple-100 text-purple-800", text: "Interviewing" },
      offer: { icon: Briefcase, color: "bg-green-100 text-green-800", text: "Offer" },
      rejected: { icon: X, color: "bg-gray-100 text-gray-800", text: "Rejected" },
    };

    const config = statusConfig[status];

    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <config.icon size={12} className="mr-1" />
        {config.text}
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Application Tracker</h2>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search companies or positions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="interested">Interested</option>
            <option value="applied">Applied</option>
            <option value="interview">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Application Cards */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No applications found</p>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <div key={app.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{app.position}</h3>
                  <p className="text-gray-600">{app.company}</p>
                  <p className="text-sm text-gray-500">
                    {app.location} • {app.salary}
                  </p>
                </div>
                {getStatusBadge(app.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={14} className="mr-1" />
                  Applied: {app.dateApplied || "Not yet"}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={14} className="mr-1" />
                  Last activity: {app.lastActivity}
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-start space-x-1 text-sm text-gray-600 mb-1">
                  <MessageSquare size={14} className="mt-1 flex-shrink-0" />
                  <p>{app.notes}</p>
                </div>
              </div>

              {app.nextStep && <div className="text-sm font-medium text-blue-600">Next: {app.nextStep}</div>}

              <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
                <button className="text-gray-600 hover:text-gray-800 text-sm flex items-center">
                  <Edit2 size={14} className="mr-1" /> Edit
                </button>
                <button className="text-gray-600 hover:text-gray-800 text-sm flex items-center">
                  <FileText size={14} className="mr-1" /> View Files
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
