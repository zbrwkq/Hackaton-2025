/**
 * Service pour l'analyse des émotions
 * Ce service est responsable de l'envoi des enregistrements vidéo au backend
 * pour l'analyse des expressions faciales
 */

const API_URL = "/api/tweets/tweets"; // Remplacer par l'URL de votre API

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

    // Créer un objet FormData pour envoyer le fichier
    const formData = new FormData();
    formData.append("tweetId", data.tweetId);
    formData.append(
      "file",
      data.videoBlob,
      `tweet_${data.tweetId}_${Date.now()}.webm`
    );

    // Envoyer les données au serveur avec un timeout pour éviter les blocages
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes timeout

    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Erreur inconnue" }));
        throw new Error(
          `Erreur lors de l'envoi de la vidéo: ${
            errorData.message || response.statusText
          }`
        );
      }

      // Traiter la réponse si nécessaire
      const result = await response.json();
      console.log("Analyse des émotions reçue:", result);
    } catch (fetchError: unknown) {
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("Délai d'attente dépassé lors de l'envoi de la vidéo");
      } else {
        throw fetchError;
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de la vidéo pour analyse:", error);
    // Gérer l'erreur, peut-être en la journalisant pour analyse ultérieure
    // mais sans notifier l'utilisateur pour respecter la demande de discrétion
  }
}
