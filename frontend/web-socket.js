import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000/notifications"); // Connexion WebSocket au backend

const App = () => {
    const [userId, setUserId] = useState(""); // ID de l'utilisateur connecté (celui qui reçoit la notif)
    const [tweetId, setTweetId] = useState(""); // ID du tweet concerné
    const [notificationType, setNotificationType] = useState("like"); // Type de notification
    const [notifications, setNotifications] = useState([]); // Liste des notifications reçues
    const [relatedUserId, setRelatedUserId] = useState(""); // ID de l'utilisateur qui envoie la notification

    // ✅ Connexion WebSocket automatique dès que l'utilisateur définit son ID
    useEffect(() => {
        if (userId) {
            console.log(`🟢 Tentative de connexion WebSocket pour User ID: ${userId}`);
            socket.emit("register", userId);

            // Vérifier les utilisateurs connectés
            socket.on("updateUsers", (users) => {
                console.log("👥 Liste des utilisateurs connectés :", users);
            });
        }

        // ✅ Écouter les notifications en temps réel
        socket.on("notification", (notification) => {
            console.log("📩 Notification reçue via WebSocket :", notification);
            setNotifications((prev) => [notification, ...prev]);
        });

        return () => {
            socket.off("notification");
            socket.off("updateUsers");
        };
    }, [userId]);

    // ✅ Fonction pour envoyer une notification
    const sendNotification = async () => {
        if (!relatedUserId || !tweetId || !notificationType) {
            console.error("❌ Erreur : Tous les champs doivent être remplis !");
            return;
        }

        const newNotification = {
            type: notificationType,
            relatedUserId, // Celui qui envoie la notification
            tweetId
        };

        try {
            console.log("📨 Envoi de la notification :", newNotification);
            const res = await fetch("http://localhost:5003/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newNotification),
            });

            const result = await res.json();
            console.log("✅ Notification envoyée avec succès :", result);
        } catch (error) {
            console.error("❌ Erreur lors de l'envoi de la notification :", error);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
            <h2>🔔 Notifications en Temps Réel</h2>

            {/* ID Utilisateur connecté */}
            <input
                type="text"
                placeholder="Votre User ID (celui qui reçoit la notification)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <button onClick={() => socket.emit("register", userId)} style={{ width: "100%", padding: "10px", marginBottom: "20px", backgroundColor: "#28a745", color: "white", border: "none", cursor: "pointer" }}>
                🔄 Se connecter au WebSocket
            </button>

            {/* Formulaire pour envoyer une notification */}
            <h3>📨 Envoyer une Notification</h3>
            <input
                type="text"
                placeholder="ID de l'utilisateur qui envoie la notification"
                value={relatedUserId}
                onChange={(e) => setRelatedUserId(e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
            />
            <input
                type="text"
                placeholder="Tweet ID"
                value={tweetId}
                onChange={(e) => setTweetId(e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
            />
            <select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
            >
                <option value="like">Like</option>
                <option value="retweet">Retweet</option>
                <option value="reply">Reply</option>
                <option value="follow">Follow</option>
                <option value="mention">Mention</option>
            </select>
            <button onClick={sendNotification} style={{ width: "100%", padding: "10px", backgroundColor: "#dc3545", color: "white", border: "none", cursor: "pointer" }}>
                🚀 Envoyer Notification
            </button>

            {/* Liste des notifications reçues */}
            <h3>📩 Notifications reçues</h3>
            <ul style={{ listStyle: "none", padding: "0" }}>
                {notifications.length === 0 ? (
                    <p>Aucune notification reçue.</p>
                ) : (
                    notifications.map((notif, index) => (
                        <li key={index} style={{ background: notif.isRead ? "#ddd" : "#fff", padding: "10px", marginBottom: "5px", border: "1px solid #ccc" }}>
                            <p><strong>Type:</strong> {notif.type}</p>
                            <p><strong>De:</strong> {notif.senderUsername}</p>
                            <p><strong>Tweet ID:</strong> {notif.tweetId}</p>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default App;
