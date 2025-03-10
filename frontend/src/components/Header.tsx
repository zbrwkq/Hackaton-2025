import { Bell, Search, User, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

export function Header() {
  const notifications = useStore((state) => state.notifications);
  const currentUser = useStore((state) => state.currentUser);
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const location = useLocation();

  return (
    <header className="fixed top-0 w-full backdrop-blur-lg bg-white/70 z-50">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Menu className="w-6 h-6 text-indigo-600" />
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-full bg-gray-100/80 border-none focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              to="/notifications" 
              className={`relative ${
                location.pathname === '/notifications' 
                  ? 'text-indigo-600' 
                  : 'text-gray-700 hover:text-indigo-600'
              } transition-colors`}
            >
              <Bell className="w-6 h-6" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Link>
            <Link 
              to="/profile"
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                location.pathname === '/profile' 
                  ? 'ring-2 ring-indigo-500 ring-offset-2' 
                  : ''
              }`}
            >
              {currentUser?.profilePicture ? (
                <img 
                  src={currentUser.profilePicture} 
                  alt={currentUser.username} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}