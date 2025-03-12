import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { TweetModal } from './TweetModal';

export const CreateTweetButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <motion.button
        className="fixed bottom-8 left-8 flex items-center justify-center w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={openModal}
      >
        <Plus size={24} />
      </motion.button>

      {isModalOpen && <TweetModal onClose={closeModal} />}
    </>
  );
}; 