export interface Station {
  id: string;
  name: string;
  description: string;
  frequency?: string;
  coverUrl: string;
  streamUrl: string; // In a real app, this would be the .mp3/.m3u8 stream
  tags: string[];
  category: string;
  gain?: number; // Volume correction factor (e.g., 0.8 for loud stations, 1.2 for quiet ones)
}

export interface Category {
  id: string;
  name: string;
}

export interface PlayerState {
  currentStation: Station | null;
  isPlaying: boolean;
  volume: number; // 0 to 1
  isMuted: boolean;
  showPlaylist: boolean;
}

export interface UserProfile {
  name: string;
  bio: string;
  avatarUrl: string;
  joinDate: string;
  isPro: boolean;
  level: number;
  listeningMinutes: number;
}