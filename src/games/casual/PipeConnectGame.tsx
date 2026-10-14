import React, { useState } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface PipeConnectProps {
  game: GameMetadata;
  onBack: () => void;
}

// Openings: [top, right, bottom, left]
type PipeType = 'straight' | 'corner' | 't' | 'cross';

interface PipeCell {
  type: PipeType;
  rotation: number; // 0, 90, 180, 270
}

const GRID = 4; // 4x4 pipe network

export const PipeConnectGame: React.FC<PipeConnectProps> = ({ game, onBack }) => {
  const [board, setBoard] = useState<PipeCell[][]>(() => generateBoard());
  const [score, setScore] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  function generateBoard(): PipeCell[][] {
    const types: PipeType[] = ['straight', 'corner', 'corner', 't'];
    const b: PipeCell[][] = [];
    for (let r = 0; r < GRID; r++) {
      const row: PipeCell[] = [];
      for (let c = 0; c < GRID; c++) {
        row.push({
          type: types[(r * GRID + c) % types.length],
          rotation: Math.floor(Math.random() * 4) * 90,
        });
      }
      b.push(row);
    }
    return b;
  }

  // Returns [top, right, bottom, left] boolean openings for a rotated pipe
  const getOpenings = (cell: PipeCell): [boolean, boolean, boolean, boolean] => {
    let base = [false, false, false, false];
    if (cell.type === 'straight') base = [true, false, true, false];
    else if (cell.type === 'corner') base = [true, true, false, false];
    else if (cell.type === 't') base = [true, true, false, true];
    else if (cell.type === 'cross') base = [true, true, true, true];

    const steps = (cell.rotation / 90) % 4;
    for (let i = 0; i < steps; i++) {
      base = [base[3], base[0], base[1], base[2]]; // Rotate 90 deg clockwise
    }
    return base as [boolean, boolean, boolean, boolean];
  };

  const checkConnected = (currentBoard: PipeCell[][]) => {
    // Breadth-first search from [0, 0] to [3, 3]
    const visited = Array(GRID).fill(false).map(() => Array(GRID).fill(false));
    const queue: [number, number][] = [[0, 0]];
    visited[0][0] = true;

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      if (r === GRID - 1 && c === GRID - 1) return true;

      const openings = getOpenings(currentBoard[r][c]);

      // Top (dr = -1)
      if (openings[0] && r > 0 && !visited[r - 1][c]) {
        const topNeighbor = getOpenings(currentBoard[r - 1][c]);
        if (topNeighbor[2]) {
          visited[r - 1][c] = true;
          queue.push([r - 1, c]);
        }
      }
      // Right (dc = 1)
      if (openings[1] && c < GRID - 1 && !visited[r][c + 1]) {
        const rightNeighbor = getOpenings(currentBoard[r][c + 1]);
        if (rightNeighbor[3]) {
          visited[r][c + 1] = true;
          queue.push([r, c + 1]);
        }
      }
      // Bottom (dr = 1)
      if (openings[2] && r < GRID - 1 && !visited[r + 1][c]) {
        const bottomNeighbor = getOpenings(currentBoard[r + 1][c]);
        if (bottomNeighbor[0]) {
          visited[r + 1][c] = true;
          queue.push([r + 1, c]);
        }
      }
      // Left (dc = -1)
      if (openings[3] && c > 0 && !visited[r][c - 1]) {
        const leftNeighbor = getOpenings(currentBoard[r][c - 1]);
        if (leftNeighbor[1]) {
          visited[r][c - 1] = true;
          queue.push([r, c - 1]);
        }
      }
    }
    return false;
  };

  const handleRotate = (r: number, c: number) => {
    if (isVictory || isGameOver) return;
    sound.playClick();

    const nextBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    nextBoard[r][c].rotation = (nextBoard[r][c].rotation + 90) % 360;
    setBoard(nextBoard);

    if (checkConnected(nextBoard)) {
      sound.playWin();
      setIsVictory(true);
      setScore(750);
    }
  };

  const restartGame = () => {
    setBoard(generateBoard());
    setScore(0);
    setIsGameOver(false);
    setIsVictory(false);
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
          Ketuk pipa untuk memutar arah aliran dari kiri atas 💧 ke kanan bawah 🏁
        </p>

        {/* 4x4 Pipe Grid */}
        <div className="w-full aspect-square bg-[#0c1222] p-3 rounded-3xl border-2 border-slate-700 shadow-2xl grid grid-cols-4 grid-rows-4 gap-2">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isStart = r === 0 && c === 0;
              const isEnd = r === GRID - 1 && c === GRID - 1;

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleRotate(r, c)}
                  className={`w-full h-full rounded-2xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center relative active:scale-95 transition-transform ${
                    isStart ? 'ring-2 ring-cyan-400' : isEnd ? 'ring-2 ring-emerald-400' : ''
                  }`}
                >
                  {/* Pipe SVG Icon rotated */}
                  <div
                    className="w-10 h-10 flex items-center justify-center transition-transform duration-200"
                    style={{ transform: `rotate(${cell.rotation}deg)` }}
                  >
                    {cell.type === 'straight' && (
                      <div className="w-3.5 h-full bg-cyan-500 rounded-sm shadow-md shadow-cyan-500/40" />
                    )}
                    {cell.type === 'corner' && (
                      <div className="w-full h-full relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-1/2 bg-cyan-500 rounded-t-sm" />
                        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1/2 h-3.5 bg-cyan-500 rounded-r-sm" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-cyan-500" />
                      </div>
                    )}
                    {cell.type === 't' && (
                      <div className="w-full h-full relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-full bg-cyan-500" />
                        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1/2 h-3.5 bg-cyan-500" />
                      </div>
                    )}
                  </div>

                  {isStart && <span className="absolute top-1 left-1 text-[10px]">💧</span>}
                  {isEnd && <span className="absolute bottom-1 right-1 text-[10px]">🏁</span>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </GameShell>
  );
};
