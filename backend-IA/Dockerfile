FROM python:3.9-slim

WORKDIR /app

# Installer les dépendances systèmes nécessaires pour OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copier et installer les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste des fichiers
COPY . .

# Créer le dossier d'uploads
RUN mkdir -p uploads

# Exposer le port 5001 (différent de celui du service users qui utilise déjà 5000)
EXPOSE 5001

# Variable d'environnement pour le port
ENV PORT=5001

# Commande de démarrage
CMD ["python", "app.py"] 