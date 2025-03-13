import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { isAuthenticated } from '../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';

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
    } else if (!publicRoutes.includes(location.pathname)) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
      // et qu'il essaie d'accéder à une route protégée
      navigate('/login');
    }
  }, [loadUserProfile, navigate, location.pathname]);
  
  return <>{children}</>;
} 