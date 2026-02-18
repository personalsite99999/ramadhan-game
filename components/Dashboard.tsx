
import React, { useState } from 'react';
import { GameType, UserProgress, GlobalLeaderboard } from '../types';
import { LayoutGrid, Brain, Binary, Rocket, MoveHorizontal, MessageCircle, Trophy, X } from 'lucide-react';

interface DashboardProps {
  progress: UserProgress;
  onSelectGame: (game: GameType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ progress, onSelectGame }) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<GlobalLeaderboard | null>(null);

  const games = [
    { type: GameType.MAZE, icon: <LayoutGrid />, label: 'CYBER-MAZE', color: 'cyan' },
    { type: GameType.MEMORY, icon: <Brain />, label: 'NEURAL-MATCH', color: 'purple' },
    { type: GameType.MATH, icon: <Binary />, label: 'QUANTUM-MATH', color: 'green' },
    { type: GameType.PLATFORMER, icon: <Rocket />, label: 'GLITCH-HOPPER', color: 'cyan' },
    { type: GameType.SNAKE, icon: <MoveHorizontal />, label: 'DATA-SERPENT', color: 'purple' },
  ];

  const openLeaderboard = () => {
    const saved = localStorage.getItem('ramadhan_leaderboard');
    if (saved) setLeaderboardData(JSON.parse(saved));
    setShowLeaderboard(true);
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden no-scrollbar">
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Floating Buttons */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        <a 
          href="https://wa.me/6281341300100" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-3 bg-[#25D366] text-white rounded-full shadow-[0_0_20px_#25D366] flex items-center justify-center animate-bounce hover:scale-110 transition-transform"
        >
          <MessageCircle size={24} />
        </a>
        <button 
          onClick={openLeaderboard}
          className="p-3 bg-[#facc15] text-black rounded-full shadow-[0_0_20px_#facc15] flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Trophy size={24} />
        </button>
      </div>

      <div className="w-full overflow-hidden bg-black/60 border-y border-[#00f3ff]/20 py-2 sticky top-0 z-40 backdrop-blur-sm">
        <div className="animate-marquee whitespace-nowrap text-[#39ff14] cyber-font text-[10px] tracking-widest uppercase">
          DONASI : 0813-41-300-100 (VIA SHOPEE - OVO - GOPAY - DANA) --- HUBUNGI VIA WHATSAPP : 0813-41-300-100 --- DONASI : 0813-41-300-100 (VIA SHOPEE - OVO - GOPAY - DANA) ---
        </div>
      </div>

      <div className="p-6 pb-20">
        <div className="text-center mb-8 pt-4">
          <h1 className="cyber-font text-4xl font-bold tracking-tighter neon-glow-cyan mb-2">RAMADHAN</h1>
          <h2 className="cyber-font text-2xl font-light neon-glow-purple tracking-widest uppercase">Games</h2>
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#00f3ff] to-transparent mt-4 opacity-50" />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {games.map((game) => (
            <button
              key={game.type}
              onClick={() => onSelectGame(game.type)}
              className={`
                group relative p-4 bg-black/40 backdrop-blur-md flex items-center gap-4 
                transition-all duration-300 transform hover:scale-105 active:scale-95
                ${game.color === 'cyan' ? 'neon-border-cyan' : game.color === 'purple' ? 'neon-border-purple' : 'border border-[#39ff14] shadow-[0_0_10px_#39ff14,inset_0_0_5px_#39ff14]'}
              `}
            >
              <div className={`p-2 rounded-sm ${game.color === 'cyan' ? 'text-[#00f3ff]' : game.color === 'purple' ? 'text-[#bc13fe]' : 'text-[#39ff14]'}`}>
                {React.cloneElement(game.icon as React.ReactElement, { size: 32 })}
              </div>
              <div className="flex-1 text-left">
                <span className="block cyber-font text-lg font-bold tracking-tight group-hover:glitch-text">
                  {game.label}
                </span>
                <span className="text-xs opacity-60">LEVEL {progress[game.type]} / 30</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 p-4 bg-black/60 border border-[#00f3ff]/10 rounded text-center">
          <p className="text-xs text-[#00f3ff]/80 mb-2">
            Kontak : <a href="https://wa.me/6281341300100" className="underline hover:text-white transition-colors">Hubungi Via Whatsapp : 0813-41-300-100</a>
          </p>
          <p className="text-xs text-[#39ff14]/80">
            Donasi : 0813-41-300-100 (Via Shopee - Ovo - Gopay - Dana)
          </p>
        </div>
      </div>

      <div className="w-full py-8 text-center border-t border-[#00f3ff]/10 bg-black/40 mt-auto">
        <span className="text-[10px] opacity-60 cyber-font block">
          Copyright © 2026, Johan - 081341300100
        </span>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col p-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="cyber-font text-2xl neon-glow-cyan flex items-center gap-2"><Trophy /> HALL OF FAME</h2>
            <button onClick={() => setShowLeaderboard(false)} className="p-2 border border-red-500 text-red-500 rounded-full"><X size={20}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
            {games.map(game => (
              <div key={game.type} className="border border-[#00f3ff]/20 p-4 rounded bg-black/40">
                <h3 className="cyber-font text-sm text-purple-400 mb-3 border-b border-purple-400/20 pb-1">{game.label} RECORDS</h3>
                {!leaderboardData?.[game.type] || leaderboardData[game.type].length === 0 ? (
                  <p className="text-[10px] opacity-40">NO RECORDS DETECTED...</p>
                ) : (
                  <div className="space-y-2">
                    {leaderboardData[game.type].sort((a,b) => a.time - b.time).slice(0, 5).map((entry, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-2">
                          <span className="opacity-40">{idx + 1}.</span>
                          <span className="text-white font-bold">{entry.name}</span>
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="text-cyan-400">LVL {entry.level}</span>
                          <span className="text-[#39ff14]">{(entry.time / 1000).toFixed(2)}s</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
