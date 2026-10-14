import React, { useState } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { storage } from '../../services/storage';
import { sound } from '../../services/sound';
import { TargetAimGame } from './TargetAimGame';
import { MathChallengeGame } from '../puzzle';
import { WhackAMoleGame } from '../arcade/WhackAMoleGame';
import { GAMES_LIST } from '../../data/gamesList';
import { Trophy, Calendar, CheckCircle2 } from 'lucide-react';

interface DailyChallengeProps {
  game: GameMetadata;
  onBack: () => void;
}

export const DailyChallengeGame: React.FC<DailyChallengeProps> = ({ game, onBack }) => {
  const challenge = storage.getDailyChallenge();
  const [isPlayingSubGame, setIsPlayingSubGame] = useState(false);

  // We choose between 3 fast-paced challenge games for the daily mission
  const activeSubGameMeta = GAMES_LIST.find((g) => g.id === challenge.gameId) || GAMES_LIST[7];

  const handleCompleteMission = () => {
    storage.completeDailyChallenge();
    sound.playWin();
    setIsPlayingSubGame(false);
  };

  if (isPlayingSubGame) {
    if (challenge.gameId === 'math-challenge') {
      return (
        <MathChallengeGame
          game={{
            ...activeSubGameMeta,
            title: `Tantangan Harian: ${activeSubGameMeta.title}`,
          }}
          onBack={() => setIsPlayingSubGame(false)}
        />
      );
    }
    if (challenge.gameId === 'whack-a-mole') {
      return (
        <WhackAMoleGame
          game={{
            ...activeSubGameMeta,
            title: `Tantangan Harian: ${activeSubGameMeta.title}`,
          }}
          onBack={() => setIsPlayingSubGame(false)}
        />
      );
    }
    return (
      <TargetAimGame
        game={{
          ...activeSubGameMeta,
          title: `Tantangan Harian: ${activeSubGameMeta.title}`,
        }}
        onBack={() => setIsPlayingSubGame(false)}
      />
    );
  }

  return (
    <GameShell
      game={game}
      onBack={onBack}
      score={challenge.isCompleted ? challenge.targetScore : 0}
      isGameOver={false}
      isVictory={challenge.isCompleted}
      onRestart={() => setIsPlayingSubGame(true)}
    >
      <div className="w-full max-w-sm flex flex-col items-center select-none text-center">
        {/* Daily Challenge Card */}
        <div className="w-full bg-gradient-to-b from-amber-950/40 via-slate-900 to-[#0e1424] p-6 rounded-3xl border-2 border-amber-500/40 shadow-2xl flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8" />
          </div>

          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 mb-1">
            Misi Tantangan Hari Ini
          </span>
          <h2 className="text-2xl font-black text-white mb-2">
            {activeSubGameMeta.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mb-6">
            {challenge.goalDescription}
          </p>

          <div className="w-full bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex justify-around items-center mb-6">
            <div>
              <span className="text-[11px] text-slate-400 block">Target Minimal</span>
              <span className="font-arcade text-xl font-bold text-cyan-400">
                {challenge.targetScore}
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div>
              <span className="text-[11px] text-slate-400 block">Hadiah XP</span>
              <span className="font-arcade text-xl font-bold text-amber-400">
                +{challenge.xpReward} XP
              </span>
            </div>
          </div>

          {challenge.isCompleted ? (
            <div className="w-full py-3 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Misi Hari Ini Selesai!
            </div>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                setIsPlayingSubGame(true);
              }}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5 fill-current" />
              Mulai Tantangan Sekarang
            </button>
          )}
        </div>

        {!challenge.isCompleted && (
          <button
            onClick={handleCompleteMission}
            className="text-xs text-slate-500 hover:text-slate-400 underline"
          >
            Klaim Hadiah Manual
          </button>
        )}
      </div>
    </GameShell>
  );
};
