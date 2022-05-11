import React from "react";

export const Section = (props: {
  title: string;
  children:
    | boolean
    | React.ReactChild
    | React.ReactFragment
    | React.ReactPortal
    | null
    | undefined;
}) => {
  return (
    <section>
      <details className="" open>
        <summary className="print:list-none print:border-b-2 select-none bg-slate-600 text-white py-4 print:py-1  uppercase text-lg px-4">
          {props.title}
        </summary>
        {props.children}
      </details>
    </section>
  );
};
