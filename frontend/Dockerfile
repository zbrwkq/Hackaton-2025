FROM node:20-slim AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances avec une installation propre
RUN npm ci || npm install

# Définir l'URL de l'API pour l'environnement de production
ENV VITE_API_URL=http://localhost:3000

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

# Configuration de base pour Nginx qui fonctionne avec les SPA et proxy vers l'API Gateway
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    # Configuration pour le développement local \
    location /api { \
        proxy_pass http://api-gateway:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
    } \
    # Configuration pour les websockets \
    location /socket.io { \
        proxy_pass http://notification-service:5003; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 