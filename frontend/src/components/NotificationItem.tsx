import { formatDistanceToNow } from 'date-fns';
import { Heart, Repeat, MessageCircle, UserPlus, AtSign } from 'lucide-react';
import type { Notification } from '../types';
import { Link } from 'react-router-dom';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="w-5 h-5 text-pink-500" fill="#EC4899" />;
      case 'retweet':
        return <Repeat className="w-5 h-5 text-green-500" />;
      case 'reply':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-indigo-500" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = () => {
    switch (notification.type) {
      case 'like':
        return 'a aimé votre tweet';
      case 'retweet':
        return 'a retweeté votre tweet';
      case 'reply':
        return 'a répondu à votre tweet';
      case 'follow':
        return 'vous suit maintenant';
      case 'mention':
        return 'vous a mentionné dans un tweet';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        !notification.read ? 'bg-indigo-50/50' : ''
      }`}
      onClick={() => !notification.read && onMarkAsRead(notification._id)}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            {getNotificationIcon()}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <Link 
                to={`/profile/${notification.sourceUserId}`} 
                className="font-medium text-gray-900 hover:text-indigo-600"
              >
                {notification.sourceUsername || 'Un utilisateur'}
              </Link>{' '}
              <span className="text-gray-600">{getNotificationText()}</span>
              {notification.tweetId && (
                <Link 
                  to={`/tweet/${notification.tweetId}`}
                  className="text-indigo-600 hover:underline ml-1"
                >
                  Voir le tweet
                </Link>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.createdAt))}
            </span>
          </div>
          {!notification.read && (
            <div className="mt-1">
              <span className="inline-block w-2 h-2 bg-indigo-600 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 