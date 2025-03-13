import { useState, useEffect } from 'react';
import { notificationWebSocket } from '../services/websocketService';
import { getUserId } from '../services/authService';

export function useNotificationSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);
  
  // Initialiser la connexion WebSocket au chargement
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      const socket = notificationWebSocket.connect(userId);
      
      socket.on('connect', () => {
        setIsConnected(true);
        console.log('🟢 WebSocket connecté avec succès');
      });
      
      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('🔴 WebSocket déconnecté');
      });
      
      socket.on('notification', (data) => {
        setLastEvent(data);
      });
      
      // Nettoyage
      return () => {
        notificationWebSocket.disconnect();
      };
    }
  }, []);
  
  /**
   * Fonction pour envoyer manuellement une notification
   * Utile pour les tests ou si besoin d'envoyer des notifications custom
   */
  const sendNotification = async (data: {
    type: 'like' | 'retweet' | 'reply' | 'follow' | 'mention';
    relatedUserId: string;
    tweetId?: string;
  }) => {
    try {
      const response = await fetch('http://localhost:3000/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      throw error;
    }
  };
  
  return {
    isConnected,
    lastEvent,
    sendNotification
  };
} 