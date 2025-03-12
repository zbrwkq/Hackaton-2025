import { useState } from 'react';
import { useStore } from '../store/useStore';
import { TweetCard } from '../components/TweetCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Edit, Calendar, MapPin, Link as LinkIcon, Camera } from 'lucide-react';

export function Profile() {
  const { currentUser, tweets } = useStore((state) => ({
    currentUser: state.currentUser,
    tweets: state.tweets
  }));
  
  const [activeTab, setActiveTab] = useState('tweets');
  
  // Filter tweets based on the current user
  const userTweets = tweets.filter(tweet => tweet.userId === currentUser?._id);
  const userLikes = tweets.filter(tweet => tweet.likes.includes(currentUser?._id || ''));
  const userRetweets = tweets.filter(tweet => tweet.retweets.includes(currentUser?._id || ''));
  
  if (!currentUser) return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-10">
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
          <button className="absolute top-3 right-3 bg-white/20 p-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition">
            <Camera className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {/* Profile picture */}
        <div className="absolute -bottom-16 left-8 border-4 border-white rounded-full shadow-md">
          <div className="relative">
            <img 
              src={currentUser.profilePicture || 'https://via.placeholder.com/128'} 
              alt={currentUser.username} 
              className="w-32 h-32 rounded-full object-cover"
            />
            <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Edit profile button */}
        <div className="absolute -bottom-16 right-8">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-gray-50 transition">
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>
      
      {/* Profile info */}
      <div className="mt-20 max-w-4xl mx-auto px-6">
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