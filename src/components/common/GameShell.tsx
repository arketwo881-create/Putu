import React from 'react';
import { BaseGame, BaseGameProps } from '../games/BaseGame';

export type GameShellProps = BaseGameProps;

export const GameShell: React.FC<GameShellProps> = (props) => {
  return <BaseGame {...props} />;
};

export default GameShell;
