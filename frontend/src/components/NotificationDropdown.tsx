import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { notificationWebSocket } from '../services/websocketService';

export function NotificationDropdown() {
  const notifications = useStore((state) => state.notifications);
  const markAllNotificationsAsRead = useStore((state) => state.markAllNotificationsAsRead);
  const markNotificationAsRead = useStore((state) => state.markNotificationAsRead);
  const [isOpen, setIsOpen] = useState(false);
  const [newNotification, setNewNotification] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Nombre de notifications non lues
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Effet pour mettre en évidence brièvement les nouvelles notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotif = notifications[0];
      setNewNotification(latestNotif._id);
      
      // Réinitialiser l'effet après 3 secondes
      const timer = setTimeout(() => {
        setNewNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notifications.length]);
  
  // Gestionnaire de clic en dehors du dropdown pour le fermer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Icône pour chaque type de notification
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return (
          <div className="rounded-full bg-red-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'retweet':
        return (
          <div className="rounded-full bg-green-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'follow':
        return (
          <div className="rounded-full bg-blue-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
        );
      case 'reply':
        return (
          <div className="rounded-full bg-purple-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'mention':
        return (
          <div className="rounded-full bg-yellow-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-gray-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  // Texte pour chaque type de notification
  const getNotificationText = (notification: any) => {
    const { type, sourceUsername } = notification;
    const username = sourceUsername || 'Quelqu\'un';
    
    switch (type) {
      case 'like':
        return `${username} a aimé votre tweet`;
      case 'retweet':
        return `${username} a retweeté votre tweet`;
      case 'follow':
        return `${username} vous suit désormais`;
      case 'reply':
        return `${username} a répondu à votre tweet`;
      case 'mention':
        return `${username} vous a mentionné dans un tweet`;
      default:
        return `Nouvelle notification de ${username}`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Icône de cloche avec badge */}
      <button 
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Badge de notification avec animation si nouvelle notification */}
        {unreadCount > 0 && (
          <motion.span 
            className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-indigo-600 rounded-full"
            initial={{ scale: 1 }}
            animate={{ 
              scale: newNotification ? [1, 1.3, 1] : 1
            }}
            transition={{ duration: 0.3 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown des notifications */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50"
            style={{ maxHeight: '400px', overflowY: 'auto' }}
          >
            {/* En-tête du dropdown */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              
              {unreadCount > 0 && (
                <button 
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  onClick={() => {
                    markAllNotificationsAsRead();
                    setIsOpen(false);
                  }}
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>

            {/* Liste des notifications */}
            <div className="divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="py-6 px-4 text-center text-gray-500">
                  Aucune notification pour le moment
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      backgroundColor: notification._id === newNotification ? ['#e8f0ff', '#f8fafc'] : ''
                    }}
                    transition={{ duration: 0.3 }}
                    className={`p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => markNotificationAsRead(notification._id)}
                  >
                    {/* Icône */}
                    {getNotificationIcon(notification.type)}
                    
                    {/* Contenu */}
                    <div className="flex-1">
                      {/* Texte de la notification */}
                      <p className="text-sm text-gray-800">
                        {getNotificationText(notification)}
                      </p>
                      
                      {/* Temps écoulé */}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    
                    {/* Indicateur non lu */}
                    {!notification.read && (
                      <span className="block w-2 h-2 bg-indigo-600 rounded-full"></span>
                    )}
                  </motion.div>
                ))
              )}
            </div>
            
            {/* Pied du dropdown */}
            <div className="p-4 bg-gray-50 text-center">
              <button 
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                onClick={() => {
                  // Naviguer vers la page des notifications
                  navigate('/notifications');
                  setIsOpen(false);
                }}
              >
                Voir toutes les notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 