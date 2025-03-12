import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useVideoRecording } from '../hooks/useVideoRecording';
import { 
  sendVideoForAnalysis, 
  checkCameraPermission, 
  isRecordingSupported 
} from '../services/emotionAnalysisService';
import * as authService from '../services/authService';

// Importation des composants factorisés
import { TweetView } from './TweetView';
import { CommentSection } from './CommentSection';
import { ActionButtons } from './ActionButtons';
import { MediaViewer } from './MediaViewer';
import { CameraPermissionButton } from './CameraPermissionButton';
import { RecordingErrorMessage } from './RecordingErrorMessage';
import { Tweet } from '../types';

// URL de base de l'API
const API_URL = 'http://localhost:5002/tweets';

export function Feed() {
  const { tweets, fetchTweets, isLoading, currentUser } = useStore((state) => ({
    tweets: state.tweets,
    fetchTweets: state.fetchTweets,
    isLoading: state.isLoading,
    currentUser: state.currentUser
  }));
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentUserId = currentUser?._id || "user123"; // On utilise l'ID de l'utilisateur connecté ou une valeur par défaut
  
  // États pour suivre les interactions utilisateur
  const [tweetData, setTweetData] = useState<Tweet[]>([]);
  const [bookmarkedTweets, setBookmarkedTweets] = useState<Set<string>>(new Set());
  
  // États pour l'enregistrement vidéo
  const { 
    startRecording, 
    stopRecording, 
    isRecording, 
    error: recordingError, 
    downloadLastRecording,
    requestCameraPermission 
  } = useVideoRecording();
  
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [canRecordVideo, setCanRecordVideo] = useState<boolean | null>(null);
  const [hasRecording, setHasRecording] = useState(false);
  const [showPermissionButton, setShowPermissionButton] = useState(true);
  
  // Référence pour suivre l'ID du tweet actuellement enregistré
  const currentRecordingTweetIdRef = useRef<string | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  
  // États pour l'UI
  const [showComments, setShowComments] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [mediaViewer, setMediaViewer] = useState<{
    isOpen: boolean;
    url: string;
    alt?: string;
  }>({
    isOpen: false,
    url: '',
    alt: ''
  });
  
  // Fonction pour charger les tweets avec contrôle de la fréquence
  const loadTweets = useCallback(async () => {
    // Éviter de faire des appels trop fréquents (pas plus d'une fois toutes les 30 secondes)
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 30000 && tweetData.length > 0) {
      console.log('Tweets déjà chargés récemment, pas besoin de recharger.');
      return;
    }
    
    console.log('Chargement des tweets...');
    try {
      await fetchTweets();
      lastFetchTimeRef.current = now;
    } catch (err) {
      console.error('Erreur lors du chargement des tweets:', err);
    }
  }, [fetchTweets, tweetData.length]);
  
  // Charger les tweets dès le démarrage
  useEffect(() => {
    if (!isLoading) {
      loadTweets();
    }
  }, []);
  
  // Recharger les tweets quand la fenêtre reprend le focus
  useEffect(() => {
    const handleFocus = () => {
      console.log('Fenêtre a repris le focus, rechargement des tweets...');
      loadTweets();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Nettoyer l'écouteur d'événements lors du démontage du composant
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadTweets]);
  
  // Synchroniser tweetData avec tweets chaque fois que tweets change
  useEffect(() => {
    console.log('Synchronisation des tweets...', tweets.length);
    if (tweets.length > 0) {
      setTweetData(
        tweets.map(tweet => ({
          ...tweet,
          likes: Array.isArray(tweet.likes) ? tweet.likes : [],
          retweets: Array.isArray(tweet.retweets) ? tweet.retweets : [],
        }))
      );
      // Réinitialiser l'index au premier tweet si tweetData était vide avant
      if (tweetData.length === 0) {
        setCurrentIndex(0);
      }
    }
  }, [tweets]);
  
  // Vérifier si l'enregistrement vidéo est supporté et autorisé
  useEffect(() => {
    const checkRecordingCapabilities = async () => {
      try {
        // Vérifier d'abord si le navigateur supporte l'enregistrement
        if (!isRecordingSupported()) {
          console.log("L'enregistrement vidéo n'est pas supporté par ce navigateur");
          setCanRecordVideo(false);
          return;
        }
        
        // Par défaut, nous supposons que nous n'avons pas encore l'autorisation
        setCanRecordVideo(false);
        setShowPermissionButton(true);
        
      } catch (err) {
        console.error("Erreur lors de la vérification des capacités d'enregistrement:", err);
        setCanRecordVideo(false);
      }
    };
    
    checkRecordingCapabilities();
  }, []);
  
  // Demander l'autorisation d'utiliser la caméra
  const handleRequestPermission = async () => {
    try {
      const granted = await requestCameraPermission();
      if (granted) {
        setCanRecordVideo(true);
        setShowPermissionButton(false);
        
        // Si l'autorisation est accordée, démarrer l'enregistrement pour le tweet actuel
        const currentTweet = getCurrentTweet();
        if (currentTweet) {
          handleRecording(currentTweet);
        }
      } else {
        setCanRecordVideo(false);
        alert("Sans accès à la caméra, nous ne pourrons pas analyser vos réactions. Vous pouvez réessayer plus tard si vous changez d'avis.");
      }
    } catch (err: unknown) {
      console.error("Erreur lors de la demande d'autorisation:", err);
      setCanRecordVideo(false);
    }
  };

  // Fonction pour gérer l'enregistrement uniquement quand le tweet change
  const handleRecording = useCallback(async (currentTweet: Tweet) => {
    try {
      // Ne rien faire si l'enregistrement n'est pas possible
      if (canRecordVideo === false) {
        return;
      }
      
      // Ne rien faire si on enregistre déjà le même tweet
      if (currentRecordingTweetIdRef.current === currentTweet._id) {
        return;
      }
      
      // 1. Si un enregistrement est en cours, l'arrêter d'abord
      if (isRecording) {
        await stopRecording();
        setHasRecording(true); // Indiquer qu'une vidéo est disponible pour téléchargement
      }
      
      // 2. Attendre un court instant pour s'assurer que l'arrêt est bien effectué
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 3. Démarrer un nouvel enregistrement pour le tweet actuel
      if (currentTweet && canRecordVideo) {
        // Mettre à jour l'ID du tweet actuellement enregistré
        currentRecordingTweetIdRef.current = currentTweet._id;
        
        await startRecording(currentTweet._id);
        setRecordingStartTime(Date.now());
      }
    } catch (err) {
      console.error("Erreur lors de la gestion de l'enregistrement:", err);
    }
  }, [isRecording, stopRecording, startRecording, canRecordVideo]);

  // Gérer l'enregistrement uniquement lorsque l'index change
  useEffect(() => {
    const currentTweet = getCurrentTweet();
    if (currentTweet && currentTweet._id !== currentRecordingTweetIdRef.current) {
      handleRecording(currentTweet);
    }
    
    // Nettoyage lors du démontage du composant
    return () => {
      if (isRecording) {
        stopRecording().catch(err => {
          console.error("Erreur lors de l'arrêt de l'enregistrement au démontage:", err);
        });
        currentRecordingTweetIdRef.current = null;
      }
    };
  }, [currentIndex, handleRecording, isRecording, stopRecording]);

  // Navigation avec les flèches du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  // Navigation
  const handlePrev = () => {
    if (tweetData.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + tweetData.length) % tweetData.length);
    }
  };
  
  const handleNext = () => {
    if (tweetData.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % tweetData.length);
    }
  };

  // Gestion des événements de glissement
  const handleDragEnd = (_: any, info: any) => {
    if (!showComments && tweetData.length > 0) {
      if (info.offset.x > 100) handlePrev();
      else if (info.offset.x < -100) handleNext();
    }
  };

  // Actions avec appels API directs
  const toggleLike = async (tweetId: string) => {
    try {
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

      const updatedTweet = await response.json();
      
      // Mettre à jour l'état local avec les données du backend
      setTweetData(prevData => {
        return prevData.map(tweet => 
          tweet._id === tweetId ? updatedTweet : tweet
        );
      });
      
      console.log('Like/Unlike réussi:', updatedTweet);
    } catch (error) {
      console.error('Erreur lors du like/unlike:', error);
    }
  };

  const toggleRetweet = async (tweetId: string) => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(`${API_URL}/${tweetId}/retweet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: '' }) // Retweet sans contenu supplémentaire
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du retweet');
      }

      const data = await response.json();
      console.log('Retweet réussi:', data);
      
      // Rafraîchir tous les tweets pour récupérer les données à jour
      await fetchTweets();
      
    } catch (error) {
      console.error('Erreur lors du retweet:', error);
    }
  };

  const toggleBookmark = async (tweetId: string) => {
    try {
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
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }

      const result = await response.json();
      
      // Mettre à jour l'état local des bookmarks
      setBookmarkedTweets(prev => {
        const newSet = new Set(prev);
        if (result.isSaved) {
          newSet.add(tweetId);
        } else {
          newSet.delete(tweetId);
        }
        return newSet;
      });
      
      console.log('Sauvegarde réussie:', result);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Vérifications d'état
  const hasUserLiked = (tweetId: string) => {
    const tweet = tweetData.find(t => t._id === tweetId);
    return tweet ? tweet.likes.includes(currentUserId) : false;
  };

  const hasUserRetweeted = (tweetId: string) => {
    const tweet = tweetData.find(t => t._id === tweetId);
    if (!tweet || !tweet.retweets) return false;
    
    return tweet.retweets.some(retweet => {
      if (typeof retweet === 'string') {
        return retweet === currentUserId;
      } else if (retweet && typeof retweet === 'object') {
        return retweet.userId === currentUserId;
      }
      return false;
    });
  };

  // Obtenir le tweet actuel avec les données à jour
  const getCurrentTweet = (): Tweet | null => {
    if (tweetData.length === 0) return null;
    return tweetData[currentIndex];
  };

  // Fonctions pour les commentaires
  const toggleCommentsView = () => {
    setShowComments(!showComments);
  };
  
  const addComment = async (tweetId: string, content: string) => {
    if (!content.trim()) return;
    
    try {
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
        throw new Error(errorData.message || 'Erreur lors du commentaire');
      }

      const data = await response.json();
      console.log('Commentaire ajouté:', data);
      
      // Mettre à jour l'état local avec le tweet mis à jour
      setTweetData(prevData => {
        return prevData.map(tweet => 
          tweet._id === tweetId ? data.tweet : tweet
        );
      });
      
    } catch (error) {
      console.error('Erreur lors du commentaire:', error);
    }
  };
  
  // Fonctions pour le visualiseur de médias
  const openMedia = (url: string, alt?: string) => {
    setMediaViewer({
      isOpen: true,
      url,
      alt: alt || 'Image'
    });
  };
  
  const closeMedia = () => {
    setMediaViewer(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  // Fonction pour suivre/ne plus suivre un utilisateur
  const toggleFollow = (userId: string) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };
  
  // Fonction pour vérifier si un utilisateur est suivi
  const isUserFollowed = (userId: string): boolean => {
    return followedUsers.has(userId);
  };

  // Tweet actuel
  const currentTweet = getCurrentTweet();

  // Afficher un message de chargement ou d'absence de tweets
  if (isLoading) {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <p className="text-xl text-gray-600">Chargement des tweets...</p>
      </div>
    );
  }
  
  if (tweetData.length === 0) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center">
        <p className="text-xl text-gray-600 mb-4">Aucun tweet disponible</p>
        <button 
          onClick={loadTweets}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Rafraîchir
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center overflow-hidden">
      {/* Bouton de rafraîchissement en haut */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={loadTweets}
          className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
          title="Rafraîchir les tweets"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <div className="relative w-full h-[92%] flex items-center justify-center">
        {/* Conteneur principal avec un espacement ajusté */}
        <motion.div 
          className="relative w-full h-full flex items-center justify-center"
          animate={{
            justifyContent: showComments ? 'center' : 'center',
            padding: showComments ? '0 1rem' : '0',
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Composant TweetView */}
          <TweetView 
            tweets={tweetData}
            currentIndex={currentIndex}
            showComments={showComments}
            isUserFollowed={isUserFollowed}
            onToggleFollow={toggleFollow}
            onMediaClick={openMedia}
            onDragEnd={handleDragEnd}
          />
          
          {/* Composant CommentSection */}
          {currentTweet && showComments && (
            <CommentSection 
              isOpen={showComments}
              tweet={currentTweet}
              onClose={toggleCommentsView}
              onAddComment={addComment}
              currentUserId={currentUserId}
            />
          )}
          
          {/* Zones de navigation tactiles (désactivées quand les commentaires sont affichés) */}
          {!showComments && (
            <div className="absolute inset-0 flex pointer-events-auto">
              <div className="w-1/2 h-full cursor-pointer" onClick={handlePrev} />
              <div className="w-1/2 h-full cursor-pointer" onClick={handleNext} />
            </div>
          )}
        </motion.div>
      </div>

      {/* Composant ActionButtons */}
      {currentTweet && (
        <ActionButtons 
          tweet={currentTweet}
          showComments={showComments}
          hasUserLiked={hasUserLiked(currentTweet._id)}
          hasUserRetweeted={hasUserRetweeted(currentTweet._id)}
          isBookmarked={bookmarkedTweets.has(currentTweet._id)}
          onToggleLike={toggleLike}
          onToggleRetweet={toggleRetweet}
          onToggleBookmark={toggleBookmark}
          onToggleComments={toggleCommentsView}
        />
      )}

      {/* Composant CameraPermissionButton */}
      <CameraPermissionButton 
        onRequestPermission={handleRequestPermission}
        visible={showPermissionButton}
      />

      {/* Composant RecordingErrorMessage */}
      <RecordingErrorMessage error={recordingError} />

      {/* Composant MediaViewer */}
      <MediaViewer 
        isOpen={mediaViewer.isOpen}
        url={mediaViewer.url}
        alt={mediaViewer.alt}
        onClose={closeMedia}
      />
    </div>
  );
}