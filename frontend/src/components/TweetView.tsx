import { motion } from 'framer-motion';
import { TweetCard } from './TweetCard';
import { Tweet } from '../types';

interface TweetViewProps {
  tweets: Tweet[];
  currentIndex: number;
  showComments: boolean;
  isUserFollowed: (userId: string) => boolean;
  onToggleFollow: (userId: string) => void;
  onMediaClick: (url: string, alt?: string) => void;
  onDragEnd: (event: any, info: any) => void;
}

export function TweetView({ 
  tweets, 
  currentIndex, 
  showComments, 
  isUserFollowed, 
  onToggleFollow, 
  onMediaClick,
  onDragEnd 
}: TweetViewProps) {
  // Styles des cartes
  const getCardStyles = (index: number) => {
    const position = ((index - currentIndex) % tweets.length + tweets.length) % tweets.length;
    const relativePosition = position > tweets.length / 2 ? position - tweets.length : position;
    
    let xPos = 0, scale = 1, opacity = 1, blur = 0, zIndex = 5;
    
    if (relativePosition === 0) {
      xPos = 0; scale = 1; opacity = 1; blur = 0; zIndex = 10;
    } else if (relativePosition === 1 || relativePosition === -tweets.length + 1) {
      xPos = 360; scale = 0.85; opacity = 0.6; blur = 4; zIndex = 1;
    } else if (relativePosition === -1 || relativePosition === tweets.length - 1) {
      xPos = -360; scale = 0.85; opacity = 0.6; blur = 4; zIndex = 1;
    } else {
      xPos = relativePosition > 0 ? 720 : -720; scale = 0.7; opacity = 0; blur = 8; zIndex = 0;
    }
    
    return {
      x: xPos,
      scale,
      opacity,
      filter: `blur(${blur}px)`,
      zIndex,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        scale: { duration: 0.4 },
        opacity: { duration: 0.4 },
        filter: { duration: 0.4 }
      }
    };
  };

  return (
    <>
      {tweets.map((tweet, index) => {
        const isActive = index === currentIndex;
        
        return (
          <motion.div
            key={tweet._id}
            className={`${isActive ? 'card-active' : 'card-inactive'}`}
            style={{ 
              position: 'absolute',
              width: '480px',
              maxHeight: isActive ? '70vh' : '60vh',
              overflowY: isActive ? 'auto' : 'hidden',
            }}
            animate={{
              ...(!showComments ? getCardStyles(index) : {}),
              x: showComments && isActive ? 'calc(-15% - 200px)' : showComments ? '-100vw' : getCardStyles(index).x,
              scale: showComments && !isActive ? 0 : showComments && isActive ? 0.95 : getCardStyles(index).scale,
              y: showComments && isActive ? '5%' : getCardStyles(index).x === 0 ? '5%' : getCardStyles(index).x,
              opacity: showComments && !isActive ? 0 : getCardStyles(index).opacity,
              filter: getCardStyles(index).filter,
              zIndex: showComments && isActive ? 10 : getCardStyles(index).zIndex,
            }}
            transition={{ 
              duration: 0.5, 
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            drag={!showComments ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={onDragEnd}
          >
            <div className="card-content">
              <TweetCard 
                tweet={tweet} 
                hideActions={true} 
                onMediaClick={onMediaClick}
                isFollowing={isUserFollowed(tweet.user?._id || '')}
                onToggleFollow={() => onToggleFollow(tweet.user?._id || '')}
              />
            </div>
          </motion.div>
        );
      })}
    </>
  );
} 