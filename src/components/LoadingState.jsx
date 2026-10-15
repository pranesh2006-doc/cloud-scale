import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading infrastructure telemetry...' }) => {
  return (
    <div className="loading-state">
      <Loader2 size={32} className="loading-spinner" />
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingState;
