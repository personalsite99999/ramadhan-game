import React, { useEffect, useRef, useState, useCallback } from 'react';

interface SnakeGameProps {
  level: number;
  onWin: () => void;
  onLose: () => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ level, onWin, onLose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const targetScore = 5 + Math.floor(level / 2);
  const gridSize = 20;
  const isWrapping = level >= 15;

  const handleGameEnd = useCallback((isWin: boolean) => {
    if (isWin) onWin();
    else onLose();
  }, [onWin, onLose]);

  const gameData = useRef({
    snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
    dir: { x: 0, y: -1 },
    nextDir: { x: 0, y: -1 },
    food: { x: 5, y: 5 },
    obstacles: [] as { x: number, y: number }[]
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameData.current;
    state.snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    state.dir = { x: 0, y: -1 };
    state.nextDir = { x: 0, y: -1 };
    state.obstacles = [];
    
    // Level difficulty scaling
    const speed = Math.max(50, 150 - (level * 4));
    
    if (level > 4) {
      const obsCount = Math.floor(level / 2.5);
      for(let i=0; i<obsCount; i++) {
        let ox, oy;
        do {
          ox = Math.floor(Math.random() * gridSize);
          oy = Math.floor(Math.random() * gridSize);
        } while (
          (ox === 10 && oy >= 8 && oy <= 14) || // Don't block start
          (ox === state.food.x && oy === state.food.y)
        );
        state.obstacles.push({ x: ox, y: oy });
      }
    }

    const move = () => {
      state.dir = state.nextDir;
      const head = { x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y };
      
      if (isWrapping) {
        if (head.x < 0) head.x = gridSize - 1;
        if (head.x >= gridSize) head.x = 0;
        if (head.y < 0) head.y = gridSize - 1;
        if (head.y >= gridSize) head.y = 0;
      } else {
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
          handleGameEnd(false); return;
        }
      }

      // Collisions with body
      if (state.snake.some(s => s.x === head.x && s.y === head.y)) { handleGameEnd(false); return; }
      // Collisions with obstacles
      if (state.obstacles.some(o => o.x === head.x && o.y === head.y)) { handleGameEnd(false); return; }

      state.snake.unshift(head);
      if (head.x === state.food.x && head.y === state.food.y) {
        setScore(s => {
          const ns = s + 1;
          if (ns >= targetScore) handleGameEnd(true);
          return ns;
        });
        // New food
        let nf;
        do {
          nf = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
        } while (
          state.snake.some(s => s.x === nf.x && s.y === nf.y) || 
          state.obstacles.some(o => o.x === nf.x && o.y === nf.y)
        );
        state.food = nf;
      } else {
        state.snake.pop();
      }
    };

    let animId: number;
    let lastTick = 0;
    const draw = (t: number) => {
      if (t - lastTick > speed) {
        move();
        lastTick = t;
      }

      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cell = canvas.width / gridSize;
      
      // Grid lines
      ctx.strokeStyle = '#ffffff05';
      ctx.lineWidth = 1;
      for(let i=0; i<=gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i*cell, 0); ctx.lineTo(i*cell, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i*cell); ctx.lineTo(canvas.width, i*cell);
        ctx.stroke();
      }

      // Obstacles
      ctx.fillStyle = '#444455';
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#444455';
      state.obstacles.forEach(o => ctx.fillRect(o.x * cell + 2, o.y * cell + 2, cell - 4, cell - 4));

      // Food (Pulsing)
      const pulse = Math.sin(t / 150) * 3;
      ctx.fillStyle = '#39ff14';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#39ff14';
      ctx.beginPath();
      ctx.arc(state.food.x * cell + cell/2, state.food.y * cell + cell/2, cell/2 - 4 + pulse/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Snake
      state.snake.forEach((s, i) => {
        const isHead = i === 0;
        ctx.fillStyle = isHead ? '#bc13fe' : `rgba(188, 19, 254, ${1 - (i / state.snake.length) * 0.7})`;
        if (isHead) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#bc13fe';
        }
        ctx.fillRect(s.x * cell + 1, s.y * cell + 1, cell - 2, cell - 2);
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [level, targetScore, isWrapping, handleGameEnd]);

  const setDirection = useCallback((dir: string) => {
    const state = gameData.current;
    if (dir === 'up' && state.dir.y === 0) state.nextDir = { x: 0, y: -1 };
    else if (dir === 'down' && state.dir.y === 0) state.nextDir = { x: 0, y: 1 };
    else if (dir === 'left' && state.dir.x === 0) state.nextDir = { x: -1, y: 0 };
    else if (dir === 'right' && state.dir.x === 0) state.nextDir = { x: 1, y: 0 };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') setDirection('up');
      if (key === 'arrowdown' || key === 's') setDirection('down');
      if (key === 'arrowleft' || key === 'a') setDirection('left');
      if (key === 'arrowright' || key === 'd') setDirection('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setDirection]);

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full bg-black/40">
      <div className="mb-4 flex gap-10 items-end">
         <div className="text-center">
            <p className="text-[10px] cyber-font text-purple-400 tracking-widest uppercase mb-1 opacity-50">Score</p>
            <p className="text-2xl cyber-font font-black text-white">{score} / {targetScore}</p>
         </div>
         <div className="text-center">
            <p className="text-[10px] cyber-font text-purple-400 tracking-widest uppercase mb-1 opacity-50">Boundary</p>
            <p className="text-xs cyber-font font-bold text-[#39ff14] animate-pulse uppercase">{isWrapping ? 'WARP_ACTIVE' : 'HARD_WALL'}</p>
         </div>
      </div>

      <div className="relative p-1 bg-black border-2 border-purple-500/30 rounded-xl mb-6 shadow-[0_0_30px_rgba(188,19,254,0.1)]">
        <canvas ref={canvasRef} width={300} height={300} className="rounded-lg max-w-full" />
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
        <div />
        <button onPointerDown={() => setDirection('up')} className="aspect-square bg-black/60 border border-purple-500 rounded-xl flex items-center justify-center active:scale-90 shadow-[0_0_15px_#bc13fe33]">
          <span className="text-xl text-purple-400">▲</span>
        </button>
        <div />
        <button onPointerDown={() => setDirection('left')} className="aspect-square bg-black/60 border border-purple-500 rounded-xl flex items-center justify-center active:scale-90 shadow-[0_0_15px_#bc13fe33]">
          <span className="text-xl text-purple-400">◀</span>
        </button>
        <button onPointerDown={() => setDirection('down')} className="aspect-square bg-black/60 border border-purple-500 rounded-xl flex items-center justify-center active:scale-90 shadow-[0_0_15px_#bc13fe33]">
          <span className="text-xl text-purple-400">▼</span>
        </button>
        <button onPointerDown={() => setDirection('right')} className="aspect-square bg-black/60 border border-purple-500 rounded-xl flex items-center justify-center active:scale-90 shadow-[0_0_15px_#bc13fe33]">
          <span className="text-xl text-purple-400">▶</span>
        </button>
      </div>
    </div>
  );
};

export default SnakeGame;