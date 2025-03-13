import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tweet, Comment, User } from '../types';
import { useStore } from '../store/useStore';

interface CommentSectionProps {
  isOpen: boolean;
  tweet: Tweet;
  onClose: () => void;
  onAddComment: (tweetId: string, content: string) => void;
  currentUserId: string;
}

export function CommentSection({ isOpen, tweet, onClose, onAddComment, currentUserId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  // Récupérer l'utilisateur courant depuis le store
  const currentUser = useStore((state) => state.currentUser);

  // Fonction pour normaliser les données utilisateur depuis un commentaire
  const getUserFromComment = (comment: Comment) => {
    // Si comment.user existe, l'utiliser directement
    if (comment.user) {
      return comment.user;
    }
    
    // Si userId est un objet (populé par Mongoose), l'utiliser comme user
    if (comment.userId && typeof comment.userId === 'object') {
      return comment.userId;
    }
    
    // Par défaut, retourner un objet minimal
    return {
      username: 'Utilisateur',
      profilePicture: ''
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="comments-card card-active"
          style={{
            position: 'absolute',
            width: '480px',
            maxHeight: '70vh',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            overflowY: 'auto',
            zIndex: 11,
            padding: '1.5rem',
            transform: 'translateY(5%)',
          }}
          initial={{ x: '100%', opacity: 0, y: '0%' }}
          animate={{ 
            x: 'calc(15% + 200px)', 
            opacity: 1,
            y: '0%' 
          }}
          exit={{ x: '100%', opacity: 0, y: '0%' }}
          transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="comments-header flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Commentaires</h2>
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="comments-list space-y-4 mb-4">
            {tweet.comments && tweet.comments.length > 0 ? (
              tweet.comments.map((comment: Comment) => {
                const user = getUserFromComment(comment);
                return (
                  <motion.div
                    key={comment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="comment bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex items-start space-x-3">
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture}
                          alt={user.username || 'Utilisateur'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-bold text-sm">
                            {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-900">{user.username || 'Utilisateur'}</h4>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-8">
                Aucun commentaire pour le moment. Soyez le premier à commenter !
              </div>
            )}
          </div>
          
          {/* Formulaire pour ajouter un commentaire */}
          <div className="comments-input border-t border-gray-100 pt-4">
            <div className="flex space-x-3">
              {currentUser ? (
                currentUser.profilePicture ? (
                  <img 
                    src={currentUser.profilePicture}
                    alt={currentUser.username}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-500 font-bold text-lg">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-500 font-bold text-lg">U</span>
                </div>
              )}
              <div className="flex-1 relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Écrivez un commentaire..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                  rows={3}
                />
                <button
                  className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full disabled:opacity-50"
                  disabled={!newComment.trim()}
                  onClick={() => {
                    onAddComment(tweet._id, newComment);
                    setNewComment('');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 