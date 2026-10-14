import React from 'react';
import { GameMetadata } from '../../types/game';
import { storage } from '../../services/storage';
import { sound } from '../../services/sound';
import { X, Play, Heart, Trophy, Gamepad2, Info } from 'lucide-react';

interface GameDetailModalProps {
  game: GameMetadata;
  onClose: () => void;
  onPlay: (game: GameMetadata) => void;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  onClose,
  onPlay,
  isFavorite,
  onToggleFavorite,
}) => {
  const highScore = storage.getHighScore(game.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f1527] border border-slate-700 rounded-3xl w-full max-w-sm max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="font-arcade text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded-md">
              #{game.number}
            </span>
            <span className="text-xs font-semibold text-slate-300">{game.categoryLabel}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sound.playClick();
                onToggleFavorite(game.id);
              }}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-rose-400"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? 'text-rose-500 fill-current' : 'text-slate-500'
                }`}
              />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300">
          <div>
            <h2 className="text-xl font-black text-white mb-1">{game.title}</h2>
            <p className="text-slate-400 leading-relaxed">{game.description}</p>
          </div>

          {/* Stats Bar */}
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-around items-center">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 block">Tingkat Kesulitan</span>
              <span className="font-bold text-amber-400 text-xs">{game.difficulty}</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] text-slate-500 block">Skor Terbaikmu</span>
              <span className="font-arcade font-bold text-cyan-400 text-sm">{highScore}</span>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Cara Bermain & Aturan
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300 text-xs leading-relaxed">
              {game.instructions.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div>

          {/* Controls */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5" /> Kontrol Game
            </h4>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-cyan-300 text-xs">
              {game.controls}
            </div>
          </div>
        </div>

        {/* Footer Play Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <button
            onClick={() => {
              sound.playClick();
              onPlay(game);
            }}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Mulai Permainan
          </button>
        </div>
      </div>
    </div>
  );
};
