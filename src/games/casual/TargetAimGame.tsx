import React, { useState, useEffect, useRef } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface TargetAimProps {
  game: GameMetadata;
  onBack: () => void;
}

interface Target {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  maxR: number;
  life: number;
}

export const TargetAimGame: React.FC<TargetAimProps> = ({ game, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hits, setHits] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const stateRef = useRef({
    targets: [] as Target[],
    frameCount: 0,
  });

  // 30s Game Timer
  useEffect(() => {
    if (isGameOver || isVictory) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsVictory(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver, isVictory]);

  // Main Render & Spawn Loop
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

      // Maintain 2-3 targets on screen
      if (s.targets.length < 3 && s.frameCount % 20 === 0) {
        s.targets.push({
          id: Math.random(),
          x: Math.random() * (canvas.width - 80) + 40,
          y: Math.random() * (canvas.height - 80) + 40,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5,
          r: 32,
          maxR: 32,
          life: 180, // ~3 seconds
        });
      }

      // Update Targets
      for (let i = s.targets.length - 1; i >= 0; i--) {
        const tg = s.targets[i];
        tg.x += tg.vx;
        tg.y += tg.vy;
        tg.life--;

        // Bounce on boundary
        if (tg.x - tg.r < 0 || tg.x + tg.r > canvas.width) tg.vx = -tg.vx;
        if (tg.y - tg.r < 0 || tg.y + tg.r > canvas.height) tg.vy = -tg.vy;

        // Shrink slightly over lifetime
        tg.r = Math.max(16, (tg.life / 180) * tg.maxR);

        if (tg.life <= 0) {
          s.targets.splice(i, 1);
        }
      }

      // Render
      ctx.fillStyle = '#080c18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Crosshair Grid
      ctx.strokeStyle = '#141c30';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Render Bullseye Targets
      for (const tg of s.targets) {
        // Outer ring (Red)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(tg.x, tg.y, tg.r, 0, Math.PI * 2);
        ctx.fill();

        // Middle ring (White)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(tg.x, tg.y, tg.r * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // Bullseye Center (Red)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(tg.x, tg.y, tg.r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isVictory]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isGameOver || isVictory) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const s = stateRef.current;
    let hit = false;

    for (let i = s.targets.length - 1; i >= 0; i--) {
      const tg = s.targets[i];
      const dist = Math.hypot(clickX - tg.x, clickY - tg.y);

      if (dist <= tg.r) {
        hit = true;
        s.targets.splice(i, 1);
        setHits((h) => h + 1);

        // Score based on how close to center
        if (dist <= tg.r * 0.35) {
          sound.playScore(); // Bullseye!
          setScore((sc) => sc + 150);
        } else if (dist <= tg.r * 0.65) {
          sound.playPop();
          setScore((sc) => sc + 80);
        } else {
          sound.playPop();
          setScore((sc) => sc + 40);
        }
        break;
      }
    }

    if (!hit) {
      sound.playHit();
    }
  };

  const restartGame = () => {
    stateRef.current.targets = [];
    stateRef.current.frameCount = 0;
    setScore(0);
    setTimeLeft(30);
    setHits(0);
    setIsGameOver(false);
    setIsVictory(false);
  };

  return (
    <GameShell
      game={game}
      onBack={onBack}
      score={score}
      timeRemaining={timeLeft}
      moves={hits}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        <p className="text-xs text-slate-400 mb-2">Ketuk tepat di pusat sasaran merah untuk skor maksimal!</p>
        <canvas
          ref={canvasRef}
          width={360}
          height={380}
          onPointerDown={handlePointerDown}
          className="w-full aspect-[360/380] rounded-2xl border-2 border-slate-700 shadow-2xl touch-none cursor-crosshair"
        />
      </div>
    </GameShell>
  );
};
