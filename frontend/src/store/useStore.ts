import { create } from 'zustand';
import type { Tweet, User, Notification } from '../types';
import * as userService from '../services/userService';
import * as authService from '../services/authService';
import * as tweetService from '../services/tweetService';
import * as notificationService from '../services/notificationService';

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
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  fetchNotifications: () => Promise<void>;
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
  notifications: [],
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
    try {
      await userService.followUser(userId);
      
      // Mettre à jour la liste des utilisateurs suivis
      const updatedUser = await userService.getUserProfile();
      set({ currentUser: updatedUser });
      
      // Envoyer une notification (utilisateur actuel qui suit un autre utilisateur)
      const { currentUser } = get();
      if (currentUser) {
        try {
          await notificationService.createNotification({
            type: 'follow',
            relatedUserId: currentUser._id
          });
        } catch (error) {
          console.error('Erreur lors de l\'envoi de la notification de suivi:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors du suivi de l\'utilisateur:', error);
    }
  },
  
  // Notification actions
  setNotifications: (notifications) => set({ notifications }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),
  
  markNotificationAsRead: async (notificationId) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((notif) => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      }));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    }
  },
  
  markAllNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map((notif) => ({ ...notif, read: true }))
  })),
  
  updateNotificationSettings: (settings) => set((state) => ({
    notificationSettings: { ...state.notificationSettings, ...settings }
  })),
  
  fetchNotifications: async () => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    try {
      const notifications = await notificationService.fetchNotifications(currentUser._id);
      set({ notifications });
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    }
  },
  
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
    set({ isLoading: true, error: null });
    try {
      const updatedTweet = await tweetService.likeTweet(tweetId);
      
      // Mettre à jour le tweet dans la liste des tweets
      set((state) => ({
        tweets: state.tweets.map((tweet) => 
          tweet._id === tweetId ? updatedTweet : tweet
        ),
        isLoading: false
      }));
      
      // Envoyer une notification (utilisateur actuel qui like le tweet d'un autre utilisateur)
      const { currentUser } = get();
      if (currentUser && updatedTweet.userId !== currentUser._id) {
        try {
          await notificationService.createNotification({
            type: 'like',
            relatedUserId: currentUser._id,
            tweetId
          });
        } catch (error) {
          console.error('Erreur lors de l\'envoi de la notification de like:', error);
        }
      }
    } catch (error) {
      console.error('Erreur de like:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur lors du like'
      });
    }
  },
  
  retweetTweet: async (tweetId, content) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTweet = await tweetService.retweetTweet(tweetId, content);
      
      // Mettre à jour la liste des tweets
      set((state) => ({
        tweets: state.tweets.map((tweet) => 
          tweet._id === tweetId ? updatedTweet : tweet
        ),
        isLoading: false
      }));
      
      // Envoyer une notification (utilisateur actuel qui retweete le tweet d'un autre utilisateur)
      const { currentUser } = get();
      if (currentUser && updatedTweet.userId !== currentUser._id) {
        try {
          await notificationService.createNotification({
            type: 'retweet',
            relatedUserId: currentUser._id,
            tweetId
          });
        } catch (error) {
          console.error('Erreur lors de l\'envoi de la notification de retweet:', error);
        }
      }
    } catch (error) {
      console.error('Erreur de retweet:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur lors du retweet'
      });
    }
  },
  
  commentTweet: async (tweetId, content) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTweet = await tweetService.commentTweet(tweetId, content);
      
      // Mettre à jour la liste des tweets
      set((state) => ({
        tweets: state.tweets.map((tweet) => 
          tweet._id === tweetId ? updatedTweet : tweet
        ),
        isLoading: false
      }));
      
      // Envoyer une notification (utilisateur actuel qui commente le tweet d'un autre utilisateur)
      const { currentUser } = get();
      if (currentUser && updatedTweet.userId !== currentUser._id) {
        try {
          await notificationService.createNotification({
            type: 'reply',
            relatedUserId: currentUser._id,
            tweetId
          });
        } catch (error) {
          console.error('Erreur lors de l\'envoi de la notification de commentaire:', error);
        }
      }
    } catch (error) {
      console.error('Erreur de commentaire:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur lors du commentaire'
      });
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