
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameType, GameState, LeaderboardEntry, GlobalLeaderboard } from '../types';
import MazeGame from '../games/MazeGame';
import MemoryMatch from '../games/MemoryMatch';
import MathQuiz from '../games/MathQuiz';
import PlatformerGame from '../games/PlatformerGame';
import SnakeGame from '../games/SnakeGame';
import { ArrowLeft, ChevronRight, RotateCcw, Timer, Save } from 'lucide-react';

interface GameContainerProps {
  gameType: GameType;
  currentLevel: number;
  onExit: () => void;
  onLevelUp: (level: number) => void;
}

const GameContainer: React.FC<GameContainerProps> = ({ gameType, currentLevel, onExit, onLevelUp }) => {
  const [level, setLevel] = useState(currentLevel);
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Use refs to keep track of current state for stable callbacks
  const levelRef = useRef(level);
  useEffect(() => { levelRef.current = level; }, [level]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 100); // Updated to 100ms for performance, UI still feels fast
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState]);

  // Stable callbacks for the games
  const handleWin = useCallback(() => {
    setGameState('RECORD_NAME');
  }, []);

  const handleLose = useCallback(() => {
    setGameState('GAMEOVER');
  }, []);

  const saveRecord = () => {
    if (!playerName.trim()) return;
    
    const leaderboard: GlobalLeaderboard = JSON.parse(localStorage.getItem('ramadhan_leaderboard') || '{}');
    if (!leaderboard[gameType]) leaderboard[gameType] = [];
    
    const newEntry: LeaderboardEntry = {
      name: playerName.trim(),
      time: elapsedTime,
      level: level,
      date: new Date().toISOString()
    };
    
    leaderboard[gameType].push(newEntry);
    localStorage.setItem('ramadhan_leaderboard', JSON.stringify(leaderboard));
    
    if (level < 30) {
      setGameState('LEVEL_UP');
    } else {
      setGameState('GAMEOVER');
    }
  };

  const nextLevel = () => {
    const next = Math.min(30, level + 1);
    setLevel(next);
    onLevelUp(next);
    setElapsedTime(0);
    setGameState('PLAYING');
  };

  const retryLevel = () => {
    setElapsedTime(0);
    setGameState('PLAYING');
  };

  // Memoize the game component to avoid re-mounting on timer ticks
  const gameComponent = useMemo(() => {
    if (gameState !== 'PLAYING') return null;
    
    switch (gameType) {
      case GameType.MAZE: return <MazeGame level={level} onWin={handleWin} onLose={handleLose} />;
      case GameType.MEMORY: return <MemoryMatch level={level} onWin={handleWin} onLose={handleLose} />;
      case GameType.MATH: return <MathQuiz level={level} onWin={handleWin} onLose={handleLose} />;
      case GameType.PLATFORMER: return <PlatformerGame level={level} onWin={handleWin} onLose={handleLose} />;
      case GameType.SNAKE: return <SnakeGame level={level} onWin={handleWin} onLose={handleLose} />;
      default: return null;
    }
  }, [gameType, level, gameState, handleWin, handleLose]);

  return (
    <div className="relative w-full h-full flex flex-col bg-black overflow-hidden">
      {/* HUD Header */}
      <div className="p-4 flex justify-between items-center border-b border-[#00f3ff]/30 bg-black/80 z-20">
        <button onClick={onExit} className="p-2 hover:bg-[#00f3ff]/20 rounded transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <div className="text-[10px] opacity-60">MISSION_TARGET</div>
          <div className="cyber-font text-xl neon-glow-cyan">LEVEL {level}</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-[10px] opacity-60 flex items-center gap-1"><Timer size={10}/> RUNTIME</div>
          <div className="cyber-font text-xs text-[#39ff14]">{(elapsedTime / 1000).toFixed(1)}s</div>
        </div>
      </div>

      <div className="flex-1 relative">
        {gameComponent}

        {/* Record Name Overlay */}
        {gameState === 'RECORD_NAME' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-6">
            <h2 className="cyber-font text-3xl mb-2 text-[#facc15] neon-glow-cyan text-center">NEW RECORD!</h2>
            <div className="text-center mb-6">
              <p className="text-xs opacity-60 uppercase mb-1">Clear Time</p>
              <p className="text-4xl cyber-font text-[#39ff14]">{(elapsedTime / 1000).toFixed(2)}s</p>
            </div>
            
            <div className="w-full max-w-xs space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  maxLength={12}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="INPUT_ID_TAG"
                  className="w-full bg-black/50 border border-cyan-500/50 p-4 cyber-font text-center text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
              <button 
                onClick={saveRecord}
                className="w-full py-4 bg-cyan-600 text-white font-bold cyber-font flex items-center justify-center gap-2 hover:bg-cyan-500 active:scale-95 transition-all"
              >
                <Save size={18} /> UPLOAD SCORE
              </button>
            </div>
          </div>
        )}

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

      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  );
};

export default GameContainer;
