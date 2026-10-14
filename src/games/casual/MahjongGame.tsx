import React, { useState } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface MahjongProps {
  game: GameMetadata;
  onBack: () => void;
}

interface Tile {
  id: number;
  symbol: string;
  layer: number; // 0: base, 1: elevated
  row: number;
  col: number;
  isRemoved: boolean;
}

const SYMBOLS = ['🀀', '🀁', '🀂', '🀃', '🀄', '🀅', '🀆', '🀇', '🀈', '🀉', '🀊', '🀋'];

export const MahjongGame: React.FC<MahjongProps> = ({ game, onBack }) => {
  const [tiles, setTiles] = useState<Tile[]>(() => generateMahjongLayout());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  function generateMahjongLayout(): Tile[] {
    const list: Tile[] = [];
    let id = 0;

    // We generate 24 tiles (12 pairs)
    const pairSymbols = [...SYMBOLS, ...SYMBOLS];
    // Shuffle symbols
    for (let i = pairSymbols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairSymbols[i], pairSymbols[j]] = [pairSymbols[j], pairSymbols[i]];
    }

    // Base Layer: 4 rows x 5 cols (20 tiles)
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        if (id < 20) {
          list.push({
            id: id++,
            symbol: pairSymbols[id - 1],
            layer: 0,
            row: r,
            col: c,
            isRemoved: false,
          });
        }
      }
    }

    // Top Layer: 2 rows x 2 cols in center (4 tiles)
    for (let r = 1; r <= 2; r++) {
      for (let c = 1; c <= 2; c++) {
        if (id < 24) {
          list.push({
            id: id++,
            symbol: pairSymbols[id - 1],
            layer: 1,
            row: r,
            col: c,
            isRemoved: false,
          });
        }
      }
    }

    return list;
  }

  // Check if tile is free (no tile on top of it, and left or right side is open)
  const isTileFree = (tile: Tile): boolean => {
    if (tile.isRemoved) return false;

    // Check if covered from top layer
    if (tile.layer === 0) {
      const covered = tiles.some(
        (t) =>
          !t.isRemoved &&
          t.layer === 1 &&
          Math.abs(t.row - tile.row) <= 0 &&
          Math.abs(t.col - tile.col) <= 0
      );
      if (covered) return false;
    }

    // Check left & right neighbors in same layer
    const hasLeft = tiles.some(
      (t) => !t.isRemoved && t.layer === tile.layer && t.row === tile.row && t.col === tile.col - 1
    );
    const hasRight = tiles.some(
      (t) => !t.isRemoved && t.layer === tile.layer && t.row === tile.row && t.col === tile.col + 1
    );

    return !hasLeft || !hasRight;
  };

  const handleTileClick = (tile: Tile) => {
    if (tile.isRemoved || isVictory || isGameOver) return;
    if (!isTileFree(tile)) {
      sound.playHit();
      return;
    }

    if (selectedId === null) {
      sound.playClick();
      setSelectedId(tile.id);
    } else {
      if (selectedId === tile.id) {
        setSelectedId(null);
        return;
      }

      const firstTile = tiles.find((t) => t.id === selectedId);
      if (!firstTile) return;

      if (firstTile.symbol === tile.symbol) {
        // Matched pair!
        sound.playScore();
        const nextTiles = tiles.map((t) =>
          t.id === tile.id || t.id === firstTile.id ? { ...t, isRemoved: true } : t
        );
        setTiles(nextTiles);
        setSelectedId(null);
        setScore((s) => s + 80);

        if (nextTiles.every((t) => t.isRemoved)) {
          setIsVictory(true);
          setScore((s) => s + 500);
        }
      } else {
        sound.playHit();
        setSelectedId(null);
      }
    }
  };

  const restartGame = () => {
    setTiles(generateMahjongLayout());
    setSelectedId(null);
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
        <p className="text-xs text-slate-400 mb-3 text-center">
          Pilih ubin bebas (sisi kiri atau kanan terbuka dan tidak tertumpuk) yang bersimbol sama.
        </p>

        {/* Mahjong Pyramidal Board Container */}
        <div className="w-full aspect-[5/4] bg-[#0c1424] p-3 rounded-3xl border-2 border-slate-700 shadow-2xl relative flex items-center justify-center">
          {tiles.map((tile) => {
            if (tile.isRemoved) return null;
            const free = isTileFree(tile);
            const isSelected = selectedId === tile.id;

            // Positioning
            const leftPct = 12 + tile.col * 16 + (tile.layer === 1 ? 2 : 0);
            const topPct = 10 + tile.row * 20 - (tile.layer === 1 ? 4 : 0);

            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                className={`absolute w-12 h-16 rounded-xl flex items-center justify-center font-bold text-2xl sm:text-3xl transition-all border-2 ${
                  isSelected
                    ? 'bg-cyan-400 text-slate-950 border-white ring-4 ring-cyan-400 shadow-xl z-30 scale-105'
                    : free
                    ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-lg hover:scale-102 z-10'
                    : 'bg-slate-700/60 text-slate-400 border-slate-600 opacity-60 z-0'
                }`}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  boxShadow: tile.layer === 1 ? '0 10px 20px rgba(0,0,0,0.6)' : '0 4px 10px rgba(0,0,0,0.4)',
                }}
              >
                {tile.symbol}
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
};
