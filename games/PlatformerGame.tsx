import React, { useEffect, useRef } from 'react';

interface PlatformerGameProps {
  level: number;
  onWin: () => void;
  onLose: () => void;
}

const PlatformerGame: React.FC<PlatformerGameProps> = ({ level, onWin, onLose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isMounted = useRef(true);
  
  const state = useRef({
    player: { x: 50, y: 500, w: 20, h: 20, vx: 0, vy: 0, grounded: false },
    platforms: [] as { x: number, y: number, w: number, h: number }[],
    hazards: [] as { x: number, y: number, r: number, vx: number, vy: number }[],
    goal: { x: 0, y: 0, w: 30, h: 30 },
    keys: { left: false, right: false, up: false },
    cameraY: 0,
    active: true
  });

  useEffect(() => {
    isMounted.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = state.current;
    s.active = true;
    s.player = { x: 50, y: 500, w: 20, h: 20, vx: 0, vy: 0, grounded: false };
    s.keys = { left: false, right: false, up: false };
    s.cameraY = 0;
    lastTimeRef.current = 0;

    // Level Generation
    s.platforms = [{ x: 0, y: 560, w: 400, h: 40 }]; 
    let curY = 560;
    let curX = 50;
    const count = 12 + Math.floor(level / 2);

    for (let i = 0; i < count; i++) {
      const w = Math.max(60, 150 - (level * 3));
      const distY = 75 + Math.random() * 25;
      const distX = 180;
      const nextX = Math.max(10, Math.min(390 - w, curX + (Math.random() * distX - distX / 2)));
      const nextY = curY - distY;
      s.platforms.push({ x: nextX, y: nextY, w, h: 12 });
      curY = nextY;
      curX = nextX;
    }

    const top = s.platforms[s.platforms.length - 1];
    s.goal = { x: top.x + top.w / 2 - 15, y: top.y - 50, w: 30, h: 30 };

    s.hazards = [];
    if (level > 2) {
      for (let i = 0; i < Math.min(10, Math.floor(level / 2)); i++) {
        s.hazards.push({
          x: Math.random() * 400,
          y: Math.random() * 500,
          r: 6,
          vx: (Math.random() - 0.5) * (2 + level * 0.1),
          vy: (Math.random() - 0.5) * (2 + level * 0.1)
        });
      }
    }

    const loop = (t: number) => {
      if (!s.active || !isMounted.current) return;
      
      if (!lastTimeRef.current) {
        lastTimeRef.current = t;
        requestRef.current = requestAnimationFrame(loop);
        return;
      }
      
      const dt = Math.min(2, (t - lastTimeRef.current) / 16.67);
      lastTimeRef.current = t;

      const p = s.player;
      const grav = 0.5 * dt;
      const fric = Math.pow(0.85, dt);
      const speed = (p.grounded ? 1.5 : 0.8) * dt;

      if (s.keys.left) p.vx -= speed;
      if (s.keys.right) p.vx += speed;
      if (s.keys.up && p.grounded) { p.vy = -11.5; p.grounded = false; }

      p.vx *= fric;
      p.vy += grav;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < 0) { p.x = 0; p.vx = 0; }
      if (p.x + p.w > 400) { p.x = 400 - p.w; p.vx = 0; }
      if (p.y > 650) { 
        s.active = false; 
        onLose(); 
        return; 
      }

      p.grounded = false;
      for (const plat of s.platforms) {
        if (p.x + p.w > plat.x && p.x < plat.x + plat.w) {
          if (p.vy > 0 && p.y + p.h <= plat.y + 12 && p.y + p.h + p.vy * dt >= plat.y) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.grounded = true;
          }
        }
      }

      for (const h of s.hazards) {
        h.x += h.vx * dt; h.y += h.vy * dt;
        if (h.x < 0 || h.x > 400) h.vx *= -1;
        if (h.y < -1000 || h.y > 600) h.vy *= -1;
        const dx = (p.x + p.w/2) - h.x;
        const dy = (p.y + p.h/2) - h.y;
        if (Math.sqrt(dx*dx + dy*dy) < h.r + p.w/2) { 
          s.active = false; 
          onLose(); 
          return; 
        }
      }

      if (p.x < s.goal.x + s.goal.w && p.x + p.w > s.goal.x && p.y < s.goal.y + s.goal.h && p.y + p.h > s.goal.y) {
        s.active = false; 
        onWin(); 
        return;
      }

      s.cameraY += (Math.max(0, 300 - p.y) - s.cameraY) * 0.1 * dt;

      // Draw
      ctx.fillStyle = '#020210';
      ctx.fillRect(0, 0, 400, 600);
      ctx.save();
      ctx.translate(0, s.cameraY);

      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f3ff';
      ctx.fillStyle = '#00f3ff';
      s.platforms.forEach(plat => ctx.fillRect(plat.x, plat.y, plat.w, plat.h));

      ctx.shadowColor = '#39ff14';
      ctx.fillStyle = '#39ff14';
      ctx.fillRect(s.goal.x, s.goal.y, s.goal.w, s.goal.h);

      ctx.shadowColor = '#ff003c';
      ctx.fillStyle = '#ff003c';
      s.hazards.forEach(h => { ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI*2); ctx.fill(); });

      ctx.shadowColor = '#bc13fe';
      ctx.fillStyle = '#bc13fe';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.restore();

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      isMounted.current = false;
      cancelAnimationFrame(requestRef.current);
    };
  }, [level, onWin, onLose]);

  const setK = (k: keyof typeof state.current.keys, v: boolean) => (e: any) => {
    e.preventDefault();
    state.current.keys[k] = v;
  };

  return (
    <div className="flex flex-col items-center justify-between h-full w-full bg-black/80 p-4 select-none touch-none">
      <div className="relative w-full aspect-[2/3] max-h-[60vh] bg-black rounded-lg border-2 border-purple-500/30 overflow-hidden shadow-[0_0_20px_#bc13fe33]">
        <canvas ref={canvasRef} width={400} height={600} className="w-full h-full object-contain" />
      </div>
      <div className="w-full max-w-[400px] grid grid-cols-2 gap-4 mt-4">
        <div className="grid grid-cols-2 gap-2">
          <button onPointerDown={setK('left', true)} onPointerUp={setK('left', false)} onPointerLeave={setK('left', false)} onTouchStart={setK('left', true)} onTouchEnd={setK('left', false)} className="h-16 bg-black/60 border-2 border-purple-500 text-purple-400 rounded-xl flex items-center justify-center text-3xl active:bg-purple-500 active:text-white transition-all">◀</button>
          <button onPointerDown={setK('right', true)} onPointerUp={setK('right', false)} onPointerLeave={setK('right', false)} onTouchStart={setK('right', true)} onTouchEnd={setK('right', false)} className="h-16 bg-black/60 border-2 border-purple-500 text-purple-400 rounded-xl flex items-center justify-center text-3xl active:bg-purple-500 active:text-white transition-all">▶</button>
        </div>
        <button onPointerDown={setK('up', true)} onPointerUp={setK('up', false)} onPointerLeave={setK('up', false)} onTouchStart={setK('up', true)} onTouchEnd={setK('up', false)} className="h-16 bg-purple-600 border-2 border-white/50 text-white font-black cyber-font text-lg rounded-xl flex items-center justify-center active:scale-95 shadow-[0_0_20px_#bc13fe]">JUMP</button>
      </div>
    </div>
  );
};

export default PlatformerGame;