import { PositionType } from "../components/Employment";

export function parseDateString(date: string) {
  const d = new Date(date);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function timeEmployed(dateStart: string, dateLeave?: string) {
  const start = new Date(dateStart);
  const end = dateLeave ? new Date(dateLeave) : new Date();

  const duration = end.valueOf() - start.valueOf();

  const s = duration / 1000;
  const min = s / 60;
  const h = min / 60;
  const days = h / 24;
  const months = Math.ceil(days / 30);

  return `${months > 11 ? Math.floor(months / 12) + " year," : ""} ${
    months % 12
  } months`;
}

export function getCompanyTenure(positions: PositionType[]) {
  const earliest = positions.reduce((pre, cur) =>
    Date.parse(pre.startDate) > Date.parse(cur.startDate) ? cur : pre
  );

  const latest = positions.reduce((acc, val) => {
    if (acc) {
      if (!acc?.leaveDate) {
        const now = new Date();
        return { ...acc, leaveDate: now.toLocaleDateString() };
      }
      return Date.parse(acc.leaveDate) < Date.parse(val.leaveDate || "")
        ? val
        : acc;
    }
    return val;
  });

  return `${parseDateString(earliest.startDate)} - ${parseDateString(
    latest.leaveDate || ""
  )}`;
}

export const includesAll = (arr: string[], target: string[]) =>
  target.every((v) => arr.includes(v));

export const includesSome = (arr: string[], target: string[]) =>
  target.some((v) => arr.includes(v));
