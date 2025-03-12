import { Tweet } from '../types';
import * as authService from './authService';

// URL de base de l'API
const API_URL = 'http://localhost:5002/tweets';

// Interface pour les paramètres de création d'un tweet
interface CreateTweetData {
  content: string;
  media?: string[];
  hashtags?: string[];
  mentions?: string[];
}

// Obtenir tous les tweets
export const getAllTweets = async (): Promise<Tweet[]> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_URL}/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération des tweets');
  }

  const data = await response.json();
  return data.tweets;
};

// Créer un nouveau tweet
export const createTweet = async (tweetData: CreateTweetData): Promise<Tweet> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(tweetData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la création du tweet');
  }

  const data = await response.json();
  return data.tweet;
};

// Liker/Unliker un tweet
export const toggleLike = async (tweetId: string): Promise<Tweet> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_URL}/${tweetId}/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors du like/unlike');
  }

  return response.json();
};

// Retweeter/Unretweeter un tweet
export const toggleRetweet = async (tweetId: string, content?: string): Promise<Tweet> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_URL}/${tweetId}/retweet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content: content || '' })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors du retweet/unretweet');
  }

  const data = await response.json();
  return data.tweet;
};

// Commenter un tweet
export const addComment = async (tweetId: string, content: string): Promise<Tweet> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_URL}/${tweetId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de l\'ajout du commentaire');
  }

  const data = await response.json();
  return data.tweet;
};

// Supprimer un tweet
export const deleteTweet = async (tweetId: string): Promise<void> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_URL}/${tweetId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la suppression du tweet');
  }
};

// Récupérer les tweets que l'utilisateur a liké
export const getUserLikedTweets = async (): Promise<Tweet[]> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_URL}/user/likes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération des tweets likés');
  }

  const data = await response.json();
  return data.tweets;
};

// Récupérer les tweets que l'utilisateur a retweeté
export const getUserRetweetedTweets = async (): Promise<Tweet[]> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_URL}/user/retweets`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération des retweets');
  }

  const data = await response.json();
  return data.tweets;
};

// Récupérer les tweets que l'utilisateur a commenté
export const getUserCommentedTweets = async (): Promise<Tweet[]> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_URL}/user/comments`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération des tweets commentés');
  }

  const data = await response.json();
  return data.tweets;
};

// Sauvegarder/Désauvegarder un tweet
export const toggleSaveTweet = async (tweetId: string): Promise<{ isSaved: boolean }> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_URL}/${tweetId}/save`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la sauvegarde du tweet');
  }

  return response.json();
};

// Récupérer les tweets sauvegardés
export const getSavedTweets = async (): Promise<Tweet[]> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_URL}/user/saved`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération des tweets sauvegardés');
  }

  const data = await response.json();
  return data.tweets;
}; 