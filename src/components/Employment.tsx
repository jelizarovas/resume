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
  leaveDate: string;
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
