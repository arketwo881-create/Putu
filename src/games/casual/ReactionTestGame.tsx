import React, { useState, useEffect, useRef } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { Zap } from 'lucide-react';

interface ReactionTestProps {
  game: GameMetadata;
  onBack: () => void;
}

type Phase = 'waiting' | 'ready' | 'go' | 'early' | 'finished';

export const ReactionTestGame: React.FC<ReactionTestProps> = ({ game, onBack }) => {
  const [phase, setPhase] = useState<Phase>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRound = () => {
    setPhase('ready');
    setReactionTime(null);

    // Random delay between 1.5s and 4.5s
    const delay = Math.random() * 2500 + 1500;
    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setPhase('go');
      sound.playLaser();
    }, delay);
  };

  const handleScreenClick = () => {
    if (phase === 'waiting' || phase === 'finished' || phase === 'early') {
      sound.playClick();
      startRound();
      return;
    }

    if (phase === 'ready') {
      // Tapped too early!
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      sound.playHit();
      setPhase('early');
      return;
    }

    if (phase === 'go') {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      sound.playScore();
      setReactionTime(elapsed);
      setPhase('finished');

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      // Score: faster reaction = higher score
      const roundScore = Math.max(50, 1000 - elapsed);
      setScore((s) => s + roundScore);

      if (elapsed < 300) {
        setIsVictory(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const restartGame = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPhase('waiting');
    setReactionTime(null);
    setScore(0);
    setAttempts(0);
    setIsGameOver(false);
    setIsVictory(false);
  };

  const getRating = (ms: number): string => {
    if (ms < 200) return '⚡ Refleks Dewa (Superhuman)';
    if (ms < 270) return '🚀 Sangat Cepat (Pro Gamer)';
    if (ms < 350) return '👍 Baik & Tangkas';
    return '🐢 Sedikit Lambat, ayo coba lagi!';
  };

  return (
    <GameShell
      game={game}
      onBack={onBack}
      score={score}
      moves={attempts}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div
        onClick={handleScreenClick}
        className="w-full max-w-sm flex flex-col items-center select-none cursor-pointer"
      >
        <div
          className={`w-full aspect-square rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 border-4 shadow-2xl ${
            phase === 'waiting'
              ? 'bg-slate-900 border-slate-700 text-slate-300'
              : phase === 'ready'
              ? 'bg-rose-950/80 border-rose-600 text-rose-300 ring-8 ring-rose-900/30'
              : phase === 'go'
              ? 'bg-emerald-500 border-white text-slate-950 ring-8 ring-emerald-400/50 shadow-emerald-500/50 scale-102'
              : phase === 'early'
              ? 'bg-amber-950/80 border-amber-600 text-amber-300'
              : 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
          }`}
        >
          {phase === 'waiting' && (
            <>
              <Zap className="w-16 h-16 text-cyan-400 mb-4 animate-bounce" />
              <h3 className="text-2xl font-black mb-2 text-white">Tes Kecepatan Refleks</h3>
              <p className="text-xs text-slate-400 max-w-[220px]">
                Ketuk di mana saja untuk mulai. Saat layar berubah HIJAU, ketuk secepat kilat!
              </p>
            </>
          )}

          {phase === 'ready' && (
            <>
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mb-4 animate-pulse">
                <span className="text-3xl">🔴</span>
              </div>
              <h3 className="text-3xl font-black text-rose-400 mb-1">SIAP-SIAP...</h3>
              <p className="text-xs text-rose-300">Tunggu sampai layar berubah hijau</p>
            </>
          )}

          {phase === 'go' && (
            <>
              <h3 className="text-4xl font-black tracking-wider animate-bounce">
                KETUK SEKARANG!
              </h3>
            </>
          )}

          {phase === 'early' && (
            <>
              <h3 className="text-2xl font-black text-amber-400 mb-2">Terlalu Cepat!</h3>
              <p className="text-xs text-slate-300 mb-4">Kamu mengetuk saat masih merah.</p>
              <span className="text-xs font-bold text-amber-300 px-3 py-1.5 rounded-xl bg-amber-900/50 border border-amber-700">
                Ketuk untuk Coba Lagi
              </span>
            </>
          )}

          {phase === 'finished' && reactionTime !== null && (
            <>
              <span className="text-xs text-cyan-400 font-semibold mb-1">Waktu Reaksimu:</span>
              <h3 className="text-5xl font-black font-arcade text-white mb-2">
                {reactionTime} <span className="text-2xl text-cyan-400">ms</span>
              </h3>
              <p className="text-sm font-bold text-cyan-300 mb-4">{getRating(reactionTime)}</p>
              <span className="text-xs font-bold text-white px-4 py-2 rounded-xl bg-cyan-600 shadow-md">
                Ketuk untuk Main Lagi
              </span>
            </>
          )}
        </div>
      </div>
    </GameShell>
  );
};
