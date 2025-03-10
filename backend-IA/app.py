from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename

from config import config



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
        
        # Ici, tu peux ajouter ta logique pour traiter le fichier
        
        return jsonify({'message': 'File uploaded successfully', 'filename': filename}), 200
    
    return jsonify({'error': 'Invalid file format'}), 400

if __name__ == '__main__':
    os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, port=config.PORT)
