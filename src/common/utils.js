export function parseDateString(date) {
  if (!date) return "Present";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Present";

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

export function timeEmployed(dateStart, dateLeave) {
  const start = new Date(dateStart);
  const end = dateLeave ? new Date(dateLeave) : new Date();

  if (Number.isNaN(start.getTime())) return "";

  const duration = end - start;
  const months = Math.ceil(duration / (1000 * 60 * 60 * 24 * 30));

  const years = Math.floor(months / 12);
  const rem = months % 12;

  const parts = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (rem > 0) parts.push(`${rem} month${rem > 1 ? "s" : ""}`);

  return parts.join(", ") || "Less than 1 month";
}

export function getCompanyTenure(positions) {
  if (!positions || positions.length === 0) return "";

  const earliest = positions.reduce((prev, cur) =>
    Date.parse(prev.startDate) > Date.parse(cur.startDate) ? cur : prev
  );

  const latest = positions.reduce((prev, cur) => {
    const prevEnd = prev.leaveDate ? Date.parse(prev.leaveDate) : Infinity;
    const curEnd = cur.leaveDate ? Date.parse(cur.leaveDate) : Infinity;
    return prevEnd > curEnd ? prev : cur;
  });

  return `${parseDateString(earliest.startDate)} - ${
    latest.leaveDate ? parseDateString(latest.leaveDate) : "Present"
  }`;
}

export const includesAll = (arr, target) =>
  target.every((v) => arr.includes(v));

export const includesSome = (arr, target) =>
  target.some((v) => arr.includes(v));
