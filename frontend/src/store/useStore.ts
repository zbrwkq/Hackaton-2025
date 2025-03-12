import { create } from 'zustand';
import type { Tweet, User, Notification } from '../types';
import * as userService from '../services/userService';
import * as authService from '../services/authService';
import * as tweetService from '../services/tweetService';

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

interface TweetState {
  tweets: Tweet[];
  isLoading: boolean;
  error: string | null;
  fetchTweets: () => Promise<void>;
  createTweet: (content: string, media?: string[], hashtags?: string[], mentions?: string[]) => Promise<void>;
  likeTweet: (tweetId: string) => Promise<void>;
  retweetTweet: (tweetId: string, content?: string) => Promise<void>;
  commentTweet: (tweetId: string, content: string) => Promise<void>;
  deleteTweet: (tweetId: string) => Promise<void>;
  saveTweet: (tweetId: string) => Promise<void>;
  fetchLikedTweets: () => Promise<void>;
  fetchRetweetedTweets: () => Promise<void>;
  fetchCommentedTweets: () => Promise<void>;
  fetchSavedTweets: () => Promise<void>;
}

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setCurrentUser: (user: User | null) => void;
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

interface NotificationState {
  notifications: Notification[];
  notificationSettings: NotificationSettings;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

type Store = AuthState & NotificationState & TweetState;

export const useStore = create<Store>((set, get) => ({
  // Auth state
  currentUser: null,
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
  
  // Tweet state
  tweets: [],
  
  // Notification state
  notifications: MOCK_NOTIFICATIONS,
  notificationSettings: {
    likes: true,
    retweets: true,
    replies: true,
    follows: true,
    mentions: true
  },
  
  // Auth actions
  setCurrentUser: (user) => set({ currentUser: user }),
  
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
  },
  
  // Notification actions
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
  
  // Tweet actions
  fetchTweets: async () => {
    set({ isLoading: true, error: null });
    try {
      const tweets = await tweetService.getAllTweets();
      set({ tweets, isLoading: false });
    } catch (error) {
      console.error('Erreur de récupération des tweets:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de récupération des tweets'
      });
    }
  },
  
  createTweet: async (content, media, hashtags, mentions) => {
    set({ isLoading: true, error: null });
    try {
      const newTweet = await tweetService.createTweet({
        content,
        media,
        hashtags,
        mentions
      });
      
      set(state => ({ 
        tweets: [newTweet, ...state.tweets],
        isLoading: false 
      }));
    } catch (error) {
      console.error('Erreur de création du tweet:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de création du tweet'
      });
      throw error;
    }
  },
  
  likeTweet: async (tweetId) => {
    try {
      const updatedTweet = await tweetService.toggleLike(tweetId);
      
      set(state => ({
        tweets: state.tweets.map(tweet => 
          tweet._id === tweetId ? updatedTweet : tweet
        )
      }));
    } catch (error) {
      console.error('Erreur de like/unlike:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur de like/unlike'
      });
    }
  },
  
  retweetTweet: async (tweetId, content) => {
    set({ isLoading: true, error: null });
    try {
      const retweetedTweet = await tweetService.toggleRetweet(tweetId, content);
      
      // Rafraîchir tous les tweets
      await get().fetchTweets();
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Erreur de retweet:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de retweet'
      });
      throw error;
    }
  },
  
  commentTweet: async (tweetId, content) => {
    try {
      const updatedTweet = await tweetService.addComment(tweetId, content);
      
      set(state => ({
        tweets: state.tweets.map(tweet => 
          tweet._id === tweetId ? updatedTweet : tweet
        )
      }));
    } catch (error) {
      console.error('Erreur d\'ajout de commentaire:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur d\'ajout de commentaire'
      });
      throw error;
    }
  },
  
  deleteTweet: async (tweetId) => {
    set({ isLoading: true, error: null });
    try {
      await tweetService.deleteTweet(tweetId);
      
      set(state => ({
        tweets: state.tweets.filter(tweet => tweet._id !== tweetId),
        isLoading: false
      }));
    } catch (error) {
      console.error('Erreur de suppression du tweet:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de suppression du tweet'
      });
      throw error;
    }
  },
  
  saveTweet: async (tweetId) => {
    try {
      const result = await tweetService.toggleSaveTweet(tweetId);
      
      // Mettre à jour l'état du tweet sauvegardé
      set(state => ({
        tweets: state.tweets.map(tweet => 
          tweet._id === tweetId 
            ? { ...tweet, isSavedByUser: result.isSaved }
            : tweet
        )
      }));
    } catch (error) {
      console.error('Erreur de sauvegarde du tweet:', error);
    set({ 
        error: error instanceof Error ? error.message : 'Erreur de sauvegarde du tweet'
      });
    }
  },
  
  fetchLikedTweets: async () => {
    set({ isLoading: true, error: null });
    try {
      const likedTweets = await tweetService.getUserLikedTweets();
      set({ tweets: likedTweets, isLoading: false });
    } catch (error) {
      console.error('Erreur de récupération des tweets likés:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de récupération des tweets likés'
      });
    }
  },
  
  fetchRetweetedTweets: async () => {
    set({ isLoading: true, error: null });
    try {
      const retweetedTweets = await tweetService.getUserRetweetedTweets();
      set({ tweets: retweetedTweets, isLoading: false });
    } catch (error) {
      console.error('Erreur de récupération des retweets:', error);
    set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de récupération des retweets'
      });
    }
  },
  
  fetchCommentedTweets: async () => {
    set({ isLoading: true, error: null });
    try {
      const commentedTweets = await tweetService.getUserCommentedTweets();
      set({ tweets: commentedTweets, isLoading: false });
    } catch (error) {
      console.error('Erreur de récupération des tweets commentés:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de récupération des tweets commentés'
      });
    }
  },
  
  fetchSavedTweets: async () => {
    set({ isLoading: true, error: null });
    try {
      const savedTweets = await tweetService.getSavedTweets();
      set({ tweets: savedTweets, isLoading: false });
    } catch (error) {
      console.error('Erreur de récupération des tweets sauvegardés:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur de récupération des tweets sauvegardés'
      });
    }
  }
}));