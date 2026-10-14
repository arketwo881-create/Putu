import React, { useState, useEffect } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { Flame } from 'lucide-react';

interface ColorReflexProps {
  game: GameMetadata;
  onBack: () => void;
}

const COLOR_DEFS = [
  { name: 'MERAH', colorClass: 'text-rose-500', bgClass: 'bg-rose-500', hex: '#ef4444' },
  { name: 'BIRU', colorClass: 'text-cyan-400', bgClass: 'bg-cyan-500', hex: '#06b6d4' },
  { name: 'HIJAU', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500', hex: '#10b981' },
  { name: 'KUNING', colorClass: 'text-amber-400', bgClass: 'bg-amber-400', hex: '#f59e0b' },
];

export const ColorReflexGame: React.FC<ColorReflexProps> = ({ game, onBack }) => {
  const [instructionType, setInstructionType] = useState<'ink' | 'text'>('ink');
  const [wordIdx, setWordIdx] = useState(0);
  const [inkIdx, setInkIdx] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(4);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const nextChallenge = () => {
    const isInk = Math.random() < 0.6;
    setInstructionType(isInk ? 'ink' : 'text');
    const w = Math.floor(Math.random() * COLOR_DEFS.length);
    let i = Math.floor(Math.random() * COLOR_DEFS.length);
    // make mismatch common
    if (i === w && Math.random() < 0.7) {
      i = (i + 1) % COLOR_DEFS.length;
    }
    setWordIdx(w);
    setInkIdx(i);
    setTimeLeft(4);
  };

  useEffect(() => {
    nextChallenge();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isGameOver || isVictory) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          sound.playHit();
          setIsGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, isVictory, wordIdx, inkIdx]);

  const handleChoice = (chosenIdx: number) => {
    if (isGameOver || isVictory) return;
    const correctIdx = instructionType === 'ink' ? inkIdx : wordIdx;

    if (chosenIdx === correctIdx) {
      sound.playScore();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore((s) => s + 50 + newStreak * 10);

      if (newStreak >= 15) {
        setIsVictory(true);
        return;
      }
      nextChallenge();
    } else {
      sound.playHit();
      setIsGameOver(true);
    }
  };

  const restartGame = () => {
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
    setIsVictory(false);
    nextChallenge();
  };

  return (
    <GameShell
      game={game}
      onBack={onBack}
      score={score}
      timeRemaining={timeLeft}
      moves={streak}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        {/* Streak Indicator */}
        <div className="w-full flex justify-between items-center mb-3 px-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            <Flame className="w-4 h-4 fill-current" />
            <span>Combo: {streak}x</span>
          </div>
          <span className="text-xs text-slate-400">Target Menang: 15 Combo</span>
        </div>

        {/* Prompt Card */}
        <div className="w-full py-8 px-4 rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl flex flex-col items-center justify-center mb-6">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Instruksi: Pilih{' '}
            <span className="text-white underline font-bold">
              {instructionType === 'ink' ? 'WARNA TINTA' : 'ARTI TEKS'}
            </span>
          </span>

          <span
            className={`font-arcade text-5xl font-black tracking-widest transition-all ${
              COLOR_DEFS[inkIdx].colorClass
            }`}
          >
            {COLOR_DEFS[wordIdx].name}
          </span>
        </div>

        {/* 4 Color Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {COLOR_DEFS.map((col, idx) => (
            <button
              key={idx}
              onClick={() => handleChoice(idx)}
              className="py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-base border border-slate-700 shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <span className={`w-4 h-4 rounded-full ${col.bgClass}`} />
              <span>{col.name}</span>
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
};
