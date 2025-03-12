const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

// Logger des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Définition des services avec les bons chemins pour Docker (utilisant les noms des services)
const serviceMap = {
  users: "http://users-service:5000/api/users",     // Service Users
  tweets: "http://tweets-service:5002/api/tweets",  // Service Tweets
  search: "http://search-service:6000/api/search",  // Service Search
  notifications: "http://notification-service:5003/notifications", // Service Notifications
  upload: "http://backend-ia-service:5001/upload",  // Service IA pour l'upload
};

app.use("/:service", (req, res, next) => {
  const serviceName = req.params.service;
  const target = serviceMap[serviceName];
  console.log("service", target);

  if (target) {
    createProxyMiddleware({
      target,
      changeOrigin: true,
      logLevel: "debug",
    })(req, res, next);
  } else {
    res.status(502).send(`Service ${serviceName} non disponible.`);
  }
});

// Route de santé pour vérifier que l'API Gateway est en ligne
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'API Gateway is running',
    services: Object.keys(serviceMap)
  });
});

// Démarrer l'API Gateway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway en écoute sur http://localhost:${PORT}`);
  console.log('🔗 Services enregistrés :', Object.keys(serviceMap));
});
