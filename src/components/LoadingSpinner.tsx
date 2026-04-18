import Image from 'next/image';
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-bar-wrapper">
      <Image
        src="/loading.jpeg"
        alt="Loading..."
        fill
        className="object-contain rounded-full shadow-lg border-2 border-[#14b8a6]/20"
        priority
      />
    </div>
  );
};

export default LoadingSpinner;
