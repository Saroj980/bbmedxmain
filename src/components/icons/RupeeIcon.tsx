import React from 'react';

export const RupeeIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => {
  return (
    <span 
      className={`inline-flex items-center justify-center font-black leading-none ${className}`}
      style={{ fontSize: `${size * 0.8}px`, width: size, height: size }}
    >
      रु.
    </span>
  );
};
