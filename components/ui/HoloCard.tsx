'use client';

import { useRef } from 'react';

interface Props {
  children: React.ReactNode;
  foil?: boolean;
  className?: string;
}

/** Tilts its content toward the mouse with a glare (see .holo in globals.css). */
export default function HoloCard({ children, foil = false, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || event.pointerType !== 'mouse') return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    el.style.setProperty('--rx', `${(0.5 - y) * 14}deg`);
    el.style.setProperty('--ry', `${(x - 0.5) * 18}deg`);
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
    el.dataset.active = '';
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    delete el.dataset.active;
  };

  return (
    <div
      ref={ref}
      className={`holo ${className}`}
      data-foil={foil}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
      <span className="holo-glare" aria-hidden="true" />
    </div>
  );
}
