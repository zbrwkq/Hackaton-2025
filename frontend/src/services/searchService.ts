import { getAuthHeader } from './authService';

const API_URL = '/api/search/search';

export interface SearchParams {
  q?: string;                 // Terme de recherche
  type?: 'all' | 'tweets' | 'users' | 'hashtags'; // Type de recherche
  startDate?: string;         // Date de début au format YYYY-MM-DD
  endDate?: string;           // Date de fin au format YYYY-MM-DD
  sortBy?: 'recent' | 'popular'; // Tri des résultats
  limit?: number;             // Nombre maximum de résultats
  category?: number;          // Catégorie (optionnel)
}

export interface SearchResults {
  success: boolean;
  query: SearchParams;
  results: {
    tweets: any[];
    users: any[];
    hashtags: any[];
  };
}

/**
 * Effectue une recherche avec les paramètres spécifiés
 */
export const search = async (params: SearchParams): Promise<SearchResults> => {
  try {
    // Construire l'URL avec les paramètres de recherche
    const queryParams = new URLSearchParams();
    
    // Ajouter chaque paramètre non vide à l'URL
    if (params.q) queryParams.append('q', params.q);
    if (params.type && params.type !== 'all') queryParams.append('type', params.type);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category !== undefined) queryParams.append('category', params.category.toString());

    const url = `${API_URL}?${queryParams.toString()}`;
    
    // Effectuer la requête avec l'en-tête d'autorisation
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la recherche');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur de recherche:', error);
    throw error;
  }
};

/**
 * Récupère les hashtags populaires (tendances)
 */
export const getTrends = async (period: '24h' | '7d' | '30d' = '24h', category?: number): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    if (category !== undefined) queryParams.append('category', category.toString());

    const url = `${API_URL}/trends?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération des tendances');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur de récupération des tendances:', error);
    throw error;
  }
};

/**
 * Convertit une plage de dates relative en dates réelles
 */
export const getDateRangeFromPeriod = (period: 'anytime' | 'today' | 'week' | 'month'): { startDate?: string, endDate?: string } => {
  if (period === 'anytime') return {};
  
  const now = new Date();
  const endDate = now.toISOString().split('T')[0]; // Format YYYY-MM-DD
  let startDate: string;
  
  switch(period) {
    case 'today':
      startDate = endDate;
      break;
    case 'week':
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      startDate = lastWeek.toISOString().split('T')[0];
      break;
    case 'month':
      const lastMonth = new Date(now);
      lastMonth.setMonth(now.getMonth() - 1);
      startDate = lastMonth.toISOString().split('T')[0];
      break;
    default:
      return {};
  }
  
  return { startDate, endDate };
}; 