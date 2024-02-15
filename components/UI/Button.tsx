"use client";
import React, { PropsWithChildren } from "react";
import classNames from "classnames";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "xs" | "md"
}

const Button: React.FC<ButtonProps & PropsWithChildren> = ({
  variant = "primary",
  children,
  className,
  size,
  ...props
}) => {
  return (
    <button
      {...props}
      className={classNames(
        "w-full  focus:outline-none  font-medium text-center ",
        'text-white  disabled:opacity-40 bg-black not:disabled:hover:bg-[#454545] not:disabled:cursor-pointer',
        size === 'xs' ? "px-2 py-1.5 text-xs" : "px-5 py-2.5  text-sm",
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
