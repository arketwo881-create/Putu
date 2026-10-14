import React, { useState, useEffect, useRef } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { Heart } from 'lucide-react';

interface BrickBreakerProps {
  game: GameMetadata;
  onBack: () => void;
}

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  points: number;
  isAlive: boolean;
}

export const BrickBreakerGame: React.FC<BrickBreakerProps> = ({ game, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Game state stored in refs for 60fps smooth loop
  const stateRef = useRef({
    paddleX: 140,
    paddleW: 80,
    paddleH: 12,
    ballX: 180,
    ballY: 280,
    ballVx: 3.5,
    ballVy: -3.5,
    ballR: 6,
    bricks: [] as Brick[],
  });

  const initBricks = () => {
    const bricks: Brick[] = [];
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#a855f7'];
    const rows = 5;
    const cols = 6;
    const bw = 50;
    const bh = 16;
    const padding = 8;
    const offsetTop = 40;
    const offsetLeft = 12;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: offsetLeft + c * (bw + padding),
          y: offsetTop + r * (bh + padding),
          w: bw,
          h: bh,
          color: colors[r],
          points: (rows - r) * 20,
          isAlive: true,
        });
      }
    }
    stateRef.current.bricks = bricks;
  };

  useEffect(() => {
    initBricks();
  }, []);

  // Main 60FPS Game Loop
  useEffect(() => {
    if (isGameOver || isVictory) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const s = stateRef.current;

      // Update ball position
      s.ballX += s.ballVx;
      s.ballY += s.ballVy;

      // Left & Right Wall bounce
      if (s.ballX - s.ballR <= 0 || s.ballX + s.ballR >= canvas.width) {
        s.ballVx = -s.ballVx;
        sound.playPop();
      }

      // Top Wall bounce
      if (s.ballY - s.ballR <= 0) {
        s.ballVy = -s.ballVy;
        sound.playPop();
      }

      // Bottom Wall (Life Lost)
      if (s.ballY + s.ballR >= canvas.height) {
        sound.playHit();
        setLives((l) => {
          const next = l - 1;
          if (next <= 0) {
            setIsGameOver(true);
          } else {
            // Reset ball to paddle
            s.ballX = s.paddleX + s.paddleW / 2;
            s.ballY = 280;
            s.ballVy = -3.5;
            s.ballVx = 3.5;
          }
          return next;
        });
      }

      // Paddle Collision
      if (
        s.ballY + s.ballR >= canvas.height - 24 &&
        s.ballY - s.ballR <= canvas.height - 12 &&
        s.ballX >= s.paddleX &&
        s.ballX <= s.paddleX + s.paddleW
      ) {
        sound.playJump();
        // Calculate hit angle
        const hitOffset = (s.ballX - (s.paddleX + s.paddleW / 2)) / (s.paddleW / 2);
        s.ballVx = hitOffset * 5;
        s.ballVy = -Math.abs(s.ballVy);
      }

      // Brick Collision
      for (const brick of s.bricks) {
        if (!brick.isAlive) continue;

        if (
          s.ballX + s.ballR >= brick.x &&
          s.ballX - s.ballR <= brick.x + brick.w &&
          s.ballY + s.ballR >= brick.y &&
          s.ballY - s.ballR <= brick.y + brick.h
        ) {
          brick.isAlive = false;
          s.ballVy = -s.ballVy;
          sound.playScore();
          setScore((sc) => sc + brick.points);

          // Check if all bricks cleared
          if (s.bricks.every((b) => !b.isAlive)) {
            setIsVictory(true);
          }
          break;
        }
      }

      // Render
      ctx.fillStyle = '#080c18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Bricks
      for (const b of s.bricks) {
        if (!b.isAlive) continue;
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Render Paddle
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(s.paddleX, canvas.height - 22, s.paddleW, s.paddleH, 6);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Render Ball
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, s.ballR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isVictory]);

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const clientX = touch.clientX - rect.left;
    const ratio = canvas.width / rect.width;
    const scaledX = clientX * ratio;

    stateRef.current.paddleX = Math.max(
      0,
      Math.min(canvas.width - stateRef.current.paddleW, scaledX - stateRef.current.paddleW / 2)
    );
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = canvas.width / rect.width;
    const scaledX = clientX * ratio;

    stateRef.current.paddleX = Math.max(
      0,
      Math.min(canvas.width - stateRef.current.paddleW, scaledX - stateRef.current.paddleW / 2)
    );
  };

  const restartGame = () => {
    initBricks();
    stateRef.current.paddleX = 140;
    stateRef.current.ballX = 180;
    stateRef.current.ballY = 280;
    stateRef.current.ballVx = 3.5;
    stateRef.current.ballVy = -3.5;
    setLives(3);
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
        {/* Lives Ribbon */}
        <div className="w-full flex justify-between items-center mb-2 px-1 text-xs">
          <span className="text-slate-400">Sentuh / Geser Paddle</span>
          <div className="flex gap-1">
            {Array(3).fill(0).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i < lives ? 'text-rose-500 fill-current' : 'text-slate-700'}`}
              />
            ))}
          </div>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={360}
          height={380}
          onTouchMove={handleTouchMove}
          onMouseMove={handleMouseMove}
          className="w-full aspect-[360/380] rounded-2xl border-2 border-slate-700 shadow-2xl touch-none cursor-ew-resize"
        />

        {/* Mobile quick buttons */}
        <div className="flex gap-4 mt-3 w-full sm:hidden">
          <button
            onTouchStart={() => {
              stateRef.current.paddleX = Math.max(0, stateRef.current.paddleX - 40);
            }}
            className="flex-1 py-3 bg-slate-800 rounded-xl text-cyan-400 font-bold active:scale-95 border border-slate-700 text-sm"
          >
            ◀ Kiri
          </button>
          <button
            onTouchStart={() => {
              stateRef.current.paddleX = Math.min(360 - stateRef.current.paddleW, stateRef.current.paddleX + 40);
            }}
            className="flex-1 py-3 bg-slate-800 rounded-xl text-cyan-400 font-bold active:scale-95 border border-slate-700 text-sm"
          >
            Kanan ▶
          </button>
        </div>
      </div>
    </GameShell>
  );
};
