import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';
import { WebSocketNotificationData } from '../services/notificationService';
import { Notification as AppNotification } from '../types';

// URL du serveur WebSocket - Connexion directe au service notification
const SOCKET_URL = 'http://localhost:5003';

export const useNotificationSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { currentUser, addNotification } = useStore();
  
  useEffect(() => {
    // Ne connecter le WebSocket que si l'utilisateur est authentifié
    if (!currentUser?._id) {
      console.log('WebSocket: Utilisateur non authentifié, pas de connexion WebSocket');
      return;
    }
    
    console.log(`WebSocket: Tentative de connexion WebSocket à ${SOCKET_URL}`);
    
    // Connexion au serveur WebSocket avec options explicites
    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'], // Essaie d'abord polling, puis websocket
      reconnectionAttempts: 5, // Nombre de tentatives de reconnexion
      reconnectionDelay: 1000, // Délai entre les tentatives (ms)
      timeout: 10000, // Timeout de connexion (ms)
      forceNew: true, // Forcer une nouvelle connexion
      path: '/socket.io' // Chemin explicite du socket.io
    });
    
    socketRef.current = socket;
    
    // Événement de connexion réussie
    socket.on('connect', () => {
      console.log(`WebSocket: Connexion réussie avec ID socket: ${socket.id}`);
      
      // S'enregistrer avec l'ID de l'utilisateur
      console.log(`WebSocket: Enregistrement de l'utilisateur ${currentUser._id}`);
      socket.emit('register', currentUser._id);
      
      // Envoi d'un ping pour vérifier que la communication fonctionne
      console.log('WebSocket: Envoi d\'un ping de test');
      socket.emit('ping', { message: 'Test de connexion', userId: currentUser._id, time: new Date().toISOString() });
    });
    
    // Réception d'un pong (réponse au ping)
    socket.on('pong', (data) => {
      console.log('WebSocket: Pong reçu du serveur:', data);
    });
    
    // Recevoir une confirmation d'enregistrement
    socket.on('register_confirm', (data) => {
      console.log('WebSocket: Confirmation d\'enregistrement reçue:', data);
    });
    
    // Événement de tentative de connexion
    socket.on('connecting', () => {
      console.log('WebSocket: Tentative de connexion en cours...');
    });
    
    // Événement de reconnexion
    socket.on('reconnect', (attemptNumber) => {
      console.log(`WebSocket: Reconnecté après ${attemptNumber} tentatives`);
      
      // S'enregistrer à nouveau après la reconnexion
      if (currentUser?._id) {
        console.log(`WebSocket: Réenregistrement de l'utilisateur ${currentUser._id} après reconnexion`);
        socket.emit('register', currentUser._id);
      }
    });
    
    // Événement de tentative de reconnexion
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`WebSocket: Tentative de reconnexion #${attemptNumber}`);
    });
    
    // Écouter les nouvelles notifications
    socket.on('notification', (data: WebSocketNotificationData) => {
      console.log('WebSocket: Notification reçue:', data);
      
      // Convertir les données du WebSocket en objet Notification
      const notification: AppNotification = {
        _id: new Date().toISOString(), // ID temporaire, sera remplacé par celui de la base de données
        userId: currentUser._id,
        type: data.type,
        createdAt: new Date().toISOString(),
        read: false,
        sourceUserId: data.senderId || '', // Utiliser senderId s'il est disponible
        sourceUsername: data.senderUsername,
        tweetId: data.tweetId
      };
      
      // Ajouter la notification à l'état global
      addNotification(notification);
      
      // Afficher une notification système si le navigateur le supporte
      if ('Notification' in window && window.Notification.permission === 'granted') {
        new window.Notification('Twitter Clone', {
          body: `${data.senderUsername} a ${getNotificationText(data.type)} votre tweet`
        });
      }
    });
    
    // Événement d'erreur
    socket.on('error', (error) => {
      console.error('WebSocket: Erreur de connexion:', error);
    });
    
    // Événement d'erreur de connexion
    socket.on('connect_error', (error) => {
      console.error('WebSocket: Erreur lors de la connexion:', error);
    });
    
    // Événement d'échec de connexion
    socket.on('connect_timeout', () => {
      console.error('WebSocket: Délai de connexion dépassé');
    });
    
    // Événement de déconnexion
    socket.on('disconnect', (reason) => {
      console.log(`WebSocket: Déconnecté, raison: ${reason}`);
    });
    
    // Nettoyer la connexion au démontage du composant
    return () => {
      if (socketRef.current) {
        console.log('WebSocket: Nettoyage de la connexion WebSocket');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentUser, addNotification]);
  
  // Obtenir le texte de la notification en fonction du type
  const getNotificationText = (type: string): string => {
    switch (type) {
      case 'like': return 'aimé';
      case 'retweet': return 'retweeté';
      case 'reply': return 'commenté';
      case 'follow': return 'commencé à vous suivre';
      case 'mention': return 'vous a mentionné dans un tweet';
      default: return 'interagi avec';
    }
  };
  
  return socketRef.current;
}; 