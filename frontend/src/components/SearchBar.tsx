import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Calendar, TrendingUp, Hash, Users } from 'lucide-react';

export function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'hashtags'>('all');
  const [dateFilter, setDateFilter] = useState<'anytime' | 'today' | 'week' | 'month'>('anytime');
  const [sortBy, setSortBy] = useState<'relevant' | 'recent' | 'popular'>('relevant');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Données de démonstration
  const recentSearches = ['IA générative', 'développement durable', 'machine learning'];
  const trendingHashtags = ['#IA', '#TechNews', '#DataScience', '#MachineLearning', '#Innovation'];
  const suggestedUsers = [
    { id: 'u1', username: 'Elena Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    { id: 'u2', username: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    { id: 'u3', username: 'Sophia Kim', avatar: 'https://images.unsplash.com/photo-1564046247017-4462f3c1e9a2?w=100' }
  ];
  
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
  
  // Formatage du nombre de résultats
  const formatResultCount = (count: number): string => {
    if (count === 0) return "Aucun résultat";
    if (count === 1) return "1 résultat";
    if (count < 1000) return `${count} résultats`;
    return `${(count / 1000).toFixed(1)}k résultats`;
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
              
              {/* Bouton Filtres avancés */}
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white rounded-full border border-gray-200 hover:border-gray-300">
                <Filter size={16} className="text-gray-500" />
                <span>Plus de filtres</span>
              </button>
            </div>
            
            {/* Contenu de recherche */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!searchQuery ? (
                // Affichage quand aucune recherche n'est en cours
                <div className="p-4">
                  {/* Recherches récentes */}
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
                        >
                          <img 
                            src={user.avatar} 
                            alt={user.username} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
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
                    <div>{formatResultCount(7)}</div>
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
                  
                  {/* Résultats - exemple */}
                  {activeTab === 'all' && (
                    <div className="divide-y divide-gray-100">
                      {/* Tweet résultat */}
                      <div className="p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <img 
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                            alt="Elena Chen"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <p className="font-medium">Elena Chen</p>
                              <span className="text-gray-500 text-sm">@elenachen • 2h</span>
                            </div>
                            <p className="mt-1">
                              Notre <span className="bg-yellow-100">IA</span> peut maintenant détecter des changements émotionnels subtils à travers les expressions faciales. Le futur de l'interaction homme-machine est là !
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span className="text-indigo-600 text-sm">#<span className="bg-yellow-100">AI</span></span>
                              <span className="text-indigo-600 text-sm">#Innovation</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* User résultat */}
                      <div className="p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img 
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                                alt="Alex Rivera"
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                              <p className="font-medium">Alex Rivera</p>
                              <p className="text-sm text-gray-500">Expert en <span className="bg-yellow-100">IA</span> et Machine Learning</p>
                            </div>
                          </div>
                          <button className="bg-indigo-600 text-white text-sm font-medium px-3 py-1 rounded-full hover:bg-indigo-700">
                            Suivre
                          </button>
                        </div>
                      </div>
                      
                      {/* Hashtag résultat */}
                      <div className="p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <Hash size={20} />
                          </div>
                          <div>
                            <p className="font-medium">#<span className="bg-yellow-100">IA</span>Générative</p>
                            <p className="text-sm text-gray-500">1.2k tweets cette semaine</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'users' && (
                    <div className="divide-y divide-gray-100">
                      {/* Quelques utilisateurs en exemple */}
                      {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img 
                                src={`https://images.unsplash.com/photo-${1507000000000 + i * 1000}?w=100`}
                                alt={`User ${i}`}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-medium">Utilisateur {i}</p>
                                <p className="text-sm text-gray-500">Expert en <span className="bg-yellow-100">IA</span></p>
                              </div>
                            </div>
                            <button className="bg-indigo-600 text-white text-sm font-medium px-3 py-1 rounded-full hover:bg-indigo-700">
                              Suivre
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {activeTab === 'hashtags' && (
                    <div className="divide-y divide-gray-100">
                      {/* Quelques hashtags en exemple */}
                      {['AIGenerative', 'AIEthics', 'AIResearch'].map((tag, i) => (
                        <div key={i} className="p-4 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                              <Hash size={20} />
                            </div>
                            <div>
                              <p className="font-medium">#<span className="bg-yellow-100">AI</span>{tag.substring(2)}</p>
                              <p className="text-sm text-gray-500">{Math.floor(Math.random() * 2000) + 500} tweets ce mois</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 