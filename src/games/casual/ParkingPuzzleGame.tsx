import React, { useState } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { ArrowRight } from 'lucide-react';

interface ParkingProps {
  game: GameMetadata;
  onBack: () => void;
}

interface Vehicle {
  id: string;
  r: number;
  c: number;
  len: number;
  dir: 'h' | 'v';
  isTarget: boolean;
  color: string;
}

const GRID_SIZE = 6;

const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'red', r: 2, c: 1, len: 2, dir: 'h', isTarget: true, color: 'bg-rose-500' },
  { id: 'v1', r: 0, c: 0, len: 2, dir: 'v', isTarget: false, color: 'bg-blue-600' },
  { id: 'v2', r: 0, c: 3, len: 3, dir: 'v', isTarget: false, color: 'bg-indigo-600' },
  { id: 'h1', r: 3, c: 1, len: 2, dir: 'h', isTarget: false, color: 'bg-emerald-600' },
  { id: 'h2', r: 5, c: 2, len: 3, dir: 'h', isTarget: false, color: 'bg-amber-600' },
  { id: 'v3', r: 2, c: 4, len: 2, dir: 'v', isTarget: false, color: 'bg-purple-600' },
  { id: 'v4', r: 1, c: 5, len: 3, dir: 'v', isTarget: false, color: 'bg-cyan-600' },
];

export const ParkingPuzzleGame: React.FC<ParkingProps> = ({ game, onBack }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    INITIAL_VEHICLES.map((v) => ({ ...v }))
  );
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Build 6x6 occupancy map
  const getOccupancyMap = (currentVehicles: Vehicle[], excludeId?: string) => {
    const grid: (string | null)[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null));

    currentVehicles.forEach((v) => {
      if (v.id === excludeId) return;
      for (let i = 0; i < v.len; i++) {
        const vr = v.dir === 'v' ? v.r + i : v.r;
        const vc = v.dir === 'h' ? v.c + i : v.c;
        if (vr >= 0 && vr < GRID_SIZE && vc >= 0 && vc < GRID_SIZE) {
          grid[vr][vc] = v.id;
        }
      }
    });

    return grid;
  };

  const handleSlide = (delta: number) => {
    if (!selectedVehicle || isVictory || isGameOver) return;
    const v = vehicles.find((veh) => veh.id === selectedVehicle);
    if (!v) return;

    const occ = getOccupancyMap(vehicles, v.id);

    if (v.dir === 'h') {
      const nextC = v.c + delta;
      // Bounds check
      if (nextC < 0 || nextC + v.len > GRID_SIZE) {
        // Red car reaching exit at row 2, col 4 -> 5 -> exit
        if (v.isTarget && delta > 0 && v.c + v.len === GRID_SIZE) {
          sound.playWin();
          setIsVictory(true);
          const pts = Math.max(100, 1000 - moves * 20);
          setScore(pts);
          return;
        }
        return;
      }
      // Collision check
      for (let i = 0; i < v.len; i++) {
        if (occ[v.r][nextC + i] !== null) return;
      }

      sound.playClick();
      setVehicles((prev) =>
        prev.map((veh) => (veh.id === v.id ? { ...veh, c: nextC } : veh))
      );
      setMoves((m) => m + 1);

      if (v.isTarget && nextC + v.len === GRID_SIZE) {
        sound.playWin();
        setIsVictory(true);
        setScore(800);
      }
    } else {
      const nextR = v.r + delta;
      if (nextR < 0 || nextR + v.len > GRID_SIZE) return;
      for (let i = 0; i < v.len; i++) {
        if (occ[nextR + i][v.c] !== null) return;
      }

      sound.playClick();
      setVehicles((prev) =>
        prev.map((veh) => (veh.id === v.id ? { ...veh, r: nextR } : veh))
      );
      setMoves((m) => m + 1);
    }
  };

  const restartGame = () => {
    setVehicles(INITIAL_VEHICLES.map((v) => ({ ...v })));
    setSelectedVehicle(null);
    setMoves(0);
    setScore(0);
    setIsGameOver(false);
    setIsVictory(false);
  };

  const sel = vehicles.find((v) => v.id === selectedVehicle);

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
        <p className="text-xs text-slate-400 mb-2 text-center">
          Pilih mobil lalu tekan tombol geser untuk meloloskan mobil merah ke gerbang keluar!
        </p>

        {/* 6x6 Parking Lot with Exit on right */}
        <div className="relative w-full aspect-square bg-[#0c1220] p-2.5 rounded-3xl border-4 border-slate-700 shadow-2xl">
          {/* Exit Gate on right row 2 */}
          <div
            className="absolute -right-3 top-[34%] -translate-y-1/2 w-4 h-12 bg-rose-500 rounded-r-lg flex items-center justify-center text-white shadow-lg shadow-rose-500/50"
            title="Pintu Keluar"
          >
            <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
          </div>

          {/* Grid lines */}
          <div className="w-full h-full grid grid-cols-6 grid-rows-6 gap-1 relative">
            {Array(GRID_SIZE * GRID_SIZE).fill(0).map((_, idx) => (
              <div key={idx} className="rounded-lg bg-slate-900/60 border border-slate-800/80" />
            ))}

            {/* Vehicles Layer */}
            {vehicles.map((v) => {
              const isSelected = selectedVehicle === v.id;
              const leftPct = (v.c / GRID_SIZE) * 100;
              const topPct = (v.r / GRID_SIZE) * 100;
              const widthPct = v.dir === 'h' ? (v.len / GRID_SIZE) * 100 : (1 / GRID_SIZE) * 100;
              const heightPct = v.dir === 'v' ? (v.len / GRID_SIZE) * 100 : (1 / GRID_SIZE) * 100;

              return (
                <button
                  key={v.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedVehicle(v.id);
                  }}
                  className={`absolute rounded-xl transition-all flex items-center justify-center p-1 font-bold text-xs ${
                    v.color
                  } ${
                    isSelected
                      ? 'ring-4 ring-white shadow-xl scale-102 z-20'
                      : 'hover:opacity-90 shadow-md'
                  }`}
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `calc(${widthPct}% - 4px)`,
                    height: `calc(${heightPct}% - 4px)`,
                    margin: '2px',
                  }}
                >
                  <span className="text-white drop-shadow font-arcade">
                    {v.isTarget ? '🚗 MERAH' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slide Controls */}
        <div className="mt-4 flex gap-3 w-full">
          {sel?.dir === 'h' ? (
            <>
              <button
                onClick={() => handleSlide(-1)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-400 font-bold rounded-xl border border-slate-700 text-sm"
              >
                ◀ Geser Kiri
              </button>
              <button
                onClick={() => handleSlide(1)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-400 font-bold rounded-xl border border-slate-700 text-sm"
              >
                Geser Kanan ▶
              </button>
            </>
          ) : sel?.dir === 'v' ? (
            <>
              <button
                onClick={() => handleSlide(-1)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-400 font-bold rounded-xl border border-slate-700 text-sm"
              >
                ▲ Geser Naik
              </button>
              <button
                onClick={() => handleSlide(1)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-400 font-bold rounded-xl border border-slate-700 text-sm"
              >
                ▼ Geser Turun
              </button>
            </>
          ) : (
            <div className="w-full py-3 bg-slate-900/50 rounded-xl text-center text-slate-500 text-xs">
              Ketuk kendaraan terlebih dahulu
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
};
