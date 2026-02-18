
import React, { useEffect, useRef, useState } from 'react';

interface PlatformerGameProps {
  level: number;
  onWin: () => void;
  onLose: () => void;
}

// Rewriting PlatformerGame to use native Canvas instead of Phaser to fix "Cannot find namespace 'Phaser'" errors.
const PlatformerGame: React.FC<PlatformerGameProps> = ({ level, onWin, onLose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game state refs to avoid closure staleness in the loop
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

    // Reset game state for the level
    const state = gameState.current;
    state.player = { x: 200, y: 500, w: 20, h: 20, vx: 0, vy: 0, grounded: false };
    state.keys = { left: false, right: false, up: false };

    // Platform generation
    const platCount = Math.max(3, 15 - Math.floor(level / 3));
    state.platforms = [{ x: 0, y: 580, w: 400, h: 40 }]; // Ground
    
    for (let i = 0; i < platCount; i++) {
      const w = Math.max(30, 150 - (level * 2));
      const x = Math.random() * (400 - w);
      const y = 500 - (i * (450 / platCount));
      state.platforms.push({ x, y, w, h: 10 });
    }

    // Goal
    state.goal = { 
      x: 50 + Math.random() * 300, 
      y: 50, 
      w: 30, 
      h: 30 
    };

    // Hazards
    state.hazards = [];
    if (level >= 5) {
      const hazardCount = Math.floor(level / 4);
      const speedMult = 100 + level * 5;
      for (let i = 0; i < hazardCount; i++) {
        state.hazards.push({
          x: Math.random() * 400,
          y: 100 + Math.random() * 300,
          r: 5,
          vx: (Math.random() - 0.5) * speedMult / 30,
          vy: (Math.random() - 0.5) * speedMult / 30
        });
      }
    }

    const update = () => {
      const p = state.player;
      const gravity = 0.5 + (level * 0.01);
      const moveSpeed = 4 + (level * 0.05);
      const jumpPower = -10 - (level * 0.05);

      // Input
      if (state.keys.left) p.vx = -moveSpeed;
      else if (state.keys.right) p.vx = moveSpeed;
      else p.vx *= 0.8;

      if (state.keys.up && p.grounded) {
        p.vy = jumpPower;
        p.grounded = false;
      }

      // Physics
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;

      // World bounds
      if (p.x < 0) p.x = 0;
      if (p.x + p.w > 400) p.x = 400 - p.w;

      // Platform collision
      p.grounded = false;
      for (const plat of state.platforms) {
        if (p.vx >= 0 && p.x < plat.x + plat.w && p.x + p.w > plat.x &&
            p.y + p.h > plat.y && p.y + p.h < plat.y + plat.h + p.vy) {
          if (p.vy > 0) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.grounded = true;
          }
        }
      }

      // Hazard movement and collision
      for (const h of state.hazards) {
        h.x += h.vx;
        h.y += h.vy;
        if (h.x < 0 || h.x > 400) h.vx *= -1;
        if (h.y < 0 || h.y > 600) h.vy *= -1;

        // Player collision
        const dx = (p.x + p.w / 2) - h.x;
        const dy = (p.y + p.h / 2) - h.y;
        if (Math.sqrt(dx * dx + dy * dy) < h.r + p.w / 2) {
          onLose();
          return;
        }
      }

      // Goal collision
      if (p.x < state.goal.x + state.goal.w && p.x + p.w > state.goal.x &&
          p.y < state.goal.y + state.goal.h && p.y + p.h > state.goal.y) {
        onWin();
        return;
      }

      // Draw
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, 400, 600);

      // Grid
      ctx.strokeStyle = '#00f3ff';
      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      for (let i = 0; i <= 400; i += 40) { ctx.moveTo(i, 0); ctx.lineTo(i, 600); }
      for (let i = 0; i <= 600; i += 40) { ctx.moveTo(0, i); ctx.lineTo(400, i); }
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Platforms
      ctx.fillStyle = '#00f3ff';
      for (const plat of state.platforms) {
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      }

      // Hazards
      ctx.fillStyle = '#ff003c';
      for (const h of state.hazards) {
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Goal
      ctx.fillStyle = '#39ff14';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#39ff14';
      ctx.fillRect(state.goal.x, state.goal.y, state.goal.w, state.goal.h);
      ctx.shadowBlur = 0;

      // Player
      ctx.fillStyle = '#bc13fe';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#bc13fe';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.shadowBlur = 0;

      requestRef.current = requestAnimationFrame(update);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') state.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') state.keys.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') state.keys.up = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') state.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') state.keys.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') state.keys.up = false;
    };

    const handleJumpEvent = () => {
      state.keys.up = true;
      setTimeout(() => { state.keys.up = false; }, 100);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('jump', handleJumpEvent);

    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('jump', handleJumpEvent);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [level, onWin, onLose]);

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={600} 
        className="rounded-lg border-2 border-[#00f3ff]/50 bg-black"
      />
      <div className="mt-4 flex gap-4 w-full max-w-[400px]">
        <button 
          onMouseDown={() => gameState.current.keys.left = true}
          onMouseUp={() => gameState.current.keys.left = false}
          onTouchStart={() => gameState.current.keys.left = true} 
          onTouchEnd={() => gameState.current.keys.left = false} 
          className="flex-1 py-4 bg-black border border-cyan-500 rounded active:scale-95 select-none"
        >
          LEFT
        </button>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('jump'))}
          className="flex-1 py-4 bg-[#bc13fe] text-black font-bold rounded active:scale-95 select-none"
        >
          JUMP
        </button>
        <button 
          onMouseDown={() => gameState.current.keys.right = true}
          onMouseUp={() => gameState.current.keys.right = false}
          onTouchStart={() => gameState.current.keys.right = true} 
          onTouchEnd={() => gameState.current.keys.right = false} 
          className="flex-1 py-4 bg-black border border-cyan-500 rounded active:scale-95 select-none"
        >
          RIGHT
        </button>
      </div>
    </div>
  );
};

export default PlatformerGame;
