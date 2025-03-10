import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TweetCard } from './TweetCard';
import { useStore } from '../store/useStore';

export function Feed() {
  const tweets = useStore((state) => state.tweets);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        if (currentIndex < tweets.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, tweets.length]);

  const handlers = useSwipeable({
    onSwipedUp: () => {
      if (currentIndex < tweets.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    },
    onSwipedDown: () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  return (
    <div
      {...handlers}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-4"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8
          }}
          className="max-w-2xl mx-auto"
        >
          {tweets[currentIndex] && (
            <TweetCard tweet={tweets[currentIndex]} />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1">
        {tweets.map((_, idx) => (
          <motion.div
            key={idx}
            initial={false}
            animate={{
              width: idx === currentIndex ? 16 : 8,
              backgroundColor: idx === currentIndex ? '#4F46E5' : '#D1D5DB'
            }}
            className="h-2 rounded-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        ))}
      </div>
    </div>
  );
}