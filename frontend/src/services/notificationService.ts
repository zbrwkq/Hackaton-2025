import axios from 'axios';
import { Notification } from '../types';

const API_URL = 'http://localhost:5003/notifications';

// Récupérer les notifications d'un utilisateur
export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    throw error;
  }
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  try {
    const response = await axios.put(`${API_URL}/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du marquage de la notification comme lue:', error);
    throw error;
  }
};

// Créer une notification
export const createNotification = async (data: {
  type: 'like' | 'retweet' | 'reply' | 'follow' | 'mention';
  relatedUserId: string;
  tweetId?: string;
}): Promise<Notification> => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    throw error;
  }
};

// Types pour les événements WebSocket
export type WebSocketNotificationData = {
  type: 'like' | 'retweet' | 'reply' | 'follow' | 'mention';
  senderUsername: string;
  senderId?: string;
  tweetId?: string;
}; 