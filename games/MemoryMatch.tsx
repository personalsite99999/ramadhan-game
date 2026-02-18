
import React, { useState, useEffect } from 'react';

interface MemoryMatchProps {
  level: number;
  onWin: () => void;
  onLose: () => void;
}

const SYMBOLS = ['★', '⚡', '☢', '☣', '◈', '◇', '◎', '▣', '♥', '♦', '♣', '♠', '⊕', '⊗', '∆', '∇', '∑', '∞', '≈', '≉', 'Ω', 'β', 'γ', 'δ', 'λ', 'µ', 'π', 'φ', 'ψ', 'ω', 'Ѻ', 'Ѽ'];

const MemoryMatch: React.FC<MemoryMatchProps> = ({ level, onWin, onLose }) => {
  const [cards, setCards] = useState<{ id: number, symbol: string, flipped: boolean, solved: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gridDim, setGridDim] = useState(4);

  useEffect(() => {
    // Scaling: Level 1 (2x2) to Level 30 (8x8)
    const dim = Math.min(8, level <= 1 ? 2 : (level <= 5 ? 4 : (level <= 15 ? 6 : 8)));
    setGridDim(dim);
    
    const count = (dim * dim) / 2;
    const symbols = SYMBOLS.slice(0, count);
    const deck = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((s, i) => ({ id: i, symbol: s, flipped: false, solved: false }));
    
    setCards(deck);
    setFlipped([]);
    setTimeLeft(Math.max(15, 60 - level));
  }, [level]);

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
      const [id1, id2] = flipped;
      if (cards[id1].symbol === cards[id2].symbol) {
        const nextCards = cards.map(c => 
          (c.id === id1 || c.id === id2) ? { ...c, solved: true } : c
        );
        setCards(nextCards);
        setFlipped([]);
        if (nextCards.every(c => c.solved)) onWin();
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  }, [flipped, cards, onWin]);

  const handleCardClick = (id: number) => {
    if (flipped.length < 2 && !flipped.includes(id) && !cards[id].solved) {
      setFlipped([...flipped, id]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full">
      <div className="mb-4 flex gap-8 items-center">
        <div className="text-xl cyber-font neon-glow-purple">TIME: {timeLeft}s</div>
      </div>

      <div 
        className="grid gap-2 w-full max-w-[600px] aspect-square"
        style={{ gridTemplateColumns: `repeat(${gridDim}, 1fr)` }}
      >
        {cards.map(card => {
          const isFlipped = flipped.includes(card.id) || card.solved;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={isFlipped}
              className={`
                aspect-square flex items-center justify-center text-2xl font-bold transition-all duration-300 transform
                ${isFlipped ? 'bg-purple-900 border-purple-400 rotate-y-180' : 'bg-black border border-cyan-800'}
                ${card.solved ? 'opacity-40 scale-95' : 'hover:scale-105'}
                rounded-sm shadow-inner
              `}
            >
              {isFlipped ? (
                <span className="text-[#bc13fe] drop-shadow-[0_0_5px_#bc13fe]">{card.symbol}</span>
              ) : (
                <div className="w-2 h-2 bg-cyan-900 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MemoryMatch;
