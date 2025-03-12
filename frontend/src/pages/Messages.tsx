import { motion } from 'framer-motion';
import { useState } from 'react';
import { Send } from 'lucide-react';

const MOCK_MESSAGES = [
  {
    id: 1,
    sender: 'Elena Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    message: 'Hey! What do you think about the new AI features?',
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    sender: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    message: 'The emotion recognition results are amazing!',
    timestamp: '1 hour ago'
  }
];

export function Messages() {
  const [message, setMessage] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto pt-20 px-4 pb-4"
    >
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 p-4">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>

        <div className="h-[calc(100vh-16rem)] overflow-y-auto p-4 space-y-4">
          {MOCK_MESSAGES.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <img
                src={msg.avatar}
                alt={msg.sender}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium">{msg.sender}</span>
                  <span className="text-sm text-gray-500">{msg.timestamp}</span>
                </div>
                <p className="text-gray-800 mt-1">{msg.message}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600 text-white p-2 rounded-full"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}