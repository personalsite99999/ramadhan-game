import React, { useEffect, useRef, useState } from 'react';

interface PlatformerGameProps {
  level: number;
  onWin: () => void;
  onLose: () => void;
}

const PlatformerGame: React.FC<PlatformerGameProps> = ({ level, onWin, onLose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  
  // Menggunakan ref untuk semua state mutable agar tidak memicu re-render React yang berat di setiap frame
  const state = useRef({
    player: { x: 50, y: 520, w: 20, h: 20, vx: 0, vy: 0, grounded: false },
    platforms: [] as { x: number, y: number, w: number, h: number }[],
    hazards: [] as { x: number, y: number, r: number, vx: number, vy: number }[],
    goal: { x: 200, y: 50, w: 30, h: 30 },
    keys: { left: false, right: false, jump: false },
    gameOver: false,
    frameId: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Level Initialization
    const s = state.current;
    s.gameOver = false;
    s.player = { x: 50, y: 520, w: 20, h: 20, vx: 0, vy: 0, grounded: false };
    
    // Create base platforms
    const platforms = [
      { x: 0, y: 570, w: 400, h: 30 }, // Floor
      { x: 30, y: 540, w: 80, h: 10 }   // Start
    ];

    const platCount = 7;
    const verticalStep = 480 / platCount;
    let prevX = 50;

    for (let i = 0; i < platCount; i++) {
      const w = Math.max(70, 160 - (level * 2));
      let x = prevX + (Math.random() * 240 - 120);
      x = Math.max(10, Math.min(400 - w - 10, x));
      const y = 490 - (i * verticalStep);
      platforms.push({ x, y, w, h: 12 });
      prevX = x;
    }
    s.platforms = platforms;

    // Set Goal
    const topPlat = platforms[platforms.length - 1];
    s.goal = { 
      x: topPlat.x + (topPlat.w / 2) - 15, 
      y: topPlat.y - 45, 
      w: 30, h: 30 
    };

    // Hazards
    s.hazards = [];
    const hCount = Math.min(12, Math.floor(level / 2));
    for (let i = 0; i < hCount; i++) {
      s.hazards.push({
        x: Math.random() * 380 + 10,
        y: 100 + Math.random() * 350,
        r: 8,
        vx: (Math.random() - 0.5) * (2 + level * 0.1),
        vy: (Math.random() - 0.5) * (2 + level * 0.1)
      });
    }

    setReady(true);

    // 2. Game Loop Logic
    const loop = () => {
      if (s.gameOver) return;

      const p = s.player;
      const grav = 0.5;
      const jump = -11.5;
      const speed = 4.8;
      const fric = 0.82;

      // Vertical
      p.vy += grav;
      const oldY = p.y;
      p.y += p.vy;

      // Horizontal
      if (s.keys.left) p.vx = -speed;
      else if (s.keys.right) p.vx = speed;
      else p.vx *= fric;
      p.x += p.vx;

      // Jump
      if (s.keys.jump && p.grounded) {
        p.vy = jump;
        p.grounded = false;
      }

      // Bounds
      if (p.x < 0) p.x = 0;
      if (p.x + p.w > 400) p.x = 400 - p.w;
      if (p.y > 600) { s.gameOver = true; onLose(); return; }

      // Platform Collisions (One-way top collision)
      p.grounded = false;
      if (p.vy >= 0) {
        for (const plat of s.platforms) {
          if (oldY + p.h <= plat.y && p.y + p.h >= plat.y && 
              p.x + p.w > plat.x && p.x < plat.x + plat.w) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.grounded = true;
            break;
          }
        }
      }

      // Hazards Collisions
      for (const h of s.hazards) {
        h.x += h.vx; h.y += h.vy;
        if (h.x < 0 || h.x > 400) h.vx *= -1;
        if (h.y < 0 || h.y > 600) h.vy *= -1;

        const dx = (p.x + p.w/2) - h.x;
        const dy = (p.y + p.h/2) - h.y;
        if (Math.sqrt(dx*dx + dy*dy) < h.r + p.w/2 - 2) {
          s.gameOver = true; onLose(); return;
        }
      }

      // Win Check
      if (p.x < s.goal.x + s.goal.w && p.x + p.w > s.goal.x &&
          p.y < s.goal.y + s.goal.h && p.y + p.h > s.goal.y) {
        s.gameOver = true; onWin(); return;
      }

      // 3. Render
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, 400, 600);

      // Draw platforms
      ctx.fillStyle = '#ff9100';
      for (const plat of s.platforms) {
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.fillStyle = '#ffb700'; // highlight
        ctx.fillRect(plat.x, plat.y, plat.w, 2);
        ctx.fillStyle = '#ff9100';
      }

      // Draw goal
      ctx.fillStyle = '#39ff14';
      ctx.shadowBlur = 15; ctx.shadowColor = '#39ff14';
      ctx.fillRect(s.goal.x, s.goal.y, s.goal.w, s.goal.h);
      ctx.shadowBlur = 0;

      // Draw hazards
      ctx.fillStyle = '#ff003c';
      ctx.shadowBlur = 10; ctx.shadowColor = '#ff003c';
      for (const h of s.hazards) {
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI*2); ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Draw player
      ctx.fillStyle = '#bc13fe';
      ctx.shadowBlur = 15; ctx.shadowColor = '#bc13fe';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = '#fff';
      ctx.fillRect(p.x + 4, p.y + 4, 3, 3);
      ctx.fillRect(p.x + p.w - 7, p.y + 4, 3, 3);
      ctx.shadowBlur = 0;

      s.frameId = requestAnimationFrame(loop);
    };

    s.frameId = requestAnimationFrame(loop);

    // 4. Input Handlers
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'a' || k === 'arrowleft') s.keys.left = true;
      if (k === 'd' || k === 'arrowright') s.keys.right = true;
      if (k === 'w' || k === 'arrowup' || k === ' ') s.keys.jump = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'a' || k === 'arrowleft') s.keys.left = false;
      if (k === 'd' || k === 'arrowright') s.keys.right = false;
      if (k === 'w' || k === 'arrowup' || k === ' ') s.keys.jump = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);

    return () => {
      cancelAnimationFrame(s.frameId);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [level, onWin, onLose]);

  // Tombol kontrol mobile menggunakan ref langsung
  const setKey = (k: 'left' | 'right' | 'jump', v: boolean) => {
    state.current.keys[k] = v;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full bg-black select-none">
      {!ready && <div className="cyber-font text-orange-500 animate-pulse">BOOTING_CORE...</div>}
      
      <div className="relative">
        <canvas ref={canvasRef} width={400} height={600} 
          className="bg-black border-2 border-orange-500 max-h-[52vh] w-auto aspect-[2/3] rounded-xl shadow-[0_0_30px_rgba(255,145,0,0.1)]" />
        <div className="absolute top-2 left-2 text-[8px] cyber-font text-orange-400 opacity-40 uppercase">Platformer_OS v3.2</div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-[360px]">
        <button 
          onPointerDown={() => setKey('left', true)} onPointerUp={() => setKey('left', false)} onPointerLeave={() => setKey('left', false)}
          className="p-6 bg-black/50 border-2 border-orange-500 rounded-2xl active:bg-orange-500/30 transition-all text-3xl text-orange-500">←</button>
        <button 
          onPointerDown={() => setKey('jump', true)} onPointerUp={() => setKey('jump', false)} onPointerLeave={() => setKey('jump', false)}
          className="p-6 bg-orange-600 border-2 border-orange-300 rounded-2xl active:scale-95 transition-all cyber-font font-black text-xs text-black shadow-[0_0_15px_rgba(255,145,0,0.5)]">JUMP</button>
        <button 
          onPointerDown={() => setKey('right', true)} onPointerUp={() => setKey('right', false)} onPointerLeave={() => setKey('right', false)}
          className="p-6 bg-black/50 border-2 border-orange-500 rounded-2xl active:bg-orange-500/30 transition-all text-3xl text-orange-500">→</button>
      </div>
    </div>
  );
};

export default PlatformerGame;