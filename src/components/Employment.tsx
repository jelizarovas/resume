import React from "react";
import employment from "../api/employment.json";
import { Section } from "./Section";

export const Employment = () => {
  return (
    <Section title="PROFESSIONAL HISTORY">
      {employment.map((job, i) => (
        <Job key={i} job={job} />
      ))}
    </Section>
  );
};

type JobType = {
  positions: PositionType[];
  location: string;
  company: string;
  logo: string;
};

type PositionType = {
  startDate: string;
  leaveDate?: string;
  description: string[];
  title: string;
};

const Job = ({ job }: { job: JobType }) => {
  return (
    <div className="jobDiv flex flex-col md:flex-row pt-4  pb-4 group transition-all">
      <div className="flex min-w-[300px]">
        <div className="aspect-square max-w-[60px] flex items-start mx-4 rounded">
          <img
            src={job.logo}
            alt={job.company}
            className="grayscale hover:grayscale-0 group-hover:grayscale-[50%]  transition-all"
          />
        </div>
        <div className="flex flex-col">
          <span className="uppercase whitespace-nowrap font-bold text-slate-700 ">
            {job.company}
          </span>
          <span className="text-xs whitespace-nowrap text-slate-500">
            {getCompanyTenure(job.positions)}
          </span>
          <span className="text-xs whitespace-nowrap text-slate-500">
            {job.location}
          </span>
        </div>
      </div>
      <div className="flex flex-col w-full">
        {job.positions.map((position, i) => (
          <Position key={i} position={position} />
        ))}
      </div>
    </div>
  );
};

const Position = ({ position }: { position: PositionType }) => {
  return (
    <div className="w-full  px-4 mt-2 md:mt-0">
      <div className="border-b-2 border-gray-200 px-2 md:px-0 flex items-center justify-between">
        <span className="uppercase font-semibold">{position.title}</span>
        <div className="text-gray-500 text-xs select-none">
          {timeEmployed(position.startDate, position?.leaveDate || undefined)}
        </div>
      </div>
      {/* <div className="text-sm">
        {parseDateString(position.startDate)}{" "}
        {position?.leaveDate
          ? `to ${parseDateString(position.leaveDate)}`
          : "- Current"}
      </div> */}

      <div className="flex flex-col text-xs items-stretch mt-2">
        {position.description.map((duty, i) => (
          <span className="py-0.5" key={i}>
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
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
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

function getCompanyTenure(positions: PositionType[]) {
  const earliest = positions.reduce((pre, cur) =>
    Date.parse(pre.startDate) > Date.parse(cur.startDate) ? cur : pre
  );

  const latest = positions.reduce((acc, val) => {
    if (acc) {
      if (!acc?.leaveDate) {
        const now = new Date();
        return { ...acc, leaveDate: now.toLocaleDateString() };
      }
      return Date.parse(acc.leaveDate) < Date.parse(val.leaveDate || "")
        ? val
        : acc;
    }
    return val;
  });

  return `${parseDateString(earliest.startDate)} - ${parseDateString(
    latest.leaveDate || ""
  )}`;
}
