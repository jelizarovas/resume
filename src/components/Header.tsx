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
    <div className="flex flex-col">
      <div className="flex py-1 items-center">
        <SubHeader title="Name" data={person.displayName} Icon={MdPerson} />
        <Player
          url={
            process.env.PUBLIC_URL +
            "/sounds/Arnas Jeliarovas name sound it out.mp3"
          }
        />
      </div>

      <SubHeader title="Phone" data={person.phoneNumber} Icon={MdPhone} />
      <SubHeader title="Email" data={person.email} Icon={MdEmail} />
      <SubHeader title="DOB" data={person.dateOfBirth} Icon={MdCalendarToday} />
      <SubHeader title="Location" data={person.location} Icon={MdPinDrop} />
    </div>
  );
};

type SubHeaderType = {
  title: string;
  data: string;
  Icon?: React.FunctionComponent<any>;
};

const SubHeader = ({ Icon, title, data, ...props }: SubHeaderType) => {
  return (
    <div className="flex">
      {Icon && <Icon className="ml-1 mr-2" />}
      <span className="hidden">{title}</span>
      <span>{data}</span>
    </div>
  );
};
