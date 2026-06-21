export interface User {
  id: string;
  email: string;
  name: string;
  nickname?: string | null;
  mbtiType: string;
  bio?: string | null;
  avatar?: string | null;
  isVerified?: boolean;
  interests?: { id: string; name: string }[];
}

export interface Post {
  id: string;
  content: string;
  image?: string | null;
  authorId: string;
  createdAt: string;
  author?: User;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender?: User;
  receiver?: User;
}

export type TabType = 'discover' | 'chat' | 'square' | 'me';
