import React from 'react';

const Buton = ({
  onClick,
  text = 'Click Me',
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`text-white px-4 py-2 rounded hover:opacity-90 ${className}`}
    >
      {text}
    </button>
  );
};

export default Buton;
