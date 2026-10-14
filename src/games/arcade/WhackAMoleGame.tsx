import React, { useState, useEffect } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface WhackAMoleProps {
  game: GameMetadata;
  onBack: () => void;
}

type HoleContent = 'none' | 'normal' | 'gold' | 'bomb';

export const WhackAMoleGame: React.FC<WhackAMoleProps> = ({ game, onBack }) => {
  const [holes, setHoles] = useState<HoleContent[]>(Array(9).fill('none'));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Timer Countdown
  useEffect(() => {
    if (isGameOver || isVictory) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsVictory(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, isVictory]);

  // Mole pop logic
  useEffect(() => {
    if (isGameOver || isVictory) return;

    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * 9);
      const rand = Math.random();
      const type: HoleContent = rand < 0.15 ? 'bomb' : rand < 0.35 ? 'gold' : 'normal';

      setHoles((prev) => {
        const next = [...prev];
        next[idx] = type;
        return next;
      });

      // Retract mole after 800ms
      setTimeout(() => {
        setHoles((prev) => {
          const next = [...prev];
          if (next[idx] === type) next[idx] = 'none';
          return next;
        });
      }, 750);
    }, 600);

    return () => clearInterval(interval);
  }, [isGameOver, isVictory]);

  const handleWhack = (idx: number) => {
    if (isGameOver || isVictory) return;
    const item = holes[idx];
    if (item === 'none') return;

    if (item === 'bomb') {
      sound.playHit();
      setIsGameOver(true);
      return;
    }

    sound.playScore();
    setScore((s) => s + (item === 'gold' ? 150 : 50));
    setHoles((prev) => {
      const next = [...prev];
      next[idx] = 'none';
      return next;
    });
  };

  const restartGame = () => {
    setHoles(Array(9).fill('none'));
    setScore(0);
    setTimeLeft(30);
    setIsGameOver(false);
    setIsVictory(false);
  };

  return (
    <GameShell
      game={game}
      onBack={onBack}
      score={score}
      timeRemaining={timeLeft}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        <p className="text-xs text-slate-400 mb-4 text-center">
          Pukul mole neon secepatnya! Hindari robot bom merah 💣
        </p>

        {/* 3x3 Grid of Holes */}
        <div className="w-full aspect-square bg-[#0a0f1d] p-3 rounded-3xl border-2 border-slate-700 shadow-2xl grid grid-cols-3 grid-rows-3 gap-3">
          {holes.map((type, idx) => (
            <button
              key={idx}
              onClick={() => handleWhack(idx)}
              className="w-full h-full rounded-2xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center relative overflow-hidden active:scale-95 transition-all shadow-inner"
            >
              {/* Hole ground mound */}
              <div className="absolute bottom-0 w-full h-5 bg-slate-950/80 rounded-t-full border-t border-slate-800" />

              {/* Emerging character */}
              {type !== 'none' && (
                <div className="text-4xl sm:text-5xl animate-in slide-in-from-bottom duration-150 z-10">
                  {type === 'normal' && '🐹'}
                  {type === 'gold' && '🦊'}
                  {type === 'bomb' && '💣'}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
};
