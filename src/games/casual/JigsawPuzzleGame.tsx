import React, { useState } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface JigsawProps {
  game: GameMetadata;
  onBack: () => void;
}

// 3x3 Grid of artwork tiles with colorful geometric motifs
const TILE_MOTIFS = ['🌌', '⚡', '🪐', '🚀', '⭐', '👾', '🌈', '💎', '🔥'];

export const JigsawPuzzleGame: React.FC<JigsawProps> = ({ game, onBack }) => {
  const [tiles, setTiles] = useState<number[]>(() => shuffleTiles());
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  function shuffleTiles(): number[] {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const handleTileClick = (idx: number) => {
    if (isVictory || isGameOver) return;

    if (selectedIdx === null) {
      sound.playClick();
      setSelectedIdx(idx);
    } else {
      if (selectedIdx === idx) {
        setSelectedIdx(null);
        return;
      }

      // Swap the two tiles
      sound.playScore();
      const nextTiles = [...tiles];
      [nextTiles[selectedIdx], nextTiles[idx]] = [nextTiles[idx], nextTiles[selectedIdx]];
      setTiles(nextTiles);
      setSelectedIdx(null);
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      // Check if solved (0 to 8 in order)
      if (nextTiles.every((val, i) => val === i)) {
        setIsVictory(true);
        const pts = Math.max(100, 1000 - nextMoves * 25);
        setScore(pts);
      }
    }
  };

  const restartGame = () => {
    setTiles(shuffleTiles());
    setSelectedIdx(null);
    setMoves(0);
    setScore(0);
    setIsGameOver(false);
    setIsVictory(false);
  };

  return (
    <GameShell
      game={game}
      onBack={onBack}
      score={score}
      moves={moves}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        <p className="text-xs text-slate-400 mb-3 text-center">
          Ketuk dua potongan untuk menukar posisinya hingga urut 1 sampai 9!
        </p>

        {/* 3x3 Jigsaw Grid */}
        <div className="w-full aspect-square bg-[#0c1122] p-3 rounded-3xl border-2 border-slate-700 shadow-2xl grid grid-cols-3 grid-rows-3 gap-2.5">
          {tiles.map((val, idx) => {
            const isCorrect = val === idx;
            const isSelected = selectedIdx === idx;

            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                className={`w-full h-full rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${
                  isSelected
                    ? 'border-cyan-400 ring-4 ring-cyan-500/40 scale-102 bg-slate-800'
                    : isCorrect
                    ? 'border-emerald-500/80 bg-emerald-950/40 text-white'
                    : 'border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-300'
                }`}
              >
                <span className="text-3xl sm:text-4xl">{TILE_MOTIFS[val]}</span>
                <span className="font-arcade text-xs text-slate-400 mt-1">#{val + 1}</span>
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
};
