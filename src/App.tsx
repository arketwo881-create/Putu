import React, { useState, useEffect } from 'react';
import { GameMetadata, PlayerStats } from './types/game';
import { storage } from './services/storage';
import { sound } from './services/sound';
import { Header } from './components/common/Header';
import { BottomNav, TabType } from './components/common/BottomNav';
import { GameRouter } from './components/common/GameRouter';
import { HomeView } from './components/views/HomeView';
import { CatalogView } from './components/views/CatalogView';
import { FavoritesView } from './components/views/FavoritesView';
import { StatsView } from './components/views/StatsView';
import { SettingsView } from './components/views/SettingsView';
import { ProfileModal } from './components/views/ProfileModal';
import { GameDetailModal } from './components/views/GameDetailModal';
import { SplashScreen } from './components/views/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [stats, setStats] = useState<PlayerStats>(() => storage.getStats());
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [catalogCategory, setCatalogCategory] = useState<string>('all');
  const [activeGame, setActiveGame] = useState<GameMetadata | null>(null);
  const [detailGame, setDetailGame] = useState<GameMetadata | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  // Subscribe to storage updates (XP, scores, level, favorites)
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setStats(storage.getStats());
    });
    return () => unsubscribe();
  }, []);

  // Handle Android Hardware / Browser Back Button
  useEffect(() => {
    const handlePopState = () => {
      if (activeGame) {
        setActiveGame(null);
      } else if (detailGame) {
        setDetailGame(null);
      } else if (showProfile) {
        setShowProfile(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeGame, detailGame, showProfile]);

  const handleLaunchGame = (game: GameMetadata) => {
    sound.playScore();
    storage.recordGamePlay(game.id);
    setDetailGame(null);
    setActiveGame(game);
    // Push history state for back button navigation
    window.history.pushState({ inGame: true }, '');
  };

  const handleBackToMenu = () => {
    sound.playClick();
    setActiveGame(null);
  };

  const handleOpenAllGames = (category?: string) => {
    setCatalogCategory(category || 'all');
    setActiveTab('catalog');
  };

  const handleToggleFavorite = (gameId: string) => {
    storage.toggleFavorite(gameId);
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Active Game Viewport
  if (activeGame) {
    return (
      <GameRouter
        game={activeGame}
        onBack={handleBackToMenu}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070914] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Top Application Bar */}
      <Header
        stats={stats}
        onOpenProfile={() => setShowProfile(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <HomeView
            stats={stats}
            onSelectGame={(g) => setDetailGame(g)}
            onQuickPlay={handleLaunchGame}
            onToggleFavorite={handleToggleFavorite}
            onOpenAllGames={handleOpenAllGames}
            dailyChallenge={storage.getDailyChallenge()}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogView
            initialCategory={catalogCategory}
            onSelectGame={(g) => setDetailGame(g)}
            onQuickPlay={handleLaunchGame}
            favorites={stats.favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            favorites={stats.favorites}
            onSelectGame={(g) => setDetailGame(g)}
            onQuickPlay={handleLaunchGame}
            onToggleFavorite={handleToggleFavorite}
            onOpenCatalog={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView stats={stats} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            stats={stats}
            onOpenProfile={() => setShowProfile(true)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        favoritesCount={stats.favorites.length}
      />

      {/* Game Detail & Instructions Modal */}
      {detailGame && (
        <GameDetailModal
          game={detailGame}
          onClose={() => setDetailGame(null)}
          onPlay={handleLaunchGame}
          isFavorite={stats.favorites.includes(detailGame.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Player Profile & Avatar Selector Modal */}
      {showProfile && (
        <ProfileModal
          stats={stats}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
