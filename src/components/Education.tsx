import React from "react";
import education from "../api/education.json";
import { Section } from "./Section";

export const Education = () => {
  return (
    <Section title="EDUCATION HISTORY">
      <div className="flex flex-col">
        {education.map((school, i) => (
          <School key={i} school={school} />
        ))}
      </div>
    </Section>
  );
};

type SchoolType = {
  name: string;
  startDate: string;
  finishDate: string;
  location: string;
  logo: string;
};

const School = ({ school }: { school: SchoolType }) => {
  return (
    <div className="jobDiv flex flex-col  py-2 border">
      <div className="flex ">
        <div className="aspect-square max-w-[80px] flex items-center mx-4 rounded">
          <img
            src={school.logo}
            alt={school.name}
            className="grayscale hover:grayscale-0 transition-all"
          />
        </div>
        <div className="flex flex-col">
          <span className="uppercase whitespace-nowrap font-bold text-indigo-900 ">
            {school.name}
          </span>
          <span className="text-xs whitespace-nowrap uppercase text-slate-500">
            {school.startDate} - {school.finishDate}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-stretch">
        <div className="flex flex-col">{school.location}</div>
      </div>
    </div>
  );
};
