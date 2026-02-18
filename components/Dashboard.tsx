
import React, { useState, useEffect } from 'react';
import { GameType, UserProgress, GlobalLeaderboard, LeaderboardEntry } from '../types';
import { LayoutGrid, Brain, Binary, Rocket, MoveHorizontal, MessageCircle, Trophy, X, Crown } from 'lucide-react';

interface DashboardProps {
  progress: UserProgress;
  onSelectGame: (game: GameType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ progress, onSelectGame }) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<GlobalLeaderboard | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ramadhan_leaderboard');
    if (saved) setLeaderboardData(JSON.parse(saved));
  }, []);

  const games = [
    { type: GameType.MAZE, icon: <LayoutGrid />, label: 'NYARI JALAN', color: 'cyan', hex: '#00f3ff' },
    { type: GameType.MEMORY, icon: <Brain />, label: 'ADU MEMORI', color: 'purple', hex: '#bc13fe' },
    { type: GameType.MATH, icon: <Binary />, label: 'NGITUNG CEPAT', color: 'green', hex: '#39ff14' },
    { type: GameType.PLATFORMER, icon: <Rocket />, label: 'LOMPAT CUY', color: 'orange', hex: '#ff9100' },
    { type: GameType.SNAKE, icon: <MoveHorizontal />, label: 'PANJANGIN ULER', color: 'pink', hex: '#ff00ff' },
  ];

  const getTopRecord = (type: GameType): LeaderboardEntry | null => {
    if (!leaderboardData || !leaderboardData[type] || leaderboardData[type].length === 0) return null;
    // Sort by Level (desc) then Time (asc)
    const sorted = [...leaderboardData[type]].sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return a.time - b.time;
    });
    return sorted[0];
  };

  const openLeaderboard = () => {
    const saved = localStorage.getItem('ramadhan_leaderboard');
    if (saved) setLeaderboardData(JSON.parse(saved));
    setShowLeaderboard(true);
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden no-scrollbar bg-[#000033]">
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .text-stroke-sm {
          text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
        }
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

      <div className="p-6 pb-20">
        <div className="text-center mb-6 pt-4">
          <h1 className="cyber-font text-4xl font-black tracking-tighter neon-glow-cyan mb-2">RAMADHAN</h1>
          <h2 className="cyber-font text-2xl font-bold neon-glow-purple tracking-widest uppercase">Games</h2>
          
          <div className="w-full overflow-hidden bg-black/40 border-y border-[#facc15]/30 py-2 mt-4 backdrop-blur-sm">
            <div className="animate-marquee whitespace-nowrap text-[#facc15] cyber-font text-[10px] tracking-widest uppercase font-bold">
              DONASI : 0813-41-300-100 (VIA SHOPEE - OVO - GOPAY - DANA) --- HUBUNGI VIA WHATSAPP : 0813-41-300-100 --- DONASI : 0813-41-300-100 (VIA SHOPEE - OVO - GOPAY - DANA) ---
            </div>
          </div>
          
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#00f3ff] to-transparent mt-4 opacity-50" />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {games.map((game) => {
            const topRecord = getTopRecord(game.type);
            return (
              <button
                key={game.type}
                onClick={() => onSelectGame(game.type)}
                style={{ color: game.hex }}
                className={`
                  group relative p-5 bg-black/40 backdrop-blur-md flex items-center gap-5 
                  transition-all duration-300 transform hover:scale-105 active:scale-95
                  animated-border pulse-button
                  neon-border-${game.color}
                `}
              >
                <div className={`p-3 rounded-lg bg-black/50 neon-border-${game.color} group-hover:scale-110 transition-transform relative`}>
                  {React.cloneElement(game.icon as React.ReactElement, { size: 36 })}
                  {topRecord && (
                    <div className="absolute -top-2 -left-2 text-[#facc15] animate-pulse">
                      <Crown size={20} fill="#facc15" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <span className={`block cyber-font text-2xl font-black tracking-tight group-hover:glitch-text neon-glow-${game.color} text-stroke-sm leading-none`}>
                    {game.label}
                  </span>
                  
                  {/* High Score Badge */}
                  {topRecord ? (
                    <div className="text-[9px] font-bold text-[#facc15] mt-1 flex items-center gap-1 uppercase tracking-tighter">
                      <Trophy size={10} /> REKOR: {topRecord.name} ({topRecord.level} - {(topRecord.time / 1000).toFixed(1)}s)
                    </div>
                  ) : (
                    <div className="text-[9px] font-bold text-white/30 mt-1 uppercase tracking-tighter">
                      BELUM ADA REKOR
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-current transition-all duration-1000 shadow-[0_0_8px_currentColor]" 
                        style={{ width: `${(progress[game.type] / 30) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-black opacity-100 drop-shadow-md">LV {progress[game.type]}/30</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 p-6 bg-black/60 border border-[#00f3ff]/20 rounded-lg text-center backdrop-blur-md">
          <p className="text-sm text-[#00f3ff] mb-2 cyber-font font-bold">
            SYSTEM_OPERATOR: <a href="https://wa.me/6281341300100" className="underline hover:neon-glow-cyan transition-all font-black tracking-widest">0813-41-300-100</a>
          </p>
          <p className="text-xs text-[#39ff14] cyber-font font-bold">
            CONTRIBUTION_LINE: 0813-41-300-100 (QRIS/E-WALLET)
          </p>
        </div>
      </div>

      <div className="w-full py-8 text-center border-t border-[#00f3ff]/10 bg-black/40 mt-auto">
        <span className="text-[10px] opacity-60 cyber-font block tracking-widest font-bold">
          EST. 2026 // PROJECT_JOHAN // 081341300100
        </span>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col p-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="cyber-font text-2xl neon-glow-cyan flex items-center gap-2 font-bold"><Trophy /> HALL OF FAME</h2>
            <button onClick={() => setShowLeaderboard(false)} className="p-2 border-2 border-red-500 text-red-500 rounded-full hover:bg-red-500/20 transition-colors"><X size={24}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
            {games.map(game => (
              <div key={game.type} className={`border border-${game.color}-500/20 p-4 rounded bg-black/40 neon-border-${game.color}`}>
                <h3 className={`cyber-font text-sm neon-glow-${game.color} mb-3 border-b border-white/10 pb-1 uppercase font-bold`}>{game.label} RECORDS</h3>
                {!leaderboardData?.[game.type] || leaderboardData[game.type].length === 0 ? (
                  <p className="text-[10px] opacity-40 italic">NO DATA PACKETS DETECTED...</p>
                ) : (
                  <div className="space-y-2">
                    {[...leaderboardData[game.type]].sort((a, b) => {
                      if (b.level !== a.level) return b.level - a.level;
                      return a.time - b.time;
                    }).slice(0, 10).map((entry, idx) => (
                      <div key={idx} className={`flex justify-between items-center text-xs border-b border-white/5 pb-1 ${idx === 0 ? 'text-[#facc15]' : 'text-white'}`}>
                        <span className="flex items-center gap-2">
                          <span className="opacity-40">{idx + 1}.</span>
                          <span className="font-black">{entry.name} {idx === 0 && <Crown size={10} className="inline ml-1" />}</span>
                        </span>
                        <span className="flex items-center gap-3 font-bold">
                          <span className={idx === 0 ? 'text-[#facc15]' : `text-${game.color}-400`}>LV {entry.level}</span>
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
