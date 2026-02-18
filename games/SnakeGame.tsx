import React, { useEffect, useRef, useState, useCallback } from 'react';

interface SnakeGameProps {
  level: number;
  onWin: () => void;
  onLose: () => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ level, onWin, onLose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const targetScore = Math.min(30, 8 + Math.floor(level / 1.5));
  const gridSize = 20;
  
  const moveQueue = useRef<string[]>([]);
  const state = useRef({
    snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
    dir: { x: 0, y: -1 },
    food: { x: 5, y: 5 },
    lastDir: { x: 0, y: -1 },
    lastUpdate: 0,
    gameOver: false
  });

  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
      if (!state.current.snake.some(s => s.x === newFood.x && s.y === newFood.y)) break;
    }
    state.current.food = newFood;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    state.current = {
      snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
      dir: { x: 0, y: -1 },
      food: { x: 15, y: 15 },
      lastDir: { x: 0, y: -1 },
      lastUpdate: 0,
      gameOver: false
    };
    generateFood();
    setScore(0);
    moveQueue.current = [];

    const baseInterval = Math.max(50, 150 - (level * 3));
    let frameId: number;

    const gameLoop = (timestamp: number) => {
      if (state.current.gameOver) return;

      if (timestamp - state.current.lastUpdate > baseInterval) {
        state.current.lastUpdate = timestamp;
        update();
      }
      
      draw(ctx, canvas.width, canvas.height);
      frameId = requestAnimationFrame(gameLoop);
    };

    const update = () => {
      if (moveQueue.current.length > 0) {
        const nextMove = moveQueue.current.shift();
        const { lastDir } = state.current;
        if (nextMove === 'up' && lastDir.y === 0) state.current.dir = { x: 0, y: -1 };
        else if (nextMove === 'down' && lastDir.y === 0) state.current.dir = { x: 0, y: 1 };
        else if (nextMove === 'left' && lastDir.x === 0) state.current.dir = { x: -1, y: 0 };
        else if (nextMove === 'right' && lastDir.x === 0) state.current.dir = { x: 1, y: 0 };
      }

      const { snake, dir, food } = state.current;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      state.current.lastDir = dir;

      // Wrapping Logic (High levels wrap, low levels hit wall)
      if (level >= 15) {
        if (head.x < 0) head.x = gridSize - 1;
        if (head.x >= gridSize) head.x = 0;
        if (head.y < 0) head.y = gridSize - 1;
        if (head.y >= gridSize) head.y = 0;
      } else {
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
          state.current.gameOver = true;
          onLose();
          return;
        }
      }

      // Self collision
      if (snake.some(s => s.x === head.x && s.y === head.y)) {
        state.current.gameOver = true;
        onLose();
        return;
      }

      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        const newScore = snake.length - 3;
        setScore(newScore);
        if (newScore >= targetScore) {
          state.current.gameOver = true;
          onWin();
          return;
        }
        generateFood();
      } else {
        snake.pop();
      }
    };

    const draw = (context: CanvasRenderingContext2D, width: number, height: number) => {
      const cellSize = width / gridSize;
      context.fillStyle = '#050505';
      context.fillRect(0, 0, width, height);

      // Grid Pattern
      context.strokeStyle = '#ff00ff11';
      context.lineWidth = 1;
      for (let i = 0; i <= gridSize; i++) {
        context.beginPath();
        context.moveTo(i * cellSize, 0);
        context.lineTo(i * cellSize, height);
        context.stroke();
        context.beginPath();
        context.moveTo(0, i * cellSize);
        context.lineTo(width, i * cellSize);
        context.stroke();
      }

      const { snake, food } = state.current;

      // Food
      context.fillStyle = '#ff00ff';
      context.shadowBlur = 15;
      context.shadowColor = '#ff00ff';
      context.beginPath();
      context.arc(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
      context.fill();

      // Snake
      context.shadowBlur = 10;
      context.shadowColor = '#bc13fe';
      snake.forEach((s, i) => {
        context.fillStyle = i === 0 ? '#ffffff' : '#bc13fe';
        context.fillRect(s.x * cellSize + 1, s.y * cellSize + 1, cellSize - 2, cellSize - 2);
        
        // Connectivity lines for aesthetics
        if (i < snake.length - 1) {
          const next = snake[i+1];
          context.strokeStyle = '#bc13fe';
          context.lineWidth = 2;
          context.beginPath();
          context.moveTo(s.x * cellSize + cellSize/2, s.y * cellSize + cellSize/2);
          context.lineTo(next.x * cellSize + cellSize/2, next.y * cellSize + cellSize/2);
          context.stroke();
        }
      });
      context.shadowBlur = 0;
    };

    frameId = requestAnimationFrame(gameLoop);

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((k === 'arrowup' || k === 'w')) moveQueue.current.push('up');
      else if ((k === 'arrowdown' || k === 's')) moveQueue.current.push('down');
      else if ((k === 'arrowleft' || k === 'a')) moveQueue.current.push('left');
      else if ((k === 'arrowright' || k === 'd')) moveQueue.current.push('right');
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', onKey);
    };
  }, [level, targetScore, onWin, onLose, generateFood]);

  const pushMove = (m: string) => moveQueue.current.push(m);

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full bg-black">
      <div className="mb-6 text-center w-full max-w-[320px] flex justify-between items-end border-b border-pink-500/30 pb-2">
        <div>
          <div className="text-[8px] cyber-font text-pink-400">DATA_HARVEST_MODE</div>
          <div className="cyber-font text-xl neon-glow-pink">SNAKE.IO_PATCH</div>
        </div>
        <div className="text-right">
          <div className="text-[8px] cyber-font text-pink-400">SCORE</div>
          <div className="cyber-font text-2xl text-white">{score}<span className="text-xs opacity-30 text-pink-500">/{targetScore}</span></div>
        </div>
      </div>
      
      <div className="relative">
        <canvas ref={canvasRef} width={320} height={320} className="bg-black border-2 border-pink-500 rounded-lg shadow-[0_0_30px_rgba(255,0,255,0.1)]" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-ping" />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3">
        <div />
        <button onPointerDown={(e) => { e.preventDefault(); pushMove('up'); }} className="w-16 h-16 flex items-center justify-center bg-black/40 border-2 border-pink-500 rounded-xl active:bg-pink-500 active:text-black transition-all neon-glow-pink select-none">
          <span className="text-2xl">↑</span>
        </button>
        <div />
        <button onPointerDown={(e) => { e.preventDefault(); pushMove('left'); }} className="w-16 h-16 flex items-center justify-center bg-black/40 border-2 border-pink-500 rounded-xl active:bg-pink-500 active:text-black transition-all neon-glow-pink select-none">
          <span className="text-2xl">←</span>
        </button>
        <button onPointerDown={(e) => { e.preventDefault(); pushMove('down'); }} className="w-16 h-16 flex items-center justify-center bg-black/40 border-2 border-pink-500 rounded-xl active:bg-pink-500 active:text-black transition-all neon-glow-pink select-none">
          <span className="text-2xl">↓</span>
        </button>
        <button onPointerDown={(e) => { e.preventDefault(); pushMove('right'); }} className="w-16 h-16 flex items-center justify-center bg-black/40 border-2 border-pink-500 rounded-xl active:bg-pink-500 active:text-black transition-all neon-glow-pink select-none">
          <span className="text-2xl">→</span>
        </button>
      </div>
      
      <div className="mt-6 text-[8px] cyber-font text-pink-500 opacity-30 tracking-widest uppercase">
        {level >= 15 ? 'WARP_DRIVE_ACTIVE' : 'CONTAINMENT_FIELD_ACTIVE'}
      </div>
    </div>
  );
};

export default SnakeGame;