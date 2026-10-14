import React, { useState, useEffect, useRef } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface RhythmTapProps {
  game: GameMetadata;
  onBack: () => void;
}

interface Note {
  id: number;
  lane: number; // 0, 1, 2, 3
  y: number;
  hit: boolean;
}

export const RhythmTapGame: React.FC<RhythmTapProps> = ({ game, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastRating, setLastRating] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const stateRef = useRef({
    notes: [] as Note[],
    speed: 4.8,
    frameCount: 0,
    misses: 0,
  });

  const LANE_COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#f59e0b'];

  const handleTapLane = (laneIndex: number) => {
    if (isGameOver || isVictory) return;
    const s = stateRef.current;
    const targetY = 320; // Hit line position

    // Find closest note in this lane
    const candidate = s.notes.find(
      (n) => n.lane === laneIndex && !n.hit && Math.abs(n.y - targetY) < 55
    );

    if (candidate) {
      candidate.hit = true;
      const diff = Math.abs(candidate.y - targetY);

      if (diff < 18) {
        sound.playScore();
        setLastRating('PERFECT!');
        setScore((sc) => sc + 100);
        setCombo((c) => c + 1);
      } else {
        sound.playPop();
        setLastRating('GOOD');
        setScore((sc) => sc + 50);
        setCombo((c) => c + 1);
      }
    } else {
      sound.playHit();
      setLastRating('MISS');
      setCombo(0);
    }
  };

  useEffect(() => {
    if (isGameOver || isVictory) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const laneW = canvas.width / 4;

    const loop = () => {
      const s = stateRef.current;
      s.frameCount++;

      // Spawn Notes
      if (s.frameCount % 28 === 0) {
        s.notes.push({
          id: Math.random(),
          lane: Math.floor(Math.random() * 4),
          y: -20,
          hit: false,
        });
      }

      // Update Notes
      for (let i = s.notes.length - 1; i >= 0; i--) {
        const n = s.notes[i];
        n.y += s.speed;

        // Note passed without being tapped
        if (!n.hit && n.y > 355) {
          n.hit = true;
          s.misses++;
          setCombo(0);
          setLastRating('MISS');
          sound.playHit();

          if (s.misses >= 5) {
            setIsGameOver(true);
          }
        }

        // Remove offscreen
        if (n.y > canvas.height + 20) {
          s.notes.splice(i, 1);
        }
      }

      // Render Track & Lanes
      ctx.fillStyle = '#060a16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Lane dividers
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(i * laneW, 0);
        ctx.lineTo(i * laneW, canvas.height);
        ctx.stroke();
      }

      // Target Hit Line
      ctx.strokeStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 320);
      ctx.lineTo(canvas.width, 320);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Render Notes
      for (const n of s.notes) {
        if (n.hit) continue;
        const color = LANE_COLORS[n.lane];
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(n.lane * laneW + 8, n.y - 12, laneW - 16, 24, 8);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isVictory]);

  const restartGame = () => {
    stateRef.current.notes = [];
    stateRef.current.frameCount = 0;
    stateRef.current.misses = 0;
    setScore(0);
    setCombo(0);
    setLastRating(null);
    setIsGameOver(false);
    setIsVictory(false);
  };

  return (
    <GameShell
      game={game}
      onBack={onBack}
      score={score}
      moves={combo}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        {/* Rating feedback */}
        <div className="h-6 mb-2 flex items-center justify-center">
          {lastRating && (
            <span
              className={`font-arcade font-bold text-sm tracking-wider ${
                lastRating === 'PERFECT!'
                  ? 'text-cyan-300'
                  : lastRating === 'GOOD'
                  ? 'text-emerald-400'
                  : 'text-rose-500'
              }`}
            >
              {lastRating} (Combo: {combo}x)
            </span>
          )}
        </div>

        {/* 4 Lanes Canvas */}
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="w-full aspect-square rounded-2xl border-2 border-slate-700 shadow-2xl"
        />

        {/* 4 Touch Hit Buttons */}
        <div className="grid grid-cols-4 gap-2 w-full mt-3">
          {[0, 1, 2, 3].map((lane) => (
            <button
              key={lane}
              onClick={() => handleTapLane(lane)}
              className="py-4 rounded-xl active:scale-90 transition-all font-arcade font-black text-white text-lg border shadow-lg flex items-center justify-center"
              style={{
                backgroundColor: LANE_COLORS[lane] + '33',
                borderColor: LANE_COLORS[lane],
              }}
            >
              {lane + 1}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
};
