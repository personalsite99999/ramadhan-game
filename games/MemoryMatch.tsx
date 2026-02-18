import React, { useState, useEffect, useCallback } from 'react';

interface MemoryMatchProps {
  level: number;
  onWin: () => void;
  onLose: () => void;
}

const SYMBOLS = ['🌙', '⭐', '🕌', '🏮', '🕋', '⚡', '☢', '☣', '◈', '◇', '◎', '▣', '♥', '♦', '♣', '♠', '⊕', '⊗', '∆', '∇', '∑', '∞', '≈', '≉', 'Ω', 'β', 'γ', 'δ', 'λ', 'µ', 'π', 'φ'];

const MemoryMatch: React.FC<MemoryMatchProps> = ({ level, onWin, onLose }) => {
  const [cards, setCards] = useState<{ id: number, symbol: string, flipped: boolean, solved: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gridDim, setGridDim] = useState(4);
  const [isProcessing, setIsProcessing] = useState(false);

  const initGame = useCallback(() => {
    // Scaling grid size based on level - Capped at 6x6 for mobile UX
    const dim = level <= 2 ? 2 : (level <= 10 ? 4 : 6);
    setGridDim(dim);
    
    const count = (dim * dim) / 2;
    // Fisher-Yates shuffle symbols
    const shuffledSymbols = [...SYMBOLS].sort(() => Math.random() - 0.5);
    const selectedSymbols = shuffledSymbols.slice(0, count);
    const deck = [...selectedSymbols, ...selectedSymbols]
      .sort(() => Math.random() - 0.5)
      .map((s, i) => ({ id: i, symbol: s, flipped: false, solved: false }));
    
    setCards(deck);
    setFlipped([]);
    setTimeLeft(Math.max(10, 45 - level));
    setIsProcessing(false);
  }, [level]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onLose();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onLose]);

  useEffect(() => {
    if (flipped.length === 2) {
      setIsProcessing(true);
      const [id1, id2] = flipped;
      
      if (cards[id1].symbol === cards[id2].symbol) {
        // MATCH
        setTimeout(() => {
          setCards(prev => {
            const next = prev.map(c => 
              (c.id === id1 || c.id === id2) ? { ...c, solved: true } : c
            );
            if (next.every(c => c.solved)) onWin();
            return next;
          });
          setFlipped([]);
          setIsProcessing(false);
        }, 400);
      } else {
        // MISMATCH
        setTimeout(() => {
          setFlipped([]);
          setIsProcessing(false);
        }, 800);
      }
    }
  }, [flipped, cards, onWin]);

  const handleCardClick = (id: number) => {
    if (isProcessing || flipped.length >= 2 || cards[id].solved || flipped.includes(id)) return;
    setFlipped(prev => [...prev, id]);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full bg-black/40">
      <div className="mb-6 flex flex-col items-center">
        <div className="text-[10px] cyber-font text-purple-400 mb-1 tracking-[0.3em]">SYNCHRONIZING MEMORY</div>
        <div className={`text-3xl cyber-font font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-purple-400'} neon-glow-purple`}>
          00:{timeLeft < 10 ? '0' : ''}{timeLeft}
        </div>
      </div>

      <div 
        className="grid gap-2 w-full max-w-[340px] aspect-square"
        style={{ gridTemplateColumns: `repeat(${gridDim}, 1fr)` }}
      >
        {cards.map(card => {
          const isFlipped = flipped.includes(card.id) || card.solved;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={isProcessing || card.solved}
              className={`
                relative aspect-square transition-all duration-500 perspective-1000
                ${card.solved ? 'opacity-30' : 'hover:scale-105 active:scale-95'}
              `}
            >
              <div className={`
                w-full h-full transition-all duration-500 transform-style-3d 
                ${isFlipped ? 'rotate-y-180' : ''}
              `}>
                {/* Front (Hidden) */}
                <div className="absolute inset-0 backface-hidden bg-black/80 border border-purple-900/50 rounded-lg flex items-center justify-center shadow-[inset_0_0_15px_rgba(188,19,254,0.1)]">
                   <div className="w-1.5 h-1.5 bg-purple-500/30 rounded-full animate-ping" />
                </div>
                {/* Back (Symbol) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-purple-900/20 border-2 border-purple-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(188,19,254,0.3)]">
                  <span className="text-2xl drop-shadow-[0_0_8px_rgba(188,19,254,0.8)]">{card.symbol}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
           <div key={i} className={`w-8 h-1 rounded-full ${isProcessing ? 'bg-purple-500 animate-pulse' : 'bg-purple-900/30'}`} style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
};

export default MemoryMatch;