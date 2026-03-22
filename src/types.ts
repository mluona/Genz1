import { Timestamp } from 'firebase/firestore';

export type SeriesType = 'Manga' | 'Manhwa' | 'Novel';
export type SeriesStatus = 'Ongoing' | 'Completed' | 'Hiatus' | 'Dropped';
export type UserRole = 'user' | 'admin' | 'translator' | 'proofreader' | 'typesetter' | 'editor';

export interface Series {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  backgroundImage?: string;
  status: SeriesStatus;
  type: SeriesType;
  genres: string[];
  tags: string[];
  author: string;
  artist: string;
  releaseYear: number;
  rating: number;
  ratingCount: number;
  views: number;
  dailyViews: number;
  weeklyViews: number;
  monthlyViews: number;
  lastUpdated: Timestamp;
  slug: string;
}

export interface Chapter {
  id: string;
  seriesId: string;
  chapterNumber: number;
  title: string;
  content: string[]; // URLs for images, text for novels
  pageCount?: number;
  publishDate: Timestamp;
  views: number;
  teamId?: string;
  isPremium?: boolean;
  coinPrice?: number;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  bio: string;
  profilePicture: string;
  role: UserRole;
  favorites: string[]; // Series IDs
  history: { seriesId: string; lastChapterId: string; timestamp: Timestamp }[];
  bookmarks: string[]; // Chapter IDs
  banned: boolean;
  createdAt?: Timestamp;
  coins?: number;
  unlockedChapters?: string[];
}

export interface Comment {
  id: string;
  seriesId: string;
  chapterId?: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  likes: number;
  parentId?: string;
  timestamp: Timestamp;
  isFlagged?: boolean;
  isSpoiler?: boolean;
  imageUrl?: string;
  gifUrl?: string;
  reactions?: Record<string, string[]>; // e.g. { 'like': ['uid1'], 'love': ['uid2'] }
  isPinned?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number; // positive for purchase, negative for usage
  type: 'purchase' | 'unlock_chapter' | 'support_creator';
  description: string;
  timestamp: Timestamp;
  chapterId?: string;
  seriesId?: string;
}

export interface Team {
  id: string;
  name: string;
  members: { userId: string; role: string }[];
}

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  currency: string;
  bonusCoins?: number;
  isActive: boolean;
  createdAt?: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'chapter' | 'reply' | 'announcement';
  read: boolean;
  timestamp: Timestamp;
  link?: string;
}
