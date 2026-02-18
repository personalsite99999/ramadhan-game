import React, { useState, useEffect, useCallback } from 'react';

interface MemoryMatchProps {
  level: number;
  onWin: () => void;
  onLose: () => void;
}

const SYMBOLS = ['★', '⚡', '☢', '☣', '◈', '◇', '◎', '▣', '♥', '♦', '♣', '♠', '⊕', '⊗', '∆', '∇', '∑', '∞', '≈', '≉', 'Ω', 'β', 'γ', 'δ', 'λ', 'µ', 'π', 'φ', 'ψ', 'ω', 'Ѻ', 'Ѽ'];

const MemoryMatch: React.FC<MemoryMatchProps> = ({ level, onWin, onLose }) => {
  const [cards, setCards] = useState<{ id: number, symbol: string, solved: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gridDim, setGridDim] = useState(4);
  const [isProcessing, setIsProcessing] = useState(false);

  const initGame = useCallback(() => {
    // Determine grid dimension: 2x2, 4x4, or 6x6
    const dim = level <= 2 ? 2 : (level <= 10 ? 4 : 6);
    setGridDim(dim);
    
    const pairCount = (dim * dim) / 2;
    const selectedSymbols = [...SYMBOLS].sort(() => Math.random() - 0.5).slice(0, pairCount);
    const deck = [...selectedSymbols, ...selectedSymbols]
      .sort(() => Math.random() - 0.5)
      .map((s, i) => ({ id: i, symbol: s, solved: false }));
    
    setCards(deck);
    setFlipped([]);
    setTimeLeft(Math.max(8, 45 - (level * 1)));
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
        // Match found
        setTimeout(() => {
          setCards(prev => {
            const next = prev.map(c => (c.id === id1 || c.id === id2) ? { ...c, solved: true } : c);
            if (next.every(c => c.solved)) {
              onWin();
            }
            return next;
          });
          setFlipped([]);
          setIsProcessing(false);
        }, 400);
      } else {
        // No match
        setTimeout(() => {
          setFlipped([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  }, [flipped, cards, onWin]);

  const handleCardClick = (id: number) => {
    if (isProcessing || flipped.includes(id) || cards[id].solved) return;
    setFlipped(prev => [...prev, id]);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full bg-black">
      <div className="mb-6 w-full max-w-[340px] flex justify-between items-end border-b border-purple-500/30 pb-2">
        <div>
          <div className="text-[8px] cyber-font text-purple-400">MEMORY_NODE</div>
          <div className="cyber-font text-xl neon-glow-purple">MATCH SYSTEM</div>
        </div>
        <div className={`cyber-font text-2xl ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
          {timeLeft}s
        </div>
      </div>

      <div 
        className="grid gap-3 w-full max-w-[340px] perspective-1000"
        style={{ gridTemplateColumns: `repeat(${gridDim}, 1fr)` }}
      >
        {cards.map(card => {
          const isFlipped = flipped.includes(card.id) || card.solved;
          return (
            <div 
              key={card.id} 
              className="aspect-square relative preserve-3d transition-all duration-500 cursor-pointer"
              style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              onClick={() => handleCardClick(card.id)}
            >
              {/* Front Face (Hidden Symbol) */}
              <div className="absolute inset-0 backface-hidden bg-black border-2 border-purple-500 rounded-lg flex items-center justify-center shadow-[inset_0_0_15px_rgba(188,19,254,0.3)] hover:border-white/50 transition-colors">
                <div className="w-1/3 h-1/3 border border-purple-400/30 rounded-full animate-ping" />
              </div>
              
              {/* Back Face (Visible Symbol) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-purple-900/40 border-2 border-purple-300 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(188,19,254,0.5)]">
                <span className="text-3xl text-white neon-glow-purple font-black">{card.symbol}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 text-[10px] cyber-font text-white/30 tracking-[0.3em] uppercase">
        Identify all pairs to clear node
      </div>
    </div>
  );
};

export default MemoryMatch;