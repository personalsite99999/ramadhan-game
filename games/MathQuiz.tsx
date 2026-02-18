
import React, { useState, useEffect } from 'react';

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
  const targetScore = Math.min(10, 3 + Math.floor(level / 3));

  const generateQuestion = () => {
    let q = '';
    let a = 0;

    if (level < 5) {
      const n1 = Math.floor(Math.random() * (10 + level));
      const n2 = Math.floor(Math.random() * (10 + level));
      q = `${n1} + ${n2}`;
      a = n1 + n2;
    } else if (level < 15) {
      const n1 = Math.floor(Math.random() * (20 + level));
      const n2 = Math.floor(Math.random() * 10);
      const op = Math.random() > 0.5 ? '*' : '-';
      q = `${n1} ${op} ${n2}`;
      a = op === '*' ? n1 * n2 : n1 - n2;
    } else {
      // Quadratic/Algebra logic simple representation
      // e.g. Solve for x: 2x + 10 = 20
      const x = Math.floor(Math.random() * 10) + 1;
      const m = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 20);
      const res = m * x + b;
      q = `${m}x + ${b} = ${res}, find x`;
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
  };

  useEffect(() => {
    generateQuestion();
    setScore(0);
  }, [level]);

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
    <div className="flex flex-col items-center justify-center p-6 h-full w-full max-w-md mx-auto">
      <div className="w-full mb-8">
        <div className="flex justify-between text-xs mb-2 opacity-60">
          <span>PROGRESS</span>
          <span>{score} / {targetScore}</span>
        </div>
        <div className="h-2 w-full bg-cyan-950 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00f3ff] shadow-[0_0_10px_#00f3ff] transition-all duration-500"
            style={{ width: `${(score / targetScore) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-black/80 p-10 border border-[#00f3ff]/30 rounded-lg w-full text-center mb-10">
        <div className="text-[10px] opacity-40 mb-4 tracking-[0.2em]">DECRYPTING EQUATION...</div>
        <h3 className="cyber-font text-3xl font-bold neon-glow-cyan animate-pulse">{question}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(opt)}
            className="p-6 bg-black border border-cyan-800 rounded hover:bg-cyan-900 transition-colors cyber-font text-xl group active:scale-95"
          >
            <span className="opacity-40 mr-2 group-hover:opacity-100">{String.fromCharCode(65+i)}.</span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MathQuiz;
