import React, { useEffect, useRef, useState, useCallback } from 'react';

interface MazeGameProps {
  level: number;
  onWin: () => void;
  onLose: () => void;
}

const MazeGame: React.FC<MazeGameProps> = ({ level, onWin, onLose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gridSize, setGridSize] = useState(5);
  const playerRef = useRef({ x: 0, y: 0 });
  const mazeRef = useRef<{ x: number, y: number, walls: boolean[] }[]>([]);

  useEffect(() => {
    // Scaling grid size: starts at 5x5, maxes out around 20x20 for level 30
    const newSize = Math.floor(5 + (level - 1) * (15 / 29));
    setGridSize(newSize);
  }, [level]);

  const generateMaze = useCallback(() => {
    const cols = gridSize;
    const rows = gridSize;
    const grid: { x: number, y: number, visited: boolean, walls: boolean[] }[] = [];
    
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        grid.push({ x: i, y: j, visited: false, walls: [true, true, true, true] });
      }
    }

    const index = (i: number, j: number) => (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) ? -1 : i + j * cols;
    
    const stack: any[] = [];
    let current = grid[0];
    current.visited = true;

    while (true) {
      let neighbors: any[] = [];
      const { x, y } = current;
      const top = grid[index(x, y - 1)];
      const right = grid[index(x + 1, y)];
      const bottom = grid[index(x, y + 1)];
      const left = grid[index(x - 1, y)];

      if (top && !top.visited) neighbors.push(top);
      if (right && !right.visited) neighbors.push(right);
      if (bottom && !bottom.visited) neighbors.push(bottom);
      if (left && !left.visited) neighbors.push(left);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        stack.push(current);
        // Remove walls
        if (current.x < next.x) { current.walls[1] = false; next.walls[3] = false; }
        else if (current.x > next.x) { current.walls[3] = false; next.walls[1] = false; }
        if (current.y < next.y) { current.walls[2] = false; next.walls[0] = false; }
        else if (current.y > next.y) { current.walls[0] = false; next.walls[2] = false; }
        next.visited = true;
        current = next;
      } else if (stack.length > 0) {
        current = stack.pop();
      } else {
        break;
      }
    }
    mazeRef.current = grid.map(c => ({ x: c.x, y: c.y, walls: c.walls }));
    playerRef.current = { x: 0, y: 0 };
  }, [gridSize]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = gridSize;
    const rows = gridSize;
    const cellSize = Math.min(canvas.width / cols, canvas.height / rows);
    const offsetX = (canvas.width - cols * cellSize) / 2;
    const offsetY = (canvas.height - rows * cellSize) / 2;
    const goal = { x: cols - 1, y: rows - 1 };

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Maze Walls
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    mazeRef.current.forEach(cell => {
      const x = cell.x * cellSize + offsetX;
      const y = cell.y * cellSize + offsetY;
      ctx.beginPath();
      if (cell.walls[0]) { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); }
      if (cell.walls[1]) { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); }
      if (cell.walls[2]) { ctx.moveTo(x + cellSize, y + cellSize); ctx.lineTo(x, y + cellSize); }
      if (cell.walls[3]) { ctx.moveTo(x, y + cellSize); ctx.lineTo(x, y); }
      ctx.stroke();
    });

    // Draw Goal
    ctx.fillStyle = '#39ff14';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#39ff14';
    ctx.fillRect(goal.x * cellSize + offsetX + cellSize * 0.2, goal.y * cellSize + offsetY + cellSize * 0.2, cellSize * 0.6, cellSize * 0.6);
    ctx.shadowBlur = 0;
    
    // Draw Player
    ctx.fillStyle = '#bc13fe';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#bc13fe';
    ctx.beginPath();
    ctx.arc(
      playerRef.current.x * cellSize + offsetX + cellSize / 2, 
      playerRef.current.y * cellSize + offsetY + cellSize / 2, 
      cellSize / 3, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [gridSize]);

  useEffect(() => {
    generateMaze();
    draw();
  }, [gridSize, generateMaze, draw]);

  const handleMove = useCallback((key: string) => {
    const { x, y } = playerRef.current;
    const idx = x + y * gridSize;
    const cell = mazeRef.current[idx];
    if (!cell) return;

    let nextX = x, nextY = y;
    const k = key.toLowerCase();
    if ((k === 'arrowup' || k === 'w') && !cell.walls[0]) nextY--;
    else if ((k === 'arrowright' || k === 'd') && !cell.walls[1]) nextX++;
    else if ((k === 'arrowdown' || k === 's') && !cell.walls[2]) nextY++;
    else if ((k === 'arrowleft' || k === 'a') && !cell.walls[3]) nextX--;

    if (nextX !== x || nextY !== y) {
      playerRef.current = { x: nextX, y: nextY };
      if (nextX === gridSize - 1 && nextY === gridSize - 1) {
        onWin();
      } else {
        draw();
      }
    }
  }, [gridSize, onWin, draw]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => handleMove(e.key);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleMove]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <div className="relative mb-4">
        <canvas ref={canvasRef} width={340} height={340} className="neon-border-cyan rounded-lg bg-black" />
        <div className="absolute top-2 left-2 text-[8px] cyber-font text-cyan-500 opacity-50">SYS_MAZE_V2.0</div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div />
        <button 
          onPointerDown={(e) => { e.preventDefault(); handleMove('w'); }} 
          className="w-16 h-16 flex items-center justify-center bg-black/40 border-2 border-cyan-500 rounded-xl active:bg-cyan-500 active:text-black transition-all neon-glow-cyan"
        >
          <span className="text-2xl">↑</span>
        </button>
        <div />
        <button 
          onPointerDown={(e) => { e.preventDefault(); handleMove('a'); }} 
          className="w-16 h-16 flex items-center justify-center bg-black/40 border-2 border-cyan-500 rounded-xl active:bg-cyan-500 active:text-black transition-all neon-glow-cyan"
        >
          <span className="text-2xl">←</span>
        </button>
        <button 
          onPointerDown={(e) => { e.preventDefault(); handleMove('s'); }} 
          className="w-16 h-16 flex items-center justify-center bg-black/40 border-2 border-cyan-500 rounded-xl active:bg-cyan-500 active:text-black transition-all neon-glow-cyan"
        >
          <span className="text-2xl">↓</span>
        </button>
        <button 
          onPointerDown={(e) => { e.preventDefault(); handleMove('d'); }} 
          className="w-16 h-16 flex items-center justify-center bg-black/40 border-2 border-cyan-500 rounded-xl active:bg-cyan-500 active:text-black transition-all neon-glow-cyan"
        >
          <span className="text-2xl">→</span>
        </button>
      </div>
    </div>
  );
};

export default MazeGame;