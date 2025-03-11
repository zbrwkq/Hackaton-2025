import { useState, useEffect, useCallback, useRef } from 'react';
import { TweetCard } from './TweetCard';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoRecording } from '../hooks/useVideoRecording';
import { 
  sendVideoForAnalysis, 
  checkCameraPermission, 
  isRecordingSupported 
} from '../services/emotionAnalysisService';

export function Feed() {
  const tweets = useStore((state) => state.tweets);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentUserId = "user123"; // À remplacer par l'ID réel de l'utilisateur connecté
  
  // États pour suivre les interactions utilisateur
  const [tweetData, setTweetData] = useState(
    tweets.map(tweet => ({
      ...tweet,
      likes: Array.isArray(tweet.likes) ? tweet.likes : [],
      retweets: Array.isArray(tweet.retweets) ? tweet.retweets : [],
    }))
  );
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
  const handleRecording = useCallback(async (currentTweet: any) => {
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
       // console.log(`Enregistrement terminé pour le tweet précédent (ID: ${currentRecordingTweetIdRef.current})`);
        setHasRecording(true); // Indiquer qu'une vidéo est disponible pour téléchargement
      }
      
      // 2. Attendre un court instant pour s'assurer que l'arrêt est bien effectué
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 3. Démarrer un nouvel enregistrement pour le tweet actuel
      if (currentTweet && canRecordVideo) {
        // Mettre à jour l'ID du tweet actuellement enregistré
        currentRecordingTweetIdRef.current = currentTweet._id;
        
        await startRecording(currentTweet._id);
        //console.log(`Démarrage de l'enregistrement pour le tweet id: ${currentTweet._id}`);
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
  }, [currentIndex, handleRecording]);  // Dépendances minimales nécessaires

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
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + tweets.length) % tweets.length);
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % tweets.length);

  // Actions
  const toggleLike = (tweetId: string) => {
    setTweetData(prevData => {
      return prevData.map(tweet => {
        if (tweet._id === tweetId) {
          const userLiked = tweet.likes.includes(currentUserId);
          return {
            ...tweet,
            likes: userLiked 
              ? tweet.likes.filter(id => id !== currentUserId) 
              : [...tweet.likes, currentUserId]
          };
        }
        return tweet;
      });
    });
  };

  const toggleRetweet = (tweetId: string) => {
    setTweetData(prevData => {
      return prevData.map(tweet => {
        if (tweet._id === tweetId) {
          const userRetweeted = tweet.retweets.includes(currentUserId);
          return {
            ...tweet,
            retweets: userRetweeted 
              ? tweet.retweets.filter(id => id !== currentUserId) 
              : [...tweet.retweets, currentUserId]
          };
        }
        return tweet;
      });
    });
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedTweets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Vérifications d'état
  const hasUserLiked = (tweetId: string) => {
    const tweet = tweetData.find(t => t._id === tweetId);
    return tweet ? tweet.likes.includes(currentUserId) : false;
  };

  const hasUserRetweeted = (tweetId: string) => {
    const tweet = tweetData.find(t => t._id === tweetId);
    return tweet ? tweet.retweets.includes(currentUserId) : false;
  };

  // Obtenir le tweet actuel avec les données à jour
  const getCurrentTweet = () => {
    return tweetData[currentIndex] || tweets[currentIndex];
  };

  // Styles des cartes
  const getCardStyles = (index: number) => {
    const position = ((index - currentIndex) % tweets.length + tweets.length) % tweets.length;
    const relativePosition = position > tweets.length / 2 ? position - tweets.length : position;
    
    let xPos = 0, scale = 1, opacity = 1, blur = 0, zIndex = 5;
    
    if (relativePosition === 0) {
      xPos = 0; scale = 1; opacity = 1; blur = 0; zIndex = 10;
    } else if (relativePosition === 1 || relativePosition === -tweets.length + 1) {
      xPos = 360; scale = 0.85; opacity = 0.6; blur = 4; zIndex = 1;
    } else if (relativePosition === -1 || relativePosition === tweets.length - 1) {
      xPos = -360; scale = 0.85; opacity = 0.6; blur = 4; zIndex = 1;
    } else {
      xPos = relativePosition > 0 ? 720 : -720; scale = 0.7; opacity = 0; blur = 8; zIndex = 0;
    }
    
    return {
      x: xPos,
      scale,
      opacity,
      filter: `blur(${blur}px)`,
      zIndex,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        scale: { duration: 0.4 },
        opacity: { duration: 0.4 },
        filter: { duration: 0.4 }
      }
    };
  };

  // Animation des boutons
  const buttonVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    })
  };

  // Format des compteurs
  const formatCount = (count: number): string => {
    if (count === 0) return "";
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + "k";
    return (count / 1000000).toFixed(1) + "M";
  };

  // Tweet actuel
  const currentTweet = getCurrentTweet();

  return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center overflow-hidden">
      <div className="relative w-full h-[92%] flex items-center justify-center">
        {/* Cartes */}
        {tweets.map((tweet, index) => {
          const isActive = index === currentIndex;
          const displayTweet = tweetData[index] || tweet;
          
          return (
            <motion.div
              key={tweet._id}
              className={`absolute ${isActive ? 'card-active' : 'card-inactive'}`}
              style={{ 
                width: '480px',
                maxHeight: isActive ? '70vh' : '60vh',
                overflowY: isActive ? 'auto' : 'hidden',
                transform: 'translateY(5%)'
              }}
              animate={{
                ...getCardStyles(index),
                y: getCardStyles(index).x === 0 ? '5%' : getCardStyles(index).x
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) handlePrev();
                else if (info.offset.x < -100) handleNext();
              }}
            >
              <div className="card-content">
                <TweetCard tweet={displayTweet} hideActions={true} />
              </div>
            </motion.div>
          );
        })}
        
        {/* Zones de navigation tactiles */}
        <div className="absolute inset-0 flex pointer-events-auto">
          <div className="w-1/2 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-1/2 h-full cursor-pointer" onClick={handleNext} />
        </div>
      </div>

      {/* Boutons d'action flottants avec compteurs */}
      <AnimatePresence>
        {tweets.length > 0 && (
          <div className="action-buttons-container flex justify-center space-x-6 md:space-x-10 mt-1 mb-4">
            {/* Commentaire */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={buttonVariants}
              className="action-button-container flex flex-col items-center"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="action-button comment-button bg-white text-gray-700 p-3 rounded-full shadow-md"
                onClick={() => {/* Fonction de commentaire */}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </motion.button>
              <span className="text-xs mt-1 text-gray-600">
                {formatCount(currentTweet.mentions?.length || 0)}
              </span>
            </motion.div>
            
            {/* Retweet */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={1}
              variants={buttonVariants}
              className="action-button-container flex flex-col items-center"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`action-button retweet-button p-3 rounded-full shadow-md
                  ${hasUserRetweeted(currentTweet._id) ? 'bg-green-50 text-green-600' : 'bg-white text-gray-700'}`}
                onClick={() => toggleRetweet(currentTweet._id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.button>
              <span className={`text-xs mt-1 ${hasUserRetweeted(currentTweet._id) ? 'text-green-600' : 'text-gray-600'}`}>
                {formatCount(currentTweet.retweets?.length || 0)}
              </span>
            </motion.div>
            
            {/* Like */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={2}
              variants={buttonVariants}
              className="action-button-container flex flex-col items-center"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`action-button like-button p-3 rounded-full shadow-md
                  ${hasUserLiked(currentTweet._id) ? 'bg-red-50 text-red-500' : 'bg-white text-gray-700'}`}
                onClick={() => toggleLike(currentTweet._id)}
              >
                {hasUserLiked(currentTweet._id) ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </motion.button>
              <span className={`text-xs mt-1 ${hasUserLiked(currentTweet._id) ? 'text-red-500' : 'text-gray-600'}`}>
                {formatCount(currentTweet.likes?.length || 0)}
              </span>
            </motion.div>
            
            {/* Enregistrer */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
              variants={buttonVariants}
              className="action-button-container flex flex-col items-center"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`action-button bookmark-button p-3 rounded-full shadow-md
                  ${bookmarkedTweets.has(currentTweet._id) ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                onClick={() => toggleBookmark(currentTweet._id)}
              >
                {bookmarkedTweets.has(currentTweet._id) ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                )}
              </motion.button>
              <span className="text-xs mt-1 text-gray-600">
                {bookmarkedTweets.has(currentTweet._id) ? "Enregistré" : ""}
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bouton pour demander l'autorisation de la caméra */}
      {showPermissionButton && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={handleRequestPermission}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            Autoriser l'accès à la caméra
          </button>
        </div>
      )}

      {/* Bouton de téléchargement pour le développement */}
      {/* {hasRecording && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => {
              downloadLastRecording();
              console.log("Téléchargement de la dernière vidéo enregistrée");
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Télécharger la vidéo
          </button>
        </div>
      )} */}

      {/* Message d'erreur d'enregistrement */}
      {recordingError && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Erreur:</strong>
            <span className="block sm:inline"> {recordingError}</span>
          </div>
        </div>
      )}
    </div>
  );
}