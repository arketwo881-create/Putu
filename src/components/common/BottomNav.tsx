import React from 'react';
import { Home, Grid, Heart, Trophy, Settings } from 'lucide-react';
import { sound } from '../../services/sound';

export type TabType = 'home' | 'catalog' | 'favorites' | 'stats' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  favoritesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  favoritesCount,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Beranda', icon: Home },
    { id: 'catalog' as TabType, label: '35 Game', icon: Grid },
    { id: 'favorites' as TabType, label: 'Favorit', icon: Heart, badge: favoritesCount },
    { id: 'stats' as TabType, label: 'Prestasi', icon: Trophy },
    { id: 'settings' as TabType, label: 'Setelan', icon: Settings },
  ];

  const handleSelect = (id: TabType) => {
    sound.playClick();
    onChangeTab(id);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0a0d18]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex justify-around items-center max-w-lg mx-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              isActive
                ? 'text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-black rounded-full px-1 min-w-[14px] text-center">
                  {tab.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] mt-1 tracking-tight font-medium">
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1 h-1 bg-cyan-400 rounded-full mt-0.5 shadow-sm shadow-cyan-400" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
