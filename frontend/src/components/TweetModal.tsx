import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, X, Send } from 'lucide-react';
import { useStore } from '../store/useStore';

interface TweetModalProps {
  onClose: () => void;
}

export const TweetModal = ({ onClose }: TweetModalProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createTweet = useStore((state) => state.createTweet);

  // Focus le textarea au chargement du modal
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Limiter à 4 médias maximum
      const newFiles = [...mediaFiles, ...filesArray].slice(0, 4);
      setMediaFiles(newFiles);
      
      // Créer des URLs pour la prévisualisation
      const previewUrls = newFiles.map(file => URL.createObjectURL(file));
      setMediaPreview(previewUrls);
    }
  };

  const removeMedia = (index: number) => {
    const newMediaFiles = [...mediaFiles];
    const newMediaPreview = [...mediaPreview];
    
    // Libérer l'URL de prévisualisation
    URL.revokeObjectURL(newMediaPreview[index]);
    
    newMediaFiles.splice(index, 1);
    newMediaPreview.splice(index, 1);
    
    setMediaFiles(newMediaFiles);
    setMediaPreview(newMediaPreview);
  };

  // Fonction pour convertir un fichier en base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;
    
    try {
      setIsSubmitting(true);
      
      // Extraire les hashtags
      const hashtags = content.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || [];
      
      // Extraire les mentions
      const mentions = content.match(/@(\w+)/g)?.map(mention => mention.substring(1)) || [];
      
      // Convertir les fichiers en base64 pour l'envoi au serveur
      const mediaUrls = await Promise.all(mediaFiles.map(file => fileToBase64(file)));
      
      await createTweet(content, mediaUrls, hashtags, mentions);
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création du tweet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const openFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClickOutside}
    >
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-4 shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Créer un Tweet</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <textarea
            ref={inputRef}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Quoi de neuf ?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={280}
          />
          
          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
            {content.length}/280
          </div>
        </div>
        
        {mediaPreview.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {mediaPreview.map((url, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden">
                <img 
                  src={url} 
                  alt={`Media ${index + 1}`} 
                  className="w-full h-32 object-cover"
                />
                <button
                  className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-100"
                  onClick={() => removeMedia(index)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleMediaChange}
              disabled={mediaFiles.length >= 4}
            />
            <button
              className="text-blue-500 hover:text-blue-600 disabled:text-gray-400"
              onClick={openFileInput}
              disabled={mediaFiles.length >= 4}
            >
              <ImageIcon size={20} />
            </button>
          </div>
          
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center space-x-1 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0)}
          >
            <span>Tweet</span>
            <Send size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}; 