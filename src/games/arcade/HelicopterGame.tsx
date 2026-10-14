import React, { useState, useEffect, useRef } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface HelicopterProps {
  game: GameMetadata;
  onBack: () => void;
}

interface TerrainSlice {
  top: number;
  bottom: number;
}

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const HelicopterGame: React.FC<HelicopterProps> = ({ game, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const stateRef = useRef({
    heliY: 180,
    heliVy: 0,
    isAscending: false,
    terrain: [] as TerrainSlice[],
    obstacles: [] as Obstacle[],
    frameCount: 0,
    speed: 3,
  });

  const initGame = () => {
    const terrain: TerrainSlice[] = [];
    for (let i = 0; i < 60; i++) {
      terrain.push({ top: 40, bottom: 40 });
    }
    stateRef.current.heliY = 180;
    stateRef.current.heliVy = 0;
    stateRef.current.isAscending = false;
    stateRef.current.terrain = terrain;
    stateRef.current.obstacles = [];
    stateRef.current.frameCount = 0;
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (isGameOver || isVictory) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const s = stateRef.current;
      s.frameCount++;

      // Physics: Hold to ascend, release to descend
      if (s.isAscending) {
        s.heliVy -= 0.42;
      } else {
        s.heliVy += 0.38;
      }
      s.heliVy = Math.max(-6, Math.min(6, s.heliVy));
      s.heliY += s.heliVy;

      // Distance score
      if (s.frameCount % 8 === 0) {
        setScore((sc) => sc + 1);
      }

      // Shift terrain left & generate new right slice
      if (s.frameCount % 2 === 0) {
        s.terrain.shift();
        const last = s.terrain[s.terrain.length - 1];
        const newTop = Math.max(30, Math.min(130, last.top + (Math.random() - 0.5) * 12));
        const newBottom = Math.max(30, Math.min(130, last.bottom + (Math.random() - 0.5) * 12));
        s.terrain.push({ top: newTop, bottom: newBottom });
      }

      // Spawn Pillars inside tunnel
      if (s.frameCount % 100 === 0) {
        s.obstacles.push({
          x: canvas.width,
          y: Math.random() * (canvas.height - 200) + 100,
          w: 24,
          h: 50,
        });
      }

      // Move & check obstacles
      const heliX = 70;
      const heliR = 12;

      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const obs = s.obstacles[i];
        obs.x -= s.speed;

        // Collision with pillar
        if (
          heliX + heliR > obs.x &&
          heliX - heliR < obs.x + obs.w &&
          s.heliY + heliR > obs.y &&
          s.heliY - heliR < obs.y + obs.h
        ) {
          sound.playHit();
          setIsGameOver(true);
        }

        if (obs.x < -30) s.obstacles.splice(i, 1);
      }

      // Terrain Collision at heliX (index ~12)
      const currentSlice = s.terrain[12] || { top: 40, bottom: 40 };
      if (s.heliY - heliR <= currentSlice.top || s.heliY + heliR >= canvas.height - currentSlice.bottom) {
        sound.playHit();
        setIsGameOver(true);
      }

      // Render
      ctx.fillStyle = '#060a16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Terrain
      const sliceW = canvas.width / (s.terrain.length - 1);
      ctx.fillStyle = '#1e293b';

      // Top Ceiling
      ctx.beginPath();
      ctx.moveTo(0, 0);
      s.terrain.forEach((sl, idx) => {
        ctx.lineTo(idx * sliceW, sl.top);
      });
      ctx.lineTo(canvas.width, 0);
      ctx.closePath();
      ctx.fill();

      // Bottom Floor
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      s.terrain.forEach((sl, idx) => {
        ctx.lineTo(idx * sliceW, canvas.height - sl.bottom);
      });
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Render Pillars
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      for (const obs of s.obstacles) {
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      }
      ctx.shadowBlur = 0;

      // Render Helicopter
      ctx.save();
      ctx.translate(heliX, s.heliY);
      ctx.rotate(s.heliVy * 0.05);

      // Heli Body
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-14, -8, 28, 16, 6);
      ctx.fill();

      // Tail
      ctx.fillStyle = '#059669';
      ctx.fillRect(-22, -3, 10, 6);
      ctx.fillRect(-24, -9, 4, 12);

      // Rotor blades spinning
      ctx.fillStyle = '#ffffff';
      const rotorW = (s.frameCount % 4) * 8 - 12;
      ctx.fillRect(-16, -11, 32, 2);
      ctx.fillRect(rotorW, -11, 8, 2);
      ctx.shadowBlur = 0;

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isVictory]);

  const restartGame = () => {
    initGame();
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
      <div
        onPointerDown={() => {
          stateRef.current.isAscending = true;
          sound.playJump();
        }}
        onPointerUp={() => {
          stateRef.current.isAscending = false;
        }}
        onPointerLeave={() => {
          stateRef.current.isAscending = false;
        }}
        className="w-full max-w-sm flex flex-col items-center select-none cursor-pointer"
      >
        <p className="text-xs text-slate-400 mb-2">Tahan layar untuk terbang naik • Lepas untuk turun</p>
        <canvas
          ref={canvasRef}
          width={360}
          height={380}
          className="w-full aspect-[360/380] rounded-2xl border-2 border-slate-700 shadow-2xl touch-none"
        />
      </div>
    </GameShell>
  );
};
