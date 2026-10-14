import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Trophy, 
  Play, 
  Pause, 
  Home, 
  X,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameMetadata } from '../../types/game';
import { storage } from '../../services/storage';
import { sound } from '../../services/sound';

export interface BaseGameProps {
  game: GameMetadata;
  onExit?: () => void;
  onBack?: () => void;
  score: number;
  bestScore?: number;
  timeRemaining?: number; // In seconds (optional)
  moves?: number; // Steps or moves taken (optional)
  isGameOver: boolean;
  isVictory: boolean;
  isPaused?: boolean;
  onPauseToggle?: (isPaused: boolean) => void;
  onRestart: () => void;
  children: React.ReactNode;
  extraHeaderControls?: React.ReactNode;
}

export const BaseGame: React.FC<BaseGameProps> = ({
  game,
  onExit,
  onBack,
  score,
  bestScore: propBestScore,
  timeRemaining,
  moves,
  isGameOver,
  isVictory,
  isPaused: controlledPaused,
  onPauseToggle,
  onRestart,
  children,
  extraHeaderControls,
}) => {
  const [internalPaused, setInternalPaused] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [soundOn, setSoundOn] = useState(storage.getStats().soundEnabled);
  const [recordedResult, setRecordedResult] = useState<{ newBest: boolean; currentHigh: number } | null>(null);

  const isPaused = controlledPaused !== undefined ? controlledPaused : internalPaused;

  const highScore = propBestScore !== undefined ? propBestScore : storage.getHighScore(game.id);

  // Victory / Defeat event handling & persistence
  useEffect(() => {
    if (isGameOver || isVictory) {
      const res = storage.recordGameResult(game.id, score, isVictory);
      setRecordedResult(res);

      if (isVictory || res.newBest) {
        sound.playWin();
        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#06b6d4', '#a855f7', '#f59e0b', '#10b981'],
          });
        } catch {}
      } else {
        sound.playGameOver();
      }
    } else {
      setRecordedResult(null);
    }
  }, [isGameOver, isVictory, game.id, score]);

  const togglePause = () => {
    sound.playClick();
    const next = !isPaused;
    if (onPauseToggle) {
      onPauseToggle(next);
    } else {
      setInternalPaused(next);
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    storage.setSound(next);
    sound.playClick();
  };

  const handleRestart = () => {
    sound.playClick();
    if (onPauseToggle) onPauseToggle(false);
    setInternalPaused(false);
    onRestart();
  };

  const handleExit = () => {
    sound.playClick();
    if (onExit) onExit();
    else if (onBack) onBack();
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col select-none touch-manipulation">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-[#0c101d]/90 backdrop-blur-md border-b border-slate-800/80 px-3 py-2.5 flex items-center justify-between">
        {/* Left: Exit/Back button & Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExit}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 transition-all text-slate-200"
            title="Keluar ke Menu"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-wide leading-tight line-clamp-1 flex items-center gap-1.5">
              <span>{game.title}</span>
            </h1>
            <span className="text-[11px] font-medium text-cyan-400">
              #{game.number} • {game.categoryLabel}
            </span>
          </div>
        </div>

        {/* Right: Pause, Sound, Instructions, Restart */}
        <div className="flex items-center gap-1.5">
          {extraHeaderControls}

          {/* Pause / Play Button */}
          <button
            onClick={togglePause}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all"
            title={isPaused ? 'Lanjutkan' : 'Jeda Permainan'}
          >
            {isPaused ? (
              <Play className="w-4 h-4 text-emerald-400 fill-current" />
            ) : (
              <Pause className="w-4 h-4 text-cyan-400 fill-current" />
            )}
          </button>

          {/* Help / Instructions Button */}
          <button
            onClick={() => {
              sound.playClick();
              setShowInstructions(true);
            }}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all"
            title="Cara Bermain"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all"
            title={soundOn ? 'Matikan Suara' : 'Nyalakan Suara'}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>

          {/* Restart Button */}
          <button
            onClick={handleRestart}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all"
            title="Mulai Ulang"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </header>

      {/* Score, Moves, Timer & Best Score Ribbon */}
      <div className="bg-[#111628]/80 border-b border-slate-800/60 px-4 py-2 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Skor:</span>
            <span className="font-bold text-cyan-300 font-arcade text-lg tracking-wider">
              {score}
            </span>
          </div>
          {moves !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Langkah:</span>
              <span className="font-semibold text-purple-300 font-arcade text-base">
                {moves}
              </span>
            </div>
          )}
          {timeRemaining !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Waktu:</span>
              <span
                className={`font-semibold font-arcade text-base ${
                  timeRemaining <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
                }`}
              >
                {timeRemaining}s
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Terbaik:</span>
          <span className="font-bold text-amber-400 font-arcade text-base">
            {highScore}
          </span>
        </div>
      </div>

      {/* Interactive Game Board Viewport Container */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
        {/* Child Game Content */}
        <div className="w-full h-full flex flex-col items-center justify-center">
          {children}
        </div>

        {/* 1. Pause Overlay */}
        {isPaused && !isGameOver && !isVictory && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
              <Pause className="w-8 h-8 fill-current" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Permainan Dijeda</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xs mb-6">
              Waktu dan aksi permainan dihentikan sementara. Kamu bisa melanjutkan kapan saja.
            </p>
            <div className="flex flex-col gap-2.5 w-full max-w-xs">
              <button
                onClick={togglePause}
                className="w-full py-3 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Lanjutkan Permainan
              </button>
              <button
                onClick={handleRestart}
                className="w-full py-2.5 px-5 rounded-xl font-semibold text-sm bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Mulai Ulang
              </button>
              <button
                onClick={handleExit}
                className="w-full py-2.5 px-5 rounded-xl font-semibold text-sm bg-slate-900 border border-slate-800 text-slate-400 hover:text-white active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Kembali ke Menu Utama
              </button>
            </div>
          </div>
        )}

        {/* 2. Victory & Game Over Modal */}
        {(isGameOver || isVictory) && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 border shadow-xl ${
                isVictory
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/20'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-rose-500/20'
              }`}
            >
              {isVictory ? (
                <Trophy className="w-10 h-10 animate-bounce" />
              ) : (
                <RotateCcw className="w-10 h-10" />
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
              {isVictory ? 'Kemenangan Gemilang!' : 'Permainan Selesai'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xs mb-5">
              {isVictory
                ? 'Luar biasa! Target permainan berhasil kamu capai dengan sempurna.'
                : 'Jangan menyerah! Analisis langkahmu dan coba lagi untuk memecahkan rekor.'}
            </p>

            {/* Score & Record Summary Box */}
            <div className="w-full max-w-xs bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-xs text-slate-400">Skor Akhir:</span>
                <span className="font-arcade text-xl font-bold text-cyan-400">
                  {score}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-xs text-slate-400">Rekor Terbaik:</span>
                <span className="font-arcade text-xl font-bold text-amber-400">
                  {recordedResult?.currentHigh ?? highScore}
                </span>
              </div>
              {recordedResult?.newBest && (
                <div className="mt-2.5 py-1 px-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Rekor Skor Baru Tercatat!
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 w-full max-w-xs">
              <button
                onClick={handleRestart}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Main Lagi
              </button>
              <button
                onClick={handleExit}
                className="w-full py-3 px-6 rounded-xl font-semibold text-sm bg-slate-800/80 hover:bg-slate-700 text-slate-200 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Kembali ke Menu Utama
              </button>
            </div>
          </div>
        )}

        {/* 3. Instructions & Rules Modal */}
        {showInstructions && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#101524] border border-slate-700 rounded-2xl w-full max-w-sm max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-cyan-400" />
                  Instruksi & Aturan
                </h3>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <div>
                  <h4 className="text-white font-semibold mb-1 text-xs uppercase tracking-wider text-cyan-400">
                    Deskripsi
                  </h4>
                  <p>{game.description}</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-1 text-xs uppercase tracking-wider text-cyan-400">
                    Cara Bermain
                  </h4>
                  <ul className="space-y-1.5 list-disc list-inside">
                    {game.instructions.map((ins, idx) => (
                      <li key={idx} className="text-slate-300">
                        {ins}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-1 text-xs uppercase tracking-wider text-cyan-400">
                    Kontrol
                  </h4>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs">
                    {game.controls}
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-slate-800 bg-slate-900/40">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white uppercase tracking-wider"
                >
                  Mengerti & Lanjutkan
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BaseGame;
