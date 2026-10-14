import React, { useState } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { Crown } from 'lucide-react';

interface CheckersProps {
  game: GameMetadata;
  onBack: () => void;
}

type Piece = {
  player: 'white' | 'black'; // white = human, black = AI
  isKing: boolean;
} | null;

type Board = Piece[][];

export const CheckersGame: React.FC<CheckersProps> = ({ game, onBack }) => {
  const [board, setBoard] = useState<Board>(() => initBoard());
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [validMoves, setValidMoves] = useState<{ r: number; c: number; jumpOver?: { r: number; c: number } }[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  function initBoard(): Board {
    const b: Board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          if (r < 3) b[r][c] = { player: 'black', isKing: false };
          else if (r > 4) b[r][c] = { player: 'white', isKing: false };
        }
      }
    }
    return b;
  }

  const getMovesFor = (b: Board, r: number, c: number) => {
    const piece = b[r][c];
    if (!piece) return [];
    const moves: { r: number; c: number; jumpOver?: { r: number; c: number } }[] = [];
    const dirs: number[] = [];

    if (piece.player === 'white' || piece.isKing) dirs.push(-1); // Upwards
    if (piece.player === 'black' || piece.isKing) dirs.push(1); // Downwards

    for (const dr of dirs) {
      for (const dc of [-1, 1]) {
        const nr = r + dr;
        const nc = c + dc;

        // Normal slide
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !b[nr][nc]) {
          moves.push({ r: nr, c: nc });
        }

        // Jump capture
        const jr = r + dr * 2;
        const jc = c + dc * 2;
        if (
          jr >= 0 && jr < 8 && jc >= 0 && jc < 8 &&
          !b[jr][jc] &&
          b[nr] && b[nr][nc] &&
          b[nr][nc]!.player !== piece.player
        ) {
          moves.push({ r: jr, c: jc, jumpOver: { r: nr, c: nc } });
        }
      }
    }
    return moves;
  };

  const handleCellClick = (r: number, c: number) => {
    if (!isPlayerTurn || isGameOver || isVictory) return;

    const clickedPiece = board[r][c];

    // Select player piece
    if (clickedPiece && clickedPiece.player === 'white') {
      sound.playClick();
      setSelected({ r, c });
      setValidMoves(getMovesFor(board, r, c));
      return;
    }

    // Try executing move
    if (selected) {
      const move = validMoves.find((m) => m.r === r && m.c === c);
      if (move) {
        sound.playScore();
        const nextBoard = board.map((row) => [...row]);
        const movingPiece = { ...nextBoard[selected.r][selected.c]! };

        // Promote to King if reaches row 0
        if (move.r === 0) movingPiece.isKing = true;

        nextBoard[move.r][move.c] = movingPiece;
        nextBoard[selected.r][selected.c] = null;

        // Remove jumped piece
        if (move.jumpOver) {
          nextBoard[move.jumpOver.r][move.jumpOver.c] = null;
          sound.playHit();
          setScore((s) => s + 100);
        }

        setBoard(nextBoard);
        setSelected(null);
        setValidMoves([]);

        // Check if black has pieces left
        const blackPieces = nextBoard.flat().filter((p) => p?.player === 'black');
        if (blackPieces.length === 0) {
          setIsVictory(true);
          return;
        }

        // AI Turn
        setIsPlayerTurn(false);
        setTimeout(() => {
          makeAIMove(nextBoard);
        }, 500);
      }
    }
  };

  const makeAIMove = (currentBoard: Board) => {
    const allBlackMoves: { from: { r: number; c: number }; to: { r: number; c: number; jumpOver?: { r: number; c: number } } }[] = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (currentBoard[r][c]?.player === 'black') {
          const m = getMovesFor(currentBoard, r, c);
          m.forEach((mv) => allBlackMoves.push({ from: { r, c }, to: mv }));
        }
      }
    }

    if (allBlackMoves.length === 0) {
      setIsVictory(true);
      return;
    }

    // Prioritize jump captures
    const jumps = allBlackMoves.filter((m) => m.to.jumpOver);
    const chosen = jumps.length > 0 ? jumps[Math.floor(Math.random() * jumps.length)] : allBlackMoves[Math.floor(Math.random() * allBlackMoves.length)];

    const nextBoard = currentBoard.map((row) => [...row]);
    const piece = { ...nextBoard[chosen.from.r][chosen.from.c]! };
    if (chosen.to.r === 7) piece.isKing = true; // AI King

    nextBoard[chosen.to.r][chosen.to.c] = piece;
    nextBoard[chosen.from.r][chosen.from.c] = null;
    if (chosen.to.jumpOver) {
      nextBoard[chosen.to.jumpOver.r][chosen.to.jumpOver.c] = null;
    }

    sound.playClick();
    setBoard(nextBoard);

    const whitePieces = nextBoard.flat().filter((p) => p?.player === 'white');
    if (whitePieces.length === 0) {
      setIsGameOver(true);
    } else {
      setIsPlayerTurn(true);
    }
  };

  const restartGame = () => {
    setBoard(initBoard());
    setSelected(null);
    setValidMoves([]);
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
        <div className="w-full flex justify-between items-center mb-2 px-1 text-xs">
          <span className="text-cyan-400 font-bold">Kamu: Putih ⚪</span>
          <span className="text-slate-400 font-bold">Lawan: Hitam ⚫</span>
        </div>

        {/* 8x8 Checkers Board */}
        <div className="w-full aspect-square bg-slate-900 p-1.5 rounded-2xl border-2 border-slate-700 shadow-2xl grid grid-cols-8 grid-rows-8 gap-0">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isDark = (r + c) % 2 === 1;
              const isSel = selected?.r === r && selected?.c === c;
              const isValid = validMoves.some((m) => m.r === r && m.c === c);

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-full h-full flex items-center justify-center relative transition-all ${
                    isDark ? 'bg-[#0f172a]' : 'bg-[#1e293b]'
                  } ${isSel ? 'ring-2 ring-cyan-400' : ''}`}
                >
                  {isValid && (
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/80 animate-ping absolute" />
                  )}

                  {cell && (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 shadow-md transition-all ${
                        cell.player === 'white'
                          ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-cyan-500/20'
                          : 'bg-rose-950 border-rose-600 text-rose-200'
                      }`}
                    >
                      {cell.isKing && <Crown className="w-4 h-4 text-amber-500 fill-current" />}
                    </div>
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
