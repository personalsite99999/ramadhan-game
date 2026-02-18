import React, { useEffect, useRef, useState, useCallback } from 'react';

interface MazeGameProps {
  level: number;
  onWin: () => void;
  onLose: () => void;
}

const MazeGame: React.FC<MazeGameProps> = ({ level, onWin, onLose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gridSize, setGridSize] = useState(5);
  const [gameReady, setGameReady] = useState(false);
  
  // Use a ref to store game data that needs to be accessed in the render loop/input handlers
  const gameData = useRef({
    player: { x: 0, y: 0 },
    enemies: [] as { x: number, y: number, nextMove: number }[],
    grid: [] as { x: number, y: number, visited: boolean, walls: boolean[] }[],
    goal: { x: 0, y: 0 },
    cols: 0,
    rows: 0
  });

  // Calculate grid size based on level
  useEffect(() => {
    const newSize = Math.min(22, Math.floor(5 + (level - 1) * 0.6));
    setGridSize(newSize);
    setGameReady(false);
  }, [level]);

  // Generate Maze
  useEffect(() => {
    const cols = gridSize;
    const rows = gridSize;
    const grid: { x: number, y: number, visited: boolean, walls: boolean[] }[] = [];
    
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        grid.push({ x: i, y: j, visited: false, walls: [true, true, true, true] });
      }
    }

    const getIndex = (i: number, j: number) => (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) ? -1 : i + j * cols;
    
    const stack: any[] = [];
    let current = grid[0];
    current.visited = true;

    // Maze Generation (Recursive Backtracker)
    let finished = false;
    while (!finished) {
      let neighbors: any[] = [];
      const { x, y } = current;
      
      const top = grid[getIndex(x, y - 1)];
      const right = grid[getIndex(x + 1, y)];
      const bottom = grid[getIndex(x, y + 1)];
      const left = grid[getIndex(x - 1, y)];

      if (top && !top.visited) neighbors.push({cell: top, dir: 0});
      if (right && !right.visited) neighbors.push({cell: right, dir: 1});
      if (bottom && !bottom.visited) neighbors.push({cell: bottom, dir: 2});
      if (left && !left.visited) neighbors.push({cell: left, dir: 3});

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        stack.push(current);
        
        // Remove walls
        if (next.dir === 0) { current.walls[0] = false; next.cell.walls[2] = false; }
        else if (next.dir === 1) { current.walls[1] = false; next.cell.walls[3] = false; }
        else if (next.dir === 2) { current.walls[2] = false; next.cell.walls[0] = false; }
        else if (next.dir === 3) { current.walls[3] = false; next.cell.walls[1] = false; }
        
        next.cell.visited = true;
        current = next.cell;
      } else if (stack.length > 0) {
        current = stack.pop();
      } else {
        finished = true;
      }
    }

    // Set initial game state
    gameData.current = {
      player: { x: 0, y: 0 },
      enemies: [],
      grid: grid,
      goal: { x: cols - 1, y: rows - 1 },
      cols: cols,
      rows: rows
    };

    // Spawn Enemies
    const enemyCount = Math.floor(level / 3);
    for (let i = 0; i < enemyCount; i++) {
      let ex, ey;
      do {
        ex = Math.floor(Math.random() * cols);
        ey = Math.floor(Math.random() * rows);
      } while ((ex < 2 && ey < 2) || (ex === cols - 1 && ey === rows - 1));
      gameData.current.enemies.push({ x: ex, y: ey, nextMove: Date.now() + 1000 + Math.random() * 2000 });
    }

    setGameReady(true);
  }, [gridSize, level]);

  const movePlayer = useCallback((dir: string) => {
    if (!gameReady) return;
    const { player, grid, goal, cols } = gameData.current;
    const cellIdx = player.x + player.y * cols;
    const cell = grid[cellIdx];
    if (!cell) return;

    let moved = false;
    if ((dir === 'ArrowUp' || dir === 'w') && !cell.walls[0]) { player.y--; moved = true; }
    else if ((dir === 'ArrowRight' || dir === 'd') && !cell.walls[1]) { player.x++; moved = true; }
    else if ((dir === 'ArrowDown' || dir === 's') && !cell.walls[2]) { player.y++; moved = true; }
    else if ((dir === 'ArrowLeft' || dir === 'a') && !cell.walls[3]) { player.x--; moved = true; }

    if (moved) {
      if (player.x === goal.x && player.y === goal.y) {
        onWin();
      }
    }
  }, [gameReady, onWin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => movePlayer(e.key);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // Main Render Loop
  useEffect(() => {
    if (!gameReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const { player, enemies, grid, goal, cols, rows } = gameData.current;
      const cellSize = Math.min(canvas.width / cols, canvas.height / rows);
      const offsetX = (canvas.width - cols * cellSize) / 2;
      const offsetY = (canvas.height - rows * cellSize) / 2;

      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Path (Aesthetic)
      ctx.strokeStyle = '#00f3ff11';
      ctx.lineWidth = 1;
      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize + offsetX, offsetY);
        ctx.lineTo(i * cellSize + offsetX, rows * cellSize + offsetY);
        ctx.stroke();
      }
      for (let j = 0; j <= rows; j++) {
        ctx.beginPath();
        ctx.moveTo(offsetX, j * cellSize + offsetY);
        ctx.lineTo(cols * cellSize + offsetX, j * cellSize + offsetY);
        ctx.stroke();
      }

      // Draw Walls
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = Math.max(1, 4 - Math.floor(cols / 8));
      ctx.lineCap = 'round';
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#00f3ff';
      
      ctx.beginPath();
      grid.forEach(cell => {
        const x = cell.x * cellSize + offsetX;
        const y = cell.y * cellSize + offsetY;
        if (cell.walls[0]) { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); }
        if (cell.walls[1]) { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); }
        if (cell.walls[2]) { ctx.moveTo(x + cellSize, y + cellSize); ctx.lineTo(x, y + cellSize); }
        if (cell.walls[3]) { ctx.moveTo(x, y + cellSize); ctx.lineTo(x, y); }
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Goal
      const gx = goal.x * cellSize + offsetX;
      const gy = goal.y * cellSize + offsetY;
      ctx.fillStyle = '#39ff14';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#39ff14';
      ctx.fillRect(gx + cellSize * 0.25, gy + cellSize * 0.25, cellSize * 0.5, cellSize * 0.5);
      ctx.shadowBlur = 0;

      // Move and Draw Enemies
      const now = Date.now();
      ctx.fillStyle = '#ff003c';
      enemies.forEach(e => {
        if (now > e.nextMove) {
          const moveDir = Math.floor(Math.random() * 4);
          const cell = grid[e.x + e.y * cols];
          if (moveDir === 0 && !cell.walls[0]) e.y--;
          else if (moveDir === 1 && !cell.walls[1]) e.x++;
          else if (moveDir === 2 && !cell.walls[2]) e.y++;
          else if (moveDir === 3 && !cell.walls[3]) e.x--;
          e.nextMove = now + Math.max(250, 1000 - level * 25);
        }
        
        const ex = e.x * cellSize + offsetX;
        const ey = e.y * cellSize + offsetY;
        ctx.beginPath();
        ctx.arc(ex + cellSize/2, ey + cellSize/2, cellSize * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Collision Check
        if (e.x === player.x && e.y === player.y) {
          onLose();
        }
      });

      // Draw Player
      const px = player.x * cellSize + offsetX;
      const py = player.y * cellSize + offsetY;
      ctx.fillStyle = '#bc13fe';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#bc13fe';
      ctx.beginPath();
      ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameReady, level, onLose]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 overflow-hidden bg-black/40">
      <div className="relative p-2 bg-black/80 rounded-xl neon-border-cyan mb-8 overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={320} 
          height={320} 
          className="rounded-lg max-w-full"
        />
        {!gameReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-cyan-400 cyber-font animate-pulse">GENERATING_MAZE...</div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
        <div />
        <button 
          onPointerDown={() => movePlayer('ArrowUp')} 
          className="aspect-square bg-black/60 border border-cyan-500 rounded-xl flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_10px_#00f3ff33]"
        >
          <span className="text-2xl text-cyan-400">▲</span>
        </button>
        <div />
        <button 
          onPointerDown={() => movePlayer('ArrowLeft')} 
          className="aspect-square bg-black/60 border border-cyan-500 rounded-xl flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_10px_#00f3ff33]"
        >
          <span className="text-2xl text-cyan-400">◀</span>
        </button>
        <button 
          onPointerDown={() => movePlayer('ArrowDown')} 
          className="aspect-square bg-black/60 border border-cyan-500 rounded-xl flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_10px_#00f3ff33]"
        >
          <span className="text-2xl text-cyan-400">▼</span>
        </button>
        <button 
          onPointerDown={() => movePlayer('ArrowRight')} 
          className="aspect-square bg-black/60 border border-cyan-500 rounded-xl flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_10px_#00f3ff33]"
        >
          <span className="text-2xl text-cyan-400">▶</span>
        </button>
      </div>
    </div>
  );
};

export default MazeGame;