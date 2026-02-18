
import React, { useState, useEffect, useCallback, useRef } from 'react';

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
  const [timer, setTimer] = useState(10);
  // Fix: Changed NodeJS.Timeout to number for browser environment compatibility
  const timerRef = useRef<number | null>(null);
  const targetScore = Math.min(10, 3 + Math.floor(level / 3));

  const generateQuestion = useCallback(() => {
    let q = '';
    let a = 0;

    const diff = level;
    if (diff < 5) {
      const n1 = Math.floor(Math.random() * (10 + diff));
      const n2 = Math.floor(Math.random() * (10 + diff));
      q = `${n1} + ${n2}`;
      a = n1 + n2;
    } else if (diff < 12) {
      const n1 = Math.floor(Math.random() * (20 + diff));
      const n2 = Math.floor(Math.random() * 15);
      const op = Math.random() > 0.4 ? '*' : '-';
      q = `${n1} ${op} ${n2}`;
      a = op === '*' ? n1 * n2 : n1 - n2;
    } else {
      // Find x logic
      const x = Math.floor(Math.random() * 12) + 1;
      const m = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 20);
      const res = m * x + b;
      q = `${m}x + ${b} = ${res}, x=?`;
      a = x;
    }

    setQuestion(q);
    setAnswer(a);

    const opts = [a];
    while (opts.length < 4) {
      const wrong = a + (Math.floor(Math.random() * 20) - 10);
      if (!opts.includes(wrong)) opts.push(wrong);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
    setTimer(Math.max(3, 10 - Math.floor(level / 5)));
  }, [level]);

  useEffect(() => {
    generateQuestion();
    setScore(0);
  }, [generateQuestion]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    // Fix: Use window.setInterval to ensure return type is a number in browser environment
    timerRef.current = window.setInterval(() => {
      setTimer(t => {
        if (t <= 0) {
          onLose();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [question, onLose]);

  const handleSelect = (choice: number) => {
    if (choice === answer) {
      const nextScore = score + 1;
      if (nextScore >= targetScore) {
        onWin();
      } else {
        setScore(nextScore);
        generateQuestion();
      }
    } else {
      onLose();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 h-full w-full max-w-md mx-auto bg-black/40">
      <div className="w-full mb-10">
        <div className="flex justify-between items-end mb-2">
           <div className="flex flex-col">
              <span className="text-[10px] cyber-font text-[#39ff14] tracking-widest opacity-60">CORRECT_ANSWERS</span>
              <span className="text-xl cyber-font font-black text-[#39ff14] neon-glow-green">{score} / {targetScore}</span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[10px] cyber-font text-red-500 tracking-widest opacity-60">REMAINING_TIME</span>
              <span className={`text-xl cyber-font font-black ${timer < 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timer}S</span>
           </div>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00f3ff] transition-all duration-500 shadow-[0_0_8px_#00f3ff]"
            style={{ width: `${(score / targetScore) * 100}%` }}
          />
        </div>
      </div>

      <div className="w-full relative py-12 px-6 bg-black/60 border border-cyan-500/30 rounded-2xl mb-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
           <div className="grid grid-cols-10 gap-1 h-full w-full">
              {Array.from({length: 100}).map((_, i) => <div key={i} className="bg-white rounded-full h-1 w-1" />)}
           </div>
        </div>
        <div className="text-[8px] cyber-font text-cyan-400 mb-6 tracking-[0.5em] text-center opacity-40 uppercase">Decrypting Neural Packet</div>
        <h3 className="cyber-font text-4xl font-black text-white text-center drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">
           {question}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(opt)}
            className="group relative p-6 bg-black/40 border border-cyan-900/50 rounded-xl hover:border-cyan-400 hover:bg-cyan-950/20 transition-all duration-300 transform active:scale-95"
          >
            <div className="absolute top-2 left-2 text-[8px] cyber-font text-cyan-500/30 group-hover:text-cyan-400">0x0{i+1}</div>
            <div className="cyber-font text-2xl font-black text-white group-hover:neon-glow-cyan">{opt}</div>
          </button>
        ))}
      </div>
      
      <p className="mt-10 text-[8px] cyber-font text-white/20 tracking-[0.2em] uppercase">Security Level: {level <= 10 ? 'LOW' : level <= 20 ? 'MEDIUM' : 'MAXIMAL'}</p>
    </div>
  );
};

export default MathQuiz;
