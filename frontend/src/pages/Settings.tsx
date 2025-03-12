import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Bell, Moon, Shield, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  
  // Get notification settings from store
  const notificationSettings = useStore((state) => state.notificationSettings);
  const updateNotificationSettings = useStore((state) => state.updateNotificationSettings);
  
  // Derive the global notifications state from individual settings
  const [notifications, setNotifications] = useState(false);
  // Save previous settings when disabling all notifications
  const [previousSettings, setPreviousSettings] = useState(notificationSettings);
  
  // Update the global notifications state based on individual settings
  useEffect(() => {
    const hasEnabledNotifications = Object.values(notificationSettings).some(value => value === true);
    setNotifications(hasEnabledNotifications);
  }, [notificationSettings]);

  // Function to handle toggle for specific notification types
  const handleNotificationToggle = (type: keyof typeof notificationSettings) => {
    updateNotificationSettings({ [type]: !notificationSettings[type] });
  };
  
  // Function to handle global notifications toggle
  const handleGlobalNotificationsToggle = () => {
    if (notifications) {
      // If turning off notifications, save current settings
      setPreviousSettings({ ...notificationSettings });
      // Disable all notifications
      updateNotificationSettings({
        likes: false,
        retweets: false,
        replies: false,
        follows: false,
        mentions: false
      });
    } else {
      // If turning on notifications, restore previous settings or enable all
      const hasAnyPreviousEnabled = Object.values(previousSettings).some(value => value === true);
      if (hasAnyPreviousEnabled) {
        updateNotificationSettings(previousSettings);
      } else {
        updateNotificationSettings({
          likes: true,
          retweets: true,
          replies: true,
          follows: true,
          mentions: true
        });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto pt-20 px-4 pb-8"
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

        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGlobalNotificationsToggle}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <motion.div
                  animate={{ x: notifications ? 24 : 2 }}
                  className="w-5 h-5 bg-white rounded-full shadow-sm"
                />
              </button>
              <button 
                onClick={() => setShowNotificationSettings(!showNotificationSettings)}
                className="ml-2 text-gray-500"
                disabled={!notifications}
              >
                {showNotificationSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
          
          {notifications && showNotificationSettings && (
            <div className="mt-4 ml-8 space-y-4 border-l-2 border-indigo-100 pl-4">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Likes</span>
                    <p className="text-xs text-gray-500 mt-1">Recevoir des notifications quand quelqu'un aime vos posts</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('likes')}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      notificationSettings.likes ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <motion.div
                      animate={{ x: notificationSettings.likes ? 20 : 2 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Retweets</span>
                    <p className="text-xs text-gray-500 mt-1">Recevoir des notifications quand quelqu'un partage vos posts</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('retweets')}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      notificationSettings.retweets ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <motion.div
                      animate={{ x: notificationSettings.retweets ? 20 : 2 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Replies</span>
                    <p className="text-xs text-gray-500 mt-1">Recevoir des notifications quand quelqu'un répond à vos posts</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('replies')}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      notificationSettings.replies ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <motion.div
                      animate={{ x: notificationSettings.replies ? 20 : 2 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Follows</span>
                    <p className="text-xs text-gray-500 mt-1">Recevoir des notifications quand quelqu'un commence à vous suivre</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('follows')}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      notificationSettings.follows ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <motion.div
                      animate={{ x: notificationSettings.follows ? 20 : 2 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Mentions</span>
                    <p className="text-xs text-gray-500 mt-1">Recevoir des notifications quand quelqu'un vous mentionne dans un post</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('mentions')}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      notificationSettings.mentions ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <motion.div
                      animate={{ x: notificationSettings.mentions ? 20 : 2 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
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