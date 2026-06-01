import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-20 w-full">
      <div className="w-12 h-12 border-4 border-white/10 border-t-accent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
