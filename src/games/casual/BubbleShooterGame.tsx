import React, { useState, useEffect, useRef } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface BubbleShooterProps {
  game: GameMetadata;
  onBack: () => void;
}

const BUBBLE_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#a855f7'];
const ROWS = 8;
const COLS = 8;
const BUBBLE_R = 18;

export const BubbleShooterGame: React.FC<BubbleShooterProps> = ({ game, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const stateRef = useRef({
    grid: [] as (string | null)[][],
    currentBubble: BUBBLE_COLORS[0],
    nextBubble: BUBBLE_COLORS[1],
    cannonAngle: -Math.PI / 2,
    bullet: null as { x: number; y: number; vx: number; vy: number; color: string } | null,
  });

  const initGrid = () => {
    const grid: (string | null)[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: (string | null)[] = [];
      for (let c = 0; c < COLS; c++) {
        if (r < 4) {
          row.push(BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)]);
        } else {
          row.push(null);
        }
      }
      grid.push(row);
    }
    stateRef.current.grid = grid;
    stateRef.current.currentBubble = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    stateRef.current.nextBubble = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    stateRef.current.bullet = null;
  };

  useEffect(() => {
    initGrid();
  }, []);

  const shootBubble = () => {
    const s = stateRef.current;
    if (s.bullet || isGameOver || isVictory) return;

    sound.playLaser();
    const speed = 10;
    s.bullet = {
      x: 180,
      y: 350,
      vx: Math.cos(s.cannonAngle) * speed,
      vy: Math.sin(s.cannonAngle) * speed,
      color: s.currentBubble,
    };
    s.currentBubble = s.nextBubble;
    s.nextBubble = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
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

      // Update flying bullet
      if (s.bullet) {
        s.bullet.x += s.bullet.vx;
        s.bullet.y += s.bullet.vy;

        // Wall bounce
        if (s.bullet.x - BUBBLE_R <= 0 || s.bullet.x + BUBBLE_R >= canvas.width) {
          s.bullet.vx = -s.bullet.vx;
          sound.playPop();
        }

        // Attach to top or to grid bubble
        let attached = false;
        if (s.bullet.y - BUBBLE_R <= 15) {
          attached = true;
        } else {
          // Check collision with any grid bubble
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              if (s.grid[r][c] !== null) {
                const bx = c * (BUBBLE_R * 2) + BUBBLE_R + 10;
                const by = r * (BUBBLE_R * 2) + BUBBLE_R + 10;
                if (Math.hypot(s.bullet.x - bx, s.bullet.y - by) < BUBBLE_R * 1.8) {
                  attached = true;
                  break;
                }
              }
            }
            if (attached) break;
          }
        }

        if (attached) {
          // Snap bullet into nearest grid slot
          const targetR = Math.max(0, Math.min(ROWS - 1, Math.floor((s.bullet.y - 10) / (BUBBLE_R * 2))));
          const targetC = Math.max(0, Math.min(COLS - 1, Math.floor((s.bullet.x - 10) / (BUBBLE_R * 2))));

          s.grid[targetR][targetC] = s.bullet.color;
          const hitColor = s.bullet.color;
          s.bullet = null;

          // Find matches with flood fill
          const matched: [number, number][] = [];
          const visited = Array(ROWS).fill(false).map(() => Array(COLS).fill(false));
          const queue: [number, number][] = [[targetR, targetC]];
          visited[targetR][targetC] = true;

          while (queue.length > 0) {
            const [cr, cc] = queue.shift()!;
            matched.push([cr, cc]);

            for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
              const nr = cr + dr;
              const nc = cc + dc;
              if (
                nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS &&
                !visited[nr][nc] &&
                s.grid[nr][nc] === hitColor
              ) {
                visited[nr][nc] = true;
                queue.push([nr, nc]);
              }
            }
          }

          if (matched.length >= 3) {
            sound.playScore();
            matched.forEach(([mr, mc]) => {
              s.grid[mr][mc] = null;
            });
            setScore((sc) => sc + matched.length * 30);

            // Check victory (all cleared)
            if (s.grid.every((row) => row.every((c) => c === null))) {
              setIsVictory(true);
            }
          } else {
            sound.playHit();
          }

          // Check if bubbles reached bottom
          if (s.grid[ROWS - 1].some((c) => c !== null)) {
            setIsGameOver(true);
          }
        }
      }

      // Render
      ctx.fillStyle = '#080d1e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Grid Bubbles
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const col = s.grid[r][c];
          if (col !== null) {
            const bx = c * (BUBBLE_R * 2) + BUBBLE_R + 10;
            const by = r * (BUBBLE_R * 2) + BUBBLE_R + 10;

            ctx.fillStyle = col;
            ctx.shadowColor = col;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(bx, by, BUBBLE_R - 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Render Cannon Line & Active Bubble
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(180, 350);
      ctx.lineTo(180 + Math.cos(s.cannonAngle) * 80, 350 + Math.sin(s.cannonAngle) * 80);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current Bubble in Cannon
      ctx.fillStyle = s.currentBubble;
      ctx.shadowColor = s.currentBubble;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(180, 350, BUBBLE_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Next Bubble indicator
      ctx.fillStyle = s.nextBubble;
      ctx.beginPath();
      ctx.arc(120, 350, BUBBLE_R * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Render Flying Bullet
      if (s.bullet) {
        ctx.fillStyle = s.bullet.color;
        ctx.shadowColor = s.bullet.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(s.bullet.x, s.bullet.y, BUBBLE_R - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isVictory]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const angle = Math.atan2(y - 350, x - 180);
    // Restrict angle to upper half
    if (angle < -0.2 && angle > -Math.PI + 0.2) {
      stateRef.current.cannonAngle = angle;
    }
  };

  const restartGame = () => {
    initGrid();
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
        <p className="text-xs text-slate-400 mb-2">Arahkan meriam lalu ketuk untuk menembak gelembung!</p>
        <canvas
          ref={canvasRef}
          width={360}
          height={380}
          onPointerMove={handlePointerMove}
          onClick={shootBubble}
          className="w-full aspect-[360/380] rounded-2xl border-2 border-slate-700 shadow-2xl touch-none cursor-crosshair"
        />
      </div>
    </GameShell>
  );
};
