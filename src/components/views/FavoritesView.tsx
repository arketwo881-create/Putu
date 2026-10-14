import React from 'react';
import { GameMetadata } from '../../types/game';
import { GAMES_LIST } from '../../data/gamesList';
import { GameCard } from '../common/GameCard';
import { Heart, Grid } from 'lucide-react';
import { sound } from '../../services/sound';

interface FavoritesViewProps {
  favorites: string[];
  onSelectGame: (game: GameMetadata) => void;
  onQuickPlay: (game: GameMetadata) => void;
  onToggleFavorite: (gameId: string) => void;
  onOpenCatalog: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onSelectGame,
  onQuickPlay,
  onToggleFavorite,
  onOpenCatalog,
}) => {
  const favoriteGames = favorites
    .map((id) => GAMES_LIST.find((g) => g.id === id))
    .filter((g): g is GameMetadata => g !== undefined);

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Heart className="w-5 h-5 text-rose-500 fill-current" />
        <h2 className="text-lg font-bold text-white">Game Favoritmu</h2>
        <span className="text-xs text-slate-400 font-arcade">({favoriteGames.length})</span>
      </div>

      {favoriteGames.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {favoriteGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onSelect={onSelectGame}
              onQuickPlay={onQuickPlay}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-[#0c1222] rounded-3xl border border-slate-800 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Belum Ada Game Favorit</h3>
          <p className="text-xs text-slate-400 max-w-xs mb-6">
            Ketuk ikon hati pada kartu game apa pun untuk menyimpannya di daftar favoritmu.
          </p>
          <button
            onClick={() => {
              sound.playClick();
              onOpenCatalog();
            }}
            className="py-2.5 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white flex items-center gap-2 shadow-lg shadow-cyan-600/30"
          >
            <Grid className="w-4 h-4" />
            Jelajahi 35 Game
          </button>
        </div>
      )}
    </div>
  );
};
