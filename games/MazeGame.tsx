
import React, { useEffect, useRef, useState } from 'react';

interface MazeGameProps {
  level: number;
  onWin: () => void;
  onLose: () => void;
}

const MazeGame: React.FC<MazeGameProps> = ({ level, onWin, onLose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gridSize, setGridSize] = useState(5);
  
  // Use a ref for level to prevent dependency loops
  const levelRef = useRef(level);
  useEffect(() => { levelRef.current = level; }, [level]);

  useEffect(() => {
    const newSize = Math.floor(5 + (level - 1) * (45 / 29));
    setGridSize(newSize);
  }, [level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    const generate = () => {
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
        if (current.x < next.x) { current.walls[1] = false; next.walls[3] = false; }
        else if (current.x > next.x) { current.walls[3] = false; next.walls[1] = false; }
        if (current.y < next.y) { current.walls[2] = false; next.walls[0] = false; }
        else if (current.y > next.y) { current.walls[0] = false; next.walls[2] = false; }
        next.visited = true;
        current = next;
      } else if (stack.length > 0) {
        current = stack.pop();
      } else {
        return true;
      }
      return false;
    };

    while (!generate());

    let player = { x: 0, y: 0 };
    const goal = { x: cols - 1, y: rows - 1 };
    const enemyCount = Math.floor(level / 5);
    const enemies = Array.from({ length: enemyCount }).map(() => ({
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
      dir: Math.floor(Math.random() * 4)
    }));

    const cellSize = Math.min(canvas.width / cols, canvas.height / rows);
    const offsetX = (canvas.width - cols * cellSize) / 2;
    const offsetY = (canvas.height - rows * cellSize) / 2;

    const draw = () => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 2;
      grid.forEach(cell => {
        const x = cell.x * cellSize + offsetX;
        const y = cell.y * cellSize + offsetY;
        ctx.beginPath();
        if (cell.walls[0]) { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); }
        if (cell.walls[1]) { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); }
        if (cell.walls[2]) { ctx.moveTo(x + cellSize, y + cellSize); ctx.lineTo(x, y + cellSize); }
        if (cell.walls[3]) { ctx.moveTo(x, y + cellSize); ctx.lineTo(x, y); }
        ctx.stroke();
      });
      ctx.fillStyle = '#39ff14';
      ctx.fillRect(goal.x * cellSize + offsetX + 4, goal.y * cellSize + offsetY + 4, cellSize - 8, cellSize - 8);
      ctx.fillStyle = '#bc13fe';
      ctx.beginPath();
      ctx.arc(player.x * cellSize + offsetX + cellSize/2, player.y * cellSize + offsetY + cellSize/2, cellSize/3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff003c';
      enemies.forEach(e => {
        ctx.fillRect(e.x * cellSize + offsetX + 6, e.y * cellSize + offsetY + 6, cellSize - 12, cellSize - 12);
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const cell = grid[index(player.x, player.y)];
      if (!cell) return;
      let moved = false;
      if ((e.key === 'ArrowUp' || e.key === 'w') && !cell.walls[0]) { player.y--; moved = true; }
      else if ((e.key === 'ArrowRight' || e.key === 'd') && !cell.walls[1]) { player.x++; moved = true; }
      else if ((e.key === 'ArrowDown' || e.key === 's') && !cell.walls[2]) { player.y++; moved = true; }
      else if ((e.key === 'ArrowLeft' || e.key === 'a') && !cell.walls[3]) { player.x--; moved = true; }
      if (moved) {
        if (player.x === goal.x && player.y === goal.y) onWin();
        enemies.forEach(e => { if (e.x === player.x && e.y === player.y) onLose(); });
        draw();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    draw();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gridSize, onWin, onLose]); // level removed from deps to prevent regenerate

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={350} 
        height={350} 
        className="neon-border-cyan rounded-lg"
      />
      <div className="mt-6 grid grid-cols-3 gap-2 w-full max-w-[200px]">
        <div />
        <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp'}))} className="p-4 bg-black/50 border border-cyan-500 rounded active:scale-90 select-none">↑</button>
        <div />
        <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft'}))} className="p-4 bg-black/50 border border-cyan-500 rounded active:scale-90 select-none">←</button>
        <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown'}))} className="p-4 bg-black/50 border border-cyan-500 rounded active:scale-90 select-none">↓</button>
        <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'}))} className="p-4 bg-black/50 border border-cyan-500 rounded active:scale-90 select-none">→</button>
      </div>
    </div>
  );
};

export default MazeGame;
