import { Tweet } from '../types';
import * as authService from './authService';

// URL de base de l'API
const API_URL = 'http://localhost:3000/api/tweets/tweets';

// Interface pour les paramètres de création d'un tweet
interface CreateTweetData {
  content: string;
  media?: string[];
  hashtags?: string[];
  mentions?: string[];
}

// Obtenir tous les tweets
export const getAllTweets = async (userId?: string, limit: number = 4): Promise<Tweet[]> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  let url = `${API_URL}/`;
  if (userId) {
    url = `${API_URL}/user/${userId}`;
  }
  
  // Ajouter le paramètre de limite
  url += `?limit=${limit}`;

  const response = await fetch(url, {
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

// Obtenir les tweets aimés par l'utilisateur
export const getUserLikedTweets = async (userId?: string): Promise<Tweet[]> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  let url = `${API_URL}/liked`;
  if (userId) {
    url = `${API_URL}/liked/${userId}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération des tweets aimés');
  }

  const data = await response.json();
  return data.tweets;
};

// Obtenir les tweets retweetés par l'utilisateur
export const getUserRetweetedTweets = async (userId?: string): Promise<Tweet[]> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  let url = `${API_URL}/retweeted`;
  if (userId) {
    url = `${API_URL}/retweeted/${userId}`;
  }

  const response = await fetch(url, {
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

// Obtenir les tweets commentés par l'utilisateur
export const getUserCommentedTweets = async (userId?: string): Promise<Tweet[]> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  let url = `${API_URL}/commented`;
  if (userId) {
    url = `${API_URL}/commented/${userId}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération des commentaires');
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

// Liker un tweet
export const likeTweet = async (tweetId: string): Promise<Tweet> => {
  return toggleLike(tweetId);
};

// Retweeter un tweet
export const retweetTweet = async (tweetId: string, content?: string): Promise<Tweet> => {
  return toggleRetweet(tweetId, content);
};

// Commenter un tweet
export const commentTweet = async (tweetId: string, content: string): Promise<Tweet> => {
  return addComment(tweetId, content);
};

// Générer des données fictives
export const generateFakeData = async (): Promise<{ message: string }> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_URL}/fake-data`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la génération des données fictives');
  }

  return response.json();
};

// Envoyer feedback et recevoir un tweet recommandé
export const sendFeedback = async (tweetId: string, file: File): Promise<Tweet> => {
  const token = authService.getToken();
  if (!token) throw new Error('Non authentifié');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('tweetId', tweetId);

  const response = await fetch(`${API_URL}/feedback`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de l\'envoi du feedback');
  }

  const data = await response.json();
  return data.nextTweet;
}; 