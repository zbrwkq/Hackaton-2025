/**
 * Service pour l'analyse des émotions
 * Ce service est responsable de l'envoi des enregistrements vidéo au backend
 * pour l'analyse des expressions faciales
 */

const API_URL = "/api/tweets/tweets"; // Remplacer par l'URL de votre API
import * as authService from './authService';
import * as tweetService from './tweetService';
import { useStore } from '../store/useStore';

interface EmotionData {
  tweetId: string;
  videoBlob: Blob;
}

/**
 * Vérifie si le navigateur a l'autorisation d'accéder à la caméra sans montrer de prompt à l'utilisateur
 * @returns Une promesse qui se résout avec true si l'accès est déjà autorisé, false sinon
 */
export async function checkCameraPermission(): Promise<boolean> {
  try {
    // Vérifier si l'API permissions est disponible
    if (navigator.permissions && navigator.permissions.query) {
      const result = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      return result.state === "granted";
    }

    // Fallback pour les navigateurs qui ne supportent pas l'API permissions
    try {
      // Tenter d'accéder à la caméra avec un timeout court
      const stream = (await Promise.race([
        navigator.mediaDevices.getUserMedia({ video: true }),
        new Promise<MediaStream>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 500)
        ),
      ])) as MediaStream;

      // Si on arrive ici, c'est que l'accès est autorisé
      // Arrêter les tracks pour ne pas laisser la caméra allumée
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      return false;
    }
  } catch (err) {
    console.error(
      "Erreur lors de la vérification des permissions de caméra:",
      err
    );
    return false;
  }
}

/**
 * Vérifie si le navigateur supporte l'enregistrement vidéo
 */
export function isRecordingSupported(): boolean {
  return !!(
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    typeof window.MediaRecorder !== "undefined"
  );
}

/**
 * Envoie l'enregistrement vidéo au serveur pour analyse des émotions
 * @param data Les données d'enregistrement et métadonnées associées
 */
export async function sendVideoForAnalysis(data: EmotionData): Promise<void> {
  try {
    // Vérifier si le blob est valide
    if (!data.videoBlob || data.videoBlob.size === 0) {
      console.warn("Blob vidéo vide ou invalide, abandon de l'envoi");
      return;
    }

    // Créer un fichier à partir du blob
    const videoFile = new File(
      [data.videoBlob], 
      `tweet_${data.tweetId}_${Date.now()}.webm`,
      { type: 'video/webm' }
    );

    try {
      // Utiliser la fonction sendFeedback du service tweets
      const nextTweet = await tweetService.sendFeedback(data.tweetId, videoFile);
      
      // Ajouter le nouveau tweet à la liste des tweets dans le store
      const { tweets } = useStore.getState();
      
      // Vérifier si le tweet existe déjà dans la liste
      const tweetExists = tweets.some(t => t._id === nextTweet._id);
      
      if (!tweetExists) {
        // Mettre à jour le store avec le nouveau tweet
        useStore.setState({
          tweets: [nextTweet, ...tweets]
        });
      }
      
      console.log("Recommandation reçue du serveur:", nextTweet);
    } catch (fetchError) {
      console.error("Erreur lors de l'envoi du feedback:", fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de la vidéo pour analyse:", error);
    // Gérer l'erreur, peut-être en la journalisant pour analyse ultérieure
    // mais sans notifier l'utilisateur pour respecter la demande de discrétion
  }
}
