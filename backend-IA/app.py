import unicodedata
import emoji
from flask import Flask, request, jsonify
import os
import joblib
from werkzeug.utils import secure_filename
from flask_cors import CORS

from config import config

import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from transformers import BertTokenizer, BertModel
import torch
import re

app = Flask(__name__)
app.config.from_object(config)
CORS(app, resources={r"/*": {"origins": "*"}})

class_names = ['Angry', 'Disgusted', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
emo_model = load_model('models/face_model.h5')
kmeans_model = joblib.load('models/kmeans_model.pkl')
bert_tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
bert_model = BertModel.from_pretrained('bert-base-uncased')

# Vérifie si l'extension du fichier est autorisée
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in config.ALLOWED_EXTENSIONS

def clean_tweet(tweet):
    # 1. Convertir en minuscules
    tweet = tweet.lower()
    
    # 2. Supprimer les URLs
    tweet = re.sub(r'https?://\S+|www\.\S+', '', tweet)
    
    # 3. Supprimer les caractères spéciaux sauf ceux utiles (ex. !, ?, #, @)
    tweet = re.sub(r"[^a-zA-Z0-9@#?!'\s]", '', tweet)
    
    # 4. Réduire les lettres répétées
    tweet = re.sub(r'(.)\1{2,}', r'\1\1', tweet)  # Remplace toute répétition de 3+ par 2 lettres
    
    # 5. Supprimer les espaces multiples
    tweet = re.sub(r'\s+', ' ', tweet).strip()
    
    # 6. Convertir les emojis en texte lisible (ex. 😂 -> ":joy:")
    tweet = emoji.demojize(tweet, delimiters=(" ", " "))  # Garde les emojis sous forme de texte
    
    # 7. Normaliser les caractères (ex. caractères accentués → version simple)
    tweet = unicodedata.normalize("NFKC", tweet)
    
    return tweet

# Route de vérification de santé
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'AI Service is running',
        'models': {
            'emotion_detection': 'loaded' if emo_model else 'not loaded',
            'clustering': 'loaded' if kmeans_model else 'not loaded',
            'bert': 'loaded' if bert_model else 'not loaded'
        },
        'endpoints': [
            '/health',
            '/emotions',
            '/cluster',
            '/clusters'
        ]
    }), 200

@app.route('/emotions', methods=['POST'])
def get_emotions():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        

        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

        cap = cv2.VideoCapture(filepath)
        emotion_hist = []
        while cap.isOpened():
            # Capture frame-by-frame
            ret, frame = cap.read()
            if not ret:
                break 
            # Convert the frame to grayscale for face detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            # Detect faces in the frame
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5, minSize=(30, 30))

            # Process each detected face
            for (x, y, w, h) in faces:
                # Extract the face region
                face_roi = frame[y:y + h, x:x + w]

                # Resize the face image to the required input size for the model
                face_image = cv2.resize(face_roi, (48, 48))
                face_image = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
                face_image = image.img_to_array(face_image)
                face_image = np.expand_dims(face_image, axis=0)
                face_image = np.vstack([face_image])

                # Predict emotion using the loaded model
                predictions = emo_model.predict(face_image)
                emotion_label = class_names[np.argmax(predictions)]
                emotion_hist.append(emotion_label)

        # Release capture
        cap.release()
        
        emotion_counter = {}
        for element in emotion_hist:
            if element in emotion_counter:
                emotion_counter[element] += 1
            else:
                emotion_counter[element] = 1

        # Calculer le pourcentage de présence
        total = len(emotion_hist)
        pourcentages = {}
        for cle, val in emotion_counter.items():
            pourcentages[cle] = (val / total) * 100

        # envoie des résultats
        pourcentages = sorted(pourcentages.items(), key=lambda x: x[1], reverse=True)
        os.remove(filepath)
        return jsonify(pourcentages), 200
    
    return jsonify({'error': 'Invalid file format'}), 400


@app.route('/cluster', methods=['POST'])
def get_cluster():
    try:
        # Récupérer le texte depuis la requête JSON
        data = request.get_json()
        tweet = data.get("tweet", "")

        if not tweet:
            return jsonify({"error": "No tweet provided"}), 400

        tweet_cleaned = clean_tweet(tweet)


        inputs = bert_tokenizer(tweet_cleaned, return_tensors='pt', truncation=True, padding=True, max_length=128)
        
        # Passer les tokens dans le modèle BERT pour obtenir les embeddings
        with torch.no_grad():
            outputs = bert_model(**inputs)

        embeddings = [outputs.last_hidden_state.mean(dim=1).squeeze().numpy()]


        cluster = kmeans_model.predict(embeddings)[0]
        return jsonify({"tweet": tweet, "cluster": int(cluster)}), 200


    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/clusters', methods=['POST'])
def get_clusters():
    try:
        datas = request.get_json()

        if not datas:
            return jsonify({"error": "No tweet provided"}), 400

        cleaned_tweets = np.array([clean_tweet(data["tweet"]) for data in datas])
        
        embeddings = []

        for idx, tweet in enumerate(cleaned_tweets, start=1):  
            inputs = bert_tokenizer(tweet, return_tensors='pt', truncation=True, padding=True, max_length=128)
            with torch.no_grad():
                outputs = bert_model(**inputs)

            embeddings.append(outputs.last_hidden_state.mean(dim=1).squeeze().numpy())
            
        


        clusters = kmeans_model.predict(embeddings)

        return jsonify([{"tweet": datas[idx]["tweet"], "cluster": int(cluster)} for idx, cluster in enumerate(clusters)]), 200



    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
if __name__ == '__main__':
    os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=config.DEBUG, port=config.PORT)


