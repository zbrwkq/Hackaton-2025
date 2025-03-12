import { create } from 'zustand';
import type { Tweet, User, Notification } from '../types';
import * as userService from '../services/userService';
import * as authService from '../services/authService';

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
  isLoading: boolean;
  error: string | null;
  setCurrentUser: (user: User | null) => void;
  setTweets: (tweets: Tweet[]) => void;
  addTweet: (tweet: Tweet) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, bio?: string) => Promise<void>;
  logout: () => void;
  loadUserProfile: () => Promise<void>;
  updateProfile: (data: { username?: string; bio?: string; profilePicture?: File; banner?: File }) => Promise<void>;
  updateProfilePicture: (file: File) => Promise<void>;
  updateBanner: (file: File) => Promise<void>;
  fetchFollowers: () => Promise<void>;
  fetchFollowing: () => Promise<void>;
  followUser: (userId: string) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
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
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
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
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const authData = await userService.login({ mail: email, password });
      
      // Stocker les données d'authentification
      authService.setAuthData(authData.token, authData.userId, authData.username);
      
      // Charger le profil utilisateur
      await get().loadUserProfile();
      
      set({ isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de connexion'
      });
      throw error;
    }
  },
  register: async (username, email, password, bio) => {
    set({ isLoading: true, error: null });
    try {
      const authData = await userService.register({ 
        username, 
        mail: email, 
        password,
        bio 
      });
      
      // Stocker les données d'authentification
      authService.setAuthData(authData.token, authData.userId, authData.username);
      
      // Charger le profil utilisateur
      await get().loadUserProfile();
      
      set({ isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur d\'inscription'
      });
      throw error;
    }
  },
  logout: () => {
    authService.clearAuthData();
    set({ isAuthenticated: false, currentUser: null });
  },
  loadUserProfile: async () => {
    const token = authService.getToken();
    if (!token) return;
    
    set({ isLoading: true });
    try {
      const userData = await userService.getProfile(token);
      set({ currentUser: userData, isLoading: false });
    } catch (error) {
      console.error('Erreur de chargement du profil:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de chargement du profil'
      });
    }
  },
  updateProfile: async (data) => {
    const token = authService.getToken();
    if (!token) return;
    
    set({ isLoading: true });
    try {
      const updatedUser = await userService.updateProfile(token, data);
      set({ currentUser: updatedUser, isLoading: false });
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de mise à jour du profil'
      });
      throw error;
    }
  },
  updateProfilePicture: async (file) => {
    const token = authService.getToken();
    if (!token) return;
    
    set({ isLoading: true });
    try {
      const updatedUser = await userService.updateProfilePicture(token, file);
      set({ currentUser: updatedUser, isLoading: false });
    } catch (error) {
      console.error('Erreur de mise à jour de la photo de profil:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de mise à jour de la photo de profil'
      });
      throw error;
    }
  },
  updateBanner: async (file) => {
    const token = authService.getToken();
    if (!token) return;
    
    set({ isLoading: true });
    try {
      const updatedUser = await userService.updateBanner(token, file);
      set({ currentUser: updatedUser, isLoading: false });
    } catch (error) {
      console.error('Erreur de mise à jour de la bannière:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de mise à jour de la bannière'
      });
      throw error;
    }
  },
  fetchFollowers: async () => {
    const token = authService.getToken();
    if (!token) return;
    
    set({ isLoading: true });
    try {
      const followers = await userService.getFollowers(token);
      // Mettre à jour le currentUser avec les détails des followers
      set(state => ({
        currentUser: state.currentUser ? {
          ...state.currentUser,
          followers: followers.map(user => user._id)
        } : null,
        isLoading: false
      }));
    } catch (error) {
      console.error('Erreur de récupération des followers:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de récupération des followers'
      });
    }
  },
  fetchFollowing: async () => {
    const token = authService.getToken();
    if (!token) return;
    
    set({ isLoading: true });
    try {
      const following = await userService.getFollowing(token);
      // Mettre à jour le currentUser avec les détails des following
      set(state => ({
        currentUser: state.currentUser ? {
          ...state.currentUser,
          following: following.map(user => user._id)
        } : null,
        isLoading: false
      }));
    } catch (error) {
      console.error('Erreur de récupération des following:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de récupération des following'
      });
    }
  },
  followUser: async (userId) => {
    const token = authService.getToken();
    if (!token) return;
    
    set({ isLoading: true });
    try {
      const result = await userService.toggleFollow(token, userId);
      
      // Rafraîchir les followers et following après l'action
      await get().loadUserProfile();
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Erreur lors du follow/unfollow:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur lors du follow/unfollow'
      });
    }
  }
}));