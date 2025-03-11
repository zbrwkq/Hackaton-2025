import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NotificationDropdown } from './NotificationDropdown';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  
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
            
            {/* Avatar utilisateur */}
            <Link to="/profile" className="flex items-center">
              <div className="relative">
                <img
                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                  alt="Avatar utilisateur"
                />
                <div className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 border border-white"></div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}