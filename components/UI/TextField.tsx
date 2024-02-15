import React from "react";

type Props = {
  label?: string;
  placeholder?: string;
  id?: string;
  name: string;
  type: string;
};

function TextField({ name, type = "text", id, placeholder, label }: Props) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block mb-2 text-sm font-medium text-gray-900 "
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={id}
        className="bg-blue-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder={placeholder}
      />
    </div>
  );
}

export default TextField;
