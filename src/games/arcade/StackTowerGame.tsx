import React, { useState, useEffect, useRef } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface StackTowerProps {
  game: GameMetadata;
  onBack: () => void;
}

interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export const StackTowerGame: React.FC<StackTowerProps> = ({ game, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899'];

  const stateRef = useRef({
    blocks: [] as Block[],
    currentX: 50,
    currentVx: 3.5,
    currentW: 160,
    blockH: 18,
    perfectStreak: 0,
  });

  const initGame = () => {
    stateRef.current.blocks = [
      {
        x: 100,
        y: 350,
        w: 160,
        h: 18,
        color: '#06b6d4',
      },
    ];
    stateRef.current.currentX = 0;
    stateRef.current.currentVx = 3.5;
    stateRef.current.currentW = 160;
    stateRef.current.perfectStreak = 0;
  };

  useEffect(() => {
    initGame();
  }, []);

  const handlePlace = () => {
    if (isGameOver) return;
    const s = stateRef.current;
    const prevBlock = s.blocks[s.blocks.length - 1];
    const diff = s.currentX - prevBlock.x;
    const absDiff = Math.abs(diff);

    // Perfect placement within tolerance
    if (absDiff <= 3) {
      sound.playWin();
      s.perfectStreak++;
      s.currentX = prevBlock.x; // Snap to align
    } else if (absDiff >= s.currentW) {
      // Complete miss! Game over
      sound.playHit();
      setIsGameOver(true);
      return;
    } else {
      // Trim block
      sound.playScore();
      s.perfectStreak = 0;
      s.currentW -= absDiff;
      if (diff > 0) {
        // Overhang to right
        s.currentX = prevBlock.x + diff;
      } else {
        // Overhang to left
        s.currentX = prevBlock.x;
      }
    }

    const newColor = COLORS[s.blocks.length % COLORS.length];
    const nextY = prevBlock.y - s.blockH;

    s.blocks.push({
      x: s.currentX,
      y: nextY,
      w: s.currentW,
      h: s.blockH,
      color: newColor,
    });

    const newScore = s.blocks.length - 1;
    setScore(newScore * 10);

    // Speed up slightly as tower grows
    s.currentVx = (s.currentVx > 0 ? 1 : -1) * (3.5 + Math.min(4, newScore * 0.15));
    s.currentX = 0;
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

      // Move active block
      s.currentX += s.currentVx;
      if (s.currentX <= 0 || s.currentX + s.currentW >= canvas.width) {
        s.currentVx = -s.currentVx;
      }

      // Camera offset when tower goes tall
      const topBlock = s.blocks[s.blocks.length - 1];
      const cameraY = topBlock ? Math.max(0, 200 - topBlock.y) : 0;

      // Render
      ctx.fillStyle = '#080c18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(0, cameraY);

      // Render stacked blocks
      for (const b of s.blocks) {
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Render current sliding block
      const nextY = topBlock ? topBlock.y - s.blockH : 330;
      const curColor = COLORS[s.blocks.length % COLORS.length];
      ctx.fillStyle = curColor;
      ctx.shadowColor = curColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(s.currentX, nextY, s.currentW, s.blockH, 4);
      ctx.fill();
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
        onClick={handlePlace}
        className="w-full max-w-sm flex flex-col items-center select-none cursor-pointer"
      >
        <p className="text-xs text-slate-400 mb-2">Ketuk layar tepat saat balok sejajar!</p>
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
