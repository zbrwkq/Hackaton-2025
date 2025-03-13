import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { isAuthenticated, getUserId } from '../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import { notificationWebSocket } from '../services/websocketService';

const publicRoutes = ['/login', '/register', '/micro-service-dashboard'];

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { loadUserProfile } = useStore(state => ({
    loadUserProfile: state.loadUserProfile
  }));
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Vérifie l'authentification au chargement de l'application
    if (isAuthenticated()) {
      loadUserProfile();
      
      // Récupérer l'ID utilisateur et initialiser le WebSocket pour les notifications
      const userId = getUserId();
      if (userId) {
        console.log('🔄 Initialisation de la connexion WebSocket pour les notifications...');
        notificationWebSocket.connect(userId);
      }
    } else if (!publicRoutes.includes(location.pathname)) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
      // et qu'il essaie d'accéder à une route protégée
      navigate('/login');
    }
    
    // Nettoyer la connexion WebSocket lors du démontage du composant
    return () => {
      notificationWebSocket.disconnect();
    };
  }, [loadUserProfile, navigate, location.pathname]);
  
  return <>{children}</>;
} 