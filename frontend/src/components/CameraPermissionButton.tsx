import React from 'react';

interface CameraPermissionButtonProps {
  onRequestPermission: () => Promise<void>;
  visible: boolean;
}

export function CameraPermissionButton({ onRequestPermission, visible }: CameraPermissionButtonProps) {
  if (!visible) return null;
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <button
        onClick={onRequestPermission}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
        Autoriser l'accès à la caméra
      </button>
    </div>
  );
} 