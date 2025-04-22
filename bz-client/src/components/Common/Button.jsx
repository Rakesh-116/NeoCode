import React from "react";

const Button = ({ children, className, ...props }) => {
  return (
    <button
      className={`px-6 py-2 border border-white/25 text-white rounded-md font-medium  transition duration-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
