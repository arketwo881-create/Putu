import React from 'react';
import { GameMetadata } from '../../types/game';

// Arcade
import { SnakeGame } from '../../games/arcade/SnakeGame';
import { BrickBreakerGame } from '../../games/arcade/BrickBreakerGame';
import { PongGame } from '../../games/arcade/PongGame';
import { FlappyBirdGame } from '../../games/arcade/FlappyBirdGame';
import { SpaceShooterGame } from '../../games/arcade/SpaceShooterGame';
import { EndlessRunnerGame } from '../../games/arcade/EndlessRunnerGame';
import { FruitSliceGame } from '../../games/arcade/FruitSliceGame';
import { WhackAMoleGame } from '../../games/arcade/WhackAMoleGame';
import { StackTowerGame } from '../../games/arcade/StackTowerGame';
import { HelicopterGame } from '../../games/arcade/HelicopterGame';

// Strategy
import { CheckersGame } from '../../games/strategy/CheckersGame';
import { ChessGame } from '../../games/strategy/ChessGame';
import { ReversiGame } from '../../games/strategy/ReversiGame';
import { ConnectFourGame } from '../../games/strategy/ConnectFourGame';
import { DotsAndBoxesGame } from '../../games/strategy/DotsAndBoxesGame';

// Casual
import { BubbleShooterGame } from '../../games/casual/BubbleShooterGame';
import { JigsawPuzzleGame } from '../../games/casual/JigsawPuzzleGame';
import { MahjongGame } from '../../games/casual/MahjongGame';
import { ParkingPuzzleGame } from '../../games/casual/ParkingPuzzleGame';
import { PipeConnectGame } from '../../games/casual/PipeConnectGame';
import { ReactionTestGame } from '../../games/casual/ReactionTestGame';
import { ColorReflexGame } from '../../games/casual/ColorReflexGame';
import { RhythmTapGame } from '../../games/casual/RhythmTapGame';
import { TargetAimGame } from '../../games/casual/TargetAimGame';
import { DailyChallengeGame } from '../../games/casual/DailyChallengeGame';

import { getRegisteredGame } from '../../registry/gameRegistry';

interface GameRouterProps {
  game: GameMetadata;
  onBack: () => void;
}

export const GameRouter: React.FC<GameRouterProps> = ({ game, onBack }) => {
  // Check First 10 Games Registry
  const registered = getRegisteredGame(game.id);
  if (registered) {
    const Component = registered.component;
    return <Component game={game} onBack={onBack} />;
  }

  switch (game.id) {

    // 11-20: Arcade & Refleks
    case 'snake-classic':
      return <SnakeGame game={game} onBack={onBack} />;
    case 'brick-breaker':
      return <BrickBreakerGame game={game} onBack={onBack} />;
    case 'pong':
      return <PongGame game={game} onBack={onBack} />;
    case 'flappy-bird':
      return <FlappyBirdGame game={game} onBack={onBack} />;
    case 'space-shooter':
      return <SpaceShooterGame game={game} onBack={onBack} />;
    case 'endless-runner':
      return <EndlessRunnerGame game={game} onBack={onBack} />;
    case 'fruit-slice':
      return <FruitSliceGame game={game} onBack={onBack} />;
    case 'whack-a-mole':
      return <WhackAMoleGame game={game} onBack={onBack} />;
    case 'stack-tower':
      return <StackTowerGame game={game} onBack={onBack} />;
    case 'helicopter-escape':
      return <HelicopterGame game={game} onBack={onBack} />;

    // 21-25: Strategi & Papan
    case 'checkers':
      return <CheckersGame game={game} onBack={onBack} />;
    case 'chess':
      return <ChessGame game={game} onBack={onBack} />;
    case 'reversi':
      return <ReversiGame game={game} onBack={onBack} />;
    case 'connect-four':
      return <ConnectFourGame game={game} onBack={onBack} />;
    case 'dots-and-boxes':
      return <DotsAndBoxesGame game={game} onBack={onBack} />;

    // 26-35: Santai & Ketangkasan
    case 'bubble-shooter':
      return <BubbleShooterGame game={game} onBack={onBack} />;
    case 'jigsaw-puzzle':
      return <JigsawPuzzleGame game={game} onBack={onBack} />;
    case 'mahjong':
      return <MahjongGame game={game} onBack={onBack} />;
    case 'parking-puzzle':
      return <ParkingPuzzleGame game={game} onBack={onBack} />;
    case 'pipe-connect':
      return <PipeConnectGame game={game} onBack={onBack} />;
    case 'reaction-test':
      return <ReactionTestGame game={game} onBack={onBack} />;
    case 'color-reflex':
      return <ColorReflexGame game={game} onBack={onBack} />;
    case 'rhythm-tap':
      return <RhythmTapGame game={game} onBack={onBack} />;
    case 'target-aim':
      return <TargetAimGame game={game} onBack={onBack} />;
    case 'daily-challenge':
      return <DailyChallengeGame game={game} onBack={onBack} />;

    default:
      return (
        <div className="p-6 text-center text-white">
          <p>Game belum ditemukan.</p>
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-800 rounded-xl">
            Kembali
          </button>
        </div>
      );
  }
};
