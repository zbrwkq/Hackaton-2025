import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import type { Tweet, RetweetData } from '../types';
import { useStore } from '../store/useStore';
import { RetweetModal } from './RetweetModal';
import * as authService from '../services/authService';

interface TweetCardProps {
  tweet: Tweet;
  hideActions?: boolean;
  onMediaClick?: (url: string, alt?: string) => void;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
}

// URL de base de l'API
const API_URL = '/api/tweets/tweets';

export function TweetCard({ 
  tweet, 
  hideActions = false, 
  onMediaClick,
  isFollowing = false,
  onToggleFollow
}: TweetCardProps) {
  const { currentUser } = useStore();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showRetweetModal, setShowRetweetModal] = useState(false);
  const [hasRetweeted, setHasRetweeted] = useState(false);
  const [tweetData, setTweetData] = useState<Tweet>(tweet);

  // Vérifier si l'utilisateur a déjà liké ou retweeté ce tweet
  useEffect(() => {
    if (currentUser && tweet.likes) {
      setIsLiked(tweet.likes.includes(currentUser._id));
    }
    
    // Vérifier si l'utilisateur a retweeté
    if (currentUser && tweet.retweets) {
      const userHasRetweeted = tweet.retweets.some(retweet => {
        if (typeof retweet === 'string') {
          return retweet === currentUser._id;
        } else {
          // C'est un objet RetweetData
          return retweet.userId === currentUser._id;
        }
      });
      setHasRetweeted(userHasRetweeted);
    }
    
    // Vérifier si le tweet est sauvegardé
    if (currentUser && tweet.isSavedByUser !== undefined) {
      setIsBookmarked(tweet.isSavedByUser);
    } else if (currentUser && tweet.savedBy) {
      setIsBookmarked(tweet.savedBy.includes(currentUser._id));
    }
    
    setTweetData(tweet);
  }, [tweet, currentUser]);

  // Fonction pour liker/unliker un tweet - Appel API direct
  const handleLike = async () => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(`${API_URL}/${tweet._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du like/unlike');
      }

      const updatedTweet = await response.json();
      setTweetData(updatedTweet);
      setIsLiked(!isLiked);
      console.log('Like/Unlike réussi:', updatedTweet);
    } catch (error) {
      console.error('Erreur lors du like/unlike:', error);
    }
  };

  // Fonction pour ouvrir le modal de retweet
  const handleRetweetClick = () => {
    setShowRetweetModal(true);
  };

  // Fonction pour retweeter un tweet - Appel API direct
  const handleRetweet = async (tweetId: string, content: string) => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(`${API_URL}/${tweetId}/retweet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: content || '' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du retweet');
      }

      const data = await response.json();
      console.log('Retweet réussi:', data);
      setHasRetweeted(true);
    } catch (error) {
      console.error('Erreur lors du retweet:', error);
    }
  };

  // Fonction pour sauvegarder un tweet - Appel API direct
  const handleBookmark = async () => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(`${API_URL}/${tweet._id}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }

      const result = await response.json();
      setIsBookmarked(result.isSaved);
      console.log('Sauvegarde réussie:', result);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Fonction pour commenter un tweet - Appel API direct
  const handleComment = async () => {
    if (!commentContent.trim()) {
      setShowCommentInput(true);
      return;
    }

    try {
      const token = authService.getToken();
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(`${API_URL}/${tweet._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentContent })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du commentaire');
      }

      const data = await response.json();
      console.log('Commentaire ajouté:', data);
      setTweetData(data.tweet);
      setCommentContent('');
      setShowCommentInput(false);
    } catch (error) {
      console.error('Erreur lors du commentaire:', error);
    }
  };

  return (
    <div className="relative bg-white rounded-2xl p-6 mx-4 my-2 shadow-sm">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={tweetData.user?.profilePicture || 'https://via.placeholder.com/40'}
              alt={tweetData.user?.username}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-lg border-2 border-white" />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{tweetData.user?.username}</h3>
              <p className="text-sm text-gray-500">
                {new Date(tweetData.createdAt).toLocaleDateString('fr-FR', {
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
          <p className="text-gray-800 leading-relaxed">{tweetData.content}</p>
          {tweetData.hashtags && tweetData.hashtags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {tweetData.hashtags.map(tag => (
                <span key={tag} className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {tweetData.media && tweetData.media.length > 0 && (
            <div className="mt-3 rounded-xl overflow-hidden">
              <div 
                className={`relative cursor-pointer transform transition hover:scale-[1.01] ${onMediaClick ? 'hover:brightness-90' : ''}`}
                onClick={() => onMediaClick && onMediaClick(tweetData.media[0], `Media de ${tweetData.user?.username || 'utilisateur'}`)}
              >
                <img 
                  src={tweetData.media[0]} 
                  alt={`Media de ${tweetData.user?.username || 'utilisateur'}`}
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
              
              {tweetData.media && tweetData.media.length > 1 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  +{tweetData.media.length - 1}
                </div>
              )}
            </div>
          )}
          {!hideActions && (
            <>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                <button
                  className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors"
                  onClick={handleComment}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{tweetData.comments?.length || 0}</span>
                </button>
                <button
                  className={`flex items-center gap-2 transition-colors ${
                    hasRetweeted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
                  }`}
                  onClick={handleRetweetClick}
                >
                  <Share2 className={`w-5 h-5 ${hasRetweeted ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{tweetData.retweets?.length || 0}</span>
                </button>
                <button
                  className={`flex items-center gap-2 transition-colors ${
                    isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
                  }`}
                  onClick={handleLike}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{tweetData.likes?.length || 0}</span>
                </button>
                <button
                  className={`transition-colors ${
                    isBookmarked ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
                  }`}
                  onClick={handleBookmark}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {showCommentInput && (
                <div className="mt-3 space-y-2">
                  <textarea 
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                    placeholder="Ajouter un commentaire..."
                    rows={2}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                  />
                  <div className="flex justify-end space-x-2">
                    <button 
                      className="px-3 py-1 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      onClick={() => setShowCommentInput(false)}
                    >
                      Annuler
                    </button>
                    <button 
                      className="px-3 py-1 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!commentContent.trim()}
                      onClick={handleComment}
                    >
                      Commenter
                    </button>
                  </div>
                </div>
              )}

              {/* Modal de retweet */}
              <RetweetModal
                isOpen={showRetweetModal}
                tweet={tweetData}
                onClose={() => setShowRetweetModal(false)}
                onRetweet={handleRetweet}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}