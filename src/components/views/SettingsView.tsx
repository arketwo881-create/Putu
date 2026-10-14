import React, { useState } from 'react';
import { PlayerStats } from '../../types/game';
import { storage } from '../../services/storage';
import { sound } from '../../services/sound';
import { supabaseService } from '../../services/supabase';
import { 
  Volume2, 
  Smartphone, 
  Globe, 
  RotateCcw, 
  ShieldCheck, 
  Cloud, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface SettingsViewProps {
  stats: PlayerStats;
  onOpenProfile: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ stats, onOpenProfile }) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const isCloudActive = supabaseService.isCloudConnected();

  const handleToggleSound = () => {
    const next = !stats.soundEnabled;
    storage.setSound(next);
    sound.playClick();
  };

  const handleToggleVibration = () => {
    const next = !stats.vibrationEnabled;
    storage.setVibration(next);
    sound.playClick();
  };

  const handleLanguageChange = (lang: 'id' | 'en') => {
    storage.setLanguage(lang);
    sound.playClick();
  };

  const handleResetData = () => {
    storage.resetAllData();
    setShowResetConfirm(false);
    sound.playHit();
  };

  return (
    <div className="space-y-5 pb-24 px-4 pt-3 max-w-lg mx-auto select-none">
      <h2 className="text-lg font-bold text-white mb-2">Pengaturan Aplikasi</h2>

      {/* Profile Shortcut */}
      <div
        onClick={() => {
          sound.playClick();
          onOpenProfile();
        }}
        className="p-4 rounded-2xl bg-[#0c1222] border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition-all shadow-md active:scale-98"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            {stats.avatar}
          </span>
          <div>
            <h4 className="font-bold text-sm text-white">{stats.username}</h4>
            <span className="text-xs text-cyan-400 font-arcade">Level {stats.level} • Ubah Profil</span>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-bold">Edit ❯</span>
      </div>

      {/* Audio & Haptic Section */}
      <div className="p-4 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Suara & Getaran
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-sm font-semibold text-white block">Efek Suara (SFX)</span>
              <span className="text-[11px] text-slate-400">Suara retro sintetis web audio</span>
            </div>
          </div>
          <button
            onClick={handleToggleSound}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              stats.soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                stats.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-sm font-semibold text-white block">Getaran Haptik Mobile</span>
              <span className="text-[11px] text-slate-400">Respons getar sentuhan Android</span>
            </div>
          </div>
          <button
            onClick={handleToggleVibration}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              stats.vibrationEnabled ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                stats.vibrationEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Language Section */}
      <div className="p-4 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Bahasa Tampilan
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleLanguageChange('id')}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
              stats.language === 'id'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            🇮🇩 Bahasa Indonesia
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
              stats.language === 'en'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Connectivity & Android Ready Card */}
      <div className="p-4 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Mode Offline & Android Ready
          </h3>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Status Permainan Inti:</span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Offline Aktif
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Sinkronisasi Cloud (Supabase):</span>
          <span className="flex items-center gap-1 text-slate-400 font-bold">
            <Cloud className="w-3.5 h-3.5" /> {isCloudActive ? 'Terhubung' : 'Lokal (Siap)'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Paket Android / Capacitor:</span>
          <span className="text-cyan-400 font-mono text-[11px]">
            com.playverse35.arcade (v1.0.0)
          </span>
        </div>
      </div>

      {/* Reset Data Danger Zone */}
      <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-rose-300">Hapus Data & Skor Lokal</h4>
            <span className="text-[11px] text-slate-400 block">Kembalikan semua progres ke kondisi awal</span>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="py-1.5 px-3 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-bold border border-rose-700/60 active:scale-95 transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        {showResetConfirm && (
          <div className="pt-3 border-t border-rose-900/40 space-y-2">
            <p className="text-xs text-rose-200">
              Apakah kamu yakin? Semua skor terbaik, level, dan favorit akan dihapus permanen.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleResetData}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-white font-bold text-xs"
              >
                Ya, Hapus Semua
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-semibold text-xs"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* App Version Info */}
      <div className="text-center pt-2 text-[11px] text-slate-500 space-y-0.5">
        <p className="font-arcade">PLAYVERSE 35 — Versi 1.0.0 (Build 35)</p>
        <p>Aplikasi Mini-Game Mandiri Offline & Android Play Store Ready</p>
      </div>
    </div>
  );
};
