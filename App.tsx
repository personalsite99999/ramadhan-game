
import React, { useState, useEffect } from 'react';
import { GameType, UserProgress } from './types';
import Dashboard from './components/Dashboard';
import GameContainer from './components/GameContainer';

const App: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    [GameType.MAZE]: 1,
    [GameType.MEMORY]: 1,
    [GameType.MATH]: 1,
    [GameType.PLATFORMER]: 1,
    [GameType.SNAKE]: 1,
  });

  useEffect(() => {
    const saved = localStorage.getItem('cyberquest_progress');
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load progress", e);
      }
    }
  }, []);

  const saveProgress = (game: GameType, level: number) => {
    const newProgress = { ...progress, [game]: level };
    setProgress(newProgress);
    localStorage.setItem('cyberquest_progress', JSON.stringify(newProgress));
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#00f3ff] flex flex-col items-center overflow-hidden">
      {!activeGame ? (
        <Dashboard 
          progress={progress} 
          onSelectGame={(game) => setActiveGame(game)} 
        />
      ) : (
        <GameContainer 
          gameType={activeGame} 
          currentLevel={progress[activeGame]}
          onExit={() => setActiveGame(null)}
          onLevelUp={(level) => saveProgress(activeGame, level)}
        />
      )}
    </div>
  );
};

export default App;
