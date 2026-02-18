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
    player: { x: 50, y: 500, w: 18, h: 18, vx: 0, vy: 0, grounded: false, color: '#bc13fe' },
    platforms: [] as { x: number, y: number, w: number, h: number }[],
    hazards: [] as { x: number, y: number, r: number, vx: number, vy: number }[],
    particles: [] as { x: number, y: number, r: number, life: number, color: string }[],
    goal: { x: 200, y: 50, w: 25, h: 25 },
    keys: { left: false, right: false, up: false }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameState.current;
    state.player = { x: 50, y: 500, w: 18, h: 18, vx: 0, vy: 0, grounded: false, color: '#bc13fe' };
    state.keys = { left: false, right: false, up: false };
    state.particles = [];

    // Improved Platform generation to guarantee reachability
    const platCount = Math.max(8, 18 - Math.floor(level / 3));
    state.platforms = [{ x: 0, y: 580, w: 400, h: 50 }]; // Ground
    
    let lastY = 580;
    for (let i = 0; i < platCount; i++) {
      const w = Math.max(40, 150 - (level * 2.5));
      const x = Math.random() * (400 - w);
      // Max vertical distance is ~100px to ensure jump reachability (jump is ~120px max)
      const y = lastY - (Math.random() * 40 + 60); 
      if (y < 80) break; // Don't block goal
      state.platforms.push({ x, y, w, h: 12 });
      lastY = y;
    }

    state.goal = { x: 50 + Math.random() * 300, y: 50, w: 25, h: 25 };

    // Hazard generation
    state.hazards = [];
    if (level >= 2) {
      const count = Math.floor(level / 2) + 1;
      const speed = 1.0 + (level * 0.12);
      for (let i = 0; i < count; i++) {
        state.hazards.push({
          x: Math.random() * 400,
          y: 100 + Math.random() * 350,
          r: 6,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed
        });
      }
    }

    const update = () => {
      const p = state.player;
      const gravity = 0.55;
      const friction = 0.82;
      const accel = 1.3;
      const jumpPower = -12;

      // Input
      if (state.keys.left) p.vx -= accel;
      if (state.keys.right) p.vx += accel;
      if (state.keys.up && p.grounded) {
        p.vy = jumpPower;
        p.grounded = false;
        // Jump particles
        for(let i=0; i<6; i++) {
           state.particles.push({ x: p.x + p.w/2, y: p.y + p.h, r: Math.random()*4, life: 1, color: '#bc13fe' });
        }
      }

      // Physics
      p.vx *= friction;
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;

      // Trail particles
      if (Math.abs(p.vx) > 0.6) {
         state.particles.push({ x: p.x + p.w/2, y: p.y + p.h/2, r: 2, life: 0.5, color: '#bc13fe44' });
      }

      // Bounds
      if (p.x < 0) { p.x = 0; p.vx = 0; }
      if (p.x + p.w > 400) { p.x = 400 - p.w; p.vx = 0; }
      if (p.y > 600) { onLose(); return; }

      // Collision
      p.grounded = false;
      for (const plat of state.platforms) {
        if (p.x + p.w > plat.x && p.x < plat.x + plat.w &&
            p.y + p.h + p.vy > plat.y && p.y + p.vy < plat.y + plat.h) {
          
          if (p.vy > 0 && p.y + p.h <= plat.y + 10) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.grounded = true;
          }
        }
      }

      // Hazards
      for (const h of state.hazards) {
        h.x += h.vx; h.y += h.vy;
        if (h.x < 0 || h.x > 400) h.vx *= -1;
        if (h.y < 0 || h.y > 600) h.vy *= -1;
        const dx = (p.x + p.w/2) - h.x;
        const dy = (p.y + p.h/2) - h.y;
        if (Math.sqrt(dx*dx + dy*dy) < h.r + p.w/2) { onLose(); return; }
      }

      // Particles update
      state.particles = state.particles.filter(pt => {
        pt.life -= 0.04;
        pt.y += 0.3;
        return pt.life > 0;
      });

      // Goal
      if (p.x < state.goal.x + state.goal.w && p.x + p.w > state.goal.x &&
          p.y < state.goal.y + state.goal.h && p.y + p.h > state.goal.y) {
        onWin(); return;
      }

      // Render
      ctx.clearRect(0, 0, 400, 600);
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, 400, 600);

      // Grid Lines
      ctx.strokeStyle = '#00f3ff08';
      ctx.beginPath();
      for(let i=0; i<400; i+=40) { ctx.moveTo(i, 0); ctx.lineTo(i, 600); }
      for(let i=0; i<600; i+=40) { ctx.moveTo(0, i); ctx.lineTo(400, i); }
      ctx.stroke();

      // Platforms
      ctx.fillStyle = '#00f3ff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f3ff';
      for (const plat of state.platforms) {
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      }
      ctx.shadowBlur = 0;

      // Hazards
      ctx.fillStyle = '#ff003c';
      for (const h of state.hazards) {
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r, 0, Math.PI*2);
        ctx.fill();
      }

      // Particles
      for (const pt of state.particles) {
         ctx.globalAlpha = pt.life;
         ctx.fillStyle = pt.color;
         ctx.beginPath();
         ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI*2);
         ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Goal
      ctx.fillStyle = '#39ff14';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#39ff14';
      ctx.fillRect(state.goal.x, state.goal.y, state.goal.w, state.goal.h);
      ctx.shadowBlur = 0;

      // Player
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = p.color;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.shadowBlur = 0;

      requestRef.current = requestAnimationFrame(update);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') state.keys.left = true;
      if (k === 'arrowright' || k === 'd') state.keys.right = true;
      if (k === 'arrowup' || k === 'w' || k === ' ') state.keys.up = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') state.keys.left = false;
      if (k === 'arrowright' || k === 'd') state.keys.right = false;
      if (k === 'arrowup' || k === 'w' || k === ' ') state.keys.up = false;
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
    <div className="flex flex-col items-center justify-center p-4 w-full h-full bg-black/40">
      <div className="relative p-2 bg-black border-2 border-cyan-500/30 rounded-xl mb-6">
        <canvas ref={canvasRef} width={400} height={600} className="w-full max-w-[320px] rounded-lg shadow-[0_0_20px_rgba(0,243,255,0.1)]" />
      </div>
      
      <div className="flex gap-4 w-full max-w-[320px]">
        <div className="flex flex-1 gap-2">
           <button 
             onPointerDown={() => gameState.current.keys.left = true}
             onPointerUp={() => gameState.current.keys.left = false}
             className="flex-1 py-4 bg-black/60 border border-cyan-500/50 text-white rounded-xl active:scale-95 transition-all cyber-font text-xs"
           >L</button>
           <button 
             onPointerDown={() => gameState.current.keys.right = true}
             onPointerUp={() => gameState.current.keys.right = false}
             className="flex-1 py-4 bg-black/60 border border-cyan-500/50 text-white rounded-xl active:scale-95 transition-all cyber-font text-xs"
           >R</button>
        </div>
        <button 
          onPointerDown={() => gameState.current.keys.up = true}
          onPointerUp={() => gameState.current.keys.up = false}
          className="flex-1 py-4 bg-purple-600 border border-purple-400 text-white font-black rounded-xl active:scale-95 transition-all cyber-font text-xs shadow-[0_0_15px_rgba(188,19,254,0.4)]"
        >JUMP</button>
      </div>
    </div>
  );
};

export default PlatformerGame;