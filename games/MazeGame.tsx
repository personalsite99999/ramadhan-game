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
  
  const gameData = useRef({
    player: { x: 0, y: 0 },
    enemies: [] as { x: number, y: number, nextMove: number }[],
    grid: [] as { x: number, y: number, visited: boolean, walls: boolean[] }[],
    goal: { x: 0, y: 0 },
    cols: 0,
    rows: 0
  });

  useEffect(() => {
    const newSize = Math.min(22, Math.floor(5 + (level - 1) * 0.6));
    setGridSize(newSize);
    setGameReady(false);
  }, [level]);

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

    while (true) {
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
        
        if (next.dir === 0) { current.walls[0] = false; next.cell.walls[2] = false; }
        else if (next.dir === 1) { current.walls[1] = false; next.cell.walls[3] = false; }
        else if (next.dir === 2) { current.walls[2] = false; next.cell.walls[0] = false; }
        else if (next.dir === 3) { current.walls[3] = false; next.cell.walls[1] = false; }
        
        next.cell.visited = true;
        current = next.cell;
      } else if (stack.length > 0) {
        current = stack.pop();
      } else {
        break;
      }
    }

    gameData.current = {
      player: { x: 0, y: 0 },
      enemies: [],
      grid: grid,
      goal: { x: cols - 1, y: rows - 1 },
      cols: cols,
      rows: rows
    };

    const enemyCount = Math.floor(level / 2.5);
    for (let i = 0; i < enemyCount; i++) {
      let ex, ey;
      do {
        ex = Math.floor(Math.random() * cols);
        ey = Math.floor(Math.random() * rows);
      } while ((ex < 3 && ey < 3) || (ex === cols - 1 && ey === rows - 1));
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

    if (moved && player.x === goal.x && player.y === goal.y) {
      onWin();
    }
  }, [gameReady, onWin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => movePlayer(e.key);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

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

      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = Math.max(1, 3 - Math.floor(cols / 10));
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

      const gx = goal.x * cellSize + offsetX;
      const gy = goal.y * cellSize + offsetY;
      ctx.fillStyle = '#39ff14';
      ctx.fillRect(gx + cellSize * 0.25, gy + cellSize * 0.25, cellSize * 0.5, cellSize * 0.5);

      const now = Date.now();
      ctx.fillStyle = '#ff003c';
      enemies.forEach(e => {
        if (now > e.nextMove) {
          const cell = grid[e.x + e.y * cols];
          const canMove = [];
          if (!cell.walls[0]) canMove.push(0);
          if (!cell.walls[1]) canMove.push(1);
          if (!cell.walls[2]) canMove.push(2);
          if (!cell.walls[3]) canMove.push(3);

          if (canMove.length > 0) {
            let moveDir;
            // Smart movement at high levels: 30% chance to chase player
            if (level > 10 && Math.random() < 0.3) {
              const dx = player.x - e.x;
              const dy = player.y - e.y;
              const preferred = [];
              if (dx > 0 && canMove.includes(1)) preferred.push(1);
              if (dx < 0 && canMove.includes(3)) preferred.push(3);
              if (dy > 0 && canMove.includes(2)) preferred.push(2);
              if (dy < 0 && canMove.includes(0)) preferred.push(0);
              moveDir = preferred.length > 0 ? preferred[Math.floor(Math.random() * preferred.length)] : canMove[Math.floor(Math.random() * canMove.length)];
            } else {
              moveDir = canMove[Math.floor(Math.random() * canMove.length)];
            }

            if (moveDir === 0) e.y--;
            else if (moveDir === 1) e.x++;
            else if (moveDir === 2) e.y++;
            else if (moveDir === 3) e.x--;
          }
          e.nextMove = now + Math.max(200, 900 - level * 20);
        }
        
        ctx.beginPath();
        ctx.arc(e.x * cellSize + offsetX + cellSize/2, e.y * cellSize + offsetY + cellSize/2, cellSize * 0.3, 0, Math.PI * 2);
        ctx.fill();

        if (e.x === player.x && e.y === player.y) onLose();
      });

      const px = player.x * cellSize + offsetX;
      const py = player.y * cellSize + offsetY;
      ctx.fillStyle = '#bc13fe';
      ctx.beginPath();
      ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize * 0.35, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameReady, level, onLose]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 overflow-hidden bg-black/40">
      <div className="relative p-2 bg-black/80 rounded-xl neon-border-cyan mb-8">
        <canvas ref={canvasRef} width={320} height={320} className="rounded-lg max-w-full" />
        {!gameReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-cyan-400 cyber-font animate-pulse">BOOTING_MAZE...</div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
        <div />
        <button onPointerDown={() => movePlayer('ArrowUp')} className="aspect-square bg-black/60 border border-cyan-500 rounded-xl flex items-center justify-center active:scale-90 shadow-[0_0_10px_#00f3ff33]"><span className="text-2xl text-cyan-400">▲</span></button>
        <div />
        <button onPointerDown={() => movePlayer('ArrowLeft')} className="aspect-square bg-black/60 border border-cyan-500 rounded-xl flex items-center justify-center active:scale-90 shadow-[0_0_10px_#00f3ff33]"><span className="text-2xl text-cyan-400">◀</span></button>
        <button onPointerDown={() => movePlayer('ArrowDown')} className="aspect-square bg-black/60 border border-cyan-500 rounded-xl flex items-center justify-center active:scale-90 shadow-[0_0_10px_#00f3ff33]"><span className="text-2xl text-cyan-400">▼</span></button>
        <button onPointerDown={() => movePlayer('ArrowRight')} className="aspect-square bg-black/60 border border-cyan-500 rounded-xl flex items-center justify-center active:scale-90 shadow-[0_0_10px_#00f3ff33]"><span className="text-2xl text-cyan-400">▶</span></button>
      </div>
    </div>
  );
};

export default MazeGame;