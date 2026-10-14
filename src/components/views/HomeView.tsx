import React from 'react';
import { GameMetadata, PlayerStats, DailyChallengeInfo } from '../../types/game';
import { GAMES_LIST } from '../../data/gamesList';
import { GameCard } from '../common/GameCard';
import { sound } from '../../services/sound';
import { Sparkles, Play, Flame, Trophy, Calendar, ChevronRight } from 'lucide-react';

interface HomeViewProps {
  stats: PlayerStats;
  onSelectGame: (game: GameMetadata) => void;
  onQuickPlay: (game: GameMetadata) => void;
  onToggleFavorite: (gameId: string) => void;
  onOpenAllGames: (category?: string) => void;
  dailyChallenge: DailyChallengeInfo;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stats,
  onSelectGame,
  onQuickPlay,
  onToggleFavorite,
  onOpenAllGames,
  dailyChallenge,
}) => {
  const featuredGame = GAMES_LIST[0]; // 2048 Puzzle
  const dailyGame = GAMES_LIST.find((g) => g.id === dailyChallenge.gameId) || GAMES_LIST[10];

  // Recently played games
  const recentGames = stats.recentlyPlayed
    .map((id) => GAMES_LIST.find((g) => g.id === id))
    .filter((g): g is GameMetadata => g !== undefined)
    .slice(0, 4);

  // Popular games
  const popularGames = GAMES_LIST.filter((g) => g.badge === 'Populer' || g.badge === 'Adiktif' || g.badge === 'Klasik').slice(0, 6);

  const categories = [
    { id: 'puzzle', name: 'Puzzle & Logika', count: 10, icon: '🧩', gradient: 'from-amber-500/20 to-orange-500/20 border-amber-500/30' },
    { id: 'arcade', name: 'Arcade & Refleks', count: 10, icon: '🕹️', gradient: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30' },
    { id: 'strategy', name: 'Strategi & Papan', count: 5, icon: '♟️', gradient: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30' },
    { id: 'casual', name: 'Santai & Ketangkasan', count: 10, icon: '🎯', gradient: 'from-rose-500/20 to-pink-500/20 border-rose-500/30' },
  ];

  return (
    <div className="space-y-6 pb-24 px-4 pt-3 max-w-lg mx-auto">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-[#101730] to-cyan-950 border border-cyan-500/30 p-5 shadow-2xl">
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Game Pilihan
            </span>
            <span className="text-xs font-arcade font-bold text-amber-400">
              35 Permainan Lengkap
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight">
            {featuredGame.title}
          </h2>
          <p className="text-xs text-slate-300 line-clamp-2 mb-4 max-w-xs">
            {featuredGame.description}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onQuickPlay(featuredGame);
              }}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/30 active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Mainkan Sekarang
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onSelectGame(featuredGame);
              }}
              className="py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs active:scale-95 transition-all"
            >
              Info Game
            </button>
          </div>
        </div>
      </div>

      {/* Daily Challenge Widget */}
      <div
        onClick={() => {
          sound.playClick();
          const challengeMeta = GAMES_LIST.find((g) => g.id === 'daily-challenge')!;
          onQuickPlay(challengeMeta);
        }}
        className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#12192c] border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all shadow-lg active:scale-98"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Tantangan Hari Ini
              </span>
              {dailyChallenge.isCompleted && (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                  Selesai
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-white">{dailyGame.title}</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">{dailyChallenge.goalDescription}</p>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-amber-400 shrink-0" />
      </div>

      {/* Categories Horizontal Scroll */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider text-slate-300">
            Kategori Mini-Game
          </h3>
          <button
            onClick={() => {
              sound.playClick();
              onOpenAllGames();
            }}
            className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-0.5"
          >
            Lihat 35 Game <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sound.playClick();
                onOpenAllGames(cat.id);
              }}
              className={`p-3 rounded-2xl border bg-gradient-to-br ${cat.gradient} text-left flex items-center justify-between active:scale-95 transition-all shadow-md`}
            >
              <div>
                <span className="text-xl block mb-1">{cat.icon}</span>
                <span className="font-bold text-xs text-white block leading-tight">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400 font-arcade">
                  {cat.count} Game
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recently Played */}
      {recentGames.length > 0 && (
        <div>
          <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-3 text-slate-300">
            Terakhir Dimainkan
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {recentGames.map((g) => (
              <GameCard
                key={g.id}
                game={g}
                onSelect={onSelectGame}
                onQuickPlay={onQuickPlay}
                isFavorite={stats.favorites.includes(g.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      )}

      {/* Popular Games */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500 fill-current" />
            Paling Populer
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {popularGames.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              onSelect={onSelectGame}
              onQuickPlay={onQuickPlay}
              isFavorite={stats.favorites.includes(g.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
