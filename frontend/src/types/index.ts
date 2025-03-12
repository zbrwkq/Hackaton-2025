export interface User {
  _id: string;
  username: string;
  bio: string;
  profilePicture: string;
  banner: string;
  followers: string[];
  following: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: User;
}

// Interface pour représenter un retweet qui peut être soit une string, soit un objet
export interface RetweetData {
  userId: string;
  tweetId?: string;
}

export interface Tweet {
  _id: string;
  userId: string;
  content: string;
  media: string[];
  hashtags: string[];
  mentions: string[];
  likes: string[];
  retweets: (string | RetweetData)[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
  user?: User;
  savedBy?: string[];
  isSavedByUser?: boolean;
}

export interface Interaction {
  _id: string;
  tweetId: string;
  userId: string;
  type: 'like' | 'retweet' | 'reply';
  replyContent?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'like' | 'retweet' | 'reply' | 'follow' | 'mention';
  createdAt: string;
  read: boolean;
  sourceUserId: string;
  sourceUsername?: string;
  tweetId?: string;
}