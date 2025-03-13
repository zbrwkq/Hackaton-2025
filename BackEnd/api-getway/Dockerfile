FROM node:20-slim

WORKDIR /app

# Copier seulement les fichiers de dépendances pour optimiser le cache Docker
COPY package*.json ./

# Installer les dépendances avec une installation propre
RUN npm ci || npm install

# Copier le reste des fichiers source
COPY . .

# Exposer le port 3000 utilisé par l'application
EXPOSE 3000

# Ajout d'instructions de vérification de santé pour Docker
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "app.js"] 