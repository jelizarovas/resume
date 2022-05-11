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
      <details className=" py-2" open>
        <summary className="select-none bg-indigo-50 py-4 uppercase text-xl px-4">
          {props.title}
        </summary>

        {props.children}
      </details>
    </section>
  );
};
