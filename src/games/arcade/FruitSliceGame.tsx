import React, { useState, useEffect, useRef } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface FruitSliceProps {
  game: GameMetadata;
  onBack: () => void;
}

interface FruitItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  isBomb: boolean;
  isSliced: boolean;
  radius: number;
}

const FRUIT_TYPES = ['🍉', '🍊', '🍓', '🍌', '🍍', '🍎'];

export const FruitSliceGame: React.FC<FruitSliceProps> = ({ game, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const stateRef = useRef({
    fruits: [] as FruitItem[],
    trail: [] as { x: number; y: number; time: number }[],
    isSwiping: false,
    frameCount: 0,
  });

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

      // Spawn Fruits or Bombs
      if (s.frameCount % 40 === 0) {
        const isBomb = Math.random() < 0.2;
        const emoji = isBomb ? '💣' : FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
        const startX = Math.random() * (canvas.width - 100) + 50;

        s.fruits.push({
          id: Math.random(),
          x: startX,
          y: canvas.height + 20,
          vx: (canvas.width / 2 - startX) * 0.02 + (Math.random() - 0.5) * 2,
          vy: -(Math.random() * 4 + 9.5),
          emoji,
          isBomb,
          isSliced: false,
          radius: 24,
        });
      }

      // Update Fruit Physics (Gravity)
      const gravity = 0.22;
      for (let i = s.fruits.length - 1; i >= 0; i--) {
        const f = s.fruits[i];
        f.x += f.vx;
        f.y += f.vy;
        f.vy += gravity;

        // Despawn fallen fruits
        if (f.y > canvas.height + 50 && f.vy > 0) {
          s.fruits.splice(i, 1);
        }
      }

      // Expire Trail points
      const now = performance.now();
      s.trail = s.trail.filter((pt) => now - pt.time < 180);

      // Render
      ctx.fillStyle = '#080c16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Fruits
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (const f of s.fruits) {
        if (f.isSliced) {
          // Half sliced flying away
          ctx.save();
          ctx.translate(f.x, f.y);
          ctx.globalAlpha = 0.6;
          ctx.fillText(f.emoji, -10, 0);
          ctx.fillText(f.emoji, 10, 0);
          ctx.restore();
        } else {
          ctx.fillText(f.emoji, f.x, f.y);
        }
      }

      // Render Blade Swipe Trail
      if (s.trail.length > 1) {
        ctx.strokeStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(s.trail[0].x, s.trail[0].y);
        for (let i = 1; i < s.trail.length; i++) {
          ctx.lineTo(s.trail[i].x, s.trail[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isVictory]);

  const handlePointer = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isGameOver || isVictory) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    stateRef.current.trail.push({ x, y, time: performance.now() });

    // Check hit test against active fruits
    for (const f of stateRef.current.fruits) {
      if (!f.isSliced && Math.hypot(x - f.x, y - f.y) < f.radius + 10) {
        f.isSliced = true;
        if (f.isBomb) {
          sound.playHit();
          setIsGameOver(true);
        } else {
          sound.playPop();
          setScore((sc) => sc + 50);
        }
      }
    }
  };

  const restartGame = () => {
    stateRef.current.fruits = [];
    stateRef.current.trail = [];
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
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        <p className="text-xs text-slate-400 mb-2">Gesek jarimu untuk menebas buah! Hindari bom 💣</p>
        <canvas
          ref={canvasRef}
          width={360}
          height={380}
          onPointerDown={(e) => {
            stateRef.current.isSwiping = true;
            handlePointer(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (stateRef.current.isSwiping) handlePointer(e.clientX, e.clientY);
          }}
          onPointerUp={() => {
            stateRef.current.isSwiping = false;
          }}
          className="w-full aspect-[360/380] rounded-2xl border-2 border-slate-700 shadow-2xl touch-none cursor-crosshair"
        />
      </div>
    </GameShell>
  );
};
