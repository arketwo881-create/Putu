import React, { useState } from 'react';
import { BaseGame } from '../../components/games/BaseGame';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { Flag, Eye, Bomb } from 'lucide-react';

interface MinesweeperProps {
  game: GameMetadata;
  onBack: () => void;
}

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const ROWS = 9;
const COLS = 9;
const TOTAL_MINES = 10;

export const MinesweeperGame: React.FC<MinesweeperProps> = ({ game, onBack }) => {
  const [board, setBoard] = useState<Cell[][]>(() => createInitialBoard());
  const [mode, setMode] = useState<'reveal' | 'flag'>('reveal');
  const [flagsUsed, setFlagsUsed] = useState(0);
  const [firstClickDone, setFirstClickDone] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  function createInitialBoard(): Cell[][] {
    const b: Cell[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          r,
          c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      b.push(row);
    }
    return b;
  }

  function populateMines(b: Cell[][], safeR: number, safeC: number) {
    let placed = 0;
    while (placed < TOTAL_MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      // Ensure safe zone around first click
      if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
      if (!b[r][c].isMine) {
        b[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate neighbor counts
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (b[r][c].isMine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc].isMine) {
              count++;
            }
          }
        }
        b[r][c].neighborMines = count;
      }
    }
  }

  const revealCell = (r: number, c: number) => {
    if (isGameOver || isVictory) return;
    let currentBoard = board.map((row) => row.map((cell) => ({ ...cell })));

    if (!firstClickDone) {
      populateMines(currentBoard, r, c);
      setFirstClickDone(true);
    }

    const target = currentBoard[r][c];
    if (target.isRevealed || target.isFlagged) return;

    if (mode === 'flag') {
      target.isFlagged = !target.isFlagged;
      setFlagsUsed((prev) => prev + (target.isFlagged ? 1 : -1));
      sound.playClick();
      setBoard(currentBoard);
      return;
    }

    // Reveal mode
    if (target.isMine) {
      // Game over! Reveal all mines
      sound.playHit();
      for (let ro = 0; ro < ROWS; ro++) {
        for (let co = 0; co < COLS; co++) {
          if (currentBoard[ro][co].isMine) {
            currentBoard[ro][co].isRevealed = true;
          }
        }
      }
      setBoard(currentBoard);
      setIsGameOver(true);
      return;
    }

    // Safe reveal with recursive flood fill for 0-neighbor cells
    sound.playScore();
    const queue: [number, number][] = [[r, c]];
    target.isRevealed = true;
    let revealedCount = 1;

    while (queue.length > 0) {
      const [cr, cc] = queue.shift()!;
      if (currentBoard[cr][cc].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              const neighbor = currentBoard[nr][nc];
              if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                neighbor.isRevealed = true;
                revealedCount++;
                if (neighbor.neighborMines === 0) {
                  queue.push([nr, nc]);
                }
              }
            }
          }
        }
      }
    }

    setScore((s) => s + revealedCount * 10);
    setBoard(currentBoard);

    // Check Victory (all non-mine cells revealed)
    let nonMinesUnrevealed = 0;
    for (let ro = 0; ro < ROWS; ro++) {
      for (let co = 0; co < COLS; co++) {
        if (!currentBoard[ro][co].isMine && !currentBoard[ro][co].isRevealed) {
          nonMinesUnrevealed++;
        }
      }
    }

    if (nonMinesUnrevealed === 0) {
      setIsVictory(true);
      setScore((s) => s + 500);
    }
  };

  const restartGame = () => {
    setBoard(createInitialBoard());
    setFirstClickDone(false);
    setFlagsUsed(0);
    setScore(0);
    setIsGameOver(false);
    setIsVictory(false);
  };

  const getNumberColor = (num: number): string => {
    switch (num) {
      case 1: return 'text-cyan-400';
      case 2: return 'text-emerald-400';
      case 3: return 'text-rose-400';
      case 4: return 'text-purple-400';
      case 5: return 'text-amber-400';
      default: return 'text-red-500';
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
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        {/* Header Tools */}
        <div className="w-full flex justify-between items-center mb-3 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 text-rose-400 font-arcade">
            <Bomb className="w-4 h-4" />
            <span>Sisa Ranjau: {Math.max(0, TOTAL_MINES - flagsUsed)}</span>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => {
                sound.playClick();
                setMode('reveal');
              }}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                mode === 'reveal' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Buka
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setMode('flag');
              }}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                mode === 'flag' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Flag className="w-3.5 h-3.5" /> Bendera
            </button>
          </div>
        </div>

        {/* 9x9 Minesweeper Grid */}
        <div className="w-full aspect-square bg-slate-950 p-2 rounded-2xl border-2 border-slate-700 shadow-2xl grid grid-cols-9 grid-rows-9 gap-1">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => revealCell(r, c)}
                className={`w-full h-full rounded-md flex items-center justify-center font-arcade font-black text-sm sm:text-base transition-all ${
                  cell.isRevealed
                    ? cell.isMine
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-900/90 border border-slate-800'
                    : 'bg-slate-800 hover:bg-slate-750 border border-slate-700 active:scale-95 shadow-sm'
                }`}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    '💣'
                  ) : cell.neighborMines > 0 ? (
                    <span className={getNumberColor(cell.neighborMines)}>
                      {cell.neighborMines}
                    </span>
                  ) : (
                    ''
                  )
                ) : cell.isFlagged ? (
                  '🚩'
                ) : (
                  ''
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </BaseGame>
  );
};
