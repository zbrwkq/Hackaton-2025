import { motion } from 'framer-motion';
import { useState } from 'react';
import { Bell, Moon, Shield, User } from 'lucide-react';

export function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto pt-20 px-4"
    >
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-indigo-600" />
            <span className="font-medium">Profile Settings</span>
          </div>
          <button className="text-indigo-600 text-sm">Edit</button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-indigo-600" />
            <span className="font-medium">Dark Mode</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full transition-colors ${
              darkMode ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <motion.div
              animate={{ x: darkMode ? 24 : 2 }}
              className="w-5 h-5 bg-white rounded-full shadow-sm"
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-indigo-600" />
            <span className="font-medium">Notifications</span>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full transition-colors ${
              notifications ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <motion.div
              animate={{ x: notifications ? 24 : 2 }}
              className="w-5 h-5 bg-white rounded-full shadow-sm"
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span className="font-medium">Privacy</span>
          </div>
          <button className="text-indigo-600 text-sm">Manage</button>
        </div>
      </div>
    </motion.div>
  );
}