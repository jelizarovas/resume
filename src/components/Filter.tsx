import React from "react";

export const Filter = ({
  filter,
  setFilter,
  positionCategories,
}: {
  filter: string[];
  setFilter: any;
  positionCategories: string[];
}) => {
  const handleChange = (event: { target: any }) =>
    setFilter((f: string[]) =>
      f.includes(event.target.value)
        ? f.filter((v: string) => v !== event.target.value)
        : [...f, event.target.value]
    );
  return (
    <div className="print:hidden bg-gray-200 py-2 px-2 flex flex-col">
      {positionCategories.map((category, i) => (
        <CheckBox
          key={i}
          label={category}
          handleChange={handleChange}
          checked={filter.includes(category)}
        />
      ))}
    </div>
  );
};

const CheckBox = ({
  label,
  handleChange,
  checked,
}: {
  label: string;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  checked: boolean;
}) => {
  return (
    <label className="flex space-x-2 items-center">
      <input
        type="checkbox"
        onChange={handleChange}
        value={label}
        checked={checked}
      />
      <span className="select-none">{titleCase(label)}</span>
    </label>
  );
};

function titleCase(v: string) {
  const str = v.toLowerCase().split(" ");
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
}
