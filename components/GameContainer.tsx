
import React, { useState } from 'react';
import { GameType, GameState } from '../types';
import MazeGame from '../games/MazeGame';
import MemoryMatch from '../games/MemoryMatch';
import MathQuiz from '../games/MathQuiz';
import PlatformerGame from '../games/PlatformerGame';
import SnakeGame from '../games/SnakeGame';
import { ArrowLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface GameContainerProps {
  gameType: GameType;
  currentLevel: number;
  onExit: () => void;
  onLevelUp: (level: number) => void;
}

const GameContainer: React.FC<GameContainerProps> = ({ gameType, currentLevel, onExit, onLevelUp }) => {
  const [level, setLevel] = useState(currentLevel);
  const [gameState, setGameState] = useState<GameState>('PLAYING');

  const handleWin = () => {
    if (level < 30) {
      setGameState('LEVEL_UP');
    } else {
      setGameState('GAMEOVER');
    }
  };

  const handleLose = () => {
    setGameState('GAMEOVER');
  };

  const nextLevel = () => {
    const next = Math.min(30, level + 1);
    setLevel(next);
    onLevelUp(next);
    setGameState('PLAYING');
  };

  const retryLevel = () => {
    setGameState('PLAYING');
  };

  const renderGame = () => {
    switch (gameType) {
      case GameType.MAZE: return <MazeGame level={level} onWin={handleWin} onLose={handleLose} />;
      case GameType.MEMORY: return <MemoryMatch level={level} onWin={handleWin} onLose={handleLose} />;
      case GameType.MATH: return <MathQuiz level={level} onWin={handleWin} onLose={handleLose} />;
      case GameType.PLATFORMER: return <PlatformerGame level={level} onWin={handleWin} onLose={handleLose} />;
      case GameType.SNAKE: return <SnakeGame level={level} onWin={handleWin} onLose={handleLose} />;
      default: return null;
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col bg-black overflow-hidden">
      {/* HUD Header */}
      <div className="p-4 flex justify-between items-center border-b border-[#00f3ff]/30 bg-black/80 z-20">
        <button onClick={onExit} className="p-2 hover:bg-[#00f3ff]/20 rounded transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <div className="text-[10px] opacity-60">MISSION_TARGET</div>
          <div className="cyber-font text-xl neon-glow-cyan">LEVEL {level}</div>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 relative">
        {gameState === 'PLAYING' && renderGame()}

        {/* Level Up Overlay */}
        {gameState === 'LEVEL_UP' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg animate-in fade-in zoom-in">
            <h2 className="cyber-font text-4xl mb-2 text-[#39ff14] drop-shadow-[0_0_10px_#39ff14]">LEVEL CLEAR</h2>
            <p className="text-[#39ff14] mb-8">NODE UPLOAD SUCCESSFUL</p>
            <button 
              onClick={nextLevel}
              className="flex items-center gap-2 px-8 py-3 bg-[#39ff14] text-black font-bold cyber-font hover:brightness-110 active:scale-95 transition-all"
            >
              NEXT NODE <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg">
            <h2 className="cyber-font text-4xl mb-2 text-[#ff003c] drop-shadow-[0_0_10px_#ff003c]">SYSTEM CRASH</h2>
            <p className="text-[#ff003c] mb-8">CONNECTION SEVERED</p>
            <div className="flex gap-4">
              <button 
                onClick={retryLevel}
                className="flex items-center gap-2 px-8 py-3 bg-[#00f3ff] text-black font-bold cyber-font hover:brightness-110 active:scale-95 transition-all"
              >
                REBOOT <RotateCcw size={20} />
              </button>
              <button 
                onClick={onExit}
                className="flex items-center gap-2 px-8 py-3 border border-[#00f3ff] text-[#00f3ff] font-bold cyber-font hover:bg-[#00f3ff]/10 active:scale-95 transition-all"
              >
                ABORT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  );
};

export default GameContainer;
