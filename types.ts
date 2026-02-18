
export enum GameType {
  MAZE = 'MAZE',
  MEMORY = 'MEMORY',
  MATH = 'MATH',
  PLATFORMER = 'PLATFORMER',
  SNAKE = 'SNAKE'
}

export type GameState = 'MENU' | 'PLAYING' | 'GAMEOVER' | 'LEVEL_UP';

export interface UserProgress {
  [GameType.MAZE]: number;
  [GameType.MEMORY]: number;
  [GameType.MATH]: number;
  [GameType.PLATFORMER]: number;
  [GameType.SNAKE]: number;
}
