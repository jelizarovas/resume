import React from "react";
import employment from "../api/employment.json";

export const Employment = () => {
  return (
    <div>
      <h2>Employment</h2>

      <div className="flex flex-col">
        {employment.map((job, i) => (
          <Job key={i} job={job} />
        ))}
      </div>
    </div>
  );
};

type JobType = {
  position: string;
  location: string;
  company: string;
  startDate: string;
  leaveDate?: string;
  description: string[];
  logo: string;
};

const Job = ({ job }: { job: JobType }) => {
  return (
    <div className="flex flex-col  py-2 border">
      <div className="flex ">
        <div className="aspect-square max-w-[80px] flex items-center mx-4 rounded">
          <img src={job.logo} alt={job.company} className="" />
        </div>
        <div className="flex flex-col">
          <span className="uppercase whitespace-nowrap font-bold text-indigo-900 ">
            {job.position}
          </span>
          <span className="text-xs whitespace-nowrap uppercase text-slate-500">
            {job.company}
          </span>
          <div className="text-sm">
            {parseDateString(job.startDate)}{" "}
            {job?.leaveDate
              ? `to ${parseDateString(job.leaveDate)}`
              : "- Current"}
          </div>
          <div className="text-gray-500 text-xs">
            {timeEmployed(job.startDate, job?.leaveDate || undefined)}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-stretch">
        <div className="flex flex-col">
          {job.description.map((duty, i) => (
            <span className="py-0.5 px-4" key={i}>
              {duty}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

function parseDateString(date: string) {
  const d = new Date(date);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[d.getMonth()]}, ${d.getFullYear()}`;
}

function timeEmployed(dateStart: string, dateLeave?: string) {
  const start = new Date(dateStart);
  const end = dateLeave ? new Date(dateLeave) : new Date();

  const duration = end.valueOf() - start.valueOf();

  const s = duration / 1000;
  const min = s / 60;
  const h = min / 60;
  const days = h / 24;
  const months = Math.ceil(days / 30);

  return `${months > 11 ? Math.floor(months / 12) + " year," : ""} ${
    months % 12
  } months`;
}
