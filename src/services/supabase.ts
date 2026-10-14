/**
 * Supabase Cloud Sync & Global Leaderboard Integration
 * 
 * Works seamlessly offline by default. If the user or developer provides Supabase URL
 * and Key, cloud sync and global high scores become active automatically.
 */

export interface CloudScore {
  id?: string;
  user_id?: string;
  username: string;
  game_id: string;
  score: number;
  created_at?: string;
}

export interface CloudProfile {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  updated_at: string;
}

class SupabaseService {
  private isConfigured: boolean = false;
  private supabaseUrl: string = '';
  private supabaseAnonKey: string = '';

  constructor() {
    this.supabaseUrl = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_URL || '';
    this.supabaseAnonKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY || '';
    this.isConfigured = Boolean(this.supabaseUrl && this.supabaseAnonKey);
  }

  public isCloudConnected(): boolean {
    return this.isConfigured;
  }

  // Submit high score to cloud leaderboard (gracefully handles offline/unconfigured)
  public async submitScore(gameId: string, score: number, username: string): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }
    try {
      const res = await fetch(`${this.supabaseUrl}/rest/v1/game_scores`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          game_id: gameId,
          score,
          username,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Get leaderboard for a specific game
  public async getLeaderboard(gameId: string, limit: number = 10): Promise<CloudScore[]> {
    if (!this.isConfigured) {
      // Return simulated local high score entry
      return [];
    }
    try {
      const res = await fetch(
        `${this.supabaseUrl}/rest/v1/game_scores?game_id=eq.${encodeURIComponent(gameId)}&order=score.desc&limit=${limit}`,
        {
          headers: {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
          },
        }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // offline fallback
    }
    return [];
  }
}

export const supabaseService = new SupabaseService();
