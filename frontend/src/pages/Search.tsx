import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TweetCard } from '../components/TweetCard';
import { Search, Filter, Users, Hash, Calendar, TrendingUp, ArrowUpDown, X } from 'lucide-react';
import { search, SearchParams, getDateRangeFromPeriod } from '../services/searchService';
import { isAuthenticated } from '../services/authService';
import { useNavigate } from 'react-router-dom';

type SearchTab = 'tweets' | 'users' | 'hashtags';
type SortOption = 'recent' | 'popular';

export function SearchPage() {
  const navigate = useNavigate();
  
  // États de recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('tweets');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{from?: string, to?: string}>({});
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchResults, setSearchResults] = useState<any>({
    tweets: [],
    users: [],
    hashtags: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Vérification de l'authentification
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/search' } });
    }
  }, [navigate]);
  
  // Fonction de recherche
  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults({ tweets: [], users: [], hashtags: [] });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Traduire les paramètres pour l'API de recherche
    const searchParams: SearchParams = {
      q: searchQuery,
      type: activeTab === 'tweets' ? 'tweets' : 
            activeTab === 'users' ? 'users' : 
            activeTab === 'hashtags' ? 'hashtags' : 'all',
      sortBy: sortBy,
      limit: 20, // Limite par défaut
    };
    
    // Ajouter les dates s'il y en a
    if (dateRange.from) searchParams.startDate = dateRange.from;
    if (dateRange.to) searchParams.endDate = dateRange.to;
    
    try {
      const response = await search(searchParams);
      setSearchResults(response.results);
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
      setSearchResults({ tweets: [], users: [], hashtags: [] });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Effectuer la recherche lors des changements de critères
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      performSearch();
    }, 500); // Ajout d'un délai pour éviter trop de requêtes
    
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, activeTab, dateRange.from, dateRange.to, sortBy]);
  
  // Réinitialiser les filtres
  const resetFilters = () => {
    setDateRange({});
    setSortBy('recent');
  };
  
  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Calculer le nombre total de résultats
  const getTotalResultCount = () => {
    if (!searchResults) return 0;
    return (searchResults.tweets?.length || 0) + 
           (searchResults.users?.length || 0) + 
           (searchResults.hashtags?.length || 0);
  };
  
  // Obtenir les résultats actuels en fonction de l'onglet actif
  const getCurrentResults = () => {
    if (!searchResults) return [];
    switch(activeTab) {
      case 'tweets': return searchResults.tweets || [];
      case 'users': return searchResults.users || [];
      case 'hashtags': return searchResults.hashtags || [];
      default: return [];
    }
  };
  
  return (
    <div className="min-h-screen bg-white pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Recherche</h1>
        
        {/* Barre de recherche */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher des tweets, utilisateurs, hashtags..."
            className="block w-full bg-gray-100 border-none rounded-full py-3 pl-12 pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
          {searchQuery && (
            <button 
              className="absolute inset-y-0 right-3 flex items-center"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        {/* Onglets de recherche */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('tweets')}
              className={`py-4 px-1 relative ${
                activeTab === 'tweets'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              } border-b-2 font-medium text-sm`}
            >
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Tweets
              </div>
              {activeTab === 'tweets' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600"
                  initial={false}
                />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 relative ${
                activeTab === 'users'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              } border-b-2 font-medium text-sm`}
            >
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Utilisateurs
              </div>
              {activeTab === 'users' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600"
                  initial={false}
                />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('hashtags')}
              className={`py-4 px-1 relative ${
                activeTab === 'hashtags'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              } border-b-2 font-medium text-sm`}
            >
              <div className="flex items-center">
                <Hash className="h-4 w-4 mr-2" />
                Hashtags
              </div>
              {activeTab === 'hashtags' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600"
                  initial={false}
                />
              )}
            </button>
          </div>
        </div>
        
        {/* Contrôles de filtrage */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtres avancés
            <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
              {Object.keys(dateRange).length > 0 || sortBy !== 'recent' ? 'Actifs' : ''}
            </span>
          </button>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-gray-50 p-4 rounded-lg mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Plage de dates
                    </h3>
                    <div className="flex space-x-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">De</label>
                        <input
                          type="date"
                          value={dateRange.from || ''}
                          onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                          className="w-full rounded border-gray-300 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">À</label>
                        <input
                          type="date"
                          value={dateRange.to || ''}
                          onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                          className="w-full rounded border-gray-300 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Trier par
                    </h3>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setSortBy('recent')}
                        className={`py-2 px-3 rounded-full text-sm ${
                          sortBy === 'recent'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Calendar className="h-3.5 w-3.5 inline mr-1" />
                        Récents
                      </button>
                      <button
                        onClick={() => setSortBy('popular')}
                        className={`py-2 px-3 rounded-full text-sm ${
                          sortBy === 'popular'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <TrendingUp className="h-3.5 w-3.5 inline mr-1" />
                        Populaires
                      </button>
                    </div>
                  </div>
                  
                  {/* Bouton de réinitialisation */}
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      onClick={resetFilters}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* État de chargement */}
        {isLoading && (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Recherche en cours...</p>
          </div>
        )}
        
        {/* Message d'erreur */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {/* Résultats de recherche */}
        {!isLoading && !error && (
          <div>
            {searchQuery ? (
              getCurrentResults().length > 0 ? (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    {getCurrentResults().length} résultat{getCurrentResults().length > 1 ? 's' : ''} pour "{searchQuery}"
                  </p>
                  
                  <div className="space-y-4">
                    {activeTab === 'tweets' && (
                      <div className="divide-y divide-gray-100">
                        {searchResults.tweets.map((tweet: any) => (
                          <div key={tweet._id} className="py-4">
                            <TweetCard 
                              tweet={tweet} 
                              hideActions={false}
                              onMediaClick={(url, alt) => {}} // Implémentez selon vos besoins
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {activeTab === 'users' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.users.map((user: any) => (
                          <div 
                            key={user._id}
                            className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-3 hover:shadow-md transition-shadow"
                          >
                            {user.profilePicture ? (
                              <img 
                                src={user.profilePicture} 
                                alt={user.username}
                                className="w-12 h-12 rounded-full object-cover" 
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 font-bold text-lg">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium text-gray-900">{user.username}</h3>
                              <p className="text-sm text-gray-500 line-clamp-1">{user.bio}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {activeTab === 'hashtags' && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {searchResults.hashtags.map((hashtagData: any) => (
                          <div 
                            key={hashtagData.hashtag}
                            className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-center"
                          >
                            <p className="text-indigo-600 font-medium">#{hashtagData.hashtag}</p>
                            <p className="text-sm text-gray-500 mt-1">{hashtagData.count} tweet{hashtagData.count > 1 ? 's' : ''}</p>
                            {hashtagData.lastUsed && (
                              <p className="text-xs text-gray-400 mt-1">Dernier: {formatDate(hashtagData.lastUsed)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Aucun résultat trouvé pour "{searchQuery}"</p>
                  <p className="text-sm text-gray-400 mt-2">Essayez d'autres termes ou critères de recherche</p>
                </div>
              )
            ) : (
              <div className="text-center py-10">
                <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Commencez votre recherche</p>
                <p className="text-sm text-gray-400 mt-2">Cherchez des tweets, des utilisateurs ou des hashtags</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 