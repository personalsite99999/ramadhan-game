import React, { useEffect, useRef, useState } from 'react';

interface SnakeGameProps {
  level: number;
  onWin: () => void;
  onLose: () => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ level, onWin, onLose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const isMounted = useRef(true);
  
  const targetScore = 5 + Math.floor(level / 2);
  const gridSize = 20;

  const state = useRef({
    snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
    dir: { x: 0, y: -1 },
    nextDir: { x: 0, y: -1 },
    food: { x: 5, y: 5 },
    obstacles: [] as { x: number, y: number }[],
    active: true,
    score: 0
  });

  useEffect(() => {
    isMounted.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = state.current;
    s.active = true;
    s.score = 0;
    s.snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    s.dir = { x: 0, y: -1 };
    s.nextDir = { x: 0, y: -1 };
    s.obstacles = [];
    setDisplayScore(0);
    
    // Speed formula: faster as level increases
    const speed = Math.max(60, 180 - (level * 6));
    
    // Generate Obstacles
    if (level > 4) {
      const obstacleCount = Math.floor(level / 2.5);
      for(let i=0; i < obstacleCount; i++) {
        let ox, oy;
        do {
          ox = Math.floor(Math.random() * gridSize);
          oy = Math.floor(Math.random() * gridSize);
        } while (
          (ox === 10 && oy >= 8 && oy <= 14) || // Player start safety
          (ox === 5 && oy === 5) || // Initial food safety
          s.obstacles.some(o => o.x === ox && o.y === oy)
        );
        s.obstacles.push({ x: ox, y: oy });
      }
    }

    let lastTick = 0;
    let animId: number;

    const move = () => {
      s.dir = s.nextDir;
      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
      
      // Warp logic for high levels
      if (level >= 15) {
        if (head.x < 0) head.x = gridSize - 1;
        if (head.x >= gridSize) head.x = 0;
        if (head.y < 0) head.y = gridSize - 1;
        if (head.y >= gridSize) head.y = 0;
      } else if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        s.active = false;
        onLose();
        return;
      }

      // Self or Obstacle collision
      if (s.snake.some(seg => seg.x === head.x && seg.y === head.y) || 
          s.obstacles.some(o => o.x === head.x && o.y === head.y)) {
        s.active = false;
        onLose();
        return;
      }

      s.snake.unshift(head);

      // Food collision
      if (head.x === s.food.x && head.y === s.food.y) {
        s.score++;
        setDisplayScore(s.score);
        
        if (s.score >= targetScore) {
          s.active = false;
          onWin();
          return;
        }

        // Relocate food
        do {
          s.food = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
        } while (
          s.snake.some(seg => seg.x === s.food.x && seg.y === s.food.y) || 
          s.obstacles.some(o => o.x === s.food.x && o.y === s.food.y)
        );
      } else {
        s.snake.pop();
      }
    };

    const draw = (t: number) => {
      if (!s.active || !isMounted.current) return;

      if (t - lastTick > speed) {
        move();
        lastTick = t;
      }

      if (!s.active) return; // Re-check after move

      ctx.fillStyle = '#020210';
      ctx.fillRect(0, 0, 300, 300);
      const cell = 300 / gridSize;
      
      // Obstacles
      ctx.fillStyle = '#444455';
      s.obstacles.forEach(o => ctx.fillRect(o.x * cell + 1, o.y * cell + 1, cell - 2, cell - 2));

      // Food
      ctx.fillStyle = '#39ff14';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#39ff14';
      ctx.beginPath();
      ctx.arc(s.food.x * cell + cell/2, s.food.y * cell + cell/2, cell/2 - 3, 0, Math.PI*2);
      ctx.fill();

      // Snake
      ctx.shadowBlur = 0;
      s.snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? '#bc13fe' : `rgba(188, 19, 254, ${1 - (i / s.snake.length) * 0.7})`;
        ctx.fillRect(seg.x * cell + 1, seg.y * cell + 1, cell - 2, cell - 2);
      });

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      isMounted.current = false;
      s.active = false;
      cancelAnimationFrame(animId);
    };
  }, [level, targetScore, onWin, onLose]);

  const setDir = (x: number, y: number) => {
    const s = state.current;
    if (!s.active) return;
    // Prevent 180-degree turns
    if (x !== 0 && s.dir.x === 0) s.nextDir = { x, y: 0 };
    if (y !== 0 && s.dir.y === 0) s.nextDir = { x: 0, y };
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full bg-black/40 select-none touch-none">
      <div className="mb-4 flex gap-8">
        <div className="text-center">
          <p className="text-[10px] cyber-font text-purple-400 uppercase opacity-50 tracking-widest">Score</p>
          <p className="text-xl cyber-font font-black text-white">{displayScore}/{targetScore}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] cyber-font text-purple-400 uppercase opacity-50 tracking-widest">Mode</p>
          <p className="text-xs cyber-font font-bold text-[#39ff14] animate-pulse">{level >= 15 ? 'WARP_ON' : 'WALLS_ON'}</p>
        </div>
      </div>

      <div className="relative p-1 bg-black border-2 border-purple-500/30 rounded-xl mb-6 shadow-[0_0_20px_#bc13fe33]">
        <canvas ref={canvasRef} width={300} height={300} className="rounded-lg" />
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#bc13fe_1px,transparent_1px)] [background-size:10px_10px]" />
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
        <div /> 
        <button onPointerDown={() => setDir(0, -1)} className="aspect-square bg-black/60 border border-purple-500 rounded-xl text-purple-400 text-xl flex items-center justify-center active:bg-purple-500 active:text-white transition-all shadow-lg active:scale-95">▲</button> 
        <div />
        
        <button onPointerDown={() => setDir(-1, 0)} className="aspect-square bg-black/60 border border-purple-500 rounded-xl text-purple-400 text-xl flex items-center justify-center active:bg-purple-500 active:text-white transition-all shadow-lg active:scale-95">◀</button>
        <button onPointerDown={() => setDir(0, 1)} className="aspect-square bg-black/60 border border-purple-500 rounded-xl text-purple-400 text-xl flex items-center justify-center active:bg-purple-500 active:text-white transition-all shadow-lg active:scale-95">▼</button>
        <button onPointerDown={() => setDir(1, 0)} className="aspect-square bg-black/60 border border-purple-500 rounded-xl text-purple-400 text-xl flex items-center justify-center active:bg-purple-500 active:text-white transition-all shadow-lg active:scale-95">▶</button>
      </div>
      
      <div className="mt-4 text-[8px] cyber-font text-white/30 tracking-[0.2em] uppercase">Security Level: {level <= 10 ? 'LOW' : level <= 20 ? 'MEDIUM' : 'CRITICAL'}</div>
    </div>
  );
};

export default SnakeGame;