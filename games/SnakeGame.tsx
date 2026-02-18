
import React, { useEffect, useRef, useState, useCallback } from 'react';

interface SnakeGameProps {
  level: number;
  onWin: () => void;
  onLose: () => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ level, onWin, onLose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const targetScore = 5 + level;
  const gridSize = 20;

  const handleGameEnd = useCallback((isWin: boolean) => {
    if (isWin) onWin();
    else onLose();
  }, [onWin, onLose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let snake = [{ x: 10, y: 10 }];
    let dir = { x: 0, y: -1 };
    let food = { x: 15, y: 15 };
    let obstacles: { x: number, y: number }[] = [];
    
    // Add obstacles for higher levels
    if (level > 3) {
      const obstacleCount = Math.floor(level / 2);
      for (let i = 0; i < obstacleCount; i++) {
        obstacles.push({
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize)
        });
      }
    }

    let localScore = 0;
    const gameSpeed = Math.max(50, 150 - (level * 3));

    const move = () => {
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      
      // Wrapping glitch (Level 15+)
      if (level >= 15) {
        if (head.x < 0) head.x = gridSize - 1;
        if (head.x >= gridSize) head.x = 0;
        if (head.y < 0) head.y = gridSize - 1;
        if (head.y >= gridSize) head.y = 0;
      } else {
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
          handleGameEnd(false);
          return;
        }
      }

      // Check collision
      if (snake.some(s => s.x === head.x && s.y === head.y)) {
        handleGameEnd(false);
        return;
      }
      if (obstacles.some(o => o.x === head.x && o.y === head.y)) {
        handleGameEnd(false);
        return;
      }

      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        localScore++;
        setScore(localScore);
        if (localScore >= targetScore) {
          handleGameEnd(true);
          return;
        }
        food = {
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize)
        };
      } else {
        snake.pop();
      }

      draw();
    };

    const draw = () => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cellSize = canvas.width / gridSize;

      // Obstacles
      ctx.fillStyle = '#333';
      obstacles.forEach(o => ctx.fillRect(o.x * cellSize, o.y * cellSize, cellSize, cellSize));

      // Food
      ctx.fillStyle = '#39ff14';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#39ff14';
      ctx.fillRect(food.x * cellSize + 2, food.y * cellSize + 2, cellSize - 4, cellSize - 4);

      // Snake
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#bc13fe';
      snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? '#bc13fe' : '#9000cc';
        ctx.fillRect(s.x * cellSize + 1, s.y * cellSize + 1, cellSize - 2, cellSize - 2);
      });
      ctx.shadowBlur = 0;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'ArrowUp' || e.key === 'w') && dir.y === 0) dir = { x: 0, y: -1 };
      else if ((e.key === 'ArrowDown' || e.key === 's') && dir.y === 0) dir = { x: 0, y: 1 };
      else if ((e.key === 'ArrowLeft' || e.key === 'a') && dir.x === 0) dir = { x: -1, y: 0 };
      else if ((e.key === 'ArrowRight' || e.key === 'd') && dir.x === 0) dir = { x: 1, y: 0 };
    };

    const interval = setInterval(move, gameSpeed);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [level, targetScore, handleGameEnd]);

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <div className="mb-4 text-center">
        <div className="text-[10px] opacity-40">PACKETS COLLECTED</div>
        <div className="cyber-font text-2xl text-[#39ff14] neon-glow-purple">{score} / {targetScore}</div>
      </div>
      
      <canvas 
        ref={canvasRef} 
        width={350} 
        height={350} 
        className="neon-border-purple bg-black rounded"
      />

      <div className="mt-6 grid grid-cols-3 gap-2">
        <div />
        <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp'}))} className="p-4 bg-black/50 border border-purple-500 rounded active:scale-90">↑</button>
        <div />
        <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft'}))} className="p-4 bg-black/50 border border-purple-500 rounded active:scale-90">←</button>
        <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown'}))} className="p-4 bg-black/50 border border-purple-500 rounded active:scale-90">↓</button>
        <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'}))} className="p-4 bg-black/50 border border-purple-500 rounded active:scale-90">→</button>
      </div>
    </div>
  );
};

export default SnakeGame;
