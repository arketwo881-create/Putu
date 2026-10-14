import React, { useState, useEffect, useRef } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface FlappyBirdProps {
  game: GameMetadata;
  onBack: () => void;
}

interface Pipe {
  x: number;
  topH: number;
  bottomY: number;
  passed: boolean;
}

export const FlappyBirdGame: React.FC<FlappyBirdProps> = ({ game, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const stateRef = useRef({
    birdY: 200,
    birdVy: 0,
    gravity: 0.38,
    jumpForce: -6.5,
    pipes: [] as Pipe[],
    pipeGap: 110,
    pipeWidth: 50,
    speed: 2.5,
    frameCount: 0,
  });

  const jump = () => {
    if (isGameOver) return;
    sound.playJump();
    stateRef.current.birdVy = stateRef.current.jumpForce;
  };

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

      // Bird Physics
      s.birdVy += s.gravity;
      s.birdY += s.birdVy;

      // Spawn Pipes
      if (s.frameCount % 90 === 0) {
        const topH = Math.floor(Math.random() * (canvas.height - s.pipeGap - 100)) + 40;
        s.pipes.push({
          x: canvas.width,
          topH,
          bottomY: topH + s.pipeGap,
          passed: false,
        });
      }

      // Move Pipes & Check Collisions
      for (let i = s.pipes.length - 1; i >= 0; i--) {
        const p = s.pipes[i];
        p.x -= s.speed;

        // Check if bird passed pipe
        if (!p.passed && p.x + s.pipeWidth < 60) {
          p.passed = true;
          sound.playScore();
          setScore((sc) => sc + 10);
        }

        // Bird Bounding Box (radius 12 at x=60, y=s.birdY)
        const birdR = 12;
        const birdX = 60;

        // Collision with top pipe
        if (
          birdX + birdR > p.x &&
          birdX - birdR < p.x + s.pipeWidth &&
          s.birdY - birdR < p.topH
        ) {
          sound.playHit();
          setIsGameOver(true);
        }

        // Collision with bottom pipe
        if (
          birdX + birdR > p.x &&
          birdX - birdR < p.x + s.pipeWidth &&
          s.birdY + birdR > p.bottomY
        ) {
          sound.playHit();
          setIsGameOver(true);
        }

        // Remove offscreen pipes
        if (p.x + s.pipeWidth < -20) {
          s.pipes.splice(i, 1);
        }
      }

      // Floor & Ceiling Collision
      if (s.birdY - 12 <= 0 || s.birdY + 12 >= canvas.height) {
        sound.playHit();
        setIsGameOver(true);
      }

      // Rendering
      ctx.fillStyle = '#060a17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 20; i++) {
        const sx = ((i * 47 + s.frameCount * 0.5) % canvas.width);
        const sy = (i * 29) % canvas.height;
        ctx.fillRect(canvas.width - sx, sy, 1.5, 1.5);
      }

      // Render Pipes
      for (const p of s.pipes) {
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;

        // Top pipe
        ctx.fillRect(p.x, 0, s.pipeWidth, p.topH);
        ctx.fillRect(p.x - 3, p.topH - 12, s.pipeWidth + 6, 12);

        // Bottom pipe
        ctx.fillRect(p.x, p.bottomY, s.pipeWidth, canvas.height - p.bottomY);
        ctx.fillRect(p.x - 3, p.bottomY, s.pipeWidth + 6, 12);
        ctx.shadowBlur = 0;
      }

      // Render Flappy Rocket / Bird
      ctx.save();
      ctx.translate(60, s.birdY);
      const angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, s.birdVy * 0.08));
      ctx.rotate(angle);

      // Rocket Body
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wing
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-6, 2, 8, 5);

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(6, -3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(7, -3, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Flame Thruster
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(-14, -3);
      ctx.lineTo(-22 - Math.random() * 6, 0);
      ctx.lineTo(-14, 3);
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isVictory]);

  const restartGame = () => {
    stateRef.current.birdY = 200;
    stateRef.current.birdVy = 0;
    stateRef.current.pipes = [];
    stateRef.current.frameCount = 0;
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
        onClick={jump}
        className="w-full max-w-sm flex flex-col items-center select-none cursor-pointer"
      >
        <p className="text-xs text-slate-400 mb-2">Ketuk layar di mana saja untuk melompat!</p>
        <canvas
          ref={canvasRef}
          width={360}
          height={400}
          className="w-full aspect-[360/400] rounded-2xl border-2 border-slate-700 shadow-2xl touch-none"
        />
      </div>
    </GameShell>
  );
};
