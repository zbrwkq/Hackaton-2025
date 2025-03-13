FROM node:20-slim

WORKDIR /app

# Copier seulement les fichiers de dépendances pour optimiser le cache Docker
COPY package*.json ./

# Installer les dépendances avec une installation propre
RUN npm ci || npm install

# Copier le reste des fichiers source
COPY . .

# Exposer le port 5000 utilisé par l'application
EXPOSE 5000

CMD ["node", "app.js"] 