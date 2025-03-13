import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Calendar, TrendingUp, Hash, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { search, getTrends, getDateRangeFromPeriod } from '../services/searchService';
import { isAuthenticated } from '../services/authService';

export function SearchBar() {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'hashtags'>('all');
  const [dateFilter, setDateFilter] = useState<'anytime' | 'today' | 'week' | 'month'>('anytime');
  const [sortBy, setSortBy] = useState<'relevant' | 'recent' | 'popular'>('relevant');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // États pour les données dynamiques
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Charger les tendances et les utilisateurs suggérés au montage
  useEffect(() => {
    if (isExpanded && isAuthenticated()) {
      loadTrendingHashtags();
      loadSuggestedUsers();
    }
  }, [isExpanded]);
  
  // Charger les hashtags tendances
  const loadTrendingHashtags = async () => {
    try {
      const response = await getTrends('24h');
      if (response.success && response.trends) {
        // Convertir les tendances en format attendu par le composant
        const formattedTrends = response.trends.map((trend: any) => `#${trend.hashtag}`);
        setTrendingHashtags(formattedTrends.slice(0, 5)); // Limiter à 5 hashtags
      }
    } catch (error) {
      console.error('Erreur lors du chargement des hashtags tendances:', error);
      // Valeurs par défaut en cas d'erreur
      setTrendingHashtags(['#IA', '#TechNews', '#DataScience', '#MachineLearning', '#Innovation']);
    }
  };
  
  // Charger les utilisateurs suggérés
  const loadSuggestedUsers = async () => {
    try {
      // Recherche d'utilisateurs populaires ou actifs récemment
      const response = await search({ type: 'users', sortBy: 'popular', limit: 3 });
      if (response.success && response.results.users) {
        // Convertir les utilisateurs au format attendu par le composant
        const formattedUsers = response.results.users.map((user: any) => ({
          id: user._id,
          username: user.username,
          avatar: user.profilePicture
        }));
        setSuggestedUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs suggérés:', error);
      // Valeurs par défaut en cas d'erreur
      setSuggestedUsers([
        { id: 'u1', username: 'Elena Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
        { id: 'u2', username: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
        { id: 'u3', username: 'Sophia Kim', avatar: 'https://images.unsplash.com/photo-1564046247017-4462f3c1e9a2?w=100' }
      ]);
    }
  };
  
  // Effectuer une recherche
  const performSearch = async () => {
    if (!searchQuery.trim() || !isAuthenticated()) return;
    
    setIsLoading(true);
    
    try {
      // Récupérer les dates correspondant au filtre
      const dateRange = getDateRangeFromPeriod(dateFilter);
      
      // Convertir le type de tri
      const apiSortBy = sortBy === 'relevant' ? 'popular' : sortBy === 'popular' ? 'popular' : 'recent';
      
      // Effectuer la recherche
      const response = await search({
        q: searchQuery,
        type: activeTab,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        sortBy: apiSortBy,
        limit: 5 // Limiter les résultats pour l'aperçu
      });
      
      if (response.success) {
        setSearchResults(response.results);
        
        // Sauvegarder la recherche dans l'historique
        saveSearchToHistory(searchQuery);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Déclencher la recherche quand les critères changent
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (isExpanded && searchQuery.trim()) {
        performSearch();
      }
    }, 500); // Délai pour éviter trop de requêtes
    
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, activeTab, dateFilter, sortBy, isExpanded]);
  
  // Fermer le menu de recherche en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Mettre le focus sur l'input quand le menu s'agrandit
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);
  
  // Charger l'historique des recherches récentes
  useEffect(() => {
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      try {
        setRecentSearches(JSON.parse(storedSearches));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);
  
  // Sauvegarder une recherche dans l'historique
  const saveSearchToHistory = (query: string) => {
    if (!query.trim()) return;
    
    // Récupérer les recherches actuelles
    const currentSearches = [...recentSearches];
    
    // Vérifier si la recherche existe déjà
    const existingIndex = currentSearches.indexOf(query);
    if (existingIndex !== -1) {
      // Supprimer l'existant pour le mettre en premier
      currentSearches.splice(existingIndex, 1);
    }
    
    // Ajouter la nouvelle recherche au début
    currentSearches.unshift(query);
    
    // Limiter à 5 recherches
    const updatedSearches = currentSearches.slice(0, 5);
    
    // Mettre à jour l'état et le stockage local
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };
  
  // Formatage du nombre de résultats
  const formatResultCount = (count: number): string => {
    if (count === 0) return "Aucun résultat";
    if (count === 1) return "1 résultat";
    if (count < 1000) return `${count} résultats`;
    return `${(count / 1000).toFixed(1)}k résultats`;
  };
  
  // Accéder à la page de recherche complète
  const goToSearchPage = () => {
    if (searchQuery.trim()) {
      saveSearchToHistory(searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&tab=${activeTab}&sort=${sortBy}&date=${dateFilter}`);
      setIsExpanded(false);
    }
  };
  
  return (
    <div 
      ref={searchContainerRef}
      className={`relative ${isExpanded ? 'z-50' : 'z-10'}`}
    >
      <motion.div
        animate={{
          width: isExpanded ? 'clamp(300px, 50vw, 600px)' : '250px',
          boxShadow: isExpanded ? '0 10px 25px rgba(0,0,0,0.1)' : '0 0 0 rgba(0,0,0,0)',
          backgroundColor: isExpanded ? 'white' : '#f3f4f6'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`relative rounded-full overflow-hidden ${isExpanded ? 'rounded-b-none border border-gray-200' : ''}`}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={() => setIsExpanded(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              goToSearchPage();
            }
          }}
          className="py-2 pl-10 pr-4 w-full focus:outline-none bg-transparent"
        />
        <div className="absolute left-3 top-2.5 text-gray-400">
          <Search size={20} />
        </div>
        {isExpanded && searchQuery && (
          <button 
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            onClick={() => setSearchQuery('')}
          >
            <X size={20} />
          </button>
        )}
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute left-0 right-0 bg-white rounded-b-xl shadow-lg border-x border-b border-gray-200 overflow-hidden"
          >
            {/* Onglets de recherche */}
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'all' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('all')}
              >
                Tous
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'users' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('users')}
              >
                Utilisateurs
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'hashtags' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('hashtags')}
              >
                Hashtags
              </button>
            </div>
            
            {/* Filtres de recherche */}
            <div className="flex flex-wrap p-3 gap-2 border-b border-gray-200 bg-gray-50">
              {/* Filtre de date */}
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white rounded-full border border-gray-200 hover:border-gray-300">
                  <Calendar size={16} className="text-gray-500" />
                  <span>
                    {dateFilter === 'anytime' && 'Toute date'}
                    {dateFilter === 'today' && 'Aujourd\'hui'}
                    {dateFilter === 'week' && 'Cette semaine'}
                    {dateFilter === 'month' && 'Ce mois'}
                  </span>
                </button>
                <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block z-10">
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${dateFilter === 'anytime' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}
                    onClick={() => setDateFilter('anytime')}
                  >
                    Toute date
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${dateFilter === 'today' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}
                    onClick={() => setDateFilter('today')}
                  >
                    Aujourd'hui
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${dateFilter === 'week' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}
                    onClick={() => setDateFilter('week')}
                  >
                    Cette semaine
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${dateFilter === 'month' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}
                    onClick={() => setDateFilter('month')}
                  >
                    Ce mois
                  </button>
                </div>
              </div>
              
              {/* Tri par */}
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white rounded-full border border-gray-200 hover:border-gray-300">
                  <TrendingUp size={16} className="text-gray-500" />
                  <span>
                    {sortBy === 'relevant' && 'Pertinence'}
                    {sortBy === 'recent' && 'Plus récents'}
                    {sortBy === 'popular' && 'Plus populaires'}
                  </span>
                </button>
                <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block z-10">
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${sortBy === 'relevant' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}
                    onClick={() => setSortBy('relevant')}
                  >
                    Pertinence
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${sortBy === 'recent' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}
                    onClick={() => setSortBy('recent')}
                  >
                    Plus récents
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${sortBy === 'popular' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}
                    onClick={() => setSortBy('popular')}
                  >
                    Plus populaires
                  </button>
                </div>
              </div>
              
              {/* Bouton Recherche avancée */}
              <button 
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white rounded-full border border-gray-200 hover:border-gray-300"
                onClick={goToSearchPage}
              >
                <Filter size={16} className="text-gray-500" />
                <span>Recherche avancée</span>
              </button>
            </div>
            
            {/* État de chargement */}
            {isLoading && (
              <div className="py-8 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-indigo-500 border-r-transparent"></div>
                <p className="text-sm text-gray-500 mt-2">Recherche en cours...</p>
              </div>
            )}
            
            {/* Contenu de recherche */}
            {!isLoading && (
              <div className="max-h-[60vh] overflow-y-auto">
                {!searchQuery ? (
                  // Affichage quand aucune recherche n'est en cours
                  <div className="p-4">
                    {/* Recherches récentes */}
                    {recentSearches.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Recherches récentes</h3>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((search, index) => (
                            <button 
                              key={index}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200"
                              onClick={() => setSearchQuery(search)}
                            >
                              <span>{search}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Hashtags populaires */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Hashtags populaires</h3>
                      <div className="flex flex-wrap gap-2">
                        {trendingHashtags.map((hashtag, index) => (
                          <button 
                            key={index}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100"
                            onClick={() => setSearchQuery(hashtag)}
                          >
                            <Hash size={16} />
                            <span>{hashtag.substring(1)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Utilisateurs suggérés */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Utilisateurs suggérés</h3>
                      <div className="space-y-2">
                        {suggestedUsers.map(user => (
                          <div 
                            key={user.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/profile/${user.id}`)}
                          >
                            {user.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user.username} 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 font-bold text-sm">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{user.username}</p>
                              <p className="text-sm text-gray-500">@{user.username.toLowerCase().replace(' ', '')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Affichage des résultats de recherche
                  <div>
                    {/* En-tête des résultats */}
                    <div className="px-4 pt-3 pb-2 text-sm text-gray-600 flex justify-between">
                      <div>
                        {searchResults.tweets && searchResults.users && searchResults.hashtags && 
                        formatResultCount(
                          (searchResults.tweets?.length || 0) + 
                          (searchResults.users?.length || 0) + 
                          (searchResults.hashtags?.length || 0)
                        )}
                      </div>
                      <div>
                        {dateFilter !== 'anytime' || sortBy !== 'relevant' ? (
                          <button 
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                            onClick={() => {
                              setDateFilter('anytime');
                              setSortBy('relevant');
                            }}
                          >
                            Réinitialiser les filtres
                          </button>
                        ) : null}
                      </div>
                    </div>
                    
                    {/* Affichage des résultats - aperçu */}
                    {activeTab === 'all' && (
                      <div className="divide-y divide-gray-100">
                        {/* Aperçu des tweets */}
                        {searchResults.tweets && searchResults.tweets.length > 0 && (
                          <>
                            {searchResults.tweets.slice(0, 1).map((tweet: any) => (
                              <div key={tweet._id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/tweet/${tweet._id}`)}>
                                <div className="flex items-start gap-3">
                                  <img 
                                    src={tweet.userId?.profilePicture} 
                                    alt={tweet.userId?.username || "Utilisateur"}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <p className="font-medium">{tweet.userId?.username || "Utilisateur"}</p>
                                      <span className="text-gray-500 text-sm">
                                        @{tweet.userId?.username?.toLowerCase().replace(' ', '') || "utilisateur"}
                                        {" • "}
                                        {new Date(tweet.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                      </span>
                                    </div>
                                    <p className="mt-1">
                                      {tweet.content.length > 120 ? tweet.content.substring(0, 120) + '...' : tweet.content}
                                    </p>
                                    {tweet.hashtags && tweet.hashtags.length > 0 && (
                                      <div className="flex gap-2 mt-2">
                                        {tweet.hashtags.map((tag: string, idx: number) => (
                                          <span key={idx} className="text-indigo-600 text-sm">{tag}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {searchResults.tweets.length > 1 && (
                              <div className="py-2 px-4 text-center">
                                <button 
                                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                  onClick={goToSearchPage}
                                >
                                  Voir tous les {searchResults.tweets.length} tweets
                                </button>
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Aperçu des utilisateurs */}
                        {searchResults.users && searchResults.users.length > 0 && (
                          <>
                            {searchResults.users.slice(0, 1).map((user: any) => (
                              <div key={user._id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/profile/${user._id}`)}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
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
                                    </div>
                                    <div>
                                      <p className="font-medium">{user.username}</p>
                                      <p className="text-sm text-gray-500">{user.bio?.substring(0, 60) || "Aucune biographie"}</p>
                                    </div>
                                  </div>
                                  <button className="bg-indigo-600 text-white text-sm font-medium px-3 py-1 rounded-full hover:bg-indigo-700">
                                    Suivre
                                  </button>
                                </div>
                              </div>
                            ))}
                            {searchResults.users.length > 1 && (
                              <div className="py-2 px-4 text-center">
                                <button 
                                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                  onClick={goToSearchPage}
                                >
                                  Voir tous les {searchResults.users.length} utilisateurs
                                </button>
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Aperçu des hashtags */}
                        {searchResults.hashtags && searchResults.hashtags.length > 0 && (
                          <>
                            {searchResults.hashtags.slice(0, 1).map((hashtagData: any, index: number) => (
                              <div key={index} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => setSearchQuery(`#${hashtagData.hashtag}`)}>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <Hash size={20} />
                                  </div>
                                  <div>
                                    <p className="font-medium">#{hashtagData.hashtag}</p>
                                    <p className="text-sm text-gray-500">{hashtagData.count} tweets</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {searchResults.hashtags.length > 1 && (
                              <div className="py-2 px-4 text-center">
                                <button 
                                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                  onClick={goToSearchPage}
                                >
                                  Voir tous les {searchResults.hashtags.length} hashtags
                                </button>
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Lien vers la page de recherche complète */}
                        <div className="py-3 px-4 bg-gray-50 text-center">
                          <button 
                            className="text-indigo-600 font-medium text-sm hover:text-indigo-800"
                            onClick={goToSearchPage}
                          >
                            Voir tous les résultats pour "{searchQuery}"
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Résultats spécifiques par type */}
                    {activeTab === 'users' && searchResults.users && (
                      <div className="divide-y divide-gray-100">
                        {searchResults.users.slice(0, 3).map((user: any) => (
                          <div key={user._id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/profile/${user._id}`)}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
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
                                  <p className="font-medium">{user.username}</p>
                                  <p className="text-sm text-gray-500">{user.bio?.substring(0, 60) || "Aucune biographie"}</p>
                                </div>
                              </div>
                              <button className="bg-indigo-600 text-white text-sm font-medium px-3 py-1 rounded-full hover:bg-indigo-700">
                                Suivre
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="py-3 px-4 bg-gray-50 text-center">
                          <button 
                            className="text-indigo-600 font-medium text-sm hover:text-indigo-800"
                            onClick={goToSearchPage}
                          >
                            Voir tous les résultats
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'hashtags' && searchResults.hashtags && (
                      <div className="divide-y divide-gray-100">
                        {searchResults.hashtags.slice(0, 5).map((hashtagData: any, index: number) => (
                          <div key={index} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => setSearchQuery(`#${hashtagData.hashtag}`)}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <Hash size={20} />
                              </div>
                              <div>
                                <p className="font-medium">#{hashtagData.hashtag}</p>
                                <p className="text-sm text-gray-500">{hashtagData.count} tweets</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="py-3 px-4 bg-gray-50 text-center">
                          <button 
                            className="text-indigo-600 font-medium text-sm hover:text-indigo-800"
                            onClick={goToSearchPage}
                          >
                            Voir tous les résultats
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 