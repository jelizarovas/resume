import React from "react";
import person from "../api/person.json";
import {
  MdCalendarToday,
  MdEmail,
  MdPerson,
  MdPhone,
  MdPinDrop,
} from "react-icons/md";
import Player from "./Player";

export const Header = () => {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap py-4">
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
