import React from 'react';

const CustomTextInput = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  className = '',
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 ${className}`}
    />
  );
};

export default CustomTextInput;
