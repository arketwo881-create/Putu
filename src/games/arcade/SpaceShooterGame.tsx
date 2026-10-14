import React, { useState, useEffect, useRef } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { Heart } from 'lucide-react';

interface SpaceShooterProps {
  game: GameMetadata;
  onBack: () => void;
}

interface Bullet {
  x: number;
  y: number;
}

interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  isBoss: boolean;
}

export const SpaceShooterGame: React.FC<SpaceShooterProps> = ({ game, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const stateRef = useRef({
    playerX: 180,
    playerY: 340,
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    bossSpawned: false,
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

      // Auto fire bullets
      if (s.frameCount % 12 === 0) {
        s.bullets.push({ x: s.playerX - 8, y: s.playerY - 14 });
        s.bullets.push({ x: s.playerX + 8, y: s.playerY - 14 });
        sound.playLaser();
      }

      // Move Bullets
      for (let i = s.bullets.length - 1; i >= 0; i--) {
        s.bullets[i].y -= 8;
        if (s.bullets[i].y < -10) s.bullets.splice(i, 1);
      }

      // Spawn Normal Enemies
      if (s.frameCount % 50 === 0 && !s.bossSpawned) {
        s.enemies.push({
          x: Math.random() * (canvas.width - 40) + 20,
          y: -20,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 1.5 + 1.5,
          hp: 2,
          maxHp: 2,
          isBoss: false,
        });
      }

      // Spawn Boss after 300 points
      if (score >= 300 && !s.bossSpawned) {
        s.bossSpawned = true;
        s.enemies.push({
          x: canvas.width / 2,
          y: -40,
          vx: 2,
          vy: 0.8,
          hp: 25,
          maxHp: 25,
          isBoss: true,
        });
      }

      // Update Enemies
      for (let i = s.enemies.length - 1; i >= 0; i--) {
        const e = s.enemies[i];
        e.y += e.vy;
        e.x += e.vx;

        if (e.isBoss) {
          if (e.y > 60) e.vy = 0;
          if (e.x < 40 || e.x > canvas.width - 40) e.vx = -e.vx;
        } else {
          if (e.x < 20 || e.x > canvas.width - 20) e.vx = -e.vx;
        }

        // Bullet hits enemy
        for (let bIdx = s.bullets.length - 1; bIdx >= 0; bIdx--) {
          const b = s.bullets[bIdx];
          const hitRadius = e.isBoss ? 35 : 16;
          if (Math.hypot(b.x - e.x, b.y - e.y) < hitRadius) {
            s.bullets.splice(bIdx, 1);
            e.hp--;
            sound.playScore();

            if (e.hp <= 0) {
              sound.playHit();
              if (e.isBoss) {
                setScore((sc) => sc + 500);
                setIsVictory(true);
              } else {
                setScore((sc) => sc + 20);
              }
              s.enemies.splice(i, 1);
              break;
            }
          }
        }

        // Enemy collides with player ship
        if (Math.hypot(s.playerX - e.x, s.playerY - e.y) < (e.isBoss ? 40 : 22)) {
          sound.playHit();
          if (!e.isBoss) s.enemies.splice(i, 1);
          setLives((l) => {
            const next = l - 1;
            if (next <= 0) setIsGameOver(true);
            return next;
          });
        }

        // Despawn passed enemies
        if (e.y > canvas.height + 30) {
          s.enemies.splice(i, 1);
        }
      }

      // Render
      ctx.fillStyle = '#050814';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      for (let st = 0; st < 30; st++) {
        const sx = (st * 37) % canvas.width;
        const sy = (st * 43 + s.frameCount * 2) % canvas.height;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Render Bullets
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      for (const b of s.bullets) {
        ctx.fillRect(b.x - 2, b.y, 4, 10);
      }
      ctx.shadowBlur = 0;

      // Render Enemies
      for (const e of s.enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);

        if (e.isBoss) {
          // Boss Ship
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(0, 30);
          ctx.lineTo(40, -25);
          ctx.lineTo(15, -15);
          ctx.lineTo(0, -30);
          ctx.lineTo(-15, -15);
          ctx.lineTo(-40, -25);
          ctx.closePath();
          ctx.fill();

          // Boss Health Bar
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#334155';
          ctx.fillRect(-30, -35, 60, 5);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-30, -35, (e.hp / e.maxHp) * 60, 5);
        } else {
          // Regular Alien
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.moveTo(0, 14);
          ctx.lineTo(14, -12);
          ctx.lineTo(-14, -12);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Render Player Ship
      ctx.save();
      ctx.translate(s.playerX, s.playerY);
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(16, 14);
      ctx.lineTo(0, 8);
      ctx.lineTo(-16, 14);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isVictory, score]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const ratioX = canvas.width / rect.width;
    const ratioY = canvas.height / rect.height;

    stateRef.current.playerX = Math.max(20, Math.min(canvas.width - 20, clientX * ratioX));
    stateRef.current.playerY = Math.max(100, Math.min(canvas.height - 20, clientY * ratioY));
  };

  const restartGame = () => {
    stateRef.current.playerX = 180;
    stateRef.current.playerY = 340;
    stateRef.current.bullets = [];
    stateRef.current.enemies = [];
    stateRef.current.bossSpawned = false;
    stateRef.current.frameCount = 0;
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
        <div className="w-full flex justify-between items-center mb-2 px-1 text-xs">
          <span className="text-slate-400">Geser untuk bermanuver</span>
          <div className="flex gap-1">
            {Array(3).fill(0).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i < lives ? 'text-rose-500 fill-current' : 'text-slate-700'}`}
              />
            ))}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={360}
          height={400}
          onPointerMove={handlePointerMove}
          className="w-full aspect-[360/400] rounded-2xl border-2 border-slate-700 shadow-2xl touch-none cursor-crosshair"
        />
      </div>
    </GameShell>
  );
};
