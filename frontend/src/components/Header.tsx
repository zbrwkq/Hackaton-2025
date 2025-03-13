import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NotificationDropdown } from './NotificationDropdown';
import { Settings as SettingsIcon, LogOut, User } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout } = useStore(state => ({ 
    currentUser: state.currentUser,
    logout: state.logout
  }));
  
  // Effet de scroll pour le style du header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Gérer la déconnexion
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Déterminer le titre de la page en fonction de l'URL
  const getTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Accueil';
      case '/messages':
        return 'Messages';
      case '/notifications':
        return 'Notifications';
      case '/profile':
        return 'Profil';
      case '/settings':
        return 'Paramètres';
      case '/search':
        return 'Recherche';
      default:
        return 'Accueil';
    }
  };
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-30 bg-white transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Titre */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">TweetAI</span>
            </Link>
          </div>
          
          {/* Titre de la page (mobile) */}
          <h1 className="text-lg font-semibold text-gray-800 md:hidden">
            {getTitle()}
          </h1>
          
          {/* Recherche et Actions */}
          <div className="flex items-center space-x-3">
            {/* Bouton de recherche avec nouveau style */}
            <button
              onClick={() => navigate('/search')}
              className="bg-indigo-50 hover:bg-indigo-100 rounded-full p-2.5 transition-colors flex items-center justify-center group"
              aria-label="Rechercher"
            >
              <svg xmlns="http://www.w3.org/2000/svg" 
                   className="h-5 w-5 text-indigo-600 group-hover:text-indigo-700" 
                   viewBox="0 0 24 24" 
                   fill="none" 
                   stroke="currentColor" 
                   strokeWidth="2.5" 
                   strokeLinecap="round" 
                   strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            
            {/* Composant de notifications */}
            <NotificationDropdown />
            
            {/* Icône des paramètres */}
            {/* <Link 
              to="/settings" 
              className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
              title="Paramètres"
            >
              <SettingsIcon className="w-5 h-5 text-gray-600" />
            </Link> */}
            
            {/* Avatar utilisateur avec menu */}
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center"
              >
                <div className="relative">
                  <img
                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                    src={currentUser?.profilePicture}
                    alt="Avatar utilisateur"
                  />
                  <div className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 border border-white"></div>
                </div>
              </button>
              
              {/* Menu déroulant */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Link 
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </Link>
                  <Link 
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Paramètres
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}