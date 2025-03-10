import { useState } from 'react';
import { useStore } from '../store/useStore';
import { NotificationItem } from '../components/NotificationItem';
import { Bell, CheckCheck } from 'lucide-react';

export function Notifications() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useStore(
    (state) => ({
      notifications: state.notifications,
      markNotificationAsRead: state.markNotificationAsRead,
      markAllNotificationsAsRead: state.markAllNotificationsAsRead
    })
  );
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.read);
  
  const hasUnreadNotifications = notifications.some(n => !n.read);

  return (
    <div className="min-h-screen bg-white pt-16 pb-10">
      <div className="max-w-2xl mx-auto">
        <div className="border-b border-gray-200 px-4 py-4 sticky top-16 bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h1>
            {hasUnreadNotifications && (
              <button
                onClick={markAllNotificationsAsRead}
                className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <CheckCheck className="w-4 h-4" />
                Tout marquer comme lu
              </button>
            )}
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm ${
                filter === 'all'
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-full text-sm ${
                filter === 'unread'
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Non lues
              {hasUnreadNotifications && (
                <span className="ml-1.5 inline-flex items-center justify-center bg-indigo-600 text-white rounded-full w-5 h-5 text-xs">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
          </div>
        </div>
        
        <div>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <NotificationItem 
                key={notification._id}
                notification={notification}
                onMarkAsRead={markNotificationAsRead}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Bell className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium">
                {filter === 'all' ? "Pas de notifications" : "Pas de notifications non lues"}
              </p>
              <p className="text-sm mt-1">
                {filter === 'all' 
                  ? "Vous serez notifié lorsque vous recevrez de nouvelles interactions" 
                  : "Toutes vos notifications ont été lues"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 