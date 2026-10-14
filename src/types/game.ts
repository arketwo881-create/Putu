export type GameCategory = 'puzzle' | 'arcade' | 'strategy' | 'casual';

export interface GameMetadata {
  id: string;
  number: number;
  title: string;
  category: GameCategory;
  categoryLabel: string;
  description: string;
  instructions: string[];
  controls: string;
  iconName: string;
  badge?: string;
  accentColor: string; // Tailwind color or hex
  difficulty: 'Mudah' | 'Sedang' | 'Tantangan';
}

export interface PlayerStats {
  username: string;
  avatar: string;
  level: number;
  xp: number;
  totalGamesPlayed: number;
  totalWins: number;
  streakDays: number;
  lastPlayedDate: string;
  highScores: Record<string, number>;
  favorites: string[];
  recentlyPlayed: string[];
  unlockedAchievements: string[];
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  language: 'id' | 'en';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  conditionType: 'games_played' | 'score' | 'wins' | 'streak' | 'favorites';
  conditionValue: number;
}

export interface DailyChallengeInfo {
  date: string;
  gameId: string;
  goalDescription: string;
  targetScore: number;
  xpReward: number;
  isCompleted: boolean;
}
