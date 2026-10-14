import React, { useState, useEffect } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { Flame } from 'lucide-react';

interface MathChallengeProps {
  game: GameMetadata;
  onBack: () => void;
}

interface Question {
  equation: string;
  options: number[];
  answer: number;
}

export const MathChallengeGame: React.FC<MathChallengeProps> = ({ game, onBack }) => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [currentQ, setCurrentQ] = useState<Question>(() => generateQuestion(1));
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);

  function generateQuestion(difficulty: number): Question {
    const ops = ['+', '-', '×'];
    if (difficulty >= 3) ops.push('÷');
    const op = ops[Math.floor(Math.random() * ops.length)];

    let a = 0;
    let b = 0;
    let ans = 0;

    if (op === '+') {
      a = Math.floor(Math.random() * (15 * difficulty)) + 5;
      b = Math.floor(Math.random() * (15 * difficulty)) + 3;
      ans = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * (20 * difficulty)) + 10;
      b = Math.floor(Math.random() * a) + 1;
      ans = a - b;
    } else if (op === '×') {
      a = Math.floor(Math.random() * (4 + difficulty * 2)) + 2;
      b = Math.floor(Math.random() * 10) + 2;
      ans = a * b;
    } else {
      b = Math.floor(Math.random() * 8) + 2;
      ans = Math.floor(Math.random() * 10) + 1;
      a = b * ans;
    }

    const options = new Set<number>([ans]);
    while (options.size < 4) {
      const delta = (Math.floor(Math.random() * 7) + 1) * (Math.random() < 0.5 ? 1 : -1);
      const fake = ans + delta;
      if (fake >= 0 && fake !== ans) options.add(fake);
    }

    return {
      equation: `${a} ${op} ${b} = ?`,
      answer: ans,
      options: Array.from(options).sort(() => Math.random() - 0.5),
    };
  }

  // Question Timer Countdown
  useEffect(() => {
    if (isGameOver || isVictory) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          sound.playGameOver();
          setIsGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver, isVictory, currentQ]);

  const handleSelectOption = (opt: number) => {
    if (isGameOver || isVictory) return;

    if (opt === currentQ.answer) {
      sound.playScore();
      const newStreak = streak + 1;
      const points = 100 + newStreak * 20 + timeLeft * 10;
      setScore((s) => s + points);
      setStreak(newStreak);
      const nextSolved = solvedCount + 1;
      setSolvedCount(nextSolved);

      if (nextSolved >= 20) {
        setIsVictory(true);
        return;
      }

      setTimeLeft(10);
      setCurrentQ(generateQuestion(Math.floor(nextSolved / 5) + 1));
    } else {
      sound.playHit();
      setStreak(0);
      setIsGameOver(true);
    }
  };

  const restartGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(10);
    setSolvedCount(0);
    setIsGameOver(false);
    setIsVictory(false);
    setCurrentQ(generateQuestion(1));
  };

  return (
    <GameShell
      game={game}
      onBack={onBack}
      score={score}
      timeRemaining={timeLeft}
      moves={solvedCount}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        {/* Streak & Level Ribbon */}
        <div className="w-full flex justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            <Flame className="w-4 h-4 fill-current" />
            <span>Streak: {streak}x</span>
          </div>
          <span className="text-xs text-slate-400">Soal {solvedCount + 1}/20</span>
        </div>

        {/* Time Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full mb-6 overflow-hidden border border-slate-700">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft > 5 ? 'bg-cyan-500' : 'bg-rose-500 animate-pulse'
            }`}
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          />
        </div>

        {/* Math Equation Card */}
        <div className="w-full py-8 px-6 bg-gradient-to-b from-[#11182c] to-[#0c1020] rounded-3xl border-2 border-cyan-500/40 shadow-2xl flex items-center justify-center mb-6">
          <span className="font-arcade text-4xl sm:text-5xl font-extrabold text-white tracking-widest text-shadow">
            {currentQ.equation}
          </span>
        </div>

        {/* 4 Answer Choices */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt)}
              className="py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-arcade font-bold text-2xl border border-slate-700 shadow-lg shadow-black/40 flex items-center justify-center transition-all"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
};
