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
  },
  {
    _id: '3',
    userId: '3',
    content: "Breaking: Our team has just launched the world's first quantum-based neural network capable of processing 10x more data than traditional models. #QuantumAI #Breakthrough",
    media: ["https://images.unsplash.com/photo-1567427017947-545c5f96d209?w=800"],
    hashtags: ['QuantumAI', 'Breakthrough'],
    mentions: [],
    likes: ['1', '2', '4', '5'],
    retweets: ['1', '5'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    user: {
      _id: '3',
      username: 'Sophia Kim',
      bio: 'Quantum Computing Researcher | Speaker',
      profilePicture: 'https://images.unsplash.com/photo-1564046247017-4462f3c1e9a2?w=100',
      banner: 'https://images.unsplash.com/photo-1545987796-200677ee1011?w=800',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    _id: '4',
    userId: '4',
    content: "After 3 years of research, we're excited to announce our paper on ethical AI decision-making has been accepted at NIPS! 📄🎉 #EthicalAI #Research",
    media: [],
    hashtags: ['EthicalAI', 'Research'],
    mentions: ['@SophiaKim'],
    likes: ['1', '3', '5'],
    retweets: ['3'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    user: {
      _id: '4',
      username: 'Marcus Johnson',
      bio: 'AI Ethics Researcher | Professor | Author',
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      banner: 'https://images.unsplash.com/photo-1557682250-62777ba45e11?w=800',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    _id: '5',
    userId: '5',
    content: "Our startup just secured $25M in Series A funding to develop our AI-powered climate prediction models! We're hiring ML engineers and climate scientists. DM for details. #ClimateAI #Startup",
    media: ["https://images.unsplash.com/photo-1536782376847-5c9d14d97cc0?w=800"],
    hashtags: ['ClimateAI', 'Startup'],
    mentions: [],
    likes: ['2', '3', '4'],
    retweets: ['1', '2', '4'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    user: {
      _id: '5',
      username: 'Ava Patel',
      bio: 'Climate AI Founder | TED Speaker',
      profilePicture: 'https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=100',
      banner: 'https://images.unsplash.com/photo-1498429089284-41f8cf3ffd39?w=800',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    _id: '6',
    userId: '6',
    content: "Just published my new paper on using reinforcement learning to optimize traffic flow in smart cities. Reduced congestion by 37% in simulations! 🚗🚦 #ReinforcementLearning #SmartCities",
    media: ["https://images.unsplash.com/photo-1548561711-59cbed4cde47?w=800"],
    hashtags: ['ReinforcementLearning', 'SmartCities'],
    mentions: [],
    likes: ['1', '2', '3', '4', '5'],
    retweets: ['2', '3'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    user: {
      _id: '6',
      username: 'David Zhang',
      bio: 'AI for Smart Cities | Urban Planning',
      profilePicture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100',
      banner: 'https://images.unsplash.com/photo-1501426578684-7996486c7d96?w=800',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    _id: '7',
    userId: '7',
    content: "Exciting news! My team's work on neural implants for visual cortex stimulation has restored partial sight in our first clinical trial patient. #NeuralInterfaces #MedicalAI",
    media: ["https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800"],
    hashtags: ['NeuralInterfaces', 'MedicalAI'],
    mentions: [],
    likes: ['1', '3', '5'],
    retweets: ['1', '3', '5'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    user: {
      _id: '7',
      username: 'Olivia Martinez',
      bio: 'Neuroscientist | Neural Interface Specialist',
      profilePicture: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=100',
      banner: 'https://images.unsplash.com/photo-1552964198-c212cdedac1f?w=800',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    _id: '8',
    userId: '8',
    content: "We've just open-sourced our NLP model that can translate between 95 languages with 92% accuracy. Check out the repo! #NLP #OpenSource github.com/translator95",
    media: [],
    hashtags: ['NLP', 'OpenSource'],
    mentions: ['@ElenaChen'],
    likes: ['1', '2', '4'],
    retweets: ['1', '2'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    user: {
      _id: '8',
      username: 'Robert Lee',
      bio: 'NLP Researcher | Polyglot Developer',
      profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
      banner: 'https://images.unsplash.com/photo-1505673542670-a5e3ff5b14a3?w=800',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    _id: '9',
    userId: '9',
    content: "Our computer vision algorithm can now identify microplastics in water samples with 98% accuracy - a huge step forward for environmental monitoring! 🔬 #ComputerVision #EnvironmentalAI",
    media: ["https://images.unsplash.com/photo-1514327567052-1eed4e4902c1?w=800"],
    hashtags: ['ComputerVision', 'EnvironmentalAI'],
    mentions: [],
    likes: ['3', '5', '7'],
    retweets: ['5', '7'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 30 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    user: {
      _id: '9',
      username: 'Emma Wilson',
      bio: 'Environmental AI Researcher | Marine Scientist',
      profilePicture: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=100',
      banner: 'https://images.unsplash.com/photo-1522093537031-3ee69e6b1746?w=800',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    _id: '10',
    userId: '10',
    content: "I'll be speaking at AI Summit next month about how we've implemented federated learning to protect healthcare data privacy while training diagnostic models. #FederatedLearning #HealthcareAI",
    media: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"],
    hashtags: ['FederatedLearning', 'HealthcareAI'],
    mentions: [],
    likes: ['1', '4', '7'],
    retweets: ['4'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    user: {
      _id: '10',
      username: 'James Taylor',
      bio: 'Healthcare AI Specialist | Privacy Advocate',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      banner: 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?w=800',
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