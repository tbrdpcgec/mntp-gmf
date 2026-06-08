import { forwardRef } from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: string[];
  onValueChange: (value: string) => void;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, onValueChange, ...props }, ref) => {
    return (
      <select
        ref={ref}
        {...props}
        onChange={(e) => onValueChange(e.target.value)}
        className="border rounded px-2 py-1 bg-white"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }
);
