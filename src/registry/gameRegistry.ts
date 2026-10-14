import React from 'react';
import { GameMetadata, GameCategory } from '../types/game';
import { GAMES_LIST } from '../data/gamesList';

// First 10 Games Component Imports
import {
  Game2048,
  SudokuGame,
  TicTacToeGame,
  MemoryMatchGame,
  MinesweeperGame,
  SlidingPuzzleGame,
  WordGuessGame,
  MathChallengeGame,
  ColorSortGame,
  ConnectDotsGame,
} from '../games/puzzle';

export interface GameComponentProps {
  game: GameMetadata;
  onBack: () => void;
}

export type GameComponent = React.ComponentType<GameComponentProps>;

export interface RegisteredGame {
  metadata: GameMetadata;
  component: GameComponent;
}

/**
 * Registry mapping for the first 10 games (Puzzle & Logika)
 */
export const FIRST_10_GAMES_REGISTRY: Record<string, RegisteredGame> = {
  'puzzle-2048': {
    metadata: GAMES_LIST.find((g) => g.id === 'puzzle-2048')!,
    component: Game2048,
  },
  'sudoku': {
    metadata: GAMES_LIST.find((g) => g.id === 'sudoku')!,
    component: SudokuGame,
  },
  'tic-tac-toe': {
    metadata: GAMES_LIST.find((g) => g.id === 'tic-tac-toe')!,
    component: TicTacToeGame,
  },
  'memory-match': {
    metadata: GAMES_LIST.find((g) => g.id === 'memory-match')!,
    component: MemoryMatchGame,
  },
  'minesweeper': {
    metadata: GAMES_LIST.find((g) => g.id === 'minesweeper')!,
    component: MinesweeperGame,
  },
  'sliding-puzzle': {
    metadata: GAMES_LIST.find((g) => g.id === 'sliding-puzzle')!,
    component: SlidingPuzzleGame,
  },
  'word-guess': {
    metadata: GAMES_LIST.find((g) => g.id === 'word-guess')!,
    component: WordGuessGame,
  },
  'math-challenge': {
    metadata: GAMES_LIST.find((g) => g.id === 'math-challenge')!,
    component: MathChallengeGame,
  },
  'color-sort': {
    metadata: GAMES_LIST.find((g) => g.id === 'color-sort')!,
    component: ColorSortGame,
  },
  'connect-dots': {
    metadata: GAMES_LIST.find((g) => g.id === 'connect-dots')!,
    component: ConnectDotsGame,
  },
};

/**
 * Helper to get registered game by ID
 */
export function getRegisteredGame(gameId: string): RegisteredGame | undefined {
  return FIRST_10_GAMES_REGISTRY[gameId];
}

/**
 * Helper to get list of the first 10 games with metadata and component
 */
export function getFirst10Games(): RegisteredGame[] {
  return Object.values(FIRST_10_GAMES_REGISTRY);
}

/**
 * Verify whether a game belongs to the first 10 games
 */
export function isFirst10Game(gameId: string): boolean {
  return gameId in FIRST_10_GAMES_REGISTRY;
}
