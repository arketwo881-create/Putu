import React, { useState, useEffect, useRef } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { Bot, Users } from 'lucide-react';

interface PongProps {
  game: GameMetadata;
  onBack: () => void;
}

export const PongGame: React.FC<PongProps> = ({ game, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'solo' | 'pvp'>('solo');
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const stateRef = useRef({
    p1Y: 140,
    p2Y: 140,
    paddleW: 10,
    paddleH: 60,
    ballX: 180,
    ballY: 170,
    ballVx: 4,
    ballVy: 2,
    ballR: 6,
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

      // Ball Movement
      s.ballX += s.ballVx;
      s.ballY += s.ballVy;

      // Top & Bottom Walls
      if (s.ballY - s.ballR <= 0 || s.ballY + s.ballR >= canvas.height) {
        s.ballVy = -s.ballVy;
        sound.playPop();
      }

      // AI Tracking for Player 2 in Solo mode
      if (mode === 'solo') {
        const targetY = s.ballY - s.paddleH / 2;
        s.p2Y += (targetY - s.p2Y) * 0.085;
      }

      // Keep paddles inside canvas
      s.p1Y = Math.max(0, Math.min(canvas.height - s.paddleH, s.p1Y));
      s.p2Y = Math.max(0, Math.min(canvas.height - s.paddleH, s.p2Y));

      // Player 1 Paddle Collision (Left)
      if (
        s.ballX - s.ballR <= 20 &&
        s.ballX + s.ballR >= 10 &&
        s.ballY >= s.p1Y &&
        s.ballY <= s.p1Y + s.paddleH
      ) {
        sound.playJump();
        s.ballVx = Math.abs(s.ballVx) * 1.05;
        const offset = (s.ballY - (s.p1Y + s.paddleH / 2)) / (s.paddleH / 2);
        s.ballVy = offset * 4.5;
      }

      // Player 2 Paddle Collision (Right)
      if (
        s.ballX + s.ballR >= canvas.width - 20 &&
        s.ballX - s.ballR <= canvas.width - 10 &&
        s.ballY >= s.p2Y &&
        s.ballY <= s.p2Y + s.paddleH
      ) {
        sound.playJump();
        s.ballVx = -Math.abs(s.ballVx) * 1.05;
        const offset = (s.ballY - (s.p2Y + s.paddleH / 2)) / (s.paddleH / 2);
        s.ballVy = offset * 4.5;
      }

      // Score for Player 2 (Ball passed left)
      if (s.ballX < 0) {
        sound.playHit();
        setP2Score((sc) => {
          const next = sc + 1;
          if (next >= 5) {
            setIsGameOver(true);
          } else {
            resetBall(1);
          }
          return next;
        });
      }

      // Score for Player 1 (Ball passed right)
      if (s.ballX > canvas.width) {
        sound.playScore();
        setP1Score((sc) => {
          const next = sc + 1;
          if (next >= 5) {
            setIsVictory(true);
          } else {
            resetBall(-1);
          }
          return next;
        });
      }

      // Rendering
      ctx.fillStyle = '#090d1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center Dotted Line
      ctx.strokeStyle = '#1e293b';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // P1 Paddle (Cyan)
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.fillRect(10, s.p1Y, s.paddleW, s.paddleH);

      // P2 Paddle (Rose)
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.fillRect(canvas.width - 20, s.p2Y, s.paddleW, s.paddleH);
      ctx.shadowBlur = 0;

      // Ball
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
  }, [isGameOver, isVictory, mode]);

  const resetBall = (dir: number) => {
    const s = stateRef.current;
    s.ballX = 180;
    s.ballY = 170;
    s.ballVx = 4 * dir;
    s.ballVy = (Math.random() - 0.5) * 4;
  };

  const handleTouchP1 = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const relY = touch.clientY - rect.top;
    const ratio = 340 / rect.height;
    stateRef.current.p1Y = relY * ratio - stateRef.current.paddleH / 2;
  };

  const handleTouchP2 = (e: React.TouchEvent<HTMLDivElement>) => {
    if (mode === 'solo') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const relY = touch.clientY - rect.top;
    const ratio = 340 / rect.height;
    stateRef.current.p2Y = relY * ratio - stateRef.current.paddleH / 2;
  };

  const restartGame = () => {
    setP1Score(0);
    setP2Score(0);
    stateRef.current.p1Y = 140;
    stateRef.current.p2Y = 140;
    resetBall(1);
    setIsGameOver(false);
    setIsVictory(false);
  };

  return (
    <GameShell
      game={game}
      onBack={onBack}
      score={p1Score * 100}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        {/* Mode Selector */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 mb-2 w-full gap-1">
          <button
            onClick={() => {
              setMode('solo');
              restartGame();
            }}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 ${
              mode === 'solo' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> Lawan AI
          </button>
          <button
            onClick={() => {
              setMode('pvp');
              restartGame();
            }}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 ${
              mode === 'pvp' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 2 Pemain
          </button>
        </div>

        {/* Score Readout */}
        <div className="w-full flex justify-around items-center mb-2 px-6">
          <span className="font-arcade text-3xl font-black text-cyan-400">{p1Score}</span>
          <span className="text-slate-600 font-bold text-lg">:</span>
          <span className="font-arcade text-3xl font-black text-rose-400">{p2Score}</span>
        </div>

        {/* Canvas & Touch Overlay */}
        <div className="relative w-full aspect-[360/340]">
          <canvas
            ref={canvasRef}
            width={360}
            height={340}
            className="w-full h-full rounded-2xl border-2 border-slate-700 shadow-2xl"
          />

          {/* Left Touch Zone (P1) */}
          <div
            onTouchMove={handleTouchP1}
            className="absolute left-0 top-0 w-1/2 h-full z-10 touch-none"
          />

          {/* Right Touch Zone (P2) */}
          <div
            onTouchMove={handleTouchP2}
            className="absolute right-0 top-0 w-1/2 h-full z-10 touch-none"
          />
        </div>

        <p className="text-[11px] text-slate-500 mt-2 text-center">
          Sentuh & geser sisi kiri untuk P1 {mode === 'pvp' ? '• Sisi kanan untuk P2' : ''}
        </p>
      </div>
    </GameShell>
  );
};
