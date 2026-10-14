import React, { useEffect, useState } from 'react';
import { Sparkles, Gamepad2 } from 'lucide-react';
import { sound } from '../../services/sound';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    sound.playScore();
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 200);
          return 100;
        }
        return p + 8;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-[#070913] flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Glow effect background */}
      <div className="absolute w-72 h-72 rounded-full bg-cyan-600/15 blur-3xl" />
      <div className="absolute w-72 h-72 rounded-full bg-indigo-600/15 blur-3xl -translate-y-24" />

      {/* Main Arcade Logo */}
      <div className="relative z-10 flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-2xl shadow-cyan-500/30 mb-5 animate-pulse">
          <div className="w-full h-full bg-[#0a0f20] rounded-[22px] flex items-center justify-center">
            <Gamepad2 className="w-12 h-12 text-cyan-400" />
          </div>
        </div>

        <h1 className="font-arcade text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 tracking-widest drop-shadow-lg">
          PLAYVERSE 35
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">
          35 Mini Games Arcade Universe
        </p>
      </div>

      {/* Loading Progress Bar */}
      <div className="relative z-10 w-full max-w-xs space-y-2">
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-75 shadow-sm shadow-cyan-400"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-500 font-arcade">
          <span>MEMUAT 35 GAME...</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};
