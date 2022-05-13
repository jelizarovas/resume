import React from "react";
import employment from "../api/employment.json";
import { getCompanyTenure, timeEmployed } from "../common/utils";
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

export type PositionType = {
  startDate: string;
  leaveDate?: string;
  description: string[];
  title: string;
};

const Job = ({ job }: { job: JobType }) => {
  return (
    <div className="jobDiv flex flex-col print:flex-row md:flex-row pt-4  pb-4 group transition-all">
      <div className="flex min-w-[300px]  bg-white">
        <div className="aspect-square w-[60px] h-[60px] flex items-center mx-4 rounded">
          <img
            src={process.env.PUBLIC_URL + "/" + job.logo}
            alt={job.company}
            className="grayscale hover:grayscale-0 group-hover:grayscale-[50%]  transition-all"
          />
        </div>
        <div className="flex flex-col">
          <span className="uppercase whitespace-nowrap font-bold text-gray-700 ">
            {job.company}
          </span>
          <span className="text-xs whitespace-nowrap text-gray-500">
            {getCompanyTenure(job.positions)}
          </span>
          <span className="text-xs whitespace-nowrap text-gray-500">
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
    <div className="w-full  px-4 mt-2 md:mt-0 print:mt-0">
      <div className="border-b-2 border-gray-200 px-2 print:px-0 md:px-0 flex items-center justify-between">
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
