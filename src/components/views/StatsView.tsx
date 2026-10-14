import React from 'react';
import { PlayerStats } from '../../types/game';
import { ACHIEVEMENTS_LIST } from '../../services/storage';
import { Trophy, Flame, Crown, Gamepad2, Award } from 'lucide-react';

interface StatsViewProps {
  stats: PlayerStats;
}

export const StatsView: React.FC<StatsViewProps> = ({ stats }) => {
  const xpNeeded = stats.level * 100;
  const xpProgress = Math.min(100, Math.round((stats.xp / xpNeeded) * 100));

  return (
    <div className="space-y-6 pb-24 px-4 pt-3 max-w-lg mx-auto">
      {/* Level & XP Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950 via-[#101730] to-cyan-950 border border-cyan-500/30 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-cyan-500/20 border border-cyan-500/40">
              {stats.avatar}
            </span>
            <div>
              <h3 className="font-bold text-base text-white">{stats.username}</h3>
              <span className="text-xs font-arcade font-black text-cyan-400">
                Peringkat: Level {stats.level}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Total XP</span>
            <span className="font-arcade text-lg font-bold text-amber-400">
              {stats.xp} / {xpNeeded}
            </span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-500 shadow-sm shadow-cyan-400"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* Key Metric Counters */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#0c1222] border border-slate-800 text-center">
          <Gamepad2 className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-400 block">Game Dimainkan</span>
          <span className="font-arcade text-xl font-bold text-white">
            {stats.totalGamesPlayed}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0c1222] border border-slate-800 text-center">
          <Crown className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-400 block">Kemenangan</span>
          <span className="font-arcade text-xl font-bold text-white">
            {stats.totalWins}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0c1222] border border-slate-800 text-center">
          <Flame className="w-5 h-5 text-rose-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-400 block">Streak Harian</span>
          <span className="font-arcade text-xl font-bold text-white">
            {stats.streakDays} Hari
          </span>
        </div>
      </div>

      {/* Achievements Badges */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Lencana Prestasi ({stats.unlockedAchievements.length}/{ACHIEVEMENTS_LIST.length})
          </h3>
        </div>

        <div className="space-y-2.5">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isUnlocked = stats.unlockedAchievements.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  isUnlocked
                    ? 'bg-[#10192e] border-cyan-500/40 shadow-lg shadow-cyan-950/40'
                    : 'bg-[#0a0f1d]/60 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                      isUnlocked
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">{ach.title}</h4>
                    <p className="text-[11px] text-slate-400">{ach.description}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-arcade font-bold px-2 py-0.5 rounded-md ${
                      isUnlocked
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    +{ach.xpReward} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
