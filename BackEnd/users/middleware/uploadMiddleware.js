const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Assurer que les dossiers d'upload existent
const profilesDir = path.join(__dirname, '../uploads/profiles');
const bannersDir = path.join(__dirname, '../uploads/banners');

if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
}

if (!fs.existsSync(bannersDir)) {
    fs.mkdirSync(bannersDir, { recursive: true });
}

// Configuration de stockage pour les photos de profil
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, profilesDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configuration de stockage pour les bannières
const bannerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, bannersDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtre pour vérifier si le fichier est une image
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Le fichier doit être une image'), false);
    }
};

// Middleware pour l'upload de photo de profil
const uploadProfilePicture = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: fileFilter
}).single('profilePicture');

// Middleware pour l'upload de bannière
const uploadBanner = multer({
    storage: bannerStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: fileFilter
}).single('banner');

// Middleware pour uploader plusieurs fichiers à la fois (profil et bannière)
const uploadProfileFiles = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname === 'profilePicture') {
                cb(null, profilesDir);
            } else if (file.fieldname === 'banner') {
                cb(null, bannersDir);
            }
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const prefix = file.fieldname === 'profilePicture' ? 'profile-' : 'banner-';
            cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: fileFilter
}).fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]);

module.exports = {
    uploadProfilePicture,
    uploadBanner,
    uploadProfileFiles
}; 