import React, { useState } from 'react';
import { BaseGame } from '../../components/games/BaseGame';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { Bot, Users } from 'lucide-react';

interface TicTacToeProps {
  game: GameMetadata;
  onBack: () => void;
}

type Player = 'X' | 'O';
type Board = (Player | null)[];

export const TicTacToeGame: React.FC<TicTacToeProps> = ({ game, onBack }) => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [mode, setMode] = useState<'ai-easy' | 'ai-hard' | 'pvp'>('ai-hard');
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const WINNING_COMBOS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const checkWinner = (b: Board): { winner: Player | null; line: number[] | null } => {
    for (const combo of WINNING_COMBOS) {
      const [a, bIndex, c] = combo;
      if (b[a] && b[a] === b[bIndex] && b[a] === b[c]) {
        return { winner: b[a], line: combo };
      }
    }
    return { winner: null, line: null };
  };

  const getBestAIMove = (current: Board): number => {
    // 1. Can AI win right now?
    for (let i = 0; i < 9; i++) {
      if (!current[i]) {
        const copy = [...current];
        copy[i] = 'O';
        if (checkWinner(copy).winner === 'O') return i;
      }
    }
    // 2. Can player win? Block player!
    for (let i = 0; i < 9; i++) {
      if (!current[i]) {
        const copy = [...current];
        copy[i] = 'X';
        if (checkWinner(copy).winner === 'X') return i;
      }
    }
    // 3. Take center
    if (!current[4]) return 4;
    // 4. Take corners
    const corners = [0, 2, 6, 8].filter((i) => !current[i]);
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
    // 5. Any open slot
    const open = current.map((val, idx) => (val === null ? idx : null)).filter((v): v is number => v !== null);
    return open[0] ?? 0;
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] || isGameOver || isVictory) return;
    if (mode !== 'pvp' && !isXNext) return;

    sound.playScore();
    const newBoard = [...board];
    newBoard[idx] = isXNext ? 'X' : 'O';

    const result = checkWinner(newBoard);
    if (result.winner) {
      setBoard(newBoard);
      setWinningLine(result.line);
      if (result.winner === 'X') {
        setIsVictory(true);
        setScore((s) => s + 100);
      } else {
        setIsGameOver(true);
      }
      return;
    }

    if (newBoard.every((cell) => cell !== null)) {
      setBoard(newBoard);
      setIsGameOver(true);
      return;
    }

    setBoard(newBoard);
    const nextTurn = !isXNext;
    setIsXNext(nextTurn);

    // AI Turn
    if (mode !== 'pvp' && nextTurn) {
      setTimeout(() => {
        let aiIdx = -1;
        if (mode === 'ai-easy') {
          const empty = newBoard.map((val, i) => (val === null ? i : null)).filter((v): v is number => v !== null);
          aiIdx = empty[Math.floor(Math.random() * empty.length)];
        } else {
          aiIdx = getBestAIMove(newBoard);
        }

        if (aiIdx !== -1 && aiIdx !== undefined) {
          const aiBoard = [...newBoard];
          aiBoard[aiIdx] = 'O';
          sound.playClick();
          const aiResult = checkWinner(aiBoard);
          if (aiResult.winner === 'O') {
            setBoard(aiBoard);
            setWinningLine(aiResult.line);
            setIsGameOver(true);
          } else if (aiBoard.every((c) => c !== null)) {
            setBoard(aiBoard);
            setIsGameOver(true);
          } else {
            setBoard(aiBoard);
            setIsXNext(true);
          }
        }
      }, 350);
    }
  };

  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinningLine(null);
    setIsGameOver(false);
    setIsVictory(false);
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
        {/* Mode Selector */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 mb-4 w-full gap-1">
          <button
            onClick={() => {
              setMode('ai-hard');
              restartGame();
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'ai-hard' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI Cerdas
          </button>
          <button
            onClick={() => {
              setMode('ai-easy');
              restartGame();
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'ai-easy' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI Santai
          </button>
          <button
            onClick={() => {
              setMode('pvp');
              restartGame();
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'pvp' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            2 Pemain
          </button>
        </div>

        {/* Turn Indicator */}
        <div className="mb-4 text-xs font-semibold text-slate-300 flex items-center gap-2">
          <span>Giliran:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold font-arcade ${
              isXNext ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
          >
            {isXNext ? 'X (Kamu)' : mode === 'pvp' ? 'O (Pemain 2)' : 'O (AI)'}
          </span>
        </div>

        {/* 3x3 Grid */}
        <div className="w-full aspect-square bg-slate-900/80 p-3 rounded-2xl border-2 border-slate-700 shadow-2xl grid grid-cols-3 grid-rows-3 gap-3">
          {board.map((cell, idx) => {
            const isHighlighted = winningLine?.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                className={`w-full h-full rounded-2xl flex items-center justify-center font-arcade font-extrabold text-5xl transition-all border ${
                  isHighlighted
                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 ring-4 ring-emerald-500/50 scale-102'
                    : cell
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 active:scale-95'
                } ${cell === 'X' ? 'text-cyan-400' : 'text-rose-400'}`}
              >
                {cell}
              </button>
            );
          })}
        </div>
      </div>
    </BaseGame>
  );
};
