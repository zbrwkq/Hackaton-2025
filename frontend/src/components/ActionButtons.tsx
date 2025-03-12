import React from 'react';
import { motion } from 'framer-motion';
import { Tweet } from '../types';

interface ActionButtonsProps {
  tweet: Tweet;
  showComments: boolean;
  hasUserLiked: boolean;
  hasUserRetweeted: boolean;
  isBookmarked: boolean;
  onToggleLike: (id: string) => void;
  onToggleRetweet: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onToggleComments: () => void;
}

export function ActionButtons({
  tweet,
  showComments,
  hasUserLiked,
  hasUserRetweeted,
  isBookmarked,
  onToggleLike,
  onToggleRetweet,
  onToggleBookmark,
  onToggleComments
}: ActionButtonsProps) {
  // Animation des boutons
  const buttonVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    })
  };

  // Format des compteurs
  const formatCount = (count: number): string => {
    if (count === 0) return "";
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + "k";
    return (count / 1000000).toFixed(1) + "M";
  };

  return (
    <div className="action-buttons-container flex justify-center space-x-6 md:space-x-10 mt-1 mb-4">
      {/* Commentaire */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={buttonVariants}
        className="action-button-container flex flex-col items-center"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`action-button comment-button p-3 rounded-full shadow-md
            ${showComments ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-gray-700'}`}
          onClick={onToggleComments}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </motion.button>
        <span className={`text-xs mt-1 ${showComments ? 'text-indigo-600' : 'text-gray-600'}`}>
          {formatCount(tweet.comments?.length || 0)}
        </span>
      </motion.div>
      
      {/* Retweet */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={1}
        variants={buttonVariants}
        className="action-button-container flex flex-col items-center"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`action-button retweet-button p-3 rounded-full shadow-md
            ${hasUserRetweeted ? 'bg-green-50 text-green-600' : 'bg-white text-gray-700'}`}
          onClick={() => onToggleRetweet(tweet._id)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </motion.button>
        <span className={`text-xs mt-1 ${hasUserRetweeted ? 'text-green-600' : 'text-gray-600'}`}>
          {formatCount(tweet.retweets?.length || 0)}
        </span>
      </motion.div>
      
      {/* Like */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={2}
        variants={buttonVariants}
        className="action-button-container flex flex-col items-center"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`action-button like-button p-3 rounded-full shadow-md
            ${hasUserLiked ? 'bg-red-50 text-red-500' : 'bg-white text-gray-700'}`}
          onClick={() => onToggleLike(tweet._id)}
        >
          {hasUserLiked ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </motion.button>
        <span className={`text-xs mt-1 ${hasUserLiked ? 'text-red-500' : 'text-gray-600'}`}>
          {formatCount(tweet.likes?.length || 0)}
        </span>
      </motion.div>
      
      {/* Enregistrer */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={3}
        variants={buttonVariants}
        className="action-button-container flex flex-col items-center"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`action-button bookmark-button p-3 rounded-full shadow-md
            ${isBookmarked ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
          onClick={() => onToggleBookmark(tweet._id)}
        >
          {isBookmarked ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          )}
        </motion.button>
        <span className="text-xs mt-1 text-gray-600">
          {isBookmarked ? "Enregistré" : ""}
        </span>
      </motion.div>
    </div>
  );
} 