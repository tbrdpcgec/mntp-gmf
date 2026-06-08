import React from 'react';

interface CustomSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  className?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  className = '',
}: CustomSelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`rounded px-1.5 py-0.5 appearance-none bg-right bg-[length:10px_10px] bg-no-repeat pr-4 transition-all  ease-in-out focus:ring-1 focus:ring-gray-400 focus:border-gray-400  hover:border-teal-500
  bg-[#292929] text-white
  [&_option]:bg-[#292929]
  [&_option]:text-white ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%23ffffff' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
