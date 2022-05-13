import React from "react";
import education from "../api/education.json";
import { parseDateString } from "../common/utils";
import { Section } from "./Section";
import { HiAcademicCap } from "react-icons/hi";

export const Education = () => {
  return (
    <Section title="EDUCATION HISTORY">
      <div className="flex flex-col sm:flex-row print:flex-row justify-evenly">
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
  degree: string;
  website: string;
};

const School = ({ school }: { school: SchoolType }) => {
  return (
    <div className="jobDiv flex flex-col w-1/2 mx-2  py-2 group">
      <div className="flex ">
        <div className="aspect-square w-[60px] max-h-[60px] overflow-hidden h-[60px] flex items-center mx-4 rounded">
          <img
            src={process.env.PUBLIC_URL + "/" + school.logo}
            alt={school.name}
            className="grayscale hover:grayscale-0 group-hover:grayscale-[50%]  transition-all"
          />
        </div>
        <div className="flex flex-col">
          <span className="flex space-x-2 items-center uppercase whitespace-nowrap font-bold text-gray-900 ">
            <HiAcademicCap />{" "}
            <a
              href={school.website}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              {school.name}
            </a>
          </span>
          <div className="rounded-lg  ">
            <span>{school.degree}</span>
          </div>
          <span className="text-xs whitespace-nowrap text-gray-500">
            {parseDateString(school.startDate)} -{" "}
            {parseDateString(school.finishDate)}
          </span>
          <span className="text-xs whitespace-nowrap text-gray-500">
            {school.location}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-stretch"></div>
    </div>
  );
};
