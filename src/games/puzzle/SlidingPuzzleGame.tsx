import React, { useState, useEffect } from 'react';
import { BaseGame } from '../../components/games/BaseGame';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface SlidingPuzzleProps {
  game: GameMetadata;
  onBack: () => void;
}

export const SlidingPuzzleGame: React.FC<SlidingPuzzleProps> = ({ game, onBack }) => {
  const [board, setBoard] = useState<number[]>(() => generateSolvableBoard());
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Generate solvable 4x4 15-puzzle by applying 50 random valid slides from solved state
  function generateSolvableBoard(): number[] {
    const b = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
    let emptyIdx = 15;

    for (let i = 0; i < 80; i++) {
      const row = Math.floor(emptyIdx / 4);
      const col = emptyIdx % 4;
      const neighbors: number[] = [];

      if (row > 0) neighbors.push(emptyIdx - 4);
      if (row < 3) neighbors.push(emptyIdx + 4);
      if (col > 0) neighbors.push(emptyIdx - 1);
      if (col < 3) neighbors.push(emptyIdx + 1);

      const target = neighbors[Math.floor(Math.random() * neighbors.length)];
      [b[emptyIdx], b[target]] = [b[target], b[emptyIdx]];
      emptyIdx = target;
    }
    return b;
  }

  // Timer
  useEffect(() => {
    if (isVictory) return;
    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isVictory]);

  const handleTileClick = (index: number) => {
    if (board[index] === 0 || isVictory) return;

    const row = Math.floor(index / 4);
    const col = index % 4;
    const emptyIndex = board.indexOf(0);
    const emptyRow = Math.floor(emptyIndex / 4);
    const emptyCol = emptyIndex % 4;

    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      sound.playClick();
      const newBoard = [...board];
      [newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]];
      setBoard(newBoard);
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      // Check win: 1 to 15, ending in 0
      const solved = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
      if (newBoard.every((val, idx) => val === solved[idx])) {
        setIsVictory(true);
        sound.playWin();
      }
    }
  };

  const restartGame = () => {
    setBoard(generateSolvableBoard());
    setMoves(0);
    setTimer(0);
    setIsVictory(false);
    setIsGameOver(false);
  };

  const score = Math.max(0, 1000 - moves * 10 - timer * 2);

  return (
    <BaseGame
      game={game}
      onBack={onBack}
      score={isVictory ? score : 0}
      moves={moves}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        <div className="w-full aspect-square bg-[#0e1322] p-3 rounded-2xl border-2 border-slate-700 shadow-2xl grid grid-cols-4 grid-rows-4 gap-2.5">
          {board.map((val, idx) => {
            const isEmpty = val === 0;
            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                disabled={isEmpty}
                className={`w-full h-full rounded-xl flex items-center justify-center font-arcade font-black text-2xl sm:text-3xl transition-transform ${
                  isEmpty
                    ? 'bg-transparent border-dashed border-2 border-slate-800'
                    : 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white border border-indigo-400 shadow-md shadow-indigo-500/20 active:scale-95'
                }`}
              >
                {!isEmpty && val}
              </button>
            );
          })}
        </div>
      </div>
    </BaseGame>
  );
};
