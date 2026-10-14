import React, { useState } from 'react';
import { PlayerStats } from '../../types/game';
import { storage } from '../../services/storage';
import { sound } from '../../services/sound';
import { X, Check } from 'lucide-react';

interface ProfileModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

const AVATAR_OPTIONS = ['🚀', '👾', '👑', '⚡', '💎', '🦊', '🤖', '🎮', '🔥', '🛡️', '🌟', '🎯'];

export const ProfileModal: React.FC<ProfileModalProps> = ({ stats, onClose }) => {
  const [username, setUsername] = useState(stats.username);
  const [selectedAvatar, setSelectedAvatar] = useState(stats.avatar);

  const handleSave = () => {
    sound.playScore();
    storage.updateProfile(username.trim() || 'Player 1', selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f1527] border border-slate-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <h3 className="font-bold text-white text-base">Profil Pemain</h3>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Avatar Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">Pilih Avatar Arkade</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedAvatar(av);
                  }}
                  className={`p-2.5 rounded-2xl text-2xl transition-all border ${
                    selectedAvatar === av
                      ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-500 scale-105'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Username Input */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Nama Panggilan</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              placeholder="Masukkan nama pemain..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Player Level Badge */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Tingkat Kemampuan:</span>
            <span className="font-arcade font-bold text-cyan-400 text-sm">
              Level {stats.level} ({stats.xp} XP)
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-98 transition-all"
          >
            <Check className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
