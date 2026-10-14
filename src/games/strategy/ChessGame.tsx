import React, { useState } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface ChessProps {
  game: GameMetadata;
  onBack: () => void;
}

type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
type PieceColor = 'w' | 'b';

interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

type ChessBoard = (ChessPiece | null)[][];

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

export const ChessGame: React.FC<ChessProps> = ({ game, onBack }) => {
  const [board, setBoard] = useState<ChessBoard>(() => initChessBoard());
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [validMoves, setValidMoves] = useState<{ r: number; c: number }[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  function initChessBoard(): ChessBoard {
    const b: ChessBoard = Array(8).fill(null).map(() => Array(8).fill(null));

    // Back rows
    const backRow: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    for (let c = 0; c < 8; c++) {
      b[0][c] = { type: backRow[c], color: 'b' };
      b[1][c] = { type: 'p', color: 'b' };
      b[6][c] = { type: 'p', color: 'w' };
      b[7][c] = { type: backRow[c], color: 'w' };
    }
    return b;
  }

  const getLegalMoves = (b: ChessBoard, r: number, c: number): { r: number; c: number }[] => {
    const piece = b[r][c];
    if (!piece) return [];
    const moves: { r: number; c: number }[] = [];

    const addMove = (nr: number, nc: number) => {
      if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) return false;
      const dest = b[nr][nc];
      if (!dest) {
        moves.push({ r: nr, c: nc });
        return true; // continue sliding
      } else if (dest.color !== piece.color) {
        moves.push({ r: nr, c: nc });
        return false; // capture, stop slide
      }
      return false; // friendly piece, stop
    };

    if (piece.type === 'p') {
      const dir = piece.color === 'w' ? -1 : 1;
      const startRow = piece.color === 'w' ? 6 : 1;

      // Single step forward
      if (r + dir >= 0 && r + dir < 8 && !b[r + dir][c]) {
        moves.push({ r: r + dir, c });
        // Initial double step
        if (r === startRow && !b[r + dir * 2][c]) {
          moves.push({ r: r + dir * 2, c });
        }
      }

      // Diagonal captures
      for (const dc of [-1, 1]) {
        const nr = r + dir;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr][nc] && b[nr][nc]!.color !== piece.color) {
          moves.push({ r: nr, c: nc });
        }
      }
    } else if (piece.type === 'n') {
      const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of offsets) addMove(r + dr, c + dc);
    } else if (piece.type === 'b') {
      for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        let step = 1;
        while (addMove(r + dr * step, c + dc * step)) step++;
      }
    } else if (piece.type === 'r') {
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        let step = 1;
        while (addMove(r + dr * step, c + dc * step)) step++;
      }
    } else if (piece.type === 'q') {
      for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]) {
        let step = 1;
        while (addMove(r + dr * step, c + dc * step)) step++;
      }
    } else if (piece.type === 'k') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) addMove(r + dr, c + dc);
        }
      }
    }

    return moves;
  };

  const handleCellClick = (r: number, c: number) => {
    if (!isPlayerTurn || isGameOver || isVictory) return;

    const clickedPiece = board[r][c];

    // Select White piece
    if (clickedPiece && clickedPiece.color === 'w') {
      sound.playClick();
      setSelected({ r, c });
      setValidMoves(getLegalMoves(board, r, c));
      return;
    }

    // Move to square
    if (selected) {
      const move = validMoves.find((m) => m.r === r && m.c === c);
      if (move) {
        sound.playScore();
        const nextBoard = board.map((row) => [...row]);
        const moving = nextBoard[selected.r][selected.c]!;
        const dest = nextBoard[move.r][move.c];

        // Pawn promotion to Queen
        if (moving.type === 'p' && move.r === 0) {
          moving.type = 'q';
        }

        // Captured opponent king = checkmate victory
        if (dest?.type === 'k') {
          nextBoard[move.r][move.c] = moving;
          nextBoard[selected.r][selected.c] = null;
          setBoard(nextBoard);
          setIsVictory(true);
          setScore((s) => s + 1000);
          return;
        }

        if (dest) {
          sound.playHit();
          setScore((s) => s + 100);
        }

        nextBoard[move.r][move.c] = moving;
        nextBoard[selected.r][selected.c] = null;
        setBoard(nextBoard);
        setSelected(null);
        setValidMoves([]);

        // AI's Turn
        setIsPlayerTurn(false);
        setTimeout(() => {
          makeAIMove(nextBoard);
        }, 500);
      }
    }
  };

  const makeAIMove = (currentBoard: ChessBoard) => {
    const allBlackMoves: { from: { r: number; c: number }; to: { r: number; c: number }; captureValue: number }[] = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (currentBoard[r][c]?.color === 'b') {
          const m = getLegalMoves(currentBoard, r, c);
          m.forEach((dest) => {
            const target = currentBoard[dest.r][dest.c];
            let val = 0;
            if (target?.type === 'q') val = 9;
            else if (target?.type === 'r') val = 5;
            else if (target?.type === 'b' || target?.type === 'n') val = 3;
            else if (target?.type === 'p') val = 1;
            else if (target?.type === 'k') val = 100;
            allBlackMoves.push({ from: { r, c }, to: dest, captureValue: val });
          });
        }
      }
    }

    if (allBlackMoves.length === 0) {
      setIsVictory(true);
      return;
    }

    // Sort by best capture
    allBlackMoves.sort((a, b) => b.captureValue - a.captureValue);
    const chosen = allBlackMoves[0];

    const nextBoard = currentBoard.map((row) => [...row]);
    const moving = nextBoard[chosen.from.r][chosen.from.c]!;
    const dest = nextBoard[chosen.to.r][chosen.to.c];

    if (moving.type === 'p' && chosen.to.r === 7) moving.type = 'q';

    if (dest?.type === 'k') {
      nextBoard[chosen.to.r][chosen.to.c] = moving;
      nextBoard[chosen.from.r][chosen.from.c] = null;
      setBoard(nextBoard);
      setIsGameOver(true);
      return;
    }

    nextBoard[chosen.to.r][chosen.to.c] = moving;
    nextBoard[chosen.from.r][chosen.from.c] = null;
    sound.playClick();
    setBoard(nextBoard);
    setIsPlayerTurn(true);
  };

  const restartGame = () => {
    setBoard(initChessBoard());
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
          <span className="text-cyan-400 font-bold">Kamu: Putih ♔</span>
          <span className="text-slate-400 font-bold">Lawan: Hitam ♚ (AI)</span>
        </div>

        {/* 8x8 Chess Board */}
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
                  className={`w-full h-full flex items-center justify-center relative font-serif text-2xl sm:text-3xl transition-all ${
                    isDark ? 'bg-[#131d36]' : 'bg-[#222f4e]'
                  } ${isSel ? 'ring-2 ring-cyan-400' : ''}`}
                >
                  {isValid && (
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80 animate-ping absolute" />
                  )}

                  {cell && (
                    <span
                      className={`select-none ${
                        cell.color === 'w' ? 'text-cyan-300 drop-shadow' : 'text-rose-400 drop-shadow'
                      }`}
                    >
                      {PIECE_SYMBOLS[cell.color][cell.type]}
                    </span>
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
