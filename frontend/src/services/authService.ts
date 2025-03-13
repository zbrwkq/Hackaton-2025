// Constantes pour les clés de stockage
const TOKEN_KEY = 'userToken';
const USER_ID_KEY = 'userId';
const USERNAME_KEY = 'username';

// Stocker les informations d'authentification
export const setAuthData = (token: string, userId: string, username: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_ID_KEY, userId);
  localStorage.setItem(USERNAME_KEY, username);
};

// Récupérer le token d'authentification
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Récupérer l'ID utilisateur
export const getUserId = (): string | null => {
  return localStorage.getItem(USER_ID_KEY);
};

// Récupérer le nom d'utilisateur
export const getUsername = (): string | null => {
  return localStorage.getItem(USERNAME_KEY);
};

// Vérifier si l'utilisateur est authentifié
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Supprimer les informations d'authentification (déconnexion)
export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USERNAME_KEY);
};

// Créer un en-tête d'autorisation avec le token
export const getAuthHeader = (): { Authorization: string } | Record<string, never> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}; 