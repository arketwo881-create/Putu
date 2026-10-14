import React, { useState, useEffect } from 'react';
import { BaseGame } from '../../components/games/BaseGame';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface MemoryMatchProps {
  game: GameMetadata;
  onBack: () => void;
}

const ICONS = ['🚀', '👾', '💎', '⚡', '🔥', '👑', '⭐', '🍕'];

interface CardItem {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryMatchGame: React.FC<MemoryMatchProps> = ({ game, onBack }) => {
  const [cards, setCards] = useState<CardItem[]>(() => generateCards());
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timer, setTimer] = useState(60);

  function generateCards(): CardItem[] {
    const deck = [...ICONS, ...ICONS];
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck.map((icon, idx) => ({
      id: idx,
      icon,
      isFlipped: false,
      isMatched: false,
    }));
  }

  // Timer
  useEffect(() => {
    if (isVictory || isGameOver) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setIsGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isVictory, isGameOver]);

  const handleCardClick = (id: number) => {
    if (flippedIds.length >= 2 || isGameOver || isVictory) return;
    const clickedCard = cards.find((c) => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    sound.playClick();
    const newCards = cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c));
    setCards(newCards);
    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = newFlipped;
      const card1 = cards.find((c) => c.id === firstId)!;
      const card2 = cards.find((c) => c.id === secondId)!;

      if (card1.icon === card2.icon) {
        sound.playScore();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c))
          );
          setFlippedIds([]);
          setScore((s) => s + 100);

          // Check if all matched
          const allMatched = newCards.every((c) => c.id === firstId || c.id === secondId || c.isMatched);
          if (allMatched) {
            setIsVictory(true);
            setScore((s) => s + timer * 10);
          }
        }, 300);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c))
          );
          setFlippedIds([]);
        }, 800);
      }
    }
  };

  const restartGame = () => {
    setCards(generateCards());
    setFlippedIds([]);
    setMoves(0);
    setScore(0);
    setTimer(60);
    setIsGameOver(false);
    setIsVictory(false);
  };

  return (
    <BaseGame
      game={game}
      onBack={onBack}
      score={score}
      moves={moves}
      timeRemaining={timer}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        {/* 4x4 Cards Grid */}
        <div className="w-full aspect-square bg-[#0c1122] p-3 rounded-2xl border-2 border-slate-700/80 shadow-2xl grid grid-cols-4 grid-rows-4 gap-2.5">
          {cards.map((card) => {
            const showFace = card.isFlipped || card.isMatched;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`w-full h-full rounded-xl flex items-center justify-center text-3xl font-bold transition-all duration-300 border ${
                  card.isMatched
                    ? 'bg-emerald-900/50 border-emerald-500/60 opacity-80 cursor-default scale-95'
                    : showFace
                    ? 'bg-cyan-950 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-transparent active:scale-95'
                }`}
              >
                {showFace ? card.icon : '❓'}
              </button>
            );
          })}
        </div>
      </div>
    </BaseGame>
  );
};
