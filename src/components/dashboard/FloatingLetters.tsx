import { useEffect, useRef, useState } from 'react';

type ElementType = 'letter' | 'bubble';
type AccentColor = 'turquoise' | 'coral' | 'muted-blue';

interface ElementSpec {
  content: string;
  type: ElementType;
  color: AccentColor;
}

// A deliberately larger-than-needed pool so each build/rotation can pick a
// tasteful, varied subset rather than always showing the same handful.
const ELEMENT_POOL: ElementSpec[] = [
  // Standalone characters — ambient language, no container.
  { content: '你', type: 'letter', color: 'turquoise' },
  { content: 'あ', type: 'letter', color: 'coral' },
  { content: '한', type: 'letter', color: 'coral' },
  { content: 'A', type: 'letter', color: 'turquoise' },
  { content: 'é', type: 'letter', color: 'muted-blue' },
  { content: 'λ', type: 'letter', color: 'turquoise' },
  { content: 'अ', type: 'letter', color: 'coral' },
  { content: 'ก', type: 'letter', color: 'muted-blue' },
  { content: 'ê', type: 'letter', color: 'coral' },
  { content: 'ә', type: 'letter', color: 'turquoise' },
  { content: '中', type: 'letter', color: 'muted-blue' },
  { content: 'ね', type: 'letter', color: 'coral' },

  // Short words/phrases inside pale tinted speech bubbles.
  { content: 'hello', type: 'bubble', color: 'turquoise' },
  { content: '你好', type: 'bubble', color: 'coral' },
  { content: '안녕', type: 'bubble', color: 'turquoise' },
  { content: 'こんにちは', type: 'bubble', color: 'coral' },
  { content: 'bonjour', type: 'bubble', color: 'turquoise' },
  { content: 'สวัสดี', type: 'bubble', color: 'coral' },
  { content: 'xin chào', type: 'bubble', color: 'turquoise' },
  { content: 'Сәлем', type: 'bubble', color: 'coral' },
  { content: 'γεια', type: 'bubble', color: 'turquoise' },
  { content: 'नमस्ते', type: 'bubble', color: 'coral' },
  { content: 'merci', type: 'bubble', color: 'turquoise' },
  { content: 'ขอบคุณ', type: 'bubble', color: 'coral' },
];

const ACCENT_VAR: Record<AccentColor, string> = {
  turquoise: 'var(--color-turquoise)',
  coral: 'var(--color-coral)',
  'muted-blue': 'var(--color-muted-blue)',
};

const ROTATE_INTERVAL_MS = 5 * 60 * 1000;
const MIN_BAND_HEIGHT = 190; // px — floor on vertical spacing between elements
const REPEL_RADIUS = 110;
const REPEL_DISTANCE = 42;
const REPEL_EASE = 0.15;

interface FloatingElement extends ElementSpec {
  id: number;
  baseX: number;
  baseY: number;
  driftAmpX: number;
  driftAmpY: number;
  driftFreqX: number;
  driftFreqY: number;
  driftPhaseX: number;
  driftPhaseY: number;
  rotAmp: number;
  rotFreq: number;
  rotPhase: number;
  depth: number; // 0 = background (smaller, fainter), 1 = foreground
  rotationTilt: number; // small static tilt, mostly for bubbles
}

function desiredCount(width: number) {
  if (width < 640) return 6;
  if (width < 1024) return 10;
  return 16;
}

