// Plynulé „dopočítávání“ čísla při změně hodnoty (easeOutExpo). Respektuje prefers-reduced-motion.
import { useEffect, useRef, useState } from 'preact/hooks';
import type { RefObject } from 'preact';

export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const raf = useRef(0);
  useEffect(() => {
    if (typeof window === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      from.current = target;
      return;
    }
    const start = performance.now();
    const a = from.current;
    cancelAnimationFrame(raf.current);
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      const e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
      const v = a + (target - a) * e;
      setValue(v);
      from.current = v;
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return value;
}

/** Spustí count-up od nuly, až je prvek vidět. */
export function useInView<T extends Element>(threshold = 0.3): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  // Bez pole závislostí: pokud se prvek vymění (skeleton → obsah), sledujeme ten nový.
  useEffect(() => {
    if (seen || !ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold });
    io.observe(ref.current);
    return () => io.disconnect();
  });
  return [ref, seen];
}

/** Skutečná šířka prvku v px (pro SVG grafy s čitelným písmem na mobilu). */
export function useWidth<T extends Element>(fallback = 640): [RefObject<T>, number] {
  const ref = useRef<T>(null);
  const observed = useRef<Element | null>(null);
  const ro = useRef<ResizeObserver | null>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    if (!ref.current || ref.current === observed.current) return;
    ro.current?.disconnect();
    ro.current = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.current.observe(ref.current);
    observed.current = ref.current;
  });
  useEffect(() => () => ro.current?.disconnect(), []);
  return [ref, w];
}
