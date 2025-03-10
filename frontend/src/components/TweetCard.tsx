import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import type { Tweet } from '../types';

interface TweetCardProps {
  tweet: Tweet;
}

export function TweetCard({ tweet }: TweetCardProps) {
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
            <div>
              <h3 className="font-semibold text-gray-900">{tweet.user?.username}</h3>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(tweet.createdAt))}
              </p>
            </div>
            <button className="text-gray-400 hover:text-indigo-600">
              <Share2 className="w-5 h-5" />
            </button>
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
              <img 
                src={tweet.media[0]} 
                alt="Post media" 
                className="w-full h-64 object-cover"
              />
            </div>
          )}
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
        </div>
      </div>
    </div>
  );
}