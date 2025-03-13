import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { TweetCard } from '../components/TweetCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Edit, Calendar, Camera, X, Save, Loader, Bookmark } from 'lucide-react';
import { Tweet, User } from '../types';

// Interface étendue pour le tweet tel que renvoyé par l'API
interface ExtendedTweet extends Omit<Tweet, 'userId'> {
  userId: string | { _id: string; username: string; profilePicture: string };
}

export function Profile() {
  const { 
    currentUser, 
    tweets, 
    isLoading, 
    loadUserProfile, 
    updateProfile, 
    updateProfilePicture, 
    updateBanner,
    fetchTweets,
    fetchLikedTweets,
    fetchRetweetedTweets,
    fetchCommentedTweets,
    fetchSavedTweets
  } = useStore(state => ({
    currentUser: state.currentUser,
    tweets: state.tweets as ExtendedTweet[],
    isLoading: state.isLoading,
    loadUserProfile: state.loadUserProfile,
    updateProfile: state.updateProfile,
    updateProfilePicture: state.updateProfilePicture,
    updateBanner: state.updateBanner,
    fetchTweets: state.fetchTweets,
    fetchLikedTweets: state.fetchLikedTweets,
    fetchRetweetedTweets: state.fetchRetweetedTweets,
    fetchCommentedTweets: state.fetchCommentedTweets,
    fetchSavedTweets: state.fetchSavedTweets
  }));
  
  const [activeTab, setActiveTab] = useState('tweets');
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [error, setError] = useState('');
  const [debug, setDebug] = useState<any>(null);
  
  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  // Charger le profil utilisateur au chargement de la page
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);
  
  // Initialiser les valeurs d'édition quand l'utilisateur change
  useEffect(() => {
    if (currentUser) {
      setEditUsername(currentUser.username);
      setEditBio(currentUser.bio || '');
    }
  }, [currentUser]);
  
  // Charger le type de tweets approprié quand l'onglet change
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchData = async () => {
      try {
        switch(activeTab) {
          case 'tweets':
            await fetchTweets();
            break;
          case 'replies':
            await fetchCommentedTweets();
            break;
          case 'likes':
            await fetchLikedTweets();
            break;
          case 'retweets':
            await fetchRetweetedTweets();
            break;
          case 'bookmarks':
            await fetchSavedTweets();
            break;
        }
        // Stocker les tweets dans le state de débogage pour visualisation
        setDebug({
          activeTab,
          tweets: tweets.slice(0, 3),
          count: tweets.length
        });
      } catch (error) {
        console.error(`Erreur lors du chargement des tweets (${activeTab}):`, error);
        setError(`Erreur lors du chargement des tweets (${activeTab})`);
      }
    };
    
    fetchData();
  }, [activeTab, currentUser, fetchTweets, fetchCommentedTweets, fetchLikedTweets, fetchRetweetedTweets, fetchSavedTweets]);
  
  // Filter tweets based on the current tab and user
  const userTweets = tweets.filter(tweet => {
    // Vérifier si userId est un objet (avec _id) ou juste une chaîne ID directe
    if (activeTab === 'tweets') {
      if (typeof tweet.userId === 'object' && tweet.userId !== null) {
        return tweet.userId._id === currentUser?._id;
      } else {
        return tweet.userId === currentUser?._id;
      }
    }
    return true; // Pour les autres onglets, les tweets sont déjà filtrés par l'API
  });
  
  // Gérer l'upload de photo de profil
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        await updateProfilePicture(e.target.files[0]);
      } catch (error) {
        setError('Erreur lors de l\'upload de la photo de profil');
        console.error(error);
      }
    }
  };
  
  // Gérer l'upload de bannière
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        await updateBanner(e.target.files[0]);
      } catch (error) {
        setError('Erreur lors de l\'upload de la bannière');
        console.error(error);
      }
    }
  };
  
  // Gérer la soumission du formulaire d'édition
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        username: editUsername,
        bio: editBio
      });
      setIsEditing(false);
      setError('');
    } catch (error) {
      setError('Erreur lors de la mise à jour du profil');
      console.error(error);
    }
  };
  
  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      <span className="ml-2">Loading profile...</span>
    </div>
  );

  // Variable d'environnement pour détecter le mode développement
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-10">
      {/* Afficher les erreurs */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 mb-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Cover photo and profile header */}
      <div className="relative">
        {/* Banner image */}
        <div className="h-48 w-full bg-gradient-to-r from-indigo-500 to-purple-600">
          {currentUser.banner && (
            <img 
              src={currentUser.banner} 
              alt="Profile banner" 
              className="w-full h-full object-cover"
            />
          )}
          <button 
            onClick={() => bannerInputRef.current?.click()}
            className="absolute top-3 right-3 bg-white/20 p-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-white" />
            )}
          </button>
          <input 
            type="file" 
            ref={bannerInputRef} 
            onChange={handleBannerChange} 
            accept="image/*"
            className="hidden" 
          />
        </div>
        
        {/* Profile picture */}
        <div className="absolute -bottom-16 left-8 border-4 border-white rounded-full shadow-md">
          <div className="relative">
            {currentUser.profilePicture ? (
              <img 
                src={currentUser.profilePicture} 
                alt={currentUser.username} 
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-bold text-2xl">
                  {currentUser.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <button 
              onClick={() => profileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="w-4 h-4 text-gray-600 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-gray-600" />
              )}
            </button>
            <input 
              type="file" 
              ref={profileInputRef} 
              onChange={handleProfilePictureChange} 
              accept="image/*"
              className="hidden" 
            />
          </div>
        </div>
        
        {/* Edit profile button */}
        <div className="absolute -bottom-16 right-8">
          {isEditing ? (
            <button 
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full font-medium mr-2 hover:bg-gray-300 transition flex items-center gap-2"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-gray-50 transition"
              disabled={isLoading}
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>
      
      {/* Profile info */}
      <div className="mt-20 max-w-4xl mx-auto px-6">
        {isEditing ? (
          <form onSubmit={handleSubmitEdit} className="space-y-4 mb-8">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{currentUser.username}</h1>
            <p className="text-gray-600">{currentUser.bio}</p>
            
            <div className="flex items-center space-x-4 text-gray-500 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(currentUser.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex space-x-5 pt-1">
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-900">{currentUser.following.length}</span>
                <span className="text-gray-500">Following</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-900">{currentUser.followers.length}</span>
                <span className="text-gray-500">Followers</span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs for tweets, likes, etc. */}
        <div className="mt-8">
          <Tabs defaultValue="tweets" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="tweets">Tweets</TabsTrigger>
              <TabsTrigger value="replies">Réponses</TabsTrigger>
              <TabsTrigger value="likes">J'aime</TabsTrigger>
              <TabsTrigger value="retweets">Retweets</TabsTrigger>
              <TabsTrigger value="bookmarks">Signets</TabsTrigger>
            </TabsList>
            
            {/* Afficher les informations de débogage en mode développement */}
            {isDevelopment && debug && (
              <div className="mt-2 p-2 bg-gray-100 text-xs rounded overflow-auto">
                <details>
                  <summary className="cursor-pointer font-bold">
                    Données de débogage ({activeTab}) - {debug.count} tweets
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-40">
                    {JSON.stringify(debug, null, 2)}
                  </pre>
                </details>
              </div>
            )}
            
            <TabsContent value="tweets" className="mt-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              ) : userTweets.length > 0 ? (
                userTweets.map(tweet => (
                  <TweetCard key={tweet._id} tweet={tweet as any} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">Pas encore de tweets</div>
              )}
            </TabsContent>
            
            <TabsContent value="replies" className="mt-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              ) : tweets.length > 0 ? (
                tweets.map(tweet => (
                  <TweetCard key={tweet._id} tweet={tweet as any} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">Pas encore de réponses</div>
              )}
            </TabsContent>
            
            <TabsContent value="likes" className="mt-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              ) : tweets.length > 0 ? (
                tweets.map(tweet => (
                  <TweetCard key={tweet._id} tweet={tweet as any} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">Pas encore de j'aime</div>
              )}
            </TabsContent>
            
            <TabsContent value="retweets" className="mt-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              ) : tweets.length > 0 ? (
                tweets.map(tweet => (
                  <TweetCard key={tweet._id} tweet={tweet as any} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">Pas encore de retweets</div>
              )}
            </TabsContent>
            
            <TabsContent value="bookmarks" className="mt-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              ) : tweets.length > 0 ? (
                tweets.map(tweet => (
                  <TweetCard key={tweet._id} tweet={tweet as any} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">Pas encore de tweets enregistrés</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 