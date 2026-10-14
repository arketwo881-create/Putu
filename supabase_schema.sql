-- PLAYVERSE 35: Supabase Database Schema
-- Provides tables for user profiles, game high scores, achievements, favorites, and daily challenges

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT NOT NULL DEFAULT 'Player',
  avatar TEXT DEFAULT '🚀',
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Game Scores Table
CREATE TABLE IF NOT EXISTS public.game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  game_id TEXT NOT NULL,
  score BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_scores_game_id_score 
ON public.game_scores(game_id, score DESC);

-- 3. Player Achievements
CREATE TABLE IF NOT EXISTS public.player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 4. Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- 5. Daily Challenges
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL UNIQUE,
  game_id TEXT NOT NULL,
  goal_description TEXT NOT NULL,
  target_score INT NOT NULL,
  xp_reward INT NOT NULL DEFAULT 150,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Player Challenge Progress
CREATE TABLE IF NOT EXISTS public.player_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, challenge_id)
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view usernames/avatars, users can only edit their own profile
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Game Scores: Anyone can view scores (global leaderboard), users can insert
CREATE POLICY "Game scores are viewable by everyone" 
ON public.game_scores FOR SELECT USING (true);

CREATE POLICY "Anyone or authenticated user can submit score" 
ON public.game_scores FOR INSERT WITH CHECK (true);

-- Favorites: Users can only see and manage their own favorites
CREATE POLICY "Users view own favorites" 
ON public.favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users modify own favorites" 
ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Daily Challenges: Read-only for all players
CREATE POLICY "Challenges viewable by all" 
ON public.daily_challenges FOR SELECT USING (true);
