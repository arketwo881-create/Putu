import React, { useState } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface ReversiProps {
  game: GameMetadata;
  onBack: () => void;
}

type Disc = 'B' | 'W' | null; // B = Black (Player), W = White (AI)
type Board = Disc[][];

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

export const ReversiGame: React.FC<ReversiProps> = ({ game, onBack }) => {
  const [board, setBoard] = useState<Board>(() => initReversiBoard());
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  function initReversiBoard(): Board {
    const b: Board = Array(8).fill(null).map(() => Array(8).fill(null));
    b[3][3] = 'W';
    b[3][4] = 'B';
    b[4][3] = 'B';
    b[4][4] = 'W';
    return b;
  }

  const getFlippableDiscs = (b: Board, r: number, c: number, player: 'B' | 'W'): { r: number; c: number }[] => {
    if (b[r][c] !== null) return [];
    const opponent = player === 'B' ? 'W' : 'B';
    const flippable: { r: number; c: number }[] = [];

    for (const [dr, dc] of DIRS) {
      let step = 1;
      const currentRay: { r: number; c: number }[] = [];

      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
        if (b[nr][nc] === opponent) {
          currentRay.push({ r: nr, c: nc });
          step++;
        } else if (b[nr][nc] === player) {
          if (currentRay.length > 0) {
            flippable.push(...currentRay);
          }
          break;
        } else {
          break;
        }
      }
    }
    return flippable;
  };

  const getValidMoves = (b: Board, player: 'B' | 'W') => {
    const valid: { r: number; c: number; flips: { r: number; c: number }[] }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const flips = getFlippableDiscs(b, r, c, player);
        if (flips.length > 0) {
          valid.push({ r, c, flips });
        }
      }
    }
    return valid;
  };

  const playerMoves = isPlayerTurn ? getValidMoves(board, 'B') : [];

  const handleCellClick = (r: number, c: number) => {
    if (!isPlayerTurn || isGameOver || isVictory) return;
    const move = playerMoves.find((m) => m.r === r && m.c === c);
    if (!move) return;

    sound.playScore();
    const nextBoard = board.map((row) => [...row]);
    nextBoard[r][c] = 'B';
    move.flips.forEach((pt) => {
      nextBoard[pt.r][pt.c] = 'B';
    });

    setBoard(nextBoard);
    setIsPlayerTurn(false);

    // Check AI Turn
    setTimeout(() => {
      makeAIMove(nextBoard);
    }, 450);
  };

  const makeAIMove = (currentBoard: Board) => {
    const aiMoves = getValidMoves(currentBoard, 'W');

    if (aiMoves.length === 0) {
      // Check if Player has moves
      const pMoves = getValidMoves(currentBoard, 'B');
      if (pMoves.length === 0) {
        finalizeGame(currentBoard);
      } else {
        setIsPlayerTurn(true);
      }
      return;
    }

    // Pick AI move with maximum flips or corner preference
    aiMoves.sort((a, b) => {
      const isCornerA = (a.r === 0 || a.r === 7) && (a.c === 0 || a.c === 7) ? 20 : 0;
      const isCornerB = (b.r === 0 || b.r === 7) && (b.c === 0 || b.c === 7) ? 20 : 0;
      return b.flips.length + isCornerB - (a.flips.length + isCornerA);
    });

    const chosen = aiMoves[0];
    const nextBoard = currentBoard.map((row) => [...row]);
    nextBoard[chosen.r][chosen.c] = 'W';
    chosen.flips.forEach((pt) => {
      nextBoard[pt.r][pt.c] = 'W';
    });

    sound.playClick();
    setBoard(nextBoard);

    const nextPMoves = getValidMoves(nextBoard, 'B');
    if (nextPMoves.length === 0) {
      const nextAIMoves = getValidMoves(nextBoard, 'W');
      if (nextAIMoves.length === 0) {
        finalizeGame(nextBoard);
      } else {
        setTimeout(() => makeAIMove(nextBoard), 500);
      }
    } else {
      setIsPlayerTurn(true);
    }
  };

  const finalizeGame = (b: Board) => {
    let black = 0;
    let white = 0;
    b.forEach((row) =>
      row.forEach((cell) => {
        if (cell === 'B') black++;
        if (cell === 'W') white++;
      })
    );

    setScore(black * 20);
    if (black > white) {
      setIsVictory(true);
    } else {
      setIsGameOver(true);
    }
  };

  const blackCount = board.flat().filter((c) => c === 'B').length;
  const whiteCount = board.flat().filter((c) => c === 'W').length;

  const restartGame = () => {
    setBoard(initReversiBoard());
    setIsPlayerTurn(true);
    setScore(0);
    setIsGameOver(false);
    setIsVictory(false);
  };

  return (
    <GameShell
      game={game}
      onBack={onBack}
      score={score || blackCount * 20}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        {/* Score count ribbon */}
        <div className="w-full flex justify-between items-center mb-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-cyan-400">
            <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 inline-block shadow-sm shadow-cyan-400" />
            <span>Kamu: {blackCount}</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-slate-300">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-200 inline-block shadow-sm" />
            <span>AI: {whiteCount}</span>
          </div>
        </div>

        {/* 8x8 Board */}
        <div className="w-full aspect-square bg-emerald-950 p-2 rounded-2xl border-2 border-emerald-800 shadow-2xl grid grid-cols-8 grid-rows-8 gap-1">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isValid = playerMoves.some((m) => m.r === r && m.c === c);

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className="w-full h-full rounded-md bg-emerald-900 hover:bg-emerald-850 flex items-center justify-center relative active:scale-95 transition-all shadow-inner"
                >
                  {isValid && (
                    <div className="w-3 h-3 rounded-full bg-cyan-400/80 animate-ping absolute" />
                  )}

                  {cell && (
                    <div
                      className={`w-7 h-7 rounded-full transition-transform duration-300 shadow-md ${
                        cell === 'B'
                          ? 'bg-slate-950 border border-cyan-400 ring-2 ring-cyan-500/30'
                          : 'bg-slate-100 border border-slate-300'
                      }`}
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