function pickSubset(count: number): ElementSpec[] {
  const pool = [...ELEMENT_POOL];
  const picked: ElementSpec[] = [];
  while (picked.length < count && pool.length > 0) {
    picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  while (picked.length < count) picked.push(ELEMENT_POOL[picked.length % ELEMENT_POOL.length]);
  return picked;
}

function buildElements(width: number, height: number): FloatingElement[] {
  const count = Math.max(1, Math.min(desiredCount(width), Math.floor(height / MIN_BAND_HEIGHT) || 1));
  const picked = pickSubset(count);

  const bandHeight = height / count;

  return picked.map((spec, i) => {
    const zone = (i + Math.floor(Math.random() * 3)) % 3; // left / center / right bias
    const zoneStart = zone === 0 ? 0.04 : zone === 1 ? 0.36 : 0.7;
    const zoneWidth = 0.26;
    const x = (zoneStart + Math.random() * zoneWidth) * width;
    const padding = Math.min(46, bandHeight * 0.25);
    const y = bandHeight * i + padding + Math.random() * Math.max(1, bandHeight - padding * 2);

    return {
      ...spec,
      id: i,
      baseX: x,
      baseY: y,
      driftAmpX: 8 + Math.random() * 10,
      driftAmpY: 8 + Math.random() * 12,
      driftFreqX: 0.04 + Math.random() * 0.05,
      driftFreqY: 0.035 + Math.random() * 0.06,
      driftPhaseX: Math.random() * Math.PI * 2,
      driftPhaseY: Math.random() * Math.PI * 2,
      rotAmp: 1.5 + Math.random() * 2.5,
      rotFreq: 0.025 + Math.random() * 0.035,
      rotPhase: Math.random() * Math.PI * 2,
      depth: Math.random(),
      rotationTilt: (Math.random() - 0.5) * 6,
    };
  });
}

export default function FloatingLetters() {
  const layerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const elementsRef = useRef<FloatingElement[]>([]);
  const repelRef = useRef<{ x: number; y: number }[]>([]);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const layerRectRef = useRef({ top: 0, left: 0, width: 0, height: 0 });
  const [, setBuildVersion] = useState(0);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

    function measureAndBuild() {
      const rect = layer!.getBoundingClientRect();
      layerRectRef.current = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
      elementsRef.current = buildElements(rect.width, rect.height);
      repelRef.current = elementsRef.current.map(() => ({ x: 0, y: 0 }));
      setBuildVersion((v) => v + 1);
    }

    measureAndBuild();
    const rotateInterval = window.setInterval(measureAndBuild, ROTATE_INTERVAL_MS);

    let resizeFrame: number | null = null;
    function onResize() {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = null;
        measureAndBuild();
      });
    }

    let scrollFrame: number | null = null;
    function onScroll() {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = null;
        const rect = layer!.getBoundingClientRect();
        layerRectRef.current.top = rect.top;
        layerRectRef.current.left = rect.left;
      });
    }

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(layer);
    window.addEventListener('scroll', onScroll, { passive: true });

    function onMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }
    function onMouseLeave() {
      mouseRef.current = null;
    }

    if (!reducedMotion && !coarsePointer) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseleave', onMouseLeave);
    }

    let rafId: number;
    function tick() {
      const t = performance.now() / 1000;
      const { top, left } = layerRectRef.current;
      const mouse = mouseRef.current;

      elementsRef.current.forEach((el, i) => {
        const node = nodeRefs.current[i];
        if (!node) return;

        const driftX = reducedMotion ? 0 : Math.sin(t * el.driftFreqX * Math.PI * 2 + el.driftPhaseX) * el.driftAmpX;
        const driftY = reducedMotion ? 0 : Math.sin(t * el.driftFreqY * Math.PI * 2 + el.driftPhaseY) * el.driftAmpY;
        const rot = reducedMotion ? 0 : Math.sin(t * el.rotFreq * Math.PI * 2 + el.rotPhase) * el.rotAmp;

        const repel = repelRef.current[i];
        let targetRx = 0;
        let targetRy = 0;

        if (mouse && !reducedMotion) {
          const viewportX = left + el.baseX + driftX;
          const viewportY = top + el.baseY + driftY;
          const dx = viewportX - mouse.x;
          const dy = viewportY - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < REPEL_RADIUS && dist > 0.001) {
            const strength = 1 - dist / REPEL_RADIUS;
            targetRx = (dx / dist) * REPEL_DISTANCE * strength;
            targetRy = (dy / dist) * REPEL_DISTANCE * strength;
          }
        }

        repel.x += (targetRx - repel.x) * REPEL_EASE;
        repel.y += (targetRy - repel.y) * REPEL_EASE;

        const totalX = el.baseX + driftX + repel.x;
        const totalY = el.baseY + driftY + repel.y;

        node.style.transform = `translate3d(${totalX}px, ${totalY}px, 0) rotate(${(rot + el.rotationTilt).toFixed(2)}deg)`;
      });

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(rotateInterval);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  // A generous fixed set of nodes; unused slots render nothing until a
  // build populates them, avoiding remounts on every resize/rotation.
  const maxNodes = 20;

  return (
    <div ref={layerRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {Array.from({ length: maxNodes }).map((_, i) => {
        const el = elementsRef.current[i];
        const accent = el ? ACCENT_VAR[el.color] : undefined;

        // Foreground elements sit slightly larger and a touch more visible;
        // background ones are smaller and fainter — kept subtle either way.
        const letterSize = el ? 0.95 + el.depth * 0.85 : 1; // ~0.95rem – 1.8rem
        const letterOpacity = el ? 0.4 + el.depth * 0.3 : 0; // ~0.4 – 0.7
        const bubbleOpacity = el ? 0.55 + el.depth * 0.25 : 0; // ~0.55 – 0.8

        return (
          <div
            key={i}
            ref={(node) => {
              nodeRefs.current[i] = node;
            }}
            style={{ position: 'absolute', top: 0, left: 0, willChange: 'transform' }}
          >
            {el?.type === 'bubble' && (
              <div
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '5px 12px',
                  borderRadius: 14,
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  color: accent,
                  border: `1px solid ${accent}`,
                  backgroundColor: `color-mix(in srgb, ${accent} 9%, white)`,
                  opacity: bubbleOpacity,
                }}
              >
                {el.content}
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    bottom: -4,
                    left: 14,
                    width: 8,
                    height: 8,
                    transform: 'rotate(45deg)',
                    backgroundColor: `color-mix(in srgb, ${accent} 9%, white)`,
                    borderRight: `1px solid ${accent}`,
                    borderBottom: `1px solid ${accent}`,
                  }}
                />
              </div>
            )}

            {el?.type === 'letter' && (
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: `${letterSize}rem`,
                  color: accent,
                  opacity: letterOpacity,
                }}
              >
                {el.content}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
