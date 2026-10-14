import { PlayerStats, Achievement, DailyChallengeInfo } from '../types/game';
import { sound } from './sound';

const STORAGE_KEY = 'playverse35_player_data';

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_play',
    title: 'Langkah Pertama',
    description: 'Mainkan permainan pertamamu di PLAYVERSE 35',
    icon: 'Gamepad2',
    xpReward: 50,
    conditionType: 'games_played',
    conditionValue: 1,
  },
  {
    id: 'arcade_enthusiast',
    title: 'Pemain Aktif',
    description: 'Mainkan 10 sesi permainan mini',
    icon: 'Flame',
    xpReward: 150,
    conditionType: 'games_played',
    conditionValue: 10,
  },
  {
    id: 'arcade_legend',
    title: 'Legenda Arkade',
    description: 'Mainkan 50 sesi permainan mini',
    icon: 'Trophy',
    xpReward: 500,
    conditionType: 'games_played',
    conditionValue: 50,
  },
  {
    id: 'first_victory',
    title: 'Kemenangan Manis',
    description: 'Raih kemenangan pertama di salah satu permainan',
    icon: 'Crown',
    xpReward: 100,
    conditionType: 'wins',
    conditionValue: 1,
  },
  {
    id: 'master_winner',
    title: 'Juara Tanpa Tanding',
    description: 'Raih 15 kemenangan dalam game',
    icon: 'Medal',
    xpReward: 350,
    conditionType: 'wins',
    conditionValue: 15,
  },
  {
    id: 'favorite_collector',
    title: 'Kolektor Favorit',
    description: 'Simpan minimal 3 permainan ke daftar favorit',
    icon: 'Heart',
    xpReward: 80,
    conditionType: 'favorites',
    conditionValue: 3,
  },
  {
    id: 'high_scorer',
    title: 'Skor Fantastis',
    description: 'Capai skor minimal 1000 pada game arcade apa pun',
    icon: 'Zap',
    xpReward: 200,
    conditionType: 'score',
    conditionValue: 1000,
  },
  {
    id: 'streak_master',
    title: 'Dedikasi Tanpa Batas',
    description: 'Bermain selama 3 hari berturut-turut',
    icon: 'Calendar',
    xpReward: 250,
    conditionType: 'streak',
    conditionValue: 3,
  },
];

const DEFAULT_STATS: PlayerStats = {
  username: 'Player 1',
  avatar: '🚀',
  level: 1,
  xp: 0,
  totalGamesPlayed: 0,
  totalWins: 0,
  streakDays: 1,
  lastPlayedDate: new Date().toISOString().split('T')[0],
  highScores: {},
  favorites: ['snake-classic', 'flappy-bird', 'chess', 'puzzle-2048'],
  recentlyPlayed: [],
  unlockedAchievements: [],
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
  language: 'id',
};

class StorageService {
  private stats: PlayerStats;
  private listeners: (() => void)[] = [];

  constructor() {
    this.stats = this.loadStats();
    sound.setEnabled(this.stats.soundEnabled);
    this.checkStreak();
  }

  private loadStats(): PlayerStats {
    if (typeof window === 'undefined') return DEFAULT_STATS;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...DEFAULT_STATS, ...JSON.parse(data) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_STATS;
  }

