
export enum GameType {
  MAZE = 'MAZE',
  MEMORY = 'MEMORY',
  MATH = 'MATH',
  PLATFORMER = 'PLATFORMER',
  SNAKE = 'SNAKE'
}

export type GameState = 'MENU' | 'PLAYING' | 'GAMEOVER' | 'LEVEL_UP' | 'RECORD_NAME';

export interface LeaderboardEntry {
  name: string;
  time: number;
  level: number;
  date: string;
}

export interface UserProgress {
  [GameType.MAZE]: number;
  [GameType.MEMORY]: number;
  [GameType.MATH]: number;
  [GameType.PLATFORMER]: number;
  [GameType.SNAKE]: number;
}

export interface GlobalLeaderboard {
  [GameType.MAZE]: LeaderboardEntry[];
  [GameType.MEMORY]: LeaderboardEntry[];
  [GameType.MATH]: LeaderboardEntry[];
  [GameType.PLATFORMER]: LeaderboardEntry[];
  [GameType.SNAKE]: LeaderboardEntry[];
}
