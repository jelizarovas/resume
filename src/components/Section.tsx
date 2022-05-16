import React, { Dispatch, SetStateAction } from "react";
import { MdFilterList, MdKeyboardArrowUp } from "react-icons/md";

export const Section = ({
  showFilter = false,
  ...props
}: {
  title: string;
  showFilter?: boolean;
  setShowFilter?: Dispatch<SetStateAction<boolean>>;
  children:
    | boolean
    | React.ReactChild
    | React.ReactFragment
    | React.ReactPortal
    | null
    | undefined;
}) => {
  return (
    <section className="">
      <details className="" open>
        <summary className="print:list-none select-none bg-slate-600 text-white py-4 print:py-1  uppercase text-lg px-4 flex justify-between">
          <span>{props.title}</span>{" "}
          {props.setShowFilter && (
            <button
              aria-label="pronunciation"
              onClick={(event) => {
                event.preventDefault();
                props.setShowFilter?.((v) => !v);
              }}
              className={`${
                showFilter ? "opacity-95" : "opacity-50"
              } print:hidden hover:opacity-100 hover:bg-indigo-200 rounded-full p-2 hover:text-indigo-800 transition-all`}
            >
              {showFilter ? <MdKeyboardArrowUp /> : <MdFilterList />}
            </button>
          )}
        </summary>
        {props.children}
      </details>
    </section>
  );
};