  private save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
    } catch {
      // ignore
    }
    this.notify();
  }

  public subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getStats(): PlayerStats {
    return { ...this.stats };
  }

  public updateProfile(username: string, avatar: string) {
    this.stats.username = username;
    this.stats.avatar = avatar;
    this.save();
  }

  public toggleFavorite(gameId: string) {
    if (this.stats.favorites.includes(gameId)) {
      this.stats.favorites = this.stats.favorites.filter((id) => id !== gameId);
    } else {
      this.stats.favorites.push(gameId);
    }
    this.checkAchievements();
    this.save();
  }

  public isFavorite(gameId: string): boolean {
    return this.stats.favorites.includes(gameId);
  }

  public recordGamePlay(gameId: string) {
    this.stats.totalGamesPlayed += 1;

    // Add to recently played (max 6, without duplicates at top)
    this.stats.recentlyPlayed = [
      gameId,
      ...this.stats.recentlyPlayed.filter((id) => id !== gameId),
    ].slice(0, 8);

    // Add 15 XP for playing
    this.addXp(15);
    this.checkAchievements();
    this.save();
  }

  public recordGameResult(gameId: string, score: number, isWin: boolean = false) {
    let newBest = false;
    const currentHigh = this.stats.highScores[gameId] || 0;

    if (score > currentHigh) {
      this.stats.highScores[gameId] = score;
      newBest = true;
    }

    if (isWin) {
      this.stats.totalWins += 1;
      this.addXp(50);
    } else {
      this.addXp(Math.min(30, Math.floor(score / 50) * 5));
    }

    this.checkAchievements(score);
    this.save();
    return { newBest, currentHigh: this.stats.highScores[gameId] };
  }

  public getHighScore(gameId: string): number {
    return this.stats.highScores[gameId] || 0;
  }

  public addXp(amount: number) {
    this.stats.xp += amount;
    // Level formula: each level takes (currentLevel * 100) XP
    let needed = this.stats.level * 100;
    while (this.stats.xp >= needed) {
      this.stats.xp -= needed;
      this.stats.level += 1;
      needed = this.stats.level * 100;
      sound.playWin();
    }
  }

  private checkAchievements(latestScore: number = 0) {
    ACHIEVEMENTS_LIST.forEach((ach) => {
      if (this.stats.unlockedAchievements.includes(ach.id)) return;

      let unlocked = false;
      switch (ach.conditionType) {
        case 'games_played':
          unlocked = this.stats.totalGamesPlayed >= ach.conditionValue;
          break;
        case 'wins':
          unlocked = this.stats.totalWins >= ach.conditionValue;
          break;
        case 'favorites':
          unlocked = this.stats.favorites.length >= ach.conditionValue;
          break;
        case 'score':
          unlocked = latestScore >= ach.conditionValue || Object.values(this.stats.highScores).some((s) => s >= ach.conditionValue);
          break;
        case 'streak':
          unlocked = this.stats.streakDays >= ach.conditionValue;
          break;
      }

      if (unlocked) {
        this.stats.unlockedAchievements.push(ach.id);
        this.addXp(ach.xpReward);
        sound.playWin();
      }
    });
  }

  private checkStreak() {
    const today = new Date().toISOString().split('T')[0];
    if (this.stats.lastPlayedDate === today) return;

    const last = new Date(this.stats.lastPlayedDate);
    const curr = new Date(today);
    const diffTime = Math.abs(curr.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      this.stats.streakDays += 1;
    } else if (diffDays > 1) {
      this.stats.streakDays = 1;
    }
    this.stats.lastPlayedDate = today;
    this.save();
  }

  public setSound(enabled: boolean) {
    this.stats.soundEnabled = enabled;
    sound.setEnabled(enabled);
    this.save();
  }

  public setVibration(enabled: boolean) {
    this.stats.vibrationEnabled = enabled;
    this.save();
  }

  public setLanguage(lang: 'id' | 'en') {
    this.stats.language = lang;
    this.save();
  }

  public resetAllData() {
    this.stats = { ...DEFAULT_STATS };
    this.save();
  }

  public getDailyChallenge(): DailyChallengeInfo {
    const today = new Date().toISOString().split('T')[0];
    const key = `daily_challenge_${today}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      return JSON.parse(stored);
    }

    // Deterministic selection based on day of year
    const games = [
      { id: 'puzzle-2048', goal: 'Capai angka 512 atau lebih tinggi', target: 512, xp: 150 },
      { id: 'snake-classic', goal: 'Kumpulkan skor minimal 100', target: 100, xp: 120 },
      { id: 'brick-breaker', goal: 'Hancurkan balok dan capai 200 poin', target: 200, xp: 130 },
      { id: 'math-challenge', goal: 'Selesaikan 5 soal matematika tanpa salah', target: 5, xp: 100 },
      { id: 'whack-a-mole', goal: 'Pukul 15 cyber mole dengan cepat', target: 15, xp: 110 },
      { id: 'reaction-test', goal: 'Capai waktu reaksi di bawah 300ms', target: 300, xp: 140 },
      { id: 'bubble-shooter', goal: 'Bersihkan gelembung hingga capai 150 poin', target: 150, xp: 125 },
    ];

    const dayNumber = new Date().getDate();
    const challengeObj = games[dayNumber % games.length];

    const challenge: DailyChallengeInfo = {
      date: today,
      gameId: challengeObj.id,
      goalDescription: challengeObj.goal,
      targetScore: challengeObj.target,
      xpReward: challengeObj.xp,
      isCompleted: false,
    };

    localStorage.setItem(key, JSON.stringify(challenge));
    return challenge;
  }

  public completeDailyChallenge() {
    const challenge = this.getDailyChallenge();
    if (!challenge.isCompleted) {
      challenge.isCompleted = true;
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`daily_challenge_${today}`, JSON.stringify(challenge));
      this.addXp(challenge.xpReward);
      this.save();
    }
  }
}

export const storage = new StorageService();
