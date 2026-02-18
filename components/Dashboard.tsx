
import React from 'react';
import { GameType, UserProgress } from '../types';
import { LayoutGrid, Brain, Binary, Rocket, MoveHorizontal, MessageCircle } from 'lucide-react';

interface DashboardProps {
  progress: UserProgress;
  onSelectGame: (game: GameType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ progress, onSelectGame }) => {
  const games = [
    { type: GameType.MAZE, icon: <LayoutGrid />, label: 'CYBER-MAZE', color: 'cyan' },
    { type: GameType.MEMORY, icon: <Brain />, label: 'NEURAL-MATCH', color: 'purple' },
    { type: GameType.MATH, icon: <Binary />, label: 'QUANTUM-MATH', color: 'green' },
    { type: GameType.PLATFORMER, icon: <Rocket />, label: 'GLITCH-HOPPER', color: 'cyan' },
    { type: GameType.SNAKE, icon: <MoveHorizontal />, label: 'DATA-SERPENT', color: 'purple' },
  ];

  return (
    <div className="w-full max-w-md p-6 mt-10 flex flex-col min-h-screen relative">
      {/* Floating Contact Button */}
      <a 
        href="https://wa.me/6281341300100" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute top-0 right-6 p-2 bg-[#25D366] text-white rounded-full shadow-[0_0_15px_#25D366] flex items-center justify-center animate-bounce z-50 hover:scale-110 transition-transform"
      >
        <MessageCircle size={28} />
      </a>

      {/* Animated Moving Donation Info */}
      <div className="w-full overflow-hidden bg-black/60 border-y border-[#00f3ff]/20 py-2 mb-6">
        <div className="animate-marquee whitespace-nowrap text-[#39ff14] cyber-font text-xs tracking-widest uppercase">
          DONASI : 0813-41-300-100 (VIA SHOPEE - OVO - GOPAY - DANA) --- HUBUNGI VIA WHATSAPP : 0813-41-300-100 --- DONASI : 0813-41-300-100 (VIA SHOPEE - OVO - GOPAY - DANA) ---
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="cyber-font text-4xl font-bold tracking-tighter neon-glow-cyan mb-2">RAMADHAN</h1>
        <h2 className="cyber-font text-2xl font-light neon-glow-purple tracking-widest uppercase">Games</h2>
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#00f3ff] to-transparent mt-4 opacity-50" />
      </div>

      <div className="grid grid-cols-1 gap-4 flex-1">
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
            <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-current to-transparent opacity-30" />
          </button>
        ))}
      </div>

      {/* Description & Contact Links */}
      <div className="mt-10 p-4 bg-black/60 border border-[#00f3ff]/10 rounded text-center mb-8">
        <p className="text-xs text-[#00f3ff]/80 mb-2">
          Kontak : <a href="https://wa.me/6281341300100" className="underline hover:text-white transition-colors">Hubungi Via Whatsapp : 0813-41-300-100</a>
        </p>
        <p className="text-xs text-[#39ff14]/80">
          Donasi : 0813-41-300-100 (Via Shopee - Ovo - Gopay - Dana)
        </p>
      </div>

      <div className="mb-8 text-center text-[10px] opacity-40 uppercase tracking-[0.2em]">
        System Status: Operational // User: Player_01
      </div>

      {/* Copyright Footer */}
      <div className="w-full py-6 text-center border-t border-[#00f3ff]/10 mt-auto">
        <span className="text-[10px] opacity-60 cyber-font block">
          Copyright © 2026, Johan - 081341300100
        </span>
      </div>
    </div>
  );
};

export default Dashboard;
