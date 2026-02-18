import React, { useState, useEffect, useCallback } from 'react';

interface MathQuizProps {
  level: number;
  onWin: () => void;
  onLose: () => void;
}

const MathQuiz: React.FC<MathQuizProps> = ({ level, onWin, onLose }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const targetScore = Math.min(10, 3 + Math.floor(level / 3));

  const generateQuestion = useCallback(() => {
    let q = '';
    let a = 0;

    // Difficulty scaling
    if (level < 5) {
      // Basic addition/subtraction
      const n1 = Math.floor(Math.random() * (10 + level * 2)) + 1;
      const n2 = Math.floor(Math.random() * (10 + level * 2)) + 1;
      const isAdd = Math.random() > 0.4;
      q = isAdd ? `${n1} + ${n2}` : `${Math.max(n1, n2)} - ${Math.min(n1, n2)}`;
      a = isAdd ? n1 + n2 : Math.max(n1, n2) - Math.min(n1, n2);
    } else if (level < 15) {
      // Multiplication / Mix
      const n1 = Math.floor(Math.random() * 12) + 2;
      const n2 = Math.floor(Math.random() * 10) + 1;
      const type = Math.random();
      if (type < 0.6) {
        q = `${n1} × ${n2}`;
        a = n1 * n2;
      } else {
        const n3 = Math.floor(Math.random() * 20);
        q = `${n1} × ${n2} + ${n3}`;
        a = n1 * n2 + n3;
      }
    } else {
      // Algebra logic
      const x = Math.floor(Math.random() * 10) + 1;
      const m = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 20);
      const res = m * x + b;
      q = `${m}x + ${b} = ${res}, find x`;
      a = x;
    }

    setQuestion(q);
    setAnswer(a);

    const opts = new Set<number>([a]);
    while (opts.size < 4) {
      const offset = Math.floor(Math.random() * 20) - 10;
      const wrong = a + (offset === 0 ? 1 : offset);
      if (wrong >= 0) opts.add(wrong);
    }
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
    setIsCorrect(null);
  }, [level]);

  useEffect(() => {
    generateQuestion();
    setScore(0);
  }, [generateQuestion]);

  const handleSelect = (choice: number) => {
    if (isCorrect !== null) return;
    
    if (choice === answer) {
      setIsCorrect(true);
      const nextScore = score + 1;
      if (nextScore >= targetScore) {
        setTimeout(onWin, 500);
      } else {
        setTimeout(() => {
          setScore(nextScore);
          generateQuestion();
        }, 500);
      }
    } else {
      setIsCorrect(false);
      setTimeout(onLose, 800);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 h-full w-full bg-black">
      <div className="w-full mb-10 max-w-sm">
        <div className="flex justify-between text-[10px] mb-2 font-black cyber-font tracking-widest text-green-400">
          <span>DECRYPT_PROGRESS</span>
          <span>{score} / {targetScore} UNIT</span>
        </div>
        <div className="h-2 w-full bg-green-950/30 border border-green-500/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-400 shadow-[0_0_15px_#39ff14] transition-all duration-500"
            style={{ width: `${(score / targetScore) * 100}%` }} 
          />
        </div>
      </div>

      <div className={`
        w-full max-w-sm p-12 bg-black/80 border-2 rounded-2xl text-center mb-10 transition-all duration-300
        ${isCorrect === true ? 'border-green-500 shadow-[0_0_40px_rgba(57,255,20,0.4)]' : 
          isCorrect === false ? 'border-red-500 animate-shake shadow-[0_0_40px_rgba(255,0,0,0.4)]' : 'border-green-500/20'}
      `}>
        <div className="text-[9px] opacity-40 mb-3 cyber-font tracking-[0.4em] text-green-400">MATH_EQUATION_V4</div>
        <h3 className="cyber-font text-4xl font-black text-white neon-glow-green drop-shadow-sm">{question}</h3>
      </div>

      <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(opt)}
            className={`
              group relative p-8 bg-black/40 border-2 rounded-xl transition-all duration-200 cyber-font text-3xl font-black active:scale-95
              ${isCorrect === null ? 'border-green-900/50 hover:border-green-400 hover:shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 
                opt === answer ? 'border-green-400 bg-green-900/20' : 'border-red-900/50 opacity-40'}
            `}
          >
            <span className="absolute top-2 left-2 text-[10px] opacity-20 text-green-400">0{i+1}</span>
            <span className="text-white">{opt}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-12 text-[9px] cyber-font text-green-400/20 uppercase tracking-[0.5em]">
        Brain Overclocking Required
      </div>
    </div>
  );
};

export default MathQuiz;