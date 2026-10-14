import React from 'react';
import { Play, Heart, Trophy } from 'lucide-react';
import { GameMetadata } from '../../types/game';
import { storage } from '../../services/storage';
import { sound } from '../../services/sound';

interface GameCardProps {
  game: GameMetadata;
  onSelect: (game: GameMetadata) => void;
  onQuickPlay: (game: GameMetadata) => void;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onSelect,
  onQuickPlay,
  isFavorite,
  onToggleFavorite,
}) => {
  const highScore = storage.getHighScore(game.id);

  return (
    <div
      onClick={() => {
        sound.playClick();
        onSelect(game);
      }}
      className="group relative bg-[#0e1424] hover:bg-[#131b32] border border-slate-800/90 hover:border-cyan-500/40 rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-lg shadow-black/40 hover:-translate-y-0.5 active:scale-98"
    >
      {/* Top Meta */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-arcade text-[10px] font-black text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-md">
          #{game.number}
        </span>

        <div className="flex items-center gap-1.5">
          {game.badge && (
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
              {game.badge}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onToggleFavorite(game.id);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
            title="Favorit"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? 'text-rose-500 fill-current' : 'text-slate-500'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Title & Category */}
      <div className="mb-3">
        <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
          {game.title}
        </h3>
        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
          {game.description}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-arcade font-bold text-amber-300">{highScore}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playClick();
            onQuickPlay(game);
          }}
          className="py-1 px-2.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <Play className="w-3 h-3 fill-current" />
          Main
        </button>
      </div>
    </div>
  );
};
