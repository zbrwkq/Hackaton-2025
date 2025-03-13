import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';

let socket: Socket | null = null;

export const notificationWebSocket = {
  // Initialiser la connexion WebSocket
  connect: (userId: string) => {
    if (socket) {
      socket.disconnect();
    }
    
    // Connexion au serveur WebSocket
    socket = io('http://localhost:3000/notifications');
    
    // Enregistrer l'utilisateur pour recevoir ses notifications
    socket.emit('register', userId);
    
    // Log des utilisateurs connectés
    socket.on('updateUsers', (users: string[]) => {
      console.log('👥 Liste des utilisateurs connectés :', users);
    });
    
    // Écouter les notifications en temps réel
    socket.on('notification', (notification: any) => {
      console.log('📩 Notification reçue via WebSocket :', notification);
      
      // Ajouter la notification au store global
      const { addNotification } = useStore.getState();
      addNotification(notification);
    });
    
    console.log(`🟢 WebSocket connecté pour l'utilisateur: ${userId}`);
    
    return socket;
  },
  
  // Déconnecter le WebSocket
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log('🔴 WebSocket déconnecté');
    }
  },
  
  // Vérifier si le WebSocket est connecté
  isConnected: () => {
    return socket !== null && socket.connected;
  },
  
  // Obtenir l'instance du socket
  getSocket: () => socket
}; 