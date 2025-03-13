import { FC, ReactNode, useEffect } from 'react';
import { useNotificationSocket } from '../hooks/useNotificationSocket';
import { useStore } from '../store/useStore';

interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * Composant qui établit la connexion WebSocket pour les notifications
 * et gère le chargement initial des notifications
 */
export const NotificationProvider: FC<NotificationProviderProps> = ({ children }) => {
  // Charge le hook qui établit la connexion WebSocket
  useNotificationSocket();
  
  const { isAuthenticated, fetchNotifications } = useStore();
  
  // Charge les notifications depuis l'API au montage ou lors de l'authentification
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);
  
  // Demande la permission pour les notifications système
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return <>{children}</>;
}; 