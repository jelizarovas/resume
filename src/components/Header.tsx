import React from "react";
import person from "../api/person.json";
import {
  MdCalendarToday,
  MdEmail,
  MdPerson,
  MdPhone,
  MdPinDrop,
} from "react-icons/md";

export const Header = () => {
  return (
    <div className="flex flex-col">
      <SubHeader title="Name" data={person.displayName} Icon={MdPerson} />
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
