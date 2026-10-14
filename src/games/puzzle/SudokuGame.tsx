import React, { useState, useEffect } from 'react';
import { BaseGame } from '../../components/games/BaseGame';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { Eraser } from 'lucide-react';

interface SudokuGameProps {
  game: GameMetadata;
  onBack: () => void;
}

// Preset verified Sudoku boards (0 represents empty cell)
const INITIAL_BOARDS = [
  {
    initial: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
  },
  {
    initial: [
      [0, 0, 0, 2, 6, 0, 7, 0, 1],
      [6, 8, 0, 0, 7, 0, 0, 9, 0],
      [1, 9, 0, 0, 0, 4, 5, 0, 0],
      [8, 2, 0, 1, 0, 0, 0, 4, 0],
      [0, 0, 4, 6, 0, 2, 9, 0, 0],
      [0, 5, 0, 0, 0, 3, 0, 2, 8],
      [0, 0, 9, 3, 0, 0, 0, 7, 4],
      [0, 4, 0, 0, 5, 0, 0, 3, 6],
      [7, 0, 3, 0, 1, 8, 0, 0, 0],
    ],
    solution: [
      [4, 3, 5, 2, 6, 9, 7, 8, 1],
      [6, 8, 2, 5, 7, 1, 4, 9, 3],
      [1, 9, 7, 8, 3, 4, 5, 6, 2],
      [8, 2, 6, 1, 9, 5, 3, 4, 7],
      [3, 7, 4, 6, 8, 2, 9, 1, 5],
      [9, 5, 1, 7, 4, 3, 6, 2, 8],
      [5, 1, 9, 3, 2, 6, 8, 7, 4],
      [2, 4, 8, 9, 5, 7, 1, 3, 6],
      [7, 6, 3, 4, 1, 8, 2, 5, 9],
    ],
  },
];

export const SudokuGame: React.FC<SudokuGameProps> = ({ game, onBack }) => {
  const [boardIndex, setBoardIndex] = useState(0);
  const [currentBoard, setCurrentBoard] = useState<number[][]>(() =>
    INITIAL_BOARDS[0].initial.map((row) => [...row])
  );
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes

  const activeSetup = INITIAL_BOARDS[boardIndex];

  // Game timer countdown
  useEffect(() => {
    if (isGameOver || isVictory) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setIsGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver, isVictory]);

  const handleCellClick = (r: number, c: number) => {
    sound.playClick();
    setSelectedCell({ r, c });
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || isGameOver || isVictory) return;
    const { r, c } = selectedCell;

    // Fixed starting cell cannot be altered
    if (activeSetup.initial[r][c] !== 0) return;

    if (num === 0) {
      // Erase
      const next = currentBoard.map((row) => [...row]);
      next[r][c] = 0;
      setCurrentBoard(next);
      sound.playClick();
      return;
    }

    const correct = activeSetup.solution[r][c] === num;
    if (correct) {
      sound.playScore();
      const next = currentBoard.map((row) => [...row]);
      next[r][c] = num;
      setCurrentBoard(next);
      setScore((s) => s + 50);

      // Check complete victory
      let won = true;
      for (let ro = 0; ro < 9; ro++) {
        for (let co = 0; co < 9; co++) {
          if (next[ro][co] !== activeSetup.solution[ro][co]) {
            won = false;
            break;
          }
        }
        if (!won) break;
      }
      if (won) {
        setIsVictory(true);
        setScore((s) => s + 500);
      }
    } else {
      sound.playHit();
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      if (nextMistakes >= 3) {
        setIsGameOver(true);
      }
    }
  };

  const restartGame = () => {
    const nextIdx = (boardIndex + 1) % INITIAL_BOARDS.length;
    setBoardIndex(nextIdx);
    setCurrentBoard(INITIAL_BOARDS[nextIdx].initial.map((row) => [...row]));
    setSelectedCell(null);
    setMistakes(0);
    setScore(0);
    setTimer(300);
    setIsGameOver(false);
    setIsVictory(false);
  };

  return (
    <BaseGame
      game={game}
      onBack={onBack}
      score={score}
      timeRemaining={timer}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        {/* Mistakes & Info Bar */}
        <div className="w-full flex justify-between items-center mb-2 px-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Kesalahan:</span>
            <span className={`font-bold font-arcade ${mistakes >= 2 ? 'text-rose-500' : 'text-amber-400'}`}>
              {mistakes}/3
            </span>
          </div>
          <span className="text-cyan-400 text-xs font-semibold">Teka-Teki #{boardIndex + 1}</span>
        </div>

        {/* 9x9 Board */}
        <div className="w-full aspect-square bg-slate-900 p-1.5 rounded-2xl border-2 border-slate-700 shadow-2xl grid grid-cols-9 grid-rows-9 gap-[1px]">
          {currentBoard.map((row, r) =>
            row.map((val, c) => {
              const isInitial = activeSetup.initial[r][c] !== 0;
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isRelated =
                selectedCell &&
                (selectedCell.r === r ||
                  selectedCell.c === c ||
                  (Math.floor(selectedCell.r / 3) === Math.floor(r / 3) &&
                    Math.floor(selectedCell.c / 3) === Math.floor(c / 3)));

              // 3x3 box borders
              const borderR = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-cyan-600/40' : '';
              const borderB = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-cyan-600/40' : '';

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-full h-full flex items-center justify-center font-arcade font-bold text-sm sm:text-base transition-colors ${borderR} ${borderB} ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300'
                      : isRelated
                      ? 'bg-slate-800/80 text-white'
                      : 'bg-slate-900/90 text-slate-200'
                  } ${isInitial ? 'font-black text-cyan-300' : 'text-white'}`}
                >
                  {val > 0 ? val : ''}
                </button>
              );
            })
          )}
        </div>

        {/* Number Pad for Input */}
        <div className="mt-4 w-full grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-arcade font-bold text-lg rounded-xl border border-slate-700 shadow-md flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleNumberInput(0)}
            className="py-3 bg-rose-950/60 hover:bg-rose-900 text-rose-300 active:scale-95 font-arcade font-bold rounded-xl border border-rose-800/50 shadow-md flex items-center justify-center"
            title="Hapus"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>
      </div>
    </BaseGame>
  );
};
