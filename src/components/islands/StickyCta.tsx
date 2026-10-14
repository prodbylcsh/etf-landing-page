// Spodní lišta na mobilu: objeví se po odscrollování hero, schová se, když je na obrazovce jiný formulář.
import { useEffect, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $consent } from '../../lib/track';
import { $unlocked, openLead } from '../../lib/store';

export default function StickyCta() {
  const [heroGone, setHeroGone] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const unlocked = useStore($unlocked);
  const consent = useStore($consent);

  useEffect(() => {
    const hero = document.querySelector('[data-section="hero"]');
    const io1 = new IntersectionObserver(([e]) => setHeroGone(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    if (hero) io1.observe(hero);
    const visible = new Set<Element>();
    const io2 = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.isIntersecting ? visible.add(e.target) : visible.delete(e.target);
        setFormVisible(visible.size > 0);
      },
      { threshold: 0.2 },
    );
    const forms = () => document.querySelectorAll('[data-sticky-hide]').forEach((f) => io2.observe(f));
    forms();
    return () => {
      io1.disconnect();
      io2.disconnect();
    };
  }, []);

  const show = heroGone && !formVisible && !unlocked && consent !== null;
  return (
    <div
      class={`fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-rule)] bg-[rgba(243,238,228,0.94)] px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 md:hidden ${show ? 'translate-y-0' : 'translate-y-full'}`}
      aria-hidden={!show}
    >
      <button class="btn btn-primary w-full" tabIndex={show ? 0 : -1} onClick={() => openLead({ source: 'sticky' })} data-track="sticky_cta">
        Poslat ETF tahák zdarma <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
