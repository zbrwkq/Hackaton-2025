import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import type { Tweet } from '../types';

interface TweetCardProps {
  tweet: Tweet;
  hideActions?: boolean;
  onMediaClick?: (url: string, alt?: string) => void;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
}

export function TweetCard({ 
  tweet, 
  hideActions = false, 
  onMediaClick,
  isFollowing = false,
  onToggleFollow
}: TweetCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <div className="relative bg-white rounded-2xl p-6 mx-4 my-2 shadow-sm">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={tweet.user?.profilePicture || 'https://via.placeholder.com/40'}
              alt={tweet.user?.username}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-lg border-2 border-white" />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{tweet.user?.username}</h3>
              <p className="text-sm text-gray-500">
                {new Date(tweet.createdAt).toLocaleDateString('fr-FR', {
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            {onToggleFollow && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFollow();
                }}
                className={`follow-button text-sm font-medium px-3 py-1 rounded-full transition-colors 
                  ${isFollowing 
                    ? 'following bg-indigo-100 text-indigo-700 hover:bg-red-50' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
              >
                {isFollowing ? (
                  <>
                    <span className="follow-text">Suivi</span>
                    <span className="unfollow-text hidden">Ne plus suivre</span>
                  </>
                ) : (
                  'Suivre'
                )}
              </button>
            )}
          </div>
          <p className="text-gray-800 leading-relaxed">{tweet.content}</p>
          {tweet.hashtags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {tweet.hashtags.map(tag => (
                <span key={tag} className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {tweet.media.length > 0 && (
            <div className="mt-3 rounded-xl overflow-hidden">
              <div 
                className={`relative cursor-pointer transform transition hover:scale-[1.01] ${onMediaClick ? 'hover:brightness-90' : ''}`}
                onClick={() => onMediaClick && onMediaClick(tweet.media[0], `Media de ${tweet.user?.username || 'utilisateur'}`)}
              >
                <img 
                  src={tweet.media[0]} 
                  alt={`Media de ${tweet.user?.username || 'utilisateur'}`}
                  className="w-full h-64 object-cover"
                />
                {onMediaClick && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-20">
                    <div className="bg-white p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              
              {tweet.media.length > 1 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  +{tweet.media.length - 1}
                </div>
              )}
            </div>
          )}
          {!hideActions && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
              <button
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors"
                onClick={() => {}}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{tweet.mentions.length}</span>
              </button>
              <button
                className={`flex items-center gap-2 transition-colors ${
                  isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
                }`}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{tweet.likes.length}</span>
              </button>
              <button
                className={`transition-colors ${
                  isBookmarked ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
                }`}
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}