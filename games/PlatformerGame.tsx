
import React, { useEffect, useRef } from 'react';

interface PlatformerGameProps {
  level: number;
  onWin: () => void;
  onLose: () => void;
}

const PlatformerGame: React.FC<PlatformerGameProps> = ({ level, onWin, onLose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  const gameState = useRef({
    player: { x: 200, y: 500, w: 20, h: 20, vx: 0, vy: 0, grounded: false },
    platforms: [] as { x: number, y: number, w: number, h: number }[],
    hazards: [] as { x: number, y: number, r: number, vx: number, vy: number }[],
    goal: { x: 200, y: 50, w: 30, h: 30 },
    keys: { left: false, right: false, up: false }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameState.current;
    state.player = { x: 200, y: 500, w: 20, h: 20, vx: 0, vy: 0, grounded: false };
    state.keys = { left: false, right: false, up: false };

    // Platform generation
    const platCount = Math.max(5, 12 - Math.floor(level / 5));
    state.platforms = [{ x: 0, y: 580, w: 400, h: 40 }]; // Ground
    
    for (let i = 0; i < platCount; i++) {
      const w = Math.max(40, 160 - (level * 3));
      const x = Math.random() * (400 - w);
      const y = 500 - (i * (450 / platCount));
      state.platforms.push({ x, y, w, h: 12 });
    }

    state.goal = { x: 50 + Math.random() * 300, y: 50, w: 30, h: 30 };

    state.hazards = [];
    if (level >= 3) {
      const hazardCount = Math.floor(level / 3) + 1;
      const speedMult = 1.5 + (level * 0.1);
      for (let i = 0; i < hazardCount; i++) {
        state.hazards.push({
          x: Math.random() * 400,
          y: 100 + Math.random() * 350,
          r: 6,
          vx: (Math.random() - 0.5) * speedMult,
          vy: (Math.random() - 0.5) * speedMult
        });
      }
    }

    const update = () => {
      const p = state.player;
      const gravity = 0.45 + (level * 0.005);
      const moveSpeed = 3.5 + (level * 0.05);
      const jumpPower = -9.5 - (level * 0.05);

      // Horizontal Movement
      if (state.keys.left) p.vx = -moveSpeed;
      else if (state.keys.right) p.vx = moveSpeed;
      else p.vx *= 0.8;

      // Vertical Movement
      if (state.keys.up && p.grounded) {
        p.vy = jumpPower;
        p.grounded = false;
      }

      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;

      // Bounds
      if (p.x < 0) p.x = 0;
      if (p.x + p.w > 400) p.x = 400 - p.w;
      if (p.y > 650) { onLose(); return; } // Fell off screen

      // Collision logic - FIXED: Removed p.vx >= 0 check
      p.grounded = false;
      for (const plat of state.platforms) {
        // Vertical collision (landing on platform)
        if (p.vy >= 0 && 
            p.x + p.w > plat.x && 
            p.x < plat.x + plat.w &&
            p.y + p.h > plat.y && 
            p.y + p.h < plat.y + plat.h + p.vy) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.grounded = true;
        }
      }

      // Hazards
      for (const h of state.hazards) {
        h.x += h.vx;
        h.y += h.vy;
        if (h.x < 0 || h.x > 400) h.vx *= -1;
        if (h.y < 0 || h.y > 600) h.vy *= -1;

        const dx = (p.x + p.w / 2) - h.x;
        const dy = (p.y + p.h / 2) - h.y;
        if (Math.sqrt(dx * dx + dy * dy) < h.r + p.w / 2 - 2) {
          onLose();
          return;
        }
      }

      // Goal
      if (p.x < state.goal.x + state.goal.w && p.x + p.w > state.goal.x &&
          p.y < state.goal.y + state.goal.h && p.y + p.h > state.goal.y) {
        onWin();
        return;
      }

      // Render
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, 400, 600);
      
      ctx.strokeStyle = '#00f3ff';
      ctx.globalAlpha = 0.05;
      ctx.beginPath();
      for (let i = 0; i <= 400; i += 40) { ctx.moveTo(i, 0); ctx.lineTo(i, 600); }
      for (let i = 0; i <= 600; i += 40) { ctx.moveTo(0, i); ctx.lineTo(400, i); }
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Draw Platforms
      ctx.fillStyle = '#00f3ff';
      for (const plat of state.platforms) {
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.fillStyle = '#00f3ff33';
        ctx.fillRect(plat.x, plat.y + plat.h, plat.w, 4);
        ctx.fillStyle = '#00f3ff';
      }

      // Draw Hazards
      ctx.fillStyle = '#ff003c';
      for (const h of state.hazards) {
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Goal
      ctx.fillStyle = '#39ff14';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#39ff14';
      ctx.fillRect(state.goal.x, state.goal.y, state.goal.w, state.goal.h);
      ctx.shadowBlur = 0;

      // Draw Player
      ctx.fillStyle = '#bc13fe';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#bc13fe';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.shadowBlur = 0;

      requestRef.current = requestAnimationFrame(update);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') state.keys.left = true;
      if (key === 'arrowright' || key === 'd') state.keys.right = true;
      if (key === 'arrowup' || key === 'w' || key === ' ') state.keys.up = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') state.keys.left = false;
      if (key === 'arrowright' || key === 'd') state.keys.right = false;
      if (key === 'arrowup' || key === 'w' || key === ' ') state.keys.up = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [level, onWin, onLose]);

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={600} 
        className="rounded-lg border-2 border-[#00f3ff]/50 bg-black max-h-[60vh] w-auto aspect-[2/3]"
      />
      <div className="mt-6 flex gap-4 w-full max-w-[400px]">
        <button 
          onPointerDown={() => gameState.current.keys.left = true}
          onPointerUp={() => gameState.current.keys.left = false}
          onPointerLeave={() => gameState.current.keys.left = false}
          className="flex-1 py-5 bg-black/80 border border-cyan-500 text-[#00f3ff] rounded active:scale-95 select-none cyber-font text-sm"
        >
          LEFT
        </button>
        <button 
          onPointerDown={() => gameState.current.keys.up = true}
          onPointerUp={() => gameState.current.keys.up = false}
          onPointerLeave={() => gameState.current.keys.up = false}
          className="flex-1 py-5 bg-[#bc13fe] text-black font-bold rounded active:scale-95 select-none cyber-font text-sm shadow-[0_0_15px_#bc13fe]"
        >
          JUMP
        </button>
        <button 
          onPointerDown={() => gameState.current.keys.right = true}
          onPointerUp={() => gameState.current.keys.right = false}
          onPointerLeave={() => gameState.current.keys.right = false}
          className="flex-1 py-5 bg-black/80 border border-cyan-500 text-[#00f3ff] rounded active:scale-95 select-none cyber-font text-sm"
        >
          RIGHT
        </button>
      </div>
    </div>
  );
};

export default PlatformerGame;
