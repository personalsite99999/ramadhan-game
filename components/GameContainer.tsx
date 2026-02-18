
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameType, GameState, LeaderboardEntry, GlobalLeaderboard } from '../types';
import MazeGame from '../games/MazeGame';
import MemoryMatch from '../games/MemoryMatch';
import MathQuiz from '../games/MathQuiz';
import PlatformerGame from '../games/PlatformerGame';
import SnakeGame from '../games/SnakeGame';
import { ArrowLeft, ChevronRight, RotateCcw, Timer, Save, Trophy, XCircle } from 'lucide-react';

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
  const [isQualified, setIsQualified] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState]);

  const checkQualification = useCallback(() => {
    const leaderboard: GlobalLeaderboard = JSON.parse(localStorage.getItem('ramadhan_leaderboard') || '{}');
    const entries = leaderboard[gameType] || [];
    
    if (entries.length < 5) return true;

    const sorted = [...entries].sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return a.time - b.time;
    });

    const fifthPlace = sorted[4];
    if (level > fifthPlace.level) return true;
    if (level === fifthPlace.level && elapsedTime < fifthPlace.time) return true;

    return false;
  }, [gameType, level, elapsedTime]);

  const handleWin = useCallback(() => {
    const qualified = checkQualification();
    setIsQualified(qualified);
    setGameState('RECORD_NAME');
  }, [checkQualification]);

  const handleLose = useCallback(() => {
    setGameState('GAMEOVER');
  }, []);

  const saveRecord = () => {
    if (isQualified && playerName.trim()) {
      const leaderboard: GlobalLeaderboard = JSON.parse(localStorage.getItem('ramadhan_leaderboard') || '{}');
      if (!leaderboard[gameType]) leaderboard[gameType] = [];
      
      const newEntry: LeaderboardEntry = {
        name: playerName.trim().toUpperCase(),
        time: elapsedTime,
        level: level,
        date: new Date().toISOString()
      };
      
      const updatedEntries = [...leaderboard[gameType], newEntry]
        .sort((a, b) => {
          if (b.level !== a.level) return b.level - a.level;
          return a.time - b.time;
        })
        .slice(0, 5);
      
      leaderboard[gameType] = updatedEntries;
      localStorage.setItem('ramadhan_leaderboard', JSON.stringify(leaderboard));
    }
    
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
    setPlayerName('');
    setGameState('PLAYING');
  };

  const retryLevel = () => {
    setElapsedTime(0);
    setPlayerName('');
    setGameState('PLAYING');
  };

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
      <div className="p-4 flex justify-between items-center border-b border-[#00f3ff]/30 bg-black/80 z-20">
        <button onClick={onExit} className="p-2 hover:bg-[#00f3ff]/20 rounded transition-colors text-[#00f3ff]">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <div className="text-[10px] opacity-60 text-[#00f3ff]">MISSION_NODE</div>
          <div className="cyber-font text-xl neon-glow-cyan text-[#00f3ff]">LEVEL {level}</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-[10px] opacity-60 flex items-center gap-1 text-[#00f3ff]"><Timer size={10}/> RUNTIME</div>
          <div className="cyber-font text-xs text-[#39ff14]">{(elapsedTime / 1000).toFixed(1)}s</div>
        </div>
      </div>

      <div className="flex-1 relative">
        {gameComponent}

        {gameState === 'RECORD_NAME' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-6">
            {isQualified ? (
              <>
                <div className="mb-4 p-4 bg-[#facc15]/10 border-2 border-[#facc15] rounded-full animate-bounce">
                  <Trophy size={48} className="text-[#facc15]" />
                </div>
                <h2 className="cyber-font text-3xl mb-2 text-[#facc15] neon-glow-orange text-center">TOP 5 RANK!</h2>
                <div className="text-center mb-6">
                  <p className="text-xs opacity-60 uppercase mb-1 text-white">Clear Time</p>
                  <p className="text-4xl cyber-font text-[#39ff14]">{(elapsedTime / 1000).toFixed(2)}s</p>
                </div>
                <div className="w-full max-w-xs space-y-4">
                  <input 
                    type="text" 
                    maxLength={10}
                    autoFocus
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="ENTER_NAME"
                    className="w-full bg-black/50 border-2 border-[#facc15] p-4 cyber-font text-center text-white focus:outline-none"
                  />
                  <button onClick={saveRecord} className="w-full py-4 bg-[#facc15] text-black font-black cyber-font flex items-center justify-center gap-2">
                    PUBLISH RECORD <Save size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 p-4 bg-red-500/10 border-2 border-red-500 rounded-full">
                  <XCircle size={48} className="text-red-500" />
                </div>
                <h2 className="cyber-font text-2xl mb-2 text-red-500 text-center uppercase">REKOR TIDAK TERKEJAR</h2>
                <p className="text-white/60 text-[10px] cyber-font mb-8 text-center max-w-[200px]">Skor kamu belum cukup untuk masuk Hall of Fame.</p>
                <button onClick={saveRecord} className="px-10 py-4 border-2 border-[#00f3ff] text-[#00f3ff] font-bold cyber-font">
                  LANJUTKAN
                </button>
              </>
            )}
          </div>
        )}

        {gameState === 'LEVEL_UP' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg">
            <h2 className="cyber-font text-4xl mb-2 text-[#39ff14]">LEVEL CLEAR</h2>
            <button onClick={nextLevel} className="flex items-center gap-2 px-8 py-3 bg-[#39ff14] text-black font-bold cyber-font">
              NEXT NODE <ChevronRight size={20} />
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg">
            <h2 className="cyber-font text-4xl mb-2 text-[#ff003c]">SYSTEM CRASH</h2>
            <div className="flex gap-4">
              <button onClick={retryLevel} className="px-8 py-3 bg-[#00f3ff] text-black font-bold cyber-font">REBOOT</button>
              <button onClick={onExit} className="px-8 py-3 border border-[#00f3ff] text-[#00f3ff] font-bold cyber-font">ABORT</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameContainer;
