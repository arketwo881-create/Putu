import React, { useState } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface ConnectFourProps {
  game: GameMetadata;
  onBack: () => void;
}

type Disc = 'R' | 'Y' | null; // R = Red/Cyan (Player), Y = Yellow (AI)
type Board = Disc[][]; // 6 rows x 7 cols

const ROWS = 6;
const COLS = 7;

export const ConnectFourGame: React.FC<ConnectFourProps> = ({ game, onBack }) => {
  const [board, setBoard] = useState<Board>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [score, setScore] = useState(0);
  const [winningCoords, setWinningCoords] = useState<{ r: number; c: number }[] | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const checkConnectFour = (b: Board): { winner: Disc; line: { r: number; c: number }[] } | null => {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const d = b[r][c];
        if (d && d === b[r][c + 1] && d === b[r][c + 2] && d === b[r][c + 3]) {
          return {
            winner: d,
            line: [{ r, c }, { r, c: c + 1 }, { r, c: c + 2 }, { r, c: c + 3 }],
          };
        }
      }
    }

    // Vertical
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r <= ROWS - 4; r++) {
        const d = b[r][c];
        if (d && d === b[r + 1][c] && d === b[r + 2][c] && d === b[r + 3][c]) {
          return {
            winner: d,
            line: [{ r, c }, { r: r + 1, c }, { r: r + 2, c }, { r: r + 3, c }],
          };
        }
      }
    }

    // Diagonal Down-Right
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const d = b[r][c];
        if (d && d === b[r + 1][c + 1] && d === b[r + 2][c + 2] && d === b[r + 3][c + 3]) {
          return {
            winner: d,
            line: [{ r, c }, { r: r + 1, c: c + 1 }, { r: r + 2, c: c + 2 }, { r: r + 3, c: c + 3 }],
          };
        }
      }
    }

    // Diagonal Up-Right
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const d = b[r][c];
        if (d && d === b[r - 1][c + 1] && d === b[r - 2][c + 2] && d === b[r - 3][c + 3]) {
          return {
            winner: d,
            line: [{ r, c }, { r: r - 1, c: c + 1 }, { r: r - 2, c: c + 2 }, { r: r - 3, c: c + 3 }],
          };
        }
      }
    }

    return null;
  };

  const dropDisc = (col: number) => {
    if (!isPlayerTurn || isGameOver || isVictory) return;
    if (board[0][col] !== null) return; // Column full

    // Find lowest available row in column
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === null) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) return;

    sound.playScore();
    const nextBoard = board.map((row) => [...row]);
    nextBoard[targetRow][col] = 'R';
    setBoard(nextBoard);

    const result = checkConnectFour(nextBoard);
    if (result && result.winner === 'R') {
      setWinningCoords(result.line);
      setIsVictory(true);
      setScore(500);
      return;
    }

    // AI Turn
    setIsPlayerTurn(false);
    setTimeout(() => {
      makeAIMove(nextBoard);
    }, 400);
  };

  const makeAIMove = (currentBoard: Board) => {
    // 1. Can AI win on next move?
    for (let c = 0; c < COLS; c++) {
      if (currentBoard[0][c] === null) {
        const testB = currentBoard.map((row) => [...row]);
        for (let r = ROWS - 1; r >= 0; r--) {
          if (testB[r][c] === null) {
            testB[r][c] = 'Y';
            if (checkConnectFour(testB)?.winner === 'Y') {
              applyAIMove(currentBoard, c);
              return;
            }
            break;
          }
        }
      }
    }

    // 2. Can Player win on next move? Block player!
    for (let c = 0; c < COLS; c++) {
      if (currentBoard[0][c] === null) {
        const testB = currentBoard.map((row) => [...row]);
        for (let r = ROWS - 1; r >= 0; r--) {
          if (testB[r][c] === null) {
            testB[r][c] = 'R';
            if (checkConnectFour(testB)?.winner === 'R') {
              applyAIMove(currentBoard, c);
              return;
            }
            break;
          }
        }
      }
    }

    // 3. Fallback: Choose center column or available random column
    const availableCols = [3, 2, 4, 1, 5, 0, 6].filter((c) => currentBoard[0][c] === null);
    if (availableCols.length > 0) {
      applyAIMove(currentBoard, availableCols[0]);
    } else {
      setIsGameOver(true);
    }
  };

  const applyAIMove = (b: Board, col: number) => {
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (b[r][col] === null) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) return;

    sound.playClick();
    const nextBoard = b.map((row) => [...row]);
    nextBoard[targetRow][col] = 'Y';
    setBoard(nextBoard);

    const res = checkConnectFour(nextBoard);
    if (res && res.winner === 'Y') {
      setWinningCoords(res.line);
      setIsGameOver(true);
    } else {
      setIsPlayerTurn(true);
    }
  };

  const restartGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setWinningCoords(null);
    setIsPlayerTurn(true);
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
        <div className="w-full flex justify-between items-center mb-2 px-2 text-xs">
          <span className="text-cyan-400 font-bold">Kamu: Cyan 🔵</span>
          <span className="text-amber-400 font-bold">AI: Kuning 🟡</span>
        </div>

        {/* 7x6 Connect 4 Grid */}
        <div className="w-full aspect-[7/6] bg-blue-950 p-2.5 rounded-3xl border-4 border-blue-800 shadow-2xl grid grid-cols-7 grid-rows-6 gap-2">
          {board.map((row, r) =>
            row.map((disc, c) => {
              const isWinning = winningCoords?.some((pt) => pt.r === r && pt.c === c);

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => dropDisc(c)}
                  className={`w-full h-full rounded-full flex items-center justify-center transition-all ${
                    disc === 'R'
                      ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50'
                      : disc === 'Y'
                      ? 'bg-amber-400 shadow-lg shadow-amber-400/50'
                      : 'bg-slate-900/90 shadow-inner'
                  } ${isWinning ? 'ring-4 ring-emerald-400 animate-bounce' : ''}`}
                />
              );
            })
          )}
        </div>
      </div>
    </GameShell>
  );
};
