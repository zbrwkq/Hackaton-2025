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

export interface Tweet {
  _id: string;
  userId: string;
  content: string;
  media: string[];
  hashtags: string[];
  mentions: string[];
  likes: string[];
  retweets: string[];
  createdAt: string;
  updatedAt: string;
  user?: User;
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
  type: 'like' | 'retweet' | 'reply' | 'follow';
  createdAt: string;
  read: boolean;
  sourceUserId: string;
  tweetId?: string;
}