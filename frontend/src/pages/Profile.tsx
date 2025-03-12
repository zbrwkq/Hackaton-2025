import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { TweetCard } from '../components/TweetCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Edit, Calendar, Camera, X, Save, Loader } from 'lucide-react';

export function Profile() {
  const { 
    currentUser, 
    tweets, 
    isLoading, 
    loadUserProfile, 
    updateProfile, 
    updateProfilePicture, 
    updateBanner 
  } = useStore(state => ({
    currentUser: state.currentUser,
    tweets: state.tweets,
    isLoading: state.isLoading,
    loadUserProfile: state.loadUserProfile,
    updateProfile: state.updateProfile,
    updateProfilePicture: state.updateProfilePicture,
    updateBanner: state.updateBanner
  }));
  
  const [activeTab, setActiveTab] = useState('tweets');
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [error, setError] = useState('');
  
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
  
  // Filter tweets based on the current user
  const userTweets = tweets.filter(tweet => tweet.userId === currentUser?._id);
  const userLikes = tweets.filter(tweet => tweet.likes.includes(currentUser?._id || ''));
  const userRetweets = tweets.filter(tweet => tweet.retweets.includes(currentUser?._id || ''));
  
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
            <img 
              src={currentUser.profilePicture || 'https://via.placeholder.com/128'} 
              alt={currentUser.username} 
              className="w-32 h-32 rounded-full object-cover"
            />
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tweets">Tweets</TabsTrigger>
              <TabsTrigger value="replies">Replies</TabsTrigger>
              <TabsTrigger value="likes">Likes</TabsTrigger>
              <TabsTrigger value="retweets">Retweets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tweets" className="mt-4 space-y-4">
              {userTweets.length > 0 ? (
                userTweets.map(tweet => (
                  <TweetCard key={tweet._id} tweet={tweet} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No tweets yet</div>
              )}
            </TabsContent>
            
            <TabsContent value="replies" className="mt-4 space-y-4">
              <div className="text-center py-8 text-gray-500">No replies yet</div>
            </TabsContent>
            
            <TabsContent value="likes" className="mt-4 space-y-4">
              {userLikes.length > 0 ? (
                userLikes.map(tweet => (
                  <TweetCard key={tweet._id} tweet={tweet} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No likes yet</div>
              )}
            </TabsContent>
            
            <TabsContent value="retweets" className="mt-4 space-y-4">
              {userRetweets.length > 0 ? (
                userRetweets.map(tweet => (
                  <TweetCard key={tweet._id} tweet={tweet} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No retweets yet</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 