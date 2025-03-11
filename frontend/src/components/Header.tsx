import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NotificationDropdown } from './NotificationDropdown';

export function Header() {
  const location = useLocation();
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
          <div className="flex items-center space-x-2">
            {/* Barre de recherche (optionnelle) */}
            <div className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="bg-gray-100 rounded-full py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
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