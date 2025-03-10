import os

class Config:
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'mp4'}
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # Limite la taille des fichiers à 100 Mo
    DEBUG = True  # Active le mode debug
    PORT = 5000

    
# Chargement de la configuration selon l'environnement
class ProductionConfig(Config):
    DEBUG = False

class DevelopmentConfig(Config):
    DEBUG = True

# Sélection de la configuration active
config = DevelopmentConfig()
