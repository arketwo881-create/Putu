import React from 'react';
import { Sparkles, Volume2, VolumeX, Flame } from 'lucide-react';
import { storage } from '../../services/storage';
import { sound } from '../../services/sound';
import { PlayerStats } from '../../types/game';

interface HeaderProps {
  stats: PlayerStats;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ stats, onOpenProfile }) => {
  const toggleSound = () => {
    const next = !stats.soundEnabled;
    storage.setSound(next);
    sound.playClick();
  };

  return (
    <header className="sticky top-0 z-20 bg-[#0a0d18]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-arcade text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 tracking-wider">
            PLAYVERSE 35
          </h1>
          <span className="text-[10px] text-slate-400 -mt-1 block font-medium">
            35 Mini Games Arcade
          </span>
        </div>
      </div>

      {/* Right Stats & Profile */}
      <div className="flex items-center gap-2">
        {/* Streak */}
        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-1 rounded-lg text-xs font-bold font-arcade">
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>{stats.streakDays}d</span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 transition-all text-slate-300"
          title={stats.soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
        >
          {stats.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-rose-400" />
          )}
        </button>

        {/* Level & Profile Avatar */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 active:scale-95 transition-all"
        >
          <span className="text-base">{stats.avatar}</span>
          <span className="text-xs font-bold font-arcade text-cyan-400">
            Lv.{stats.level}
          </span>
        </button>
      </div>
    </header>
  );
};
