import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { TweetCard } from '../components/TweetCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Edit, Calendar, Camera, X, Save, Loader, Bookmark } from 'lucide-react';
import { Tweet, User } from '../types';
import { useParams } from 'react-router-dom';

// Interface étendue pour le tweet tel que renvoyé par l'API
interface ExtendedTweet extends Omit<Tweet, 'userId'> {
  userId: string | { _id: string; username: string; profilePicture: string };
}

export function Profile() {
  const { userId } = useParams<{ userId?: string }>();
  const isOwnProfile = !userId;
  
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
    fetchSavedTweets,
    getUserById,
    followUser
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
    fetchSavedTweets: state.fetchSavedTweets,
    getUserById: state.getUserById,
    followUser: state.followUser
  }));
  
  const [activeTab, setActiveTab] = useState('tweets');
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [error, setError] = useState('');
  const [debug, setDebug] = useState<any>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followInProgress, setFollowInProgress] = useState(false);
  
  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  // Chargement du profil utilisateur - optimisé pour éviter les appels excessifs
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (userId) {
          // Charger le profil d'un autre utilisateur
          const user = await getUserById(userId);
          setProfileUser(user);
        } else if (currentUser) {
          // Si on a déjà le currentUser, l'utiliser directement
          setProfileUser(currentUser);
        } else {
          // Seulement si currentUser n'est pas déjà chargé
          await loadUserProfile();
          setProfileUser(currentUser);
        }
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        setError('Erreur lors du chargement du profil');
      }
    };
    
    loadProfile();
    // Ne pas inclure currentUser dans les dépendances pour éviter les rechargements en boucle
  }, [userId, loadUserProfile, getUserById]);
  
  // Mise à jour des champs d'édition lorsque les données utilisateur changent
  useEffect(() => {
    if ((isOwnProfile && currentUser) || (!isOwnProfile && profileUser)) {
      const user = isOwnProfile ? currentUser : profileUser;
      setEditUsername(user?.username || '');
      setEditBio(user?.bio || '');
    }
  }, [profileUser, isOwnProfile, currentUser?.username, currentUser?.bio]);
  
  // Charger le type de tweets approprié quand l'onglet change - optimisé pour réduire les appels API
  useEffect(() => {
    if (!profileUser) return;
    
    // Variable pour suivre si le composant est monté
    let isMounted = true;
    
    const fetchData = async () => {
      if (!isMounted) return;
      
      try {
        // Si c'est le profil d'un autre utilisateur, adapter les appels API pour obtenir leurs tweets
        const targetUserId = isOwnProfile ? currentUser?._id : profileUser._id;
        
        switch(activeTab) {
          case 'tweets':
            await fetchTweets(targetUserId);
            break;
          case 'replies':
            await fetchCommentedTweets(targetUserId);
            break;
          case 'likes':
            await fetchLikedTweets(targetUserId);
            break;
          case 'retweets':
            await fetchRetweetedTweets(targetUserId);
            break;
          case 'bookmarks':
            if (isOwnProfile) {
              await fetchSavedTweets();
            }
            break;
        }
        
        // Vérifier si le composant est toujours monté avant de mettre à jour l'état
        if (isMounted) {
          // Stocker les tweets dans le state de débogage pour visualisation
          setDebug({
            activeTab,
            tweets: tweets.slice(0, 3),
            count: tweets.length
          });
        }
      } catch (error) {
        if (isMounted) {
          console.error(`Erreur lors du chargement des tweets (${activeTab}):`, error);
          setError(`Erreur lors du chargement des tweets (${activeTab})`);
        }
      }
    };
    
    fetchData();
    
    // Nettoyage pour éviter les mises à jour d'état sur un composant démonté
    return () => {
      isMounted = false;
    };
  }, [activeTab, profileUser?._id, isOwnProfile]);
  
  // Filter tweets based on the current tab and user
  const userTweets = tweets.filter(tweet => {
    // Pour la vue du profil d'un autre utilisateur
    const targetUserId = isOwnProfile ? currentUser?._id : profileUser?._id;
    
    // Vérifier si userId est un objet (avec _id) ou juste une chaîne ID directe
    if (activeTab === 'tweets') {
      if (typeof tweet.userId === 'object' && tweet.userId !== null) {
        return tweet.userId._id === targetUserId;
      } else {
        return tweet.userId === targetUserId;
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
  
  // Vérifier si l'utilisateur courant suit déjà l'utilisateur du profil
  useEffect(() => {
    if (!isOwnProfile && currentUser && profileUser) {
      const isAlreadyFollowing = currentUser.following.includes(profileUser._id);
      setIsFollowing(isAlreadyFollowing);
    }
  }, [currentUser, profileUser, isOwnProfile]);

  // Fonction pour suivre/ne plus suivre un utilisateur
  const handleToggleFollow = async () => {
    if (isOwnProfile || !profileUser || !currentUser) return;
    
    try {
      setFollowInProgress(true);
      await followUser(profileUser._id);
      
      // Mettre à jour l'état localement (l'état réel sera mis à jour lors du rechargement du profil)
      setIsFollowing(prev => !prev);
      
      // Recharger le profil de l'utilisateur courant pour mettre à jour la liste des following
      await loadUserProfile();
      
      // Recharger le profil de l'utilisateur consulté pour mettre à jour la liste des followers
      if (userId) {
        const updatedUser = await getUserById(userId);
        setProfileUser(updatedUser);
      }
      
      setFollowInProgress(false);
    } catch (error) {
      console.error('Erreur lors du suivi/désabonnement:', error);
      setError('Erreur lors du suivi/désabonnement');
      setFollowInProgress(false);
    }
  };
  
  if (isLoading || !profileUser) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      <span className="ml-2">Loading profile...</span>
    </div>
  );

  // Variable d'environnement pour détecter le mode développement
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const displayedUser = isOwnProfile ? currentUser : profileUser;
  
  // Vérification supplémentaire pour éviter les erreurs
  if (!displayedUser) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      <span className="ml-2">Loading user data...</span>
    </div>
  );

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
      
      {/* HEADER - Photo de couverture et informations de profil */}
      <div className="relative mb-24">
        {/* Bannière */}
        <div className="h-56 w-full bg-gradient-to-r from-indigo-500 to-purple-600 relative">
          {displayedUser?.banner && (
            <img 
              src={displayedUser.banner} 
              alt="Profile banner" 
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Bouton d'upload de bannière */}
          {isOwnProfile && (
            <button 
              onClick={() => bannerInputRef.current?.click()}
              className="absolute top-4 right-4 bg-white/20 p-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </button>
          )}
          <input 
            type="file" 
            ref={bannerInputRef} 
            onChange={handleBannerChange} 
            accept="image/*"
            className="hidden" 
          />
        </div>
        
        {/* Carte de profil superposée */}
        <div className="max-w-4xl mx-auto px-6 relative -mt-24">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 relative">
              {/* Photo de profil */}
              <div className="md:-mt-16 flex flex-col items-center md:items-start">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                    {displayedUser?.profilePicture ? (
                      <img 
                        src={displayedUser.profilePicture} 
                        alt="Profile picture" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-2xl">
                          {displayedUser?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Bouton d'upload de photo de profil */}
                  {isOwnProfile && (
                    <button 
                      onClick={() => profileInputRef.current?.click()} 
                      className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full hover:bg-indigo-700 transition"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </button>
                  )}
                  <input 
                    type="file" 
                    ref={profileInputRef} 
                    onChange={handleProfilePictureChange} 
                    accept="image/*"
                    className="hidden" 
                  />
                </div>
              </div>
              
              {/* Informations de profil */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {isEditing ? (
                    <form onSubmit={handleSubmitEdit} className="space-y-4 w-full">
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
                      
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Sauvegarder
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900">{displayedUser.username}</h1>
                        <p className="text-gray-600">{displayedUser.bio || "Aucune biographie"}</p>
                        
                        <div className="flex items-center space-x-4 text-gray-500 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Inscrit le {new Date(displayedUser.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-5 pt-1">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-gray-900">{displayedUser.following.length}</span>
                            <span className="text-gray-500">Abonnements</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-gray-900">{displayedUser.followers.length}</span>
                            <span className="text-gray-500">Abonnés</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bouton d'édition (pour son propre profil) ou de suivi (pour le profil d'un autre) */}
                      {isOwnProfile ? (
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="shrink-0 mt-4 md:mt-0 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-gray-50 transition"
                        >
                          <Edit className="w-4 h-4" />
                          Éditer le profil
                        </button>
                      ) : (
                        <button 
                          onClick={handleToggleFollow}
                          disabled={followInProgress}
                          className={`shrink-0 mt-4 md:mt-0 px-4 py-2 rounded-full font-medium flex items-center justify-center gap-2 transition ${
                            isFollowing 
                              ? 'bg-white border border-gray-300 text-gray-700 group hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {followInProgress ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : isFollowing ? (
                            <>
                              <span className="group-hover:hidden">Abonné</span>
                              <span className="hidden group-hover:inline">Se désabonner</span>
                            </>
                          ) : (
                            "S'abonner"
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Onglets (Tweets, Likes, etc.) */}
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
      </div>
    </div>
  );
} 