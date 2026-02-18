import React, { useState, useEffect } from 'react';
import { GameType, UserProgress, GlobalLeaderboard, LeaderboardEntry } from '../types';
import { LayoutGrid, Brain, Binary, Rocket, MoveHorizontal, MessageCircle, Trophy, X, Crown, Share2 } from 'lucide-react';

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

  const getTopRecords = (type: GameType): LeaderboardEntry[] => {
    if (!leaderboardData || !leaderboardData[type]) return [];
    return [...leaderboardData[type]]
      .sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        return a.time - b.time;
      })
      .slice(0, 5);
  };

  const openLeaderboard = () => {
    const saved = localStorage.getItem('ramadhan_leaderboard');
    if (saved) setLeaderboardData(JSON.parse(saved));
    setShowLeaderboard(true);
  };

  const shareToWhatsApp = () => {
    // Correct URL as requested
    const gameUrl = "https://ramadhan-games.vercel.app/";
    const text = encodeURIComponent(`🌙 Ngabuburit makin seru di Ramadhan Games! 🎮✨\n\nMainkan 5 game ketangkasan cyberpunk sambil nunggu buka puasa. Pecahkan rekor dan jadilah juara Hall of Fame!\n\nMain sekarang di: ${gameUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
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
        <button 
          onClick={shareToWhatsApp}
          className="group relative p-3 bg-[#25D366] text-white rounded-full shadow-[0_0_20px_#25D366] flex items-center justify-center animate-bounce hover:scale-110 transition-transform"
          title="Share to WhatsApp"
        >
          <div className="absolute -left-10 bg-black/80 px-2 py-1 rounded text-[8px] cyber-font opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-[#25D366]">SHARE_GAME</div>
          <Share2 size={24} />
          {/* Mini Logo Indicator for Branding */}
          <img 
            src="https://josanvin.github.io/josanvin/img/LogoGames2.png" 
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-white bg-white p-0.5 shadow-sm"
            alt="logo"
          />
        </button>
        <button 
          onClick={openLeaderboard}
          className="p-3 bg-[#facc15] text-black rounded-full shadow-[0_0_20px_#facc15] flex flex-col items-center justify-center hover:scale-110 transition-transform"
        >
          <Trophy size={24} />
          <span className="text-[8px] font-black cyber-font">SCORE</span>
        </button>
      </div>

      <div className="p-6 pb-20">
        <div className="text-center mb-6 pt-4">
          <div className="relative flex items-center justify-center mb-2 min-h-[80px]">
            <img 
              src="https://josanvin.github.io/josanvin/img/LogoGames2.png" 
              alt="Logo Games" 
              className="absolute left-3 h-[70px] w-auto bg-transparent filter drop-shadow-[0_0_15px_#00f3ff]"
              style={{ objectFit: 'contain' }}
            />
            <h1 className="cyber-font text-4xl font-black tracking-tighter neon-glow-cyan leading-none text-center z-10">RAMADHAN</h1>
          </div>
          <h2 className="cyber-font text-2xl font-bold neon-glow-purple tracking-widest uppercase">Games</h2>
          
          <div className="w-full overflow-hidden bg-black/40 border-y border-[#facc15]/30 py-2 mt-4 backdrop-blur-sm">
            <div className="animate-marquee whitespace-nowrap text-[#facc15] cyber-font text-[10px] tracking-widest uppercase font-bold">
              SIAPKAN DIRIMU UNTUK BERBUKA PUASA DENGAN GAME SERU! --- JADILAH LEGENDA DI HALL OF FAME --- NGABUBURIT MAKIN SERU BERSAMA RAMADHAN GAMES --- DONASI : 0813-41-300-100 ---
            </div>
          </div>
          
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#00f3ff] to-transparent mt-4 opacity-50" />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {games.map((game) => (
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
              </div>
              <div className="flex-1 text-left">
                <span className={`block cyber-font text-2xl font-black tracking-tight group-hover:glitch-text neon-glow-${game.color} text-stroke-sm leading-none uppercase`}>
                  {game.label}
                </span>
                
                <div className="flex items-center gap-2 mt-3">
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
          ))}
        </div>

        <div className="mt-10 p-6 bg-black/60 border border-[#00f3ff]/20 rounded-lg text-center backdrop-blur-md">
          <p className="text-[10px] text-[#facc15] mb-2 cyber-font font-black uppercase tracking-widest">
            Sambil Nunggu Buka, Yuk Main Game! 🌙
          </p>
          <p className="text-sm text-[#00f3ff] mb-2 cyber-font font-bold">
            HUBUNGI ADMIN: <a href="https://wa.me/6281341300100" target="_blank" className="underline hover:neon-glow-cyan transition-all font-black tracking-widest">0813-41-300-100</a>
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
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col p-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <Trophy className="text-[#facc15]" />
              <h2 className="cyber-font text-2xl neon-glow-cyan font-bold uppercase italic">HALL OF FAME</h2>
            </div>
            <button onClick={() => setShowLeaderboard(false)} className="p-3 bg-red-500/10 border-2 border-red-500 text-red-500 rounded-full hover:bg-red-500/20 transition-all active:scale-90"><X size={24}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
            {games.map(game => {
              const records = getTopRecords(game.type);
              return (
                <div key={game.type} className={`border border-${game.color}-500/20 p-4 rounded bg-black/40 neon-border-${game.color}`}>
                  <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-1">
                    <h3 className={`cyber-font text-sm neon-glow-${game.color} uppercase font-bold`}>{game.label}</h3>
                    <span className="text-[8px] opacity-30 font-bold uppercase tracking-widest">Global Top 5</span>
                  </div>
                  {records.length === 0 ? (
                    <p className="text-[10px] opacity-40 italic py-2">NO DATA PACKETS DETECTED...</p>
                  ) : (
                    <div className="space-y-2">
                      {records.map((entry, idx) => (
                        <div key={idx} className={`flex justify-between items-center p-2 rounded ${idx === 0 ? 'bg-white/5 border border-white/10' : ''}`}>
                          <div className="flex items-center gap-3">
                            <span className={`cyber-font text-lg font-black w-6 text-center ${idx === 0 ? 'text-[#facc15]' : 'opacity-20 text-white'}`}>
                              {idx + 1}
                            </span>
                            <div>
                              <div className={`text-xs font-black uppercase tracking-tight ${idx === 0 ? 'text-[#facc15] italic' : 'text-white'}`}>
                                {entry.name} {idx === 0 && <Crown size={12} className="inline ml-1" />}
                              </div>
                              <div className="text-[8px] opacity-30 cyber-font">
                                {new Date(entry.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            <div className="flex flex-col">
                              <span className="text-[7px] opacity-40 uppercase font-black">Level</span>
                              <span className={`text-[11px] font-black ${idx === 0 ? 'text-[#facc15]' : `text-${game.color}-400`}`}>LV.{entry.level}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[7px] opacity-40 uppercase font-black">Time</span>
                              <span className="text-[#39ff14] text-[11px] font-black">{(entry.time / 1000).toFixed(2)}s</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-[10px] text-[#facc15]/50 cyber-font uppercase tracking-[0.3em] font-black">
              Hanya Peringkat 5 Besar Yang Berhak Tampil
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;