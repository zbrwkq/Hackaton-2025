FROM node:20-slim

WORKDIR /app

# Copier seulement les fichiers de dépendances pour optimiser le cache Docker
COPY package*.json ./

# Installer les dépendances avec une installation propre
RUN npm ci || npm install

# Copier le reste des fichiers source
COPY . .

# Exposer le port si nécessaire (à ajuster selon votre application)
# EXPOSE 3000

CMD ["node", "db.config.js"] 