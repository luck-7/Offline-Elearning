import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    small: 'spinner-border-sm',
    medium: '',
    large: 'spinner-border-lg'
  };

  const textSizes = {
    small: 'small',
    medium: '',
    large: 'h5'
  };

  return (
    <div className={`d-flex flex-column align-items-center justify-content-center p-4 ${className}`}>
      <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && (
        <div className={`mt-3 text-muted ${textSizes[size]}`}>
          {text}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
