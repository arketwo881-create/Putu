import React, { useState } from 'react';
import { BaseGame } from '../../components/games/BaseGame';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';
import { Delete, CornerDownLeft } from 'lucide-react';

interface WordGuessProps {
  game: GameMetadata;
  onBack: () => void;
}

const WORDS = [
  'SURYA', 'BINTANG', 'PLANET', 'ROKET', 'ANGIN', 'LAUTAN', 'PULAU', 
  'HUJAN', 'SENJA', 'BUNGA', 'MOTOR', 'MOBIL', 'KAPAL', 'KERETA',
  'JUARA', 'KAPAL', 'LAMPU', 'PINTU', 'KASUR', 'KUNCI', 'POHON'
].filter((w) => w.length === 5);

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];

export const WordGuessGame: React.FC<WordGuessProps> = ({ game, onBack }) => {
  const [targetWord, setTargetWord] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isVictory, setIsVictory] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const handleKeyPress = (key: string) => {
    if (isVictory || isGameOver) return;

    if (key === 'DEL' || key === 'BACKSPACE') {
      sound.playClick();
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        sound.playHit();
        return;
      }

      sound.playScore();
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);

      if (currentGuess === targetWord) {
        setIsVictory(true);
        const points = (7 - newGuesses.length) * 150;
        setScore(points);
        return;
      }

      if (newGuesses.length >= 6) {
        setIsGameOver(true);
      }

      setCurrentGuess('');
      return;
    }

    if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
      sound.playClick();
      setCurrentGuess((prev) => prev + key);
    }
  };

  const getLetterStatus = (letter: string, index: number, guessWord: string) => {
    if (targetWord[index] === letter) return 'correct'; // Green
    if (targetWord.includes(letter)) return 'present'; // Yellow
    return 'absent'; // Gray
  };

  const getKeyStatus = (key: string) => {
    let status = 'default';
    for (const g of guesses) {
      for (let i = 0; i < 5; i++) {
        if (g[i] === key) {
          if (targetWord[i] === key) return 'correct';
          if (targetWord.includes(key)) status = 'present';
          else if (status === 'default') status = 'absent';
        }
      }
    }
    return status;
  };

  const restartGame = () => {
    setTargetWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuesses([]);
    setCurrentGuess('');
    setIsVictory(false);
    setIsGameOver(false);
    setScore(0);
  };

  return (
    <BaseGame
      game={game}
      onBack={onBack}
      score={score}
      moves={guesses.length}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        {/* Guesses Grid 6 Rows x 5 Cols */}
        <div className="grid grid-rows-6 gap-1.5 mb-5 w-full max-w-[280px]">
          {Array(6).fill(0).map((_, rowIdx) => {
            const guess = guesses[rowIdx];
            const isCurrent = rowIdx === guesses.length;

            return (
              <div key={rowIdx} className="grid grid-cols-5 gap-1.5">
                {Array(5).fill(0).map((_, colIdx) => {
                  let letter = '';
                  let status = 'empty';

                  if (guess) {
                    letter = guess[colIdx];
                    status = getLetterStatus(letter, colIdx, guess);
                  } else if (isCurrent) {
                    letter = currentGuess[colIdx] || '';
                    status = letter ? 'typing' : 'empty';
                  }

                  let bgStyle = 'bg-slate-900 border-slate-800 text-white';
                  if (status === 'correct') {
                    bgStyle = 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/20';
                  } else if (status === 'present') {
                    bgStyle = 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-500/20';
                  } else if (status === 'absent') {
                    bgStyle = 'bg-slate-800 border-slate-700 text-slate-400';
                  } else if (status === 'typing') {
                    bgStyle = 'bg-slate-850 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/40';
                  }

                  return (
                    <div
                      key={colIdx}
                      className={`aspect-square rounded-xl border flex items-center justify-center font-arcade font-black text-xl transition-all ${bgStyle}`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {isGameOver && (
          <div className="mb-3 text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-800 px-3 py-1.5 rounded-xl">
            Kata Rahasia: {targetWord}
          </div>
        )}

        {/* Virtual On-screen Keyboard */}
        <div className="w-full space-y-1.5">
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1">
              {row.map((key) => {
                const status = getKeyStatus(key);
                let btnStyle = 'bg-slate-800 text-slate-200 border-slate-700';
                if (status === 'correct') btnStyle = 'bg-emerald-600 text-white border-emerald-500';
                else if (status === 'present') btnStyle = 'bg-amber-600 text-white border-amber-500';
                else if (status === 'absent') btnStyle = 'bg-slate-900 text-slate-500 border-slate-850';

                const isAction = key === 'ENTER' || key === 'DEL';

                return (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className={`h-11 rounded-lg text-xs font-arcade font-bold border transition-all active:scale-95 flex items-center justify-center ${btnStyle} ${
                      isAction ? 'px-2 sm:px-3 text-[10px] bg-slate-700' : 'flex-1 max-w-[34px]'
                    }`}
                  >
                    {key === 'ENTER' ? <CornerDownLeft className="w-3.5 h-3.5" /> : key === 'DEL' ? <Delete className="w-4 h-4" /> : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </BaseGame>
  );
};
