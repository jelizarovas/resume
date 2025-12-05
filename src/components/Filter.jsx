import React from "react";

export const Filter = ({ filter, setFilter, positionCategories }) => {
  const handleChange = (event) =>
    setFilter((f) =>
      f.includes(event.target.value)
        ? f.filter((v) => v !== event.target.value)
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

const CheckBox = ({ label, handleChange, checked }) => {
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

function titleCase(v) {
  const str = v.toLowerCase().split(" ");
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
}
