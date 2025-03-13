import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Bell, Moon, Shield, User, ChevronDown, ChevronUp, LogOut, Database } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { generateFakeData } from '../services/tweetService';

export function Settings() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [fakeDataMessage, setFakeDataMessage] = useState("");
  
  // Get notification settings from store
  const notificationSettings = useStore((state) => state.notificationSettings);
  const updateNotificationSettings = useStore((state) => state.updateNotificationSettings);
  const logout = useStore((state) => state.logout);
  
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
  
  // Gérer la déconnexion
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Générer des données fictives
  const handleGenerateFakeData = async () => {
    try {
      setIsGeneratingData(true);
      setFakeDataMessage("");
      const result = await generateFakeData();
      setFakeDataMessage(result.message || "Données générées avec succès");
    } catch (error) {
      if (error instanceof Error) {
        setFakeDataMessage(`Erreur: ${error.message}`);
      } else {
        setFakeDataMessage("Une erreur est survenue");
      }
    } finally {
      setIsGeneratingData(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen pt-20 pb-10 px-4 bg-gray-50"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-xl p-6 shadow-sm space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        
        {/* Section Compte */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">Compte</span>
            </div>
            <button className="text-indigo-600 text-sm">Manage</button>
          </div>
        </div>
        
        {/* Section thème sombre */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">Thème</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 h-5 rounded-full transition-colors ${
                darkMode ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <motion.div
                animate={{ x: darkMode ? 20 : 2 }}
                className="w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>
        </div>
        
        {/* Section notifications */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">Notifications</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleGlobalNotificationsToggle}
                className={`w-10 h-5 rounded-full transition-colors ${
                  notifications ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <motion.div
                  animate={{ x: notifications ? 20 : 2 }}
                  className="w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
              <button
                onClick={() => setShowNotificationSettings(!showNotificationSettings)}
                className="text-gray-500 hover:bg-gray-100 rounded-full p-1 transition-colors"
              >
                {showNotificationSettings ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          
          {/* Détails des paramètres de notification */}
          {showNotificationSettings && (
            <div className="ml-8 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Likes</span>
                    <p className="text-xs text-gray-500 mt-1">Recevoir des notifications quand quelqu'un aime votre post</p>
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
                    <p className="text-xs text-gray-500 mt-1">Recevoir des notifications quand quelqu'un retweete votre post</p>
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
                    <p className="text-xs text-gray-500 mt-1">Recevoir des notifications quand quelqu'un répond à votre post</p>
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

        {/* Section confidentialité */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">Confidentialité</span>
            </div>
            <button className="text-indigo-600 text-sm">Gérer</button>
          </div>
        </div>
        
        {/* Section développement (pour générer des données fictives) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">Outils de développement</span>
            </div>
          </div>
          <div className="ml-8 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Données fictives</span>
                  <p className="text-xs text-gray-500 mt-1">Générer des tweets, likes et commentaires fictifs pour tester l'application</p>
                  {fakeDataMessage && (
                    <p className={`text-xs mt-1 ${fakeDataMessage.startsWith('Erreur') ? 'text-red-500' : 'text-green-500'}`}>
                      {fakeDataMessage}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleGenerateFakeData}
                  disabled={isGeneratingData}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isGeneratingData 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isGeneratingData ? 'Génération...' : 'Générer des données'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Séparateur */}
        <hr className="border-gray-200" />
        
        {/* Section de déconnexion */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="font-medium">Déconnexion</span>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Se déconnecter
            </button>
          </div>
          <p className="text-sm text-gray-500 ml-8">
            Vous serez déconnecté de votre compte sur cet appareil. Vous devrez saisir vos identifiants pour vous reconnecter.
          </p>
        </div>
      </div>
    </motion.div>
  );
}