import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaViewerProps {
  isOpen: boolean;
  url: string;
  alt?: string;
  onClose: () => void;
}

export function MediaViewer({ isOpen, url, alt, onClose }: MediaViewerProps) {
  // Fermer le modal quand on appuie sur la touche Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Bloquer le défilement du body quand le modal est ouvert
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Rétablir le défilement du body quand le composant est démonté
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative max-w-screen-lg max-h-screen p-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Bouton de fermeture */}
            <button 
              className="absolute top-5 right-5 bg-white rounded-full p-2 shadow-lg z-10"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image en grand */}
            <img
              src={url}
              alt={alt || 'Image'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              style={{ maxHeight: 'calc(100vh - 8rem)' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 