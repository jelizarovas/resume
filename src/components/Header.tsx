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
    <div className="flex flex-col md:flex-row flex-wrap py-4">
      <SubHeader
        title="Name"
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
      />
      <SubHeader title="Location" data={person.location} Icon={MdPinDrop} />

      <SubHeader
        title="Email"
        type="email"
        data={person.email}
        Icon={MdEmail}
      />
      {/* <SubHeader title="DOB" data={person.dateOfBirth} Icon={MdCalendarToday} /> */}
    </div>
  );
};

type SubHeaderType = {
  title: string;
  data: string;
  type?: string;
  Icon?: React.FunctionComponent<any>;
  Action?: React.ReactNode;
};

const SubHeader = ({
  Icon,
  title,
  data,
  Action,
  type,
  ...props
}: SubHeaderType) => {
  return (
    <div className="flex text-xl w-full md:w-1/2 space-x-2 items-center py-2 px-4">
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
