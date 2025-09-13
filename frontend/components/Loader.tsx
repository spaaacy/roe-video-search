import React from "react";
import { BarLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="py-8">
      <div className="m-auto">
        <BarLoader color={"var(--primary)"} />
      </div>
    </div>
  );
};

export default Loader;
