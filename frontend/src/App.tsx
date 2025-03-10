import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Login } from './pages/Login';
import { MainLayout } from './layouts/MainLayout';
import { Feed } from './components/Feed';
import { Settings } from './pages/Settings';
import { Messages } from './pages/Messages';
import { Profile } from './pages/Profile';
import { Notifications } from './pages/Notifications';
import { useStore } from './store/useStore';

const MOCK_TWEETS = [
  {
    _id: '1',
    userId: '1',
    content: "Our AI can now detect subtle emotional changes through facial expressions. The future of human-computer interaction is here! 🤖✨ #AI #Innovation",
    media: ["https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=800"],
    hashtags: ['AI', 'Innovation'],
    mentions: [],
    likes: ['2', '3'],
    retweets: ['2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      _id: '1',
      username: 'Elena Chen',
      bio: 'AI Researcher | Tech Enthusiast',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      banner: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    _id: '2',
    userId: '2',
    content: "Just achieved 98% accuracy in emotion recognition using our new neural network architecture! Here's a visualization of the results 📊 #DeepLearning",
    media: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800"],
    hashtags: ['DeepLearning'],
    mentions: [],
    likes: ['1'],
    retweets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      _id: '2',
      username: 'Alex Rivera',
      bio: 'ML Engineer | PhD Candidate',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      banner: 'https://images.unsplash.com/photo-1557683311-eeb2f49a8476?w=800',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
];

function App() {
  const setTweets = useStore((state) => state.setTweets);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  useEffect(() => {
    setTweets(MOCK_TWEETS);
  }, [setTweets]);

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
            <Route index element={<Feed />} />
            <Route path="messages" element={<Messages />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;