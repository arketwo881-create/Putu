import React, { useState } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { RotateCcw } from 'lucide-react';

interface ColorSortProps {
  game: GameMetadata;
  onBack: () => void;
}

type Tube = string[];

const COLORS = {
  R: 'bg-rose-500 shadow-rose-500/50',
  B: 'bg-cyan-500 shadow-cyan-500/50',
  G: 'bg-emerald-500 shadow-emerald-500/50',
  Y: 'bg-amber-400 shadow-amber-400/50',
  P: 'bg-purple-500 shadow-purple-500/50',
};

const TUBE_CAPACITY = 4;

export const ColorSortGame: React.FC<ColorSortProps> = ({ game, onBack }) => {
  // 5 colored tubes + 2 empty tubes
  const [tubes, setTubes] = useState<Tube[]>(() => generateLevel());
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  function generateLevel(): Tube[] {
    return [
      ['R', 'B', 'G', 'Y'],
      ['B', 'R', 'Y', 'G'],
      ['G', 'Y', 'R', 'B'],
      ['Y', 'G', 'B', 'R'],
      [],
      [],
    ];
  }

  const handleTubeClick = (index: number) => {
    if (isVictory || isGameOver) return;

    if (selectedTube === null) {
      if (tubes[index].length === 0) return;
      sound.playClick();
      setSelectedTube(index);
    } else {
      if (selectedTube === index) {
        // Deselect
        sound.playClick();
        setSelectedTube(null);
        return;
      }

      // Try pouring from selectedTube to index
      const src = tubes[selectedTube];
      const dest = tubes[index];

      if (dest.length >= TUBE_CAPACITY) {
        sound.playHit();
        setSelectedTube(null);
        return;
      }

      const topSrcColor = src[src.length - 1];
      const topDestColor = dest.length > 0 ? dest[dest.length - 1] : null;

      if (topDestColor === null || topDestColor === topSrcColor) {
        // Legal pour
        sound.playPop();
        const nextTubes = tubes.map((t) => [...t]);
        const poured = nextTubes[selectedTube].pop()!;
        nextTubes[index].push(poured);

        setTubes(nextTubes);
        setMoves((m) => m + 1);
        setSelectedTube(null);

        // Check if won: Every non-empty tube must have 4 of the exact same color
        const won = nextTubes.every(
          (t) => t.length === 0 || (t.length === TUBE_CAPACITY && t.every((c) => c === t[0]))
        );

        if (won) {
          setIsVictory(true);
          const points = Math.max(100, 1000 - moves * 20);
          setScore(points);
        }
      } else {
        sound.playHit();
        setSelectedTube(null);
      }
    }
  };

  const restartGame = () => {
    setTubes(generateLevel());
    setSelectedTube(null);
    setMoves(0);
    setScore(0);
    setIsVictory(false);
    setIsGameOver(false);
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
        <p className="text-xs text-slate-400 mb-6 text-center">
          Ketuk tabung asal untuk mengambil warna atas, lalu ketuk tabung tujuan untuk menuang.
        </p>

        {/* Tubes Display */}
        <div className="grid grid-cols-3 gap-6 sm:gap-8 justify-items-center mb-8">
          {tubes.map((tube, idx) => {
            const isSelected = selectedTube === idx;
            return (
              <button
                key={idx}
                onClick={() => handleTubeClick(idx)}
                className={`w-16 h-48 rounded-b-3xl border-2 border-t-0 p-1 flex flex-col-reverse items-center gap-1 transition-all relative ${
                  isSelected
                    ? 'border-cyan-400 -translate-y-3 ring-4 ring-cyan-500/30'
                    : 'border-slate-600/80 hover:border-slate-500'
                } bg-slate-900/60 backdrop-blur-sm`}
              >
                {/* Lip of tube */}
                <div
                  className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-18 h-3 rounded-full border-2 ${
                    isSelected ? 'border-cyan-400 bg-cyan-950' : 'border-slate-600 bg-slate-800'
                  }`}
                />

                {/* Liquid Layers */}
                {tube.map((color, cIdx) => (
                  <div
                    key={cIdx}
                    className={`w-full h-10 rounded-xl transition-all shadow-inner ${
                      COLORS[color as keyof typeof COLORS]
                    }`}
                  />
                ))}
              </button>
            );
          })}
        </div>

        {selectedTube !== null && (
          <button
            onClick={() => setSelectedTube(null)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Batalkan Pilihan
          </button>
        )}
      </div>
    </GameShell>
  );
};
