from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename

from config import config

import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

app = Flask(__name__)
app.config.from_object(config)

# Vérifie si l'extension du fichier est autorisée
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in config.ALLOWED_EXTENSIONS

# Crée le dossier uploads s'il n'existe pas
os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)

# Endpoint pour l'upload de fichier MP4
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        model_best = load_model('models/face_model.h5') 

        class_names = ['Angry', 'Disgusted', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

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
                predictions = model_best.predict(face_image)
                emotion_label = class_names[np.argmax(predictions)]
                emotion_hist.append(emotion_label)



        # Release the webcam and close the window
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

        # Affichage des résultats
        pourcentages = sorted(pourcentages.items(), key=lambda x: x[1], reverse=True)
        os.remove(filepath)
        return jsonify(pourcentages), 200
    
    return jsonify({'error': 'Invalid file format'}), 400

if __name__ == '__main__':
    os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=config.DEBUG, port=config.PORT)


