import React from "react";
import person from "../api/person.json";
import {
  // MdCalendarToday,
  MdEmail,
  MdPerson,
  MdPhone,
  MdPinDrop,
} from "react-icons/md";

import { GrDocumentPdf, GrGithub } from "react-icons/gr";
import Player from "./Player";

export const Header = () => {
  return (
    <>
      <div className="max-w-[640px] mx-auto flex flex-col sm:flex-row flex-wrap py-2">
        <SubHeader
          title="Name"
          className="order-1"
          data={person.displayName}
          Icon={MdPerson}
          Action={
            <Player
              url={
                process.env.PUBLIC_URL +
                "/sounds/Arnas Jeliarovas name sound it out.mp3"
              }
            />
          }
        />
        <SubHeader
          title="Phone"
          type="phone"
          data={person.phoneNumber}
          Icon={MdPhone}
          className="order-2"
        />
        <SubHeader
          title="Location"
          data={person.location}
          Icon={MdPinDrop}
          className="order-4 sm:order-3"
        />

        <SubHeader
          title="Email"
          type="email"
          data={person.email}
          Icon={MdEmail}
          className="order-3 sm:order-4"
        />
        {/* <SubHeader title="DOB" data={person.dateOfBirth} Icon={MdCalendarToday} /> */}
      </div>
      <div className="print:hidden bg-gray-200 py-2 mx-auto flex justify-around space-x-2 items-center">
        <div className="flex justify-center space-x-2 items-center group">
          <GrDocumentPdf />
          <a
            href="/pdf/Arnas Jelizarovas Resume EN.pdf"
            target="_blank"
            className="group-hover:underline"
          >
            View as PDF
          </a>
        </div>
        <div className="flex justify-center space-x-2 items-center group">
          <GrGithub />
          <a
            href="https://github.com/jelizarovas/resume"
            target="_blank"
            className="group-hover:underline"
            rel="noreferrer"
          >
            View Source
          </a>
        </div>
      </div>
    </>
  );
};

type SubHeaderType = {
  title: string;
  data: string;
  type?: string;
  className?: string;
  Icon?: React.FunctionComponent<any>;
  Action?: React.ReactNode;
};

const SubHeader = ({
  Icon,
  title,
  data,
  Action,
  type,
  className = "",
  ...props
}: SubHeaderType) => {
  return (
    <div
      className={
        "flex text-xl w-full sm:w-1/2 space-x-2 items-center py-2 px-4 " +
        className
      }
    >
      {Icon && <Icon className="" />}
      <span className="hidden">{title}</span>
      {
        {
          email: (
            <a
              className="hover:underline"
              href={`mailto:${data}`}
              target="_blank"
              rel="noreferrer"
            >
              {data}
            </a>
          ),
          phone: (
            <a
              className="hover:underline"
              target="_blank"
              href={`tel:${data}`}
              rel="noreferrer"
            >
              {data}
            </a>
          ),
          default: <span>{data}</span>,
        }[type || "default"]
      }
      {!!Action && Action}
    </div>
  );
};
