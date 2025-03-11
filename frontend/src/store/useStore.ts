import { create } from 'zustand';
import type { Tweet, User, Notification } from '../types';

// Notifications d'exemple pour la démo
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    _id: '1',
    userId: '1',
    type: 'like',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
    sourceUserId: '2',
    sourceUsername: 'Alex Rivera',
    tweetId: '1'
  },
  {
    _id: '2',
    userId: '1',
    type: 'retweet',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    read: false,
    sourceUserId: '3',
    sourceUsername: 'Maria Johnson',
    tweetId: '1'
  },
  {
    _id: '3',
    userId: '1',
    type: 'follow',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    sourceUserId: '4',
    sourceUsername: 'Thomas Wright'
  },
  {
    _id: '4',
    userId: '1',
    type: 'reply',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    read: true,
    sourceUserId: '5',
    sourceUsername: 'Sophia Chen',
    tweetId: '1'
  },
  {
    _id: '5',
    userId: '1',
    type: 'mention',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: true,
    sourceUserId: '6',
    sourceUsername: 'James Wilson',
    tweetId: '2'
  }
];

interface NotificationSettings {
  likes: boolean;
  retweets: boolean;
  replies: boolean;
  follows: boolean;
  mentions: boolean;
}

interface Store {
  currentUser: User | null;
  tweets: Tweet[];
  notifications: Notification[];
  notificationSettings: NotificationSettings;
  isAuthenticated: boolean;
  setCurrentUser: (user: User | null) => void;
  setTweets: (tweets: Tweet[]) => void;
  addTweet: (tweet: Tweet) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  login: (email: string, password: string) => void;
  register: (username: string, email: string, password: string) => void;
  logout: () => void;
}

export const useStore = create<Store>((set) => ({
  currentUser: null,
  tweets: [],
  notifications: MOCK_NOTIFICATIONS,
  notificationSettings: {
    likes: true,
    retweets: true,
    replies: true,
    follows: true,
    mentions: true
  },
  isAuthenticated: false,
  setCurrentUser: (user) => set({ currentUser: user }),
  setTweets: (tweets) => set({ tweets }),
  addTweet: (tweet) => set((state) => ({ tweets: [tweet, ...state.tweets] })),
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => ({ 
    notifications: [notification, ...state.notifications] 
  })),
  markNotificationAsRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(notification => 
      notification._id === notificationId 
        ? { ...notification, read: true } 
        : notification
    )
  })),
  markAllNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map(notification => ({ ...notification, read: true }))
  })),
  updateNotificationSettings: (settings) => set((state) => ({
    notificationSettings: { ...state.notificationSettings, ...settings }
  })),
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
  register: (username, email, password) => {
    // Mock register - in a real app this would call an API
    set({ 
      isAuthenticated: true,
      currentUser: {
        _id: '1',
        username,
        bio: 'New user',
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