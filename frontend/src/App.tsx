import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MainLayout } from './layouts/MainLayout';
import { Feed } from './components/Feed';
import { Settings } from './pages/Settings';
import { Messages } from './pages/Messages';
import { Profile } from './pages/Profile';
import { Notifications } from './pages/Notifications';
import { SearchPage } from './pages/Search';
import { useStore } from './store/useStore';
import { AuthProvider } from './components/AuthProvider';

function App() {
  const fetchTweets = useStore((state) => state.fetchTweets);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTweets();
    }
  }, [fetchTweets, isAuthenticated]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
            <Route 
              path="/" 
              element={
                isAuthenticated 
                  ? <MainLayout /> 
                  : <Navigate to="/login" />
              }
            >
              <Route index element={<Feed />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile/:userId?" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="search" element={<SearchPage />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;