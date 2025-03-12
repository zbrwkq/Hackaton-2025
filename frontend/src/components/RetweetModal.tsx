import { useState } from 'react';
import { X } from 'lucide-react';
import { Tweet } from '../types';

interface RetweetModalProps {
  isOpen: boolean;
  tweet: Tweet;
  onClose: () => void;
  onRetweet: (tweetId: string, content: string) => void;
}

export function RetweetModal({ isOpen, tweet, onClose, onRetweet }: RetweetModalProps) {
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRetweet(tweet._id, content);
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Retweeter</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 mb-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={tweet.user?.profilePicture || 'https://via.placeholder.com/40'}
              alt={tweet.user?.username}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-semibold">{tweet.user?.username}</span>
          </div>
          <p className="text-sm text-gray-700">{tweet.content}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ajouter un commentaire (optionnel)"
            className="w-full p-3 mb-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          ></textarea>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Retweeter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 