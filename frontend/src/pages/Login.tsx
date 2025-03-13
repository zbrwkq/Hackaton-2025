import { motion } from 'framer-motion';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Link, useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { login, isLoading, error } = useStore(state => ({ 
    login: state.login, 
    isLoading: state.isLoading,
    error: state.error
  }));
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      await login(email, password);
      navigate('/'); // Rediriger vers la page d'accueil après connexion réussie
    } catch (error) {
      // Utiliser l'erreur du store ou définir un message par défaut
      setErrorMessage(error instanceof Error ? error.message : 'Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome Back</h1>
        
        {(errorMessage || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage || error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>
          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            type="submit"
            className={`w-full ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-2 rounded-lg font-medium transition-colors`}
            disabled={isLoading}
          >
            {isLoading ? 'Connexion en cours...' : 'Sign In'}
          </motion.button>
          
          <div className="text-center mt-4">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}