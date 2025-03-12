import React from 'react';

interface RecordingErrorMessageProps {
  error: string | null;
}

export function RecordingErrorMessage({ error }: RecordingErrorMessageProps) {
  if (!error) return null;
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    </div>
  );
} 