FROM node:20-slim as build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances avec une installation propre
RUN npm ci || npm install

# Copier le reste des fichiers source
COPY . .

# Construire l'application
RUN npm run build

# Étape 2: servir l'application avec Nginx
FROM nginx:alpine

# Copier la configuration Nginx personnalisée
COPY --from=build /app/dist /usr/share/nginx/html

# Copier la configuration nginx personnalisée
RUN rm -rf /etc/nginx/conf.d/default.conf

# Configuration de base pour Nginx qui fonctionne avec les SPA
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 