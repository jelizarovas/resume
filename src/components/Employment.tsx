import React from "react";
import employment from "../api/employment.json";
import { Section } from "./Section";

export const Employment = () => {
  return (
    <Section title="PROFESSIONAL HISTORY">
      {/* <div className="flex flex-col"> */}
      {employment.map((job, i) => (
        <Job key={i} job={job} />
      ))}
      {/* </div> */}
    </Section>
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
    <div className="jobDiv flex flex-col  py-4">
      <div className="flex ">
        <div className="aspect-square max-w-[80px] flex items-center mx-4 rounded">
          <img
            src={job.logo}
            alt={job.company}
            className="grayscale hover:grayscale-0 transition-all"
          />
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

      <div className="flex flex-col text-xs items-stretch mt-2">
        {job.description.map((duty, i) => (
          <span className="py-0.5 px-4" key={i}>
            {duty}
          </span>
        ))}
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
