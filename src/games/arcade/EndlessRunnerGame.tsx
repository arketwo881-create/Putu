import React, { useState, useEffect, useRef } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface EndlessRunnerProps {
  game: GameMetadata;
  onBack: () => void;
}

interface Obstacle {
  lane: number; // 0, 1, 2
  y: number;
  type: 'barrier' | 'coin'; // barrier = jump, coin = score
}

export const EndlessRunnerGame: React.FC<EndlessRunnerProps> = ({ game, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const stateRef = useRef({
    lane: 1, // 0: left, 1: center, 2: right
    isJumping: false,
    jumpTimer: 0,
    obstacles: [] as Obstacle[],
    speed: 5.5,
    frameCount: 0,
  });

  const jump = () => {
    if (stateRef.current.isJumping || isGameOver) return;
    sound.playJump();
    stateRef.current.isJumping = true;
    stateRef.current.jumpTimer = 24;
  };

  const moveLane = (delta: number) => {
    if (isGameOver) return;
    sound.playClick();
    stateRef.current.lane = Math.max(0, Math.min(2, stateRef.current.lane + delta));
  };

  useEffect(() => {
    if (isGameOver || isVictory) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const laneX = [canvas.width * 0.22, canvas.width * 0.5, canvas.width * 0.78];

    const loop = () => {
      const s = stateRef.current;
      s.frameCount++;

      // Handle Jump timer
      if (s.isJumping) {
        s.jumpTimer--;
        if (s.jumpTimer <= 0) s.isJumping = false;
      }

      // Continuous distance score
      if (s.frameCount % 10 === 0) {
        setScore((sc) => sc + 1);
      }

      // Spawn Obstacles & Coins
      if (s.frameCount % 45 === 0) {
        const lane = Math.floor(Math.random() * 3);
        const isCoin = Math.random() < 0.45;
        s.obstacles.push({
          lane,
          y: -40,
          type: isCoin ? 'coin' : 'barrier',
        });
      }

      // Update Obstacles
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const obs = s.obstacles[i];
        obs.y += s.speed;

        // Collision with player (player is at y = 310)
        const playerY = 310;
        if (Math.abs(obs.y - playerY) < 25 && obs.lane === s.lane) {
          if (obs.type === 'coin') {
            sound.playScore();
            setScore((sc) => sc + 50);
            s.obstacles.splice(i, 1);
            continue;
          } else if (obs.type === 'barrier') {
            if (!s.isJumping) {
              sound.playHit();
              setIsGameOver(true);
            }
          }
        }

        // Despawn passed
        if (obs.y > canvas.height + 40) {
          s.obstacles.splice(i, 1);
        }
      }

      // Render Perspective Tracks
      ctx.fillStyle = '#080c1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Track Lanes
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.35, 0);
      ctx.lineTo(canvas.width * 0.05, canvas.height);
      ctx.moveTo(canvas.width * 0.65, 0);
      ctx.lineTo(canvas.width * 0.95, canvas.height);
      ctx.stroke();

      // Render Obstacles & Coins
      for (const obs of s.obstacles) {
        const x = laneX[obs.lane];
        if (obs.type === 'coin') {
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(x, obs.y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.fillRect(x - 22, obs.y - 8, 44, 16);
          ctx.shadowBlur = 0;
        }
      }

      // Render Player Character
      const px = laneX[s.lane];
      const py = s.isJumping ? 260 : 310;

      ctx.save();
      ctx.translate(px, py);
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;

      // Body
      ctx.beginPath();
      ctx.roundRect(-14, -20, 28, 40, 8);
      ctx.fill();

      // Visor
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-10, -14, 20, 8);
      ctx.shadowBlur = 0;
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isVictory]);

  const restartGame = () => {
    stateRef.current.lane = 1;
    stateRef.current.isJumping = false;
    stateRef.current.obstacles = [];
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
        <canvas
          ref={canvasRef}
          width={360}
          height={380}
          className="w-full aspect-[360/380] rounded-2xl border-2 border-slate-700 shadow-2xl"
        />

        {/* Action Controls */}
        <div className="grid grid-cols-3 gap-2 w-full mt-3">
          <button
            onClick={() => moveLane(-1)}
            className="py-3 bg-slate-800 rounded-xl text-cyan-400 font-bold active:scale-95 border border-slate-700 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={jump}
            className="py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold active:scale-95 shadow-md flex items-center justify-center gap-1"
          >
            <ArrowUp className="w-5 h-5" /> Lompat
          </button>
          <button
            onClick={() => moveLane(1)}
            className="py-3 bg-slate-800 rounded-xl text-cyan-400 font-bold active:scale-95 border border-slate-700 flex items-center justify-center"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </GameShell>
  );
};
