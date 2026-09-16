import { useEffect, useRef, useState } from 'react';

const REPEL_RADIUS = 90; // px — how close the pointer/touch has to get before a bubble flees
const REPEL_DISTANCE = 55; // px — how far a bubble jumps away

interface BubbleOffset {
  x: number;
  y: number;
}

export default function AbstractLanguageVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [offsets, setOffsets] = useState<BubbleOffset[]>([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(pointer: coarse)');
    const update = () => {
      setReducedMotion(motionQuery.matches);
      setIsCoarsePointer(pointerQuery.matches);
    };
    update();
    motionQuery.addEventListener('change', update);
    pointerQuery.addEventListener('change', update);
    return () => {
      motionQuery.removeEventListener('change', update);
      pointerQuery.removeEventListener('change', update);
    };
  }, []);

  // Bubble anchor points, as a percentage of the container — kept in one
  // place so the repulsion math below can reference the same coordinates
  // the JSX renders at.
  const bubbleAnchors = [
    { top: 16, left: 14 },
    { top: 38, left: 46 },
  ];

  function repelFrom(clientX: number, clientY: number) {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    setOffsets((prev) =>
      prev.map((offset, i) => {
        const anchor = bubbleAnchors[i];
        const bubblePx = {
          x: rect.left + (anchor.left / 100) * rect.width,
          y: rect.top + (anchor.top / 100) * rect.height,
        };
        const dx = bubblePx.x - clientX;
        const dy = bubblePx.y - clientY;
        const dist = Math.hypot(dx, dy);
        if (dist > REPEL_RADIUS || dist === 0) return offset;

        const angle = Math.atan2(dy, dx);
        return { x: Math.cos(angle) * REPEL_DISTANCE, y: Math.sin(angle) * REPEL_DISTANCE };
      })
    );

    window.setTimeout(() => {
      setOffsets((prev) => prev.map(() => ({ x: 0, y: 0 })));
    }, 800);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (reducedMotion || isCoarsePointer) return;
    repelFrom(e.clientX, e.clientY);
  }

  function handleTouch(e: React.TouchEvent) {
    if (reducedMotion) return;
    const touch = e.touches[0];
    if (touch) repelFrom(touch.clientX, touch.clientY);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouch}
      className="relative w-full aspect-square max-w-[520px] mx-auto overflow-hidden"
      aria-hidden="true"
    >
      {/* Soft organic background shapes */}
      <svg viewBox="0 0 520 520" className="absolute inset-0 w-full h-full">
        <path
          d="M390 60c80 20 130 100 110 180s-110 140-200 130S150 300 140 210 180 40 390 60Z"
          fill="var(--color-muted-blue)"
          opacity={0.22}
        />
        <path
          d="M110 250c55-35 135-25 170 30s10 125-55 150-145 0-170-65 0-90 55-115Z"
          fill="var(--color-aqua)"
          opacity={0.5}
        />
      </svg>

      {/* Thin curved connection lines */}
      <svg viewBox="0 0 520 520" className="absolute inset-0 w-full h-full">
        <path
          d="M300 90c30 55-20 100-65 90s-80 40-45 85 120 25 140-30"
          fill="none"
          stroke="var(--color-turquoise)"
          strokeWidth="2"
          opacity={0.8}
        />
        <path
          d="M150 300c40-25 95-10 130 30s100 15 120-40"
          fill="none"
          stroke="var(--color-coral)"
          strokeWidth="2"
          opacity={0.8}
        />
      </svg>

      {/* Speech bubbles — idle float (CSS keyframe on the inner span) plus
          cursor-repulsion (JS-driven transform on the outer positioned div),
          composed on two separate elements so neither overwrites the
          other's `transform`. */}
      {bubbleAnchors.map((anchor, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${anchor.top}%`,
            left: `${anchor.left}%`,
            transform: `translate(${offsets[i].x}px, ${offsets[i].y}px)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <div
            className={reducedMotion ? '' : 'mingoloop-float'}
            style={{
              animationDuration: `${7 + i * 1.5}s`,
              animationDelay: `${i * 0.8}s`,
            }}
          >
            <div
              className="rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1"
              style={{ backgroundColor: i === 0 ? 'var(--color-turquoise)' : 'var(--color-coral)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
