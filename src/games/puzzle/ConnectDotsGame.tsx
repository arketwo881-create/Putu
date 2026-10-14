import React, { useState } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface ConnectDotsProps {
  game: GameMetadata;
  onBack: () => void;
}

interface Point {
  r: number;
  c: number;
}

interface DotPair {
  color: string;
  name: string;
  p1: Point;
  p2: Point;
}

const GRID_SIZE = 5;

const DOT_PAIRS: DotPair[] = [
  { color: '#ef4444', name: 'red', p1: { r: 0, c: 0 }, p2: { r: 4, c: 1 } },
  { color: '#3b82f6', name: 'blue', p1: { r: 0, c: 4 }, p2: { r: 3, c: 3 } },
  { color: '#10b981', name: 'green', p1: { r: 1, c: 2 }, p2: { r: 4, c: 4 } },
  { color: '#f59e0b', name: 'yellow', p1: { r: 2, c: 0 }, p2: { r: 4, c: 2 } },
];

export const ConnectDotsGame: React.FC<ConnectDotsProps> = ({ game, onBack }) => {
  // Paths for each color
  const [paths, setPaths] = useState<Record<string, Point[]>>({
    red: [],
    blue: [],
    green: [],
    yellow: [],
  });
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const isDotAt = (r: number, c: number) => {
    return DOT_PAIRS.find(
      (d) => (d.p1.r === r && d.p1.c === c) || (d.p2.r === r && d.p2.c === c)
    );
  };

  const handleCellClick = (r: number, c: number) => {
    if (isVictory || isGameOver) return;

    const dot = isDotAt(r, c);

    if (dot) {
      // Start path from this dot
      sound.playClick();
      setActiveColor(dot.name);
      setPaths((prev) => ({
        ...prev,
        [dot.name]: [{ r, c }],
      }));
      return;
    }

    if (!activeColor) return;

    // Continue drawing path if adjacent to the current path end
    const currentPath = paths[activeColor];
    if (currentPath.length === 0) return;

    const last = currentPath[currentPath.length - 1];
    const isAdjacent = Math.abs(last.r - r) + Math.abs(last.c - c) === 1;

    if (!isAdjacent) return;

    // Check if cell is occupied by another color's path or dot
    const pair = DOT_PAIRS.find((d) => d.name === activeColor)!;
    const isTargetDot =
      (pair.p1.r === r && pair.p1.c === c) || (pair.p2.r === r && pair.p2.c === c);

    // If it's a different dot, block
    const otherDot = isDotAt(r, c);
    if (otherDot && otherDot.name !== activeColor) return;

    // Add cell to path
    sound.playScore();
    const newPath = [...currentPath, { r, c }];
    const nextPaths = {
      ...paths,
      [activeColor]: newPath,
    };
    setPaths(nextPaths);

    // If reached the target dot, complete this path!
    if (isTargetDot && newPath.length > 1) {
      sound.playPop();
      setActiveColor(null);

      // Check if all 4 colors are connected!
      const allConnected = DOT_PAIRS.every((dp) => {
        const p = nextPaths[dp.name];
        if (p.length < 2) return false;
        const start = p[0];
        const end = p[p.length - 1];
        return (
          ((start.r === dp.p1.r && start.c === dp.p1.c && end.r === dp.p2.r && end.c === dp.p2.c) ||
            (start.r === dp.p2.r && start.c === dp.p2.c && end.r === dp.p1.r && end.c === dp.p1.c))
        );
      });

      if (allConnected) {
        setIsVictory(true);
        setScore(600);
      }
    }
  };

  const restartGame = () => {
    setPaths({ red: [], blue: [], green: [], yellow: [] });
    setActiveColor(null);
    setIsVictory(false);
    setIsGameOver(false);
    setScore(0);
  };

  return (
    <GameShell
      game={game}
      onBack={onBack}
      score={score}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        <p className="text-xs text-slate-400 mb-4 text-center">
          Ketuk titik warna, lalu ketuk petak tetangga hingga menyambung ke titik warna yang sama.
        </p>

        {/* 5x5 Grid */}
        <div className="w-full aspect-square bg-[#0b101e] p-2.5 rounded-2xl border-2 border-slate-700 shadow-2xl grid grid-cols-5 grid-rows-5 gap-2">
          {Array(GRID_SIZE).fill(0).map((_, r) =>
            Array(GRID_SIZE).fill(0).map((_, c) => {
              const dot = isDotAt(r, c);

              // Find if this cell is in any path
              let pathColorHex: string | null = null;
              for (const [colName, pathPoints] of Object.entries(paths)) {
                if (pathPoints.some((pt) => pt.r === r && pt.c === c)) {
                  const pair = DOT_PAIRS.find((dp) => dp.name === colName);
                  if (pair) pathColorHex = pair.color;
                  break;
                }
              }

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className="w-full h-full rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center relative active:scale-95 transition-all"
                >
                  {/* Path trail */}
                  {pathColorHex && !dot && (
                    <div
                      className="w-5 h-5 rounded-md transition-all shadow-md"
                      style={{ backgroundColor: pathColorHex, boxShadow: `0 0 10px ${pathColorHex}` }}
                    />
                  )}

                  {/* Dot */}
                  {dot && (
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white/60 shadow-lg flex items-center justify-center animate-pulse"
                      style={{ backgroundColor: dot.color, boxShadow: `0 0 12px ${dot.color}` }}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </GameShell>
  );
};
