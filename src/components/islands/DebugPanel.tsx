// Živý přehled měřených událostí a funnelu. Zobrazí se jen s ?debug=1 (pro demo a QA).
import { useEffect, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $events } from '../../lib/track';

const FUNNEL = ['page_view', 'hero_view', 'first_interaction', 'section_view', 'form_view', 'form_focus', 'form_submit', 'lead_created'];

export default function DebugPanel() {
  const [on, setOn] = useState(false);
  const [open, setOpen] = useState(true);
  const events = useStore($events);
  useEffect(() => setOn(new URLSearchParams(location.search).has('debug')), []);
  if (!on) return null;
  const seen = new Set(events.map((e) => e.name));
  const t0 = events[0]?.at ?? Date.now();
  return (
    <div class="fixed top-12 right-2 z-[60] w-[min(92vw,340px)] font-mono text-[11px]">
      <div class="rounded-2xl bg-[var(--color-dark)] p-3 text-zinc-300 shadow-2xl">
        <button class="flex w-full justify-between text-[var(--color-lime)]" onClick={() => setOpen(!open)}>
          <span>● TRACKING DEBUG ({events.length})</span>
          <span>{open ? '–' : '+'}</span>
        </button>
        {open && (
          <>
            <ol class="mt-2 grid grid-cols-2 gap-1">
              {FUNNEL.map((f, i) => (
                <li class={seen.has(f) ? 'text-[var(--color-lime)]' : 'text-[#5d6d66]'}>
                  {i + 1}. {seen.has(f) ? '✓' : '·'} {f}
                </li>
              ))}
            </ol>
            <div class="mt-2 max-h-56 overflow-auto border-t border-[var(--color-dark-line)] pt-2">
              {[...events].reverse().map((e) => (
                <div class="flex gap-2 py-0.5 text-[#c9d4ce]">
                  <span class="text-[#5d6d66]">+{((e.at - t0) / 1000).toFixed(1)}s</span>
                  <span class="text-[var(--color-lime)]">{e.name}</span>
                  <span class="truncate">{JSON.stringify(Object.fromEntries(Object.entries(e.props).filter(([k]) => !['device', 't_since_load', 'variant'].includes(k))))}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
