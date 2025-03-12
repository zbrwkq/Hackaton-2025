const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

// Logger des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Définition des services avec les bons chemins
const serviceMap = {
  users: "http://localhost:4000/users",  // 🔥 Correction : ajout de `/api/users`
  tweets: "http://localhost:5002/tweets", // 🔥 Correction : ajout de `/api/tweets`
  search: "http://localhost:6000/search", // 🔥 Correction : ajout de `/api/search`
};

  

 app.use("/:service", (req, res, next) => {
    const serviceName = req.params.service;
    const target = serviceMap[serviceName];
    console.log("service",target);
  
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
  
// Démarrer l'API Gateway
const PORT =  3000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway en écoute sur http://localhost:${PORT}`);
  console.log('🔗 Services enregistrés :', Object.keys(serviceMap));
});
