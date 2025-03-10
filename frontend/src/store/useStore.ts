import { create } from 'zustand';
import type { Tweet, User, Notification } from '../types';

interface Store {
  currentUser: User | null;
  tweets: Tweet[];
  notifications: Notification[];
  isAuthenticated: boolean;
  setCurrentUser: (user: User | null) => void;
  setTweets: (tweets: Tweet[]) => void;
  addTweet: (tweet: Tweet) => void;
  setNotifications: (notifications: Notification[]) => void;
  login: (email: string, password: string) => void;
  logout: () => void;
}

export const useStore = create<Store>((set) => ({
  currentUser: null,
  tweets: [],
  notifications: [],
  isAuthenticated: false,
  setCurrentUser: (user) => set({ currentUser: user }),
  setTweets: (tweets) => set({ tweets }),
  addTweet: (tweet) => set((state) => ({ tweets: [tweet, ...state.tweets] })),
  setNotifications: (notifications) => set({ notifications }),
  login: (email, password) => {
    // Mock login
    set({ 
      isAuthenticated: true,
      currentUser: {
        _id: '1',
        username: 'Demo User',
        bio: 'AI Enthusiast',
        profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        banner: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
        followers: [],
        following: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    });
  },
  logout: () => set({ isAuthenticated: false, currentUser: null }),
}));