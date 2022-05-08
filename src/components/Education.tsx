import React from "react";
import education from "../api/education.json";

export const Education = () => {
  return (
    <div>
      <h2>Education</h2>

      <div className="flex flex-col">
        {education.map((school, i) => (
          <School key={i} school={school} />
        ))}
      </div>
    </div>
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
    <div className="flex flex-col  py-2 border">
      <div className="flex ">
        <div className="aspect-square max-w-[80px] flex items-center mx-4 rounded">
          <img src={school.logo} alt={school.name} className="" />
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
