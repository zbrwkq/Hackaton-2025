const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();

// Activer CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

// Logger des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Définition des services avec les bons chemins pour Docker
// Les URLs correspondent aux chemins réels exposés par chaque service
const serviceMap = {
  users: "http://users-service:5000",         // Service Users (expose /users)
  tweets: "http://tweets-service:5002",      // Service Tweets (expose /tweets)
  search: "http://search-service:6000",  // Service Search (expose /api/search)
  ia: "http://backend-ia-service:5001",  // Service IA pour l'upload
};

// Route racine
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'API Gateway is running',
    message: 'Utilisez /health pour vérifier l\'état ou /api/:service pour accéder aux services',
    services: Object.keys(serviceMap)
  });
});

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'API Gateway is running',
    services: Object.keys(serviceMap)
  });
});

// Routes pour accéder aux services, maintenant avec préfixe explicite /api
app.use("/api/:service", (req, res, next) => {
  const serviceName = req.params.service;
  const target = serviceMap[serviceName];
  console.log("service", target);

  if (target) {
    createProxyMiddleware({
      target,
      changeOrigin: true,
      logLevel: "debug",
      pathRewrite: {
        [`^/api/${serviceName}`]: '', // Supprime le préfixe /api et le nom du service
      }
    })(req, res, next);
  } else {
    res.status(502).send(`Service ${serviceName} non disponible.`);
  }
});

// Démarrer l'API Gateway
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Gateway en écoute sur http://localhost:${PORT}`);
  console.log("🔗 Services enregistrés :", Object.keys(serviceMap));
});
