import React, { useState } from 'react';
import { GameMetadata, GameCategory } from '../../types/game';
import { GAMES_LIST } from '../../data/gamesList';
import { GameCard } from '../common/GameCard';
import { sound } from '../../services/sound';
import { Search, X } from 'lucide-react';

interface CatalogViewProps {
  initialCategory?: string;
  onSelectGame: (game: GameMetadata) => void;
  onQuickPlay: (game: GameMetadata) => void;
  favorites: string[];
  onToggleFavorite: (gameId: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  initialCategory = 'all',
  onSelectGame,
  onQuickPlay,
  favorites,
  onToggleFavorite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'Semua (35)' },
    { id: 'puzzle', label: 'Puzzle (10)' },
    { id: 'arcade', label: 'Arcade (10)' },
    { id: 'strategy', label: 'Strategi (5)' },
    { id: 'casual', label: 'Santai (10)' },
  ];

  const filteredGames = GAMES_LIST.filter((game) => {
    const matchesCategory =
      selectedCategory === 'all' || game.category === (selectedCategory as GameCategory);
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.number.toString() === searchQuery.trim();
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-lg mx-auto">
      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari dari 35 mini-game..."
          className="w-full bg-[#0e1424] border border-slate-800 rounded-2xl pl-10 pr-9 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center text-xs text-slate-400 px-1">
        <span>Menampilkan {filteredGames.length} permainan</span>
      </div>

      {/* 35 Games Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onSelect={onSelectGame}
            onQuickPlay={onQuickPlay}
            isFavorite={favorites.includes(game.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
          <p className="text-sm">Tidak ada game yang cocok dengan pencarian "{searchQuery}".</p>
        </div>
      )}
    </div>
  );
};
