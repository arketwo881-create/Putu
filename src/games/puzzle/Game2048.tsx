import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BaseGame } from '../../components/games/BaseGame';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface Game2048Props {
  game: GameMetadata;
  onBack: () => void;
}

type Board = number[][];

export const Game2048: React.FC<Game2048Props> = ({ game, onBack }) => {
  const [board, setBoard] = useState<Board>(() => getInitialBoard());
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [hasWonBefore, setHasWonBefore] = useState(false);

  // Swipe handling for touch screens
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  function getInitialBoard(): Board {
    const b: Board = Array(4).fill(0).map(() => Array(4).fill(0));
    spawnTile(b);
    spawnTile(b);
    return b;
  }

  function spawnTile(b: Board): boolean {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return false;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    b[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  const checkGameOver = (b: Board): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) return false;
        if (r < 3 && b[r][c] === b[r + 1][c]) return false;
        if (c < 3 && b[r][c] === b[r][c + 1]) return false;
      }
    }
    return true;
  };

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (isGameOver) return;

    setBoard((prev) => {
      let moved = false;
      let pointsGained = 0;
      const next: Board = prev.map((row) => [...row]);

      const slide = (row: number[]) => {
        const filtered = row.filter((v) => v !== 0);
        const res: number[] = [];
        for (let i = 0; i < filtered.length; i++) {
          if (filtered[i] === filtered[i + 1]) {
            const combined = filtered[i] * 2;
            res.push(combined);
            pointsGained += combined;
            if (combined >= 2048 && !hasWonBefore) {
              setIsVictory(true);
              setHasWonBefore(true);
            }
            i++;
            moved = true;
          } else {
            res.push(filtered[i]);
          }
        }
        while (res.length < 4) res.push(0);
        if (res.some((val, idx) => val !== row[idx])) moved = true;
        return res;
      };

      if (direction === 'left') {
        for (let r = 0; r < 4; r++) {
          next[r] = slide(next[r]);
        }
      } else if (direction === 'right') {
        for (let r = 0; r < 4; r++) {
          const rev = [...next[r]].reverse();
          const slided = slide(rev).reverse();
          next[r] = slided;
        }
      } else if (direction === 'up') {
        for (let c = 0; c < 4; c++) {
          const col = [next[0][c], next[1][c], next[2][c], next[3][c]];
          const slided = slide(col);
          for (let r = 0; r < 4; r++) next[r][c] = slided[r];
        }
      } else if (direction === 'down') {
        for (let c = 0; c < 4; c++) {
          const col = [next[3][c], next[2][c], next[1][c], next[0][c]];
          const slided = slide(col).reverse();
          for (let r = 0; r < 4; r++) next[r][c] = slided[r];
        }
      }

      if (moved) {
        sound.playScore();
        spawnTile(next);
        setScore((s) => s + pointsGained);
        if (checkGameOver(next)) {
          setIsGameOver(true);
        }
        return next;
      }
      return prev;
    });
  }, [isGameOver, hasWonBefore]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        move('up');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        move('down');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        move('left');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        move('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 25) {
      if (absX > absY) {
        move(dx > 0 ? 'right' : 'left');
      } else {
        move(dy > 0 ? 'down' : 'up');
      }
    }
    touchStartRef.current = null;
  };

  const restartGame = () => {
    setBoard(getInitialBoard());
    setScore(0);
    setIsGameOver(false);
    setIsVictory(false);
    setHasWonBefore(false);
  };

  const getTileStyle = (val: number): string => {
    switch (val) {
      case 2: return 'bg-slate-800 text-slate-200 border-slate-700';
      case 4: return 'bg-slate-700 text-slate-100 border-slate-600';
      case 8: return 'bg-amber-600/80 text-white border-amber-500 shadow-md shadow-amber-600/30';
      case 16: return 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30';
      case 32: return 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/40';
      case 64: return 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/50';
      case 128: return 'bg-yellow-500 text-slate-900 border-yellow-400 font-extrabold shadow-lg shadow-yellow-500/40';
      case 256: return 'bg-cyan-500 text-slate-900 border-cyan-400 font-extrabold shadow-lg shadow-cyan-500/40';
      case 512: return 'bg-indigo-500 text-white border-indigo-400 font-extrabold shadow-lg shadow-indigo-500/40';
      case 1024: return 'bg-purple-600 text-white border-purple-400 font-extrabold shadow-xl shadow-purple-600/50';
      case 2048: return 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black shadow-2xl shadow-yellow-400/60 animate-pulse';
      default: return 'bg-slate-900/60 text-slate-500 border-slate-800';
    }
  };

  return (
    <BaseGame
      game={game}
      onBack={onBack}
      score={score}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div 
        className="w-full max-w-sm flex flex-col items-center select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 4x4 Grid Container */}
        <div className="w-full aspect-square bg-[#0e1424] p-3 rounded-2xl border-2 border-slate-800 shadow-2xl grid grid-cols-4 grid-rows-4 gap-2.5">
          {board.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`w-full h-full rounded-xl flex items-center justify-center font-arcade font-bold transition-all duration-150 border ${
                  val > 512 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                } ${getTileStyle(val)}`}
              >
                {val > 0 ? val : ''}
              </div>
            ))
          )}
        </div>

        {/* Touch D-Pad Controls for mobile */}
        <div className="mt-5 grid grid-cols-3 gap-2 w-48 sm:hidden">
          <div />
          <button
            onClick={() => move('up')}
            className="p-3.5 bg-slate-800 rounded-xl flex items-center justify-center active:scale-90 text-cyan-400 border border-slate-700"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />
          <button
            onClick={() => move('left')}
            className="p-3.5 bg-slate-800 rounded-xl flex items-center justify-center active:scale-90 text-cyan-400 border border-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => move('down')}
            className="p-3.5 bg-slate-800 rounded-xl flex items-center justify-center active:scale-90 text-cyan-400 border border-slate-700"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => move('right')}
            className="p-3.5 bg-slate-800 rounded-xl flex items-center justify-center active:scale-90 text-cyan-400 border border-slate-700"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </BaseGame>
  );
};
