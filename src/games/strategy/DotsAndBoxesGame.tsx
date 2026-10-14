import React, { useState } from 'react';
import { GameShell } from '../../components/common/GameShell';
import { GameMetadata } from '../../types/game';
import { sound } from '../../services/sound';

interface DotsAndBoxesProps {
  game: GameMetadata;
  onBack: () => void;
}

const DOTS = 4; // 4x4 dots = 3x3 boxes

export const DotsAndBoxesGame: React.FC<DotsAndBoxesProps> = ({ game, onBack }) => {
  // Horizontal lines: 4 rows of 3 segments: [r][c]
  const [hLines, setHLines] = useState<boolean[][]>(() =>
    Array(DOTS).fill(false).map(() => Array(DOTS - 1).fill(false))
  );
  // Vertical lines: 3 rows of 4 segments: [r][c]
  const [vLines, setVLines] = useState<boolean[][]>(() =>
    Array(DOTS - 1).fill(false).map(() => Array(DOTS).fill(false))
  );
  // Claimed boxes: 3x3 array: 'P' (Player) or 'AI' or null
  const [boxes, setBoxes] = useState<('P' | 'AI' | null)[][]>(() =>
    Array(DOTS - 1).fill(null).map(() => Array(DOTS - 1).fill(null))
  );

  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [pScore, setPScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const checkCompletedBoxes = (
    hl: boolean[][],
    vl: boolean[][],
    currentBoxes: ('P' | 'AI' | null)[][],
    owner: 'P' | 'AI'
  ) => {
    let newlyCompleted = 0;
    const nextBoxes = currentBoxes.map((row) => [...row]);

    for (let r = 0; r < DOTS - 1; r++) {
      for (let c = 0; c < DOTS - 1; c++) {
        if (nextBoxes[r][c] === null) {
          const top = hl[r][c];
          const bottom = hl[r + 1][c];
          const left = vl[r][c];
          const right = vl[r][c + 1];

          if (top && bottom && left && right) {
            nextBoxes[r][c] = owner;
            newlyCompleted++;
          }
        }
      }
    }

    return { newlyCompleted, nextBoxes };
  };

  const handleLineClick = (type: 'h' | 'v', r: number, c: number) => {
    if (!isPlayerTurn || isGameOver || isVictory) return;

    if (type === 'h' && hLines[r][c]) return;
    if (type === 'v' && vLines[r][c]) return;

    sound.playClick();
    const nextHL = hLines.map((row) => [...row]);
    const nextVL = vLines.map((row) => [...row]);

    if (type === 'h') nextHL[r][c] = true;
    else nextVL[r][c] = true;

    setHLines(nextHL);
    setVLines(nextVL);

    const { newlyCompleted, nextBoxes } = checkCompletedBoxes(nextHL, nextVL, boxes, 'P');
    setBoxes(nextBoxes);

    if (newlyCompleted > 0) {
      sound.playScore();
      setPScore((sc) => {
        const next = sc + newlyCompleted;
        checkGameEnd(next, aiScore);
        return next;
      });
      // Player gets another turn!
    } else {
      setIsPlayerTurn(false);
      setTimeout(() => {
        makeAIMove(nextHL, nextVL, nextBoxes, pScore, aiScore);
      }, 500);
    }
  };

  const makeAIMove = (
    currentHL: boolean[][],
    currentVL: boolean[][],
    currentBoxes: ('P' | 'AI' | null)[][],
    currentPScore: number,
    currentAIScore: number
  ) => {
    // Collect all available line moves
    const availableLines: { type: 'h' | 'v'; r: number; c: number; closesBox: boolean }[] = [];

    for (let r = 0; r < DOTS; r++) {
      for (let c = 0; c < DOTS - 1; c++) {
        if (!currentHL[r][c]) {
          const testHL = currentHL.map((row) => [...row]);
          testHL[r][c] = true;
          const { newlyCompleted } = checkCompletedBoxes(testHL, currentVL, currentBoxes, 'AI');
          availableLines.push({ type: 'h', r, c, closesBox: newlyCompleted > 0 });
        }
      }
    }

    for (let r = 0; r < DOTS - 1; r++) {
      for (let c = 0; c < DOTS; c++) {
        if (!currentVL[r][c]) {
          const testVL = currentVL.map((row) => [...row]);
          testVL[r][c] = true;
          const { newlyCompleted } = checkCompletedBoxes(currentHL, testVL, currentBoxes, 'AI');
          availableLines.push({ type: 'v', r, c, closesBox: newlyCompleted > 0 });
        }
      }
    }

    if (availableLines.length === 0) {
      checkGameEnd(currentPScore, currentAIScore);
      return;
    }

    // AI chooses to close a box if possible
    availableLines.sort((a, b) => (b.closesBox ? 1 : 0) - (a.closesBox ? 1 : 0));
    const chosen = availableLines[0];

    const nextHL = currentHL.map((row) => [...row]);
    const nextVL = currentVL.map((row) => [...row]);
    if (chosen.type === 'h') nextHL[chosen.r][chosen.c] = true;
    else nextVL[chosen.r][chosen.c] = true;

    setHLines(nextHL);
    setVLines(nextVL);

    const { newlyCompleted, nextBoxes } = checkCompletedBoxes(nextHL, nextVL, currentBoxes, 'AI');
    setBoxes(nextBoxes);

    if (newlyCompleted > 0) {
      sound.playHit();
      const updatedAIScore = currentAIScore + newlyCompleted;
      setAiScore(updatedAIScore);
      checkGameEnd(currentPScore, updatedAIScore);

      // AI gets bonus turn!
      setTimeout(() => {
        makeAIMove(nextHL, nextVL, nextBoxes, currentPScore, updatedAIScore);
      }, 500);
    } else {
      setIsPlayerTurn(true);
    }
  };

  const checkGameEnd = (p: number, ai: number) => {
    if (p + ai >= 9) {
      if (p > ai) setIsVictory(true);
      else setIsGameOver(true);
    }
  };

  const restartGame = () => {
    setHLines(Array(DOTS).fill(false).map(() => Array(DOTS - 1).fill(false)));
    setVLines(Array(DOTS - 1).fill(false).map(() => Array(DOTS).fill(false)));
    setBoxes(Array(DOTS - 1).fill(null).map(() => Array(DOTS - 1).fill(null)));
    setPScore(0);
    setAiScore(0);
    setIsPlayerTurn(true);
    setIsGameOver(false);
    setIsVictory(false);
  };

  return (
    <GameShell
      game={game}
      onBack={onBack}
      score={pScore * 100}
      isGameOver={isGameOver}
      isVictory={isVictory}
      onRestart={restartGame}
    >
      <div className="w-full max-w-sm flex flex-col items-center select-none">
        {/* Score & Turn Info */}
        <div className="w-full flex justify-between items-center mb-4 px-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-cyan-400">
            <span>Kamu: {pScore} kotak</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-rose-400">
            <span>AI: {aiScore} kotak</span>
          </div>
        </div>

        {/* Dots and Lines Grid Container */}
        <div className="w-full max-w-[280px] aspect-square bg-[#0c1222] p-5 rounded-3xl border-2 border-slate-700 shadow-2xl flex flex-col justify-between relative">
          {Array(DOTS).fill(0).map((_, r) => (
            <React.Fragment key={r}>
              {/* Row of Dots and Horizontal Segments */}
              <div className="flex items-center justify-between">
                {Array(DOTS).fill(0).map((__, c) => (
                  <React.Fragment key={c}>
                    {/* Dot */}
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-300 shadow-md z-10" />

                    {/* Horizontal Line Segment */}
                    {c < DOTS - 1 && (
                      <button
                        onClick={() => handleLineClick('h', r, c)}
                        className={`flex-1 h-3 rounded-full mx-1 transition-all ${
                          hLines[r][c]
                            ? 'bg-cyan-400 shadow-md shadow-cyan-400/50'
                            : 'bg-slate-800 hover:bg-slate-700 active:scale-95'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Vertical Segments & Boxes between dot rows */}
              {r < DOTS - 1 && (
                <div className="flex items-center justify-between h-14">
                  {Array(DOTS).fill(0).map((___, c) => (
                    <React.Fragment key={c}>
                      {/* Vertical Line Segment */}
                      <button
                        onClick={() => handleLineClick('v', r, c)}
                        className={`w-3 h-full rounded-full my-1 transition-all ${
                          vLines[r][c]
                            ? 'bg-cyan-400 shadow-md shadow-cyan-400/50'
                            : 'bg-slate-800 hover:bg-slate-700 active:scale-95'
                        }`}
                      />

                      {/* Box interior */}
                      {c < DOTS - 1 && (
                        <div
                          className={`flex-1 h-full mx-1 rounded-xl flex items-center justify-center font-arcade font-black text-lg transition-all ${
                            boxes[r][c] === 'P'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
                              : boxes[r][c] === 'AI'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-inner'
                              : 'bg-transparent'
                          }`}
                        >
                          {boxes[r][c] ? (boxes[r][c] === 'P' ? 'YOU' : 'AI') : ''}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </GameShell>
  );
};
