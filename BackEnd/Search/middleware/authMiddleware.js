const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        console.log("Headers reçus:", req.headers);
        const token = req.header("Authorization");
        console.log("Token reçu:", token);

        if (!token) {
            return res.status(401).json({ message: "Accès refusé, aucun token fourni." });
        }

        // Vérifier le format du token
        if (!token.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Format de token invalide" });
        }

        // Extraire le token
        const tokenWithoutBearer = token.replace('Bearer ', '');
        console.log("Token sans Bearer:", tokenWithoutBearer);

        // Vérifier le token
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
        console.log("Token décodé:", decoded);

        req.user = decoded;
        next();
    } catch (error) {
        console.error("Erreur d'authentification:", error);
        return res.status(401).json({ 
            message: "Token invalide",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = authMiddleware;