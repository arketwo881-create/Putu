import React, { useState, useEffect, useRef } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface SnakeProps {
  game: GameMetadata;
  onBack: () => void;
}

type Point = { x: number; y: number };

const GRID_SIZE = 20;

export const SnakeGame: React.FC<SnakeProps> = ({ game, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [dir, setDir] = useState<Point>({ x: 0, y: -1 });
  const [nextDir, setNextDir] = useState<Point>({ x: 0, y: -1 });
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code) && dir.y === 0) {
        e.preventDefault();
        setNextDir({ x: 0, y: -1 });
      } else if (['ArrowDown', 'KeyS'].includes(e.code) && dir.y === 0) {
        e.preventDefault();
        setNextDir({ x: 0, y: 1 });
      } else if (['ArrowLeft', 'KeyA'].includes(e.code) && dir.x === 0) {
        e.preventDefault();
        setNextDir({ x: -1, y: 0 });
      } else if (['ArrowRight', 'KeyD'].includes(e.code) && dir.x === 0) {
        e.preventDefault();
        setNextDir({ x: 1, y: 0 });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir]);

  // Main Game Loop
  useEffect(() => {
    if (isGameOver || isVictory) return;

    const tick = () => {
      setDir(nextDir);
      setSnake((prevSnake) => {
        const head = { x: prevSnake[0].x + nextDir.x, y: prevSnake[0].y + nextDir.y };

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          sound.playHit();
          setIsGameOver(true);
          return prevSnake;
        }

        // Tail collision
        if (prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          sound.playHit();
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat food
        if (head.x === food.x && head.y === food.y) {
          sound.playScore();
          setScore((s) => s + 10);

          // Generate new food location
          let newFood: Point;
          do {
            newFood = {
              x: Math.floor(Math.random() * GRID_SIZE),
              y: Math.floor(Math.random() * GRID_SIZE),
            };
          } while (newSnake.some((s) => s.x === newFood.x && s.y === newFood.y));

          setFood(newFood);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(70, 140 - Math.floor(score / 30) * 10);
    const timer = setInterval(tick, speed);
    return () => clearInterval(timer);
  }, [nextDir, food, isGameOver, isVictory, score]);

  // Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellWidth = canvas.width / GRID_SIZE;
    const cellHeight = canvas.height / GRID_SIZE;

    // Background
    ctx.fillStyle = '#0a0e1c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = '#141c33';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(canvas.width, i * cellHeight);
      ctx.stroke();
    }

    // Food
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
      food.x * cellWidth + cellWidth / 2,
      food.y * cellHeight + cellHeight / 2,
      cellWidth / 2.2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake
    snake.forEach((part, idx) => {
      ctx.fillStyle = idx === 0 ? '#10b981' : '#059669';
      if (idx === 0) {
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
      }
      ctx.beginPath();
      ctx.roundRect(
        part.x * cellWidth + 1,
        part.y * cellHeight + 1,
        cellWidth - 2,
        cellHeight - 2,
        idx === 0 ? 6 : 4
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }, [snake, food]);

  const restartGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ]);
    setFood({ x: 5, y: 5 });
    setDir({ x: 0, y: -1 });
    setNextDir({ x: 0, y: -1 });
    setScore(0);
    setIsGameOver(false);
    setIsVictory(false);
  };

  const handleDpad = (x: number, y: number) => {
    if (x !== 0 && dir.x === 0) setNextDir({ x, y: 0 });
    if (y !== 0 && dir.y === 0) setNextDir({ x: 0, y });
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
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="w-full aspect-square rounded-2xl border-2 border-slate-700 shadow-2xl"
        />

        {/* D-Pad Controls for mobile */}
        <div className="mt-4 grid grid-cols-3 gap-2 w-48 sm:hidden">
          <div />
          <button
            onClick={() => handleDpad(0, -1)}
            className="p-3.5 bg-slate-800 rounded-xl flex items-center justify-center active:scale-90 text-emerald-400 border border-slate-700 shadow-md"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
          <div />
          <button
            onClick={() => handleDpad(-1, 0)}
            className="p-3.5 bg-slate-800 rounded-xl flex items-center justify-center active:scale-90 text-emerald-400 border border-slate-700 shadow-md"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleDpad(0, 1)}
            className="p-3.5 bg-slate-800 rounded-xl flex items-center justify-center active:scale-90 text-emerald-400 border border-slate-700 shadow-md"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleDpad(1, 0)}
            className="p-3.5 bg-slate-800 rounded-xl flex items-center justify-center active:scale-90 text-emerald-400 border border-slate-700 shadow-md"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </GameShell>
  );
};
