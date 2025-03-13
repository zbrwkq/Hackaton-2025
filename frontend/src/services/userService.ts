import { User } from '../types';

// URL de base de l'API
const API_URL = '/api/users/users';

// Interface pour la réponse d'authentification
interface AuthResponse {
  token: string;
  userId: string;
  username: string;
}

// Interface pour les informations d'enregistrement
interface RegisterData {
  username: string;
  mail: string;
  password: string;
  bio?: string;
}

// Interface pour les informations de connexion
interface LoginData {
  mail: string;
  password: string;
}

// Interface pour la mise à jour du profil
interface UpdateProfileData {
  username?: string;
  bio?: string;
  profilePicture?: File;
  banner?: File;
}

// Fonction d'inscription
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de l\'inscription');
  }

  // Après l'inscription, connecter automatiquement l'utilisateur
  return login({ mail: userData.mail, password: userData.password });
};

// Fonction de connexion
export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Identifiants incorrects');
  }

  return response.json();
};

// Fonction pour récupérer le profil utilisateur
export const getProfile = async (token: string): Promise<User> => {
  const response = await fetch(`${API_URL}/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération du profil');
  }

  return response.json();
};

// Fonction pour mettre à jour le profil
export const updateProfile = async (token: string, data: UpdateProfileData): Promise<User> => {
  // Utiliser FormData pour l'envoi des fichiers
  const formData = new FormData();
  
  if (data.username) formData.append('username', data.username);
  if (data.bio !== undefined) formData.append('bio', data.bio);
  if (data.profilePicture) formData.append('profilePicture', data.profilePicture);
  if (data.banner) formData.append('banner', data.banner);

  const response = await fetch(`${API_URL}/profile/update`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la mise à jour du profil');
  }

  return response.json().then(data => data.user);
};

// Fonction pour mettre à jour l'image de profil uniquement
export const updateProfilePicture = async (token: string, file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('profilePicture', file);

  const response = await fetch(`${API_URL}/profile/picture`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'image de profil');
  }

  return response.json().then(data => data.user);
};

// Fonction pour mettre à jour la bannière uniquement
export const updateBanner = async (token: string, file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('banner', file);

  const response = await fetch(`${API_URL}/profile/banner`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la mise à jour de la bannière');
  }

  return response.json().then(data => data.user);
};

// Fonction pour récupérer les followers
export const getFollowers = async (token: string): Promise<User[]> => {
  const response = await fetch(`${API_URL}/followers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération des followers');
  }

  return response.json().then(data => data.followers);
};

// Fonction pour récupérer les utilisateurs suivis
export const getFollowing = async (token: string): Promise<User[]> => {
  const response = await fetch(`${API_URL}/following`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération des following');
  }

  return response.json().then(data => data.following);
};

// Fonction pour suivre/ne plus suivre un utilisateur
export const toggleFollow = async (token: string, userId: string): Promise<{ isFollowing: boolean }> => {
  const response = await fetch(`${API_URL}/follow/${userId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de l\'action de follow/unfollow');
  }

  return response.json();
}; 