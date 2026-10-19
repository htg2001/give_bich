import React, { useEffect, useState } from 'react';

interface PetalItem {
  id: number;
  type: 'blossom' | 'rose' | 'heart' | 'star';
  left: number;
  duration: number;
  drift: number;
  spin: number;
  size: number;
  delay: number;
  opacity: number;
}

export const PetalBackground: React.FC = () => {
  const [petals, setPetals] = useState<PetalItem[]>([]);

  useEffect(() => {
    const types: ('blossom' | 'rose' | 'heart' | 'star')[] = ['blossom', 'rose', 'heart', 'star'];
    const initialPetals: PetalItem[] = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      type: types[i % types.length],
      left: Math.random() * 95,
      duration: 6 + Math.random() * 7,
      drift: (Math.random() - 0.5) * 180,
      spin: (Math.random() - 0.5) * 540,
      size: 16 + Math.random() * 16,
      delay: -Math.random() * 8,
      opacity: 0.65 + Math.random() * 0.3,
    }));
    setPetals(initialPetals);

    const interval = setInterval(() => {
      setPetals((prev) => {
        const nextId = (prev[prev.length - 1]?.id ?? 0) + 1;
        const newPetal: PetalItem = {
          id: nextId,
          type: types[Math.floor(Math.random() * types.length)],
          left: Math.random() * 95,
          duration: 7 + Math.random() * 6,
          drift: (Math.random() - 0.5) * 180,
          spin: (Math.random() - 0.5) * 540,
          size: 16 + Math.random() * 16,
          delay: 0,
          opacity: 0.7 + Math.random() * 0.25,
        };
        return [...prev.slice(-24), newPetal];
      });
    }, 1100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {/* Soft ambient glowing gradient orbs (pure gradients for smooth rendering on all hardware) */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(251, 207, 232, 0.45) 0%, rgba(253, 230, 242, 0.15) 55%, transparent 75%)',
          animationDuration: '9s',
        }}
      />
      <div
        className="absolute top-1/4 -right-24 w-[420px] h-[420px] rounded-full pointer-events-none animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(233, 213, 255, 0.38) 0%, rgba(243, 232, 255, 0.12) 55%, transparent 75%)',
          animationDuration: '11s',
          animationDelay: '-3s',
        }}
      />
      <div
        className="absolute -bottom-24 left-1/4 w-[480px] h-[360px] rounded-full pointer-events-none animate-pulse"
        style={{
          background: 'radial-gradient(ellipse, rgba(254, 205, 211, 0.32) 0%, rgba(255, 228, 230, 0.1) 60%, transparent 75%)',
          animationDuration: '12s',
          animationDelay: '-5s',
        }}
      />

      {/* Floating Sparkles in scenery */}
      <div className="absolute top-[16%] left-[10%] text-rose-300 text-lg animate-ping opacity-60" style={{ animationDuration: '3.5s' }}>✦</div>
      <div className="absolute top-[26%] right-[12%] text-pink-300 text-xl animate-bounce opacity-70" style={{ animationDuration: '4.5s' }}>✧</div>
      <div className="absolute bottom-[22%] right-[18%] text-amber-300 text-base animate-pulse opacity-75">✦</div>
      <div className="absolute bottom-[18%] left-[16%] text-rose-300 text-lg animate-pulse opacity-60">♡</div>
      <div className="absolute top-[45%] left-[6%] text-purple-300 text-sm animate-pulse opacity-50">✨</div>
      <div className="absolute top-[52%] right-[7%] text-pink-300 text-sm animate-pulse opacity-60">✧</div>

      {/* Falling romantic petals (styled SVGs for universal high fidelity across OSes) */}
      {petals.map((p) => (
        <span
          key={p.id}
          className="absolute select-none pointer-events-none"
          style={{
            top: '-35px',
            left: `${p.left}vw`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `petalFall ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            ['--drift' as string]: `${p.drift}px`,
            ['--spin' as string]: `${p.spin}deg`,
            filter: 'drop-shadow(0 2px 4px rgba(220, 100, 140, 0.2))',
          }}
        >
          {p.type === 'blossom' && (
            <svg viewBox="0 0 24 24" className="w-full h-full fill-pink-300 stroke-pink-400/40">
              <path d="M12 2C13.5 6 17 7 19 8.5C17 11 15 14 15.5 17C13 16 10.5 17.5 8.5 19C7 16 6 12.5 4.5 11C7 9.5 8.5 6 12 2Z" />
            </svg>
          )}
          {p.type === 'rose' && (
            <svg viewBox="0 0 24 24" className="w-full h-full fill-rose-300 stroke-rose-400/40">
              <circle cx="12" cy="12" r="9" opacity="0.3" fill="#fbcfe8" />
              <path d="M12 6C9 6 7 8 7 11C7 14 10 17 12 18C14 17 17 14 17 11C17 8 15 6 12 6Z" />
            </svg>
          )}
          {p.type === 'heart' && (
            <svg viewBox="0 0 24 24" className="w-full h-full fill-pink-400/80">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
          {p.type === 'star' && (
            <svg viewBox="0 0 24 24" className="w-full h-full fill-amber-300/85">
              <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z" />
            </svg>
          )}
        </span>
      ))}
    </div>
  );
};
