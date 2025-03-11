import { useRef, useState, useEffect } from 'react';
import { sendVideoForAnalysis } from '../services/emotionAnalysisService';

interface VideoRecordingHook {
  startRecording: (tweetId: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  isRecording: boolean;
  error: string | null;
  downloadLastRecording: () => void;
  requestCameraPermission: () => Promise<boolean>;
}

/**
 * Options de configuration pour l'enregistrement vidéo
 */
const VIDEO_CONFIG = {
  // Qualité vidéo basse pour réduire la taille
  width: 320,        // Résolution réduite (était 640)
  height: 240,       // Résolution réduite (était 480)
  frameRate: 10,     // Framerate bas (15-30 est standard)
  facingMode: 'user',
  // Bitrate bas pour réduire la taille du fichier (en bits par seconde)
  bitsPerSecond: 250000  // 250 Kbps (une vidéo standard est ~1-2 Mbps)
};

/**
 * Hook personnalisé pour gérer l'enregistrement vidéo silencieux
 */
export function useVideoRecording(): VideoRecordingHook {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const currentTweetIdRef = useRef<string | null>(null);
  const currentUserId = "user123"; // À remplacer par l'ID réel de l'utilisateur connecté
  const stopPromiseResolveRef = useRef<(() => void) | null>(null);
  
  // Référence pour stocker la dernière vidéo enregistrée
  const lastRecordingBlobRef = useRef<Blob | null>(null);
  
  // Références pour éviter les opérations simultanées
  const isStartingRef = useRef<boolean>(false);
  const isStoppingRef = useRef<boolean>(false);
  
  // État pour suivre si l'autorisation de caméra a été accordée
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // Nettoyage des ressources
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  /**
   * Demande explicitement à l'utilisateur l'autorisation d'utiliser la caméra
   * @returns Une promesse qui se résout à true si l'autorisation est accordée, false sinon
   */
  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      // Créer un élément de dialogue pour expliquer à l'utilisateur pourquoi nous avons besoin de la caméra
      const confirmed = window.confirm(
        "Pour améliorer votre expérience, nous aimerions accéder à votre caméra. " +
        "Cela nous permettra d'analyser vos réactions aux tweets. " +
        "\n\nVeuillez autoriser l'accès à la caméra lorsque votre navigateur vous le demandera."
      );
      
      if (!confirmed) {
        console.log("L'utilisateur a refusé de donner son consentement pour la caméra");
        setHasCameraPermission(false);
        return false;
      }
      
      // Demander l'accès à la caméra de manière explicite
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      // Si nous arrivons ici, l'autorisation a été accordée
      // Arrêter immédiatement cette stream temporaire
      tempStream.getTracks().forEach(track => track.stop());
      
      console.log("Autorisation d'accès à la caméra accordée par l'utilisateur");
      setHasCameraPermission(true);
      return true;
      
    } catch (err) {
      console.error("Erreur lors de la demande d'autorisation de caméra:", err);
      setHasCameraPermission(false);
      return false;
    }
  };

  /**
   * Télécharge la dernière vidéo enregistrée
   */
  const downloadLastRecording = () => {
    if (!lastRecordingBlobRef.current) {
      console.error("Pas d'enregistrement disponible à télécharger");
      return;
    }

    // Créer une URL temporaire pour le blob
    const url = URL.createObjectURL(lastRecordingBlobRef.current);
    
    // Créer un élément <a> invisible pour le téléchargement
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `tweet_${currentTweetIdRef.current || 'unknown'}_${Date.now()}.webm`;
    
    // Ajouter l'élément au DOM, cliquer dessus et le supprimer
    document.body.appendChild(a);
    a.click();
    
    // Nettoyer après le téléchargement
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  /**
   * Démarre l'enregistrement vidéo
   */
  const startRecording = async (tweetId: string): Promise<void> => {
    // Éviter les démarrages simultanés
    if (isStartingRef.current || isStoppingRef.current) {
      console.log("Opération d'enregistrement déjà en cours, ignoré");
      return;
    }

    // Ne pas redémarrer si on enregistre déjà ce tweet
    if (isRecording && currentTweetIdRef.current === tweetId) {
      console.log(`Déjà en train d'enregistrer le tweet ${tweetId}, ignoré`);
      return;
    }
    
    try {
      isStartingRef.current = true;
      
      // Vérifier si nous avons déjà l'autorisation pour la caméra
      if (hasCameraPermission === null || hasCameraPermission === false) {
        // Si nous n'avons pas encore vérifié ou si l'autorisation a été refusée,
        // demander explicitement l'autorisation
        const permitted = await requestCameraPermission();
        if (!permitted) {
          console.log("Impossible d'accéder à la caméra: autorisation refusée");
          setError("Autorisation d'accès à la caméra refusée");
          return;
        }
      }
      
      // Arrêter l'enregistrement précédent si nécessaire
      if (isRecording) {
        await stopRecording();
      }
      
      // Configurer le nouvel enregistrement
      currentTweetIdRef.current = tweetId;
      setError(null);
      
      // Accéder à la caméra avec des contraintes de basse qualité
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: VIDEO_CONFIG.facingMode,
          width: { ideal: VIDEO_CONFIG.width },
          height: { ideal: VIDEO_CONFIG.height },
          frameRate: { ideal: VIDEO_CONFIG.frameRate }
        },
        audio: false
      });
      
      // Créer le MediaRecorder avec un bitrate bas
      const options: MediaRecorderOptions = {
        videoBitsPerSecond: VIDEO_CONFIG.bitsPerSecond
      };
      
      // Vérifier si le navigateur supporte le codec spécifié
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        options.mimeType = 'video/webm;codecs=vp8';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        options.mimeType = 'video/webm';
      }
      
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;
      
      // Configurer la collecte des données
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      // Gérer la fin de l'enregistrement
      mediaRecorder.onstop = async () => {
        // Créer un blob à partir des chunks collectés avec compression
        const mimeType = options.mimeType || 'video/webm';
        const videoBlob = new Blob(chunksRef.current, { type: mimeType });
        
        // Afficher la taille du blob pour diagnostique
        console.log(`Taille de la vidéo enregistrée: ${(videoBlob.size / 1024).toFixed(2)} KB`);
        
        // Sauvegarder la vidéo pour un téléchargement ultérieur
        lastRecordingBlobRef.current = videoBlob;
        
        if (videoBlob.size > 0 && currentTweetIdRef.current) {
          try {
            await sendVideoForAnalysis({
              tweetId: currentTweetIdRef.current,
              userId: currentUserId,
              videoBlob,
              recordingTimestamp: Date.now()
            });
          } catch (err) {
            console.error('Erreur lors de l\'envoi de la vidéo pour analyse:', err);
          }
        }
        
        chunksRef.current = [];
        
        if (stopPromiseResolveRef.current) {
          stopPromiseResolveRef.current();
          stopPromiseResolveRef.current = null;
        }
      };
      
      // Démarrer l'enregistrement avec des segments plus fréquents mais plus petits
      mediaRecorder.start(500); // Enregistrer par tranches de 500ms
      setIsRecording(true);
      
    } catch (err) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', err);
      setError('Impossible d\'accéder à la caméra');
      throw err;
    } finally {
      isStartingRef.current = false;
    }
  };

  /**
   * Arrête l'enregistrement vidéo en cours
   */
  const stopRecording = (): Promise<void> => {
    // Éviter les arrêts simultanés
    if (isStoppingRef.current) {
      return new Promise<void>((resolve) => {
        const existingResolve = stopPromiseResolveRef.current;
        stopPromiseResolveRef.current = () => {
          if (existingResolve) existingResolve();
          resolve();
        };
      });
    }
    
    return new Promise<void>((resolve) => {
      // Résoudre immédiatement si aucun enregistrement n'est en cours
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        setIsRecording(false);
        resolve();
        return;
      }
      
      isStoppingRef.current = true;
      
      stopPromiseResolveRef.current = () => {
        resolve();
        isStoppingRef.current = false;
      };
      
      // Arrêter l'enregistrement
      mediaRecorderRef.current.stop();
      
      // Libérer les ressources
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      setIsRecording(false);
    });
  };

  return {
    startRecording,
    stopRecording,
    isRecording,
    error,
    downloadLastRecording,
    requestCameraPermission
  };
} 