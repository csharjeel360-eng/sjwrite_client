import { useEffect, useRef } from 'react';

// DeferredScript loads an external script after a chosen trigger to avoid render-blocking.
// strategy: 'idle' (requestIdleCallback or setTimeout), 'interaction' (first user interaction), 'visible' (when document becomes visible)
export default function DeferredScript({ src, id, strategy = 'idle', attrs = {}, onLoad }) {
  const loaded = useRef(false);

  useEffect(() => {
    if (!src || loaded.current) return;

    const inject = () => {
      if (loaded.current) return;
      loaded.current = true;
      const s = document.createElement('script');
      if (id) s.id = id;
      s.src = src;
      s.async = true;
      Object.entries(attrs || {}).forEach(([k, v]) => s.setAttribute(k, v));
      s.onload = () => onLoad && onLoad();
      document.body.appendChild(s);
    };

    if (strategy === 'idle' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => inject(), { timeout: 2000 });
    } else if (strategy === 'idle') {
      const t = setTimeout(inject, 1500);
      return () => clearTimeout(t);
    } else if (strategy === 'interaction') {
      const handler = () => {
        inject();
        window.removeEventListener('pointerdown', handler);
        window.removeEventListener('keydown', handler);
      };
      window.addEventListener('pointerdown', handler, { once: true });
      window.addEventListener('keydown', handler, { once: true });
    } else if (strategy === 'visible') {
      const onVisible = () => {
        if (document.visibilityState === 'visible') inject();
      };
      document.addEventListener('visibilitychange', onVisible);
      onVisible();
      return () => document.removeEventListener('visibilitychange', onVisible);
    } else {
      // default fallback
      const t = setTimeout(inject, 1500);
      return () => clearTimeout(t);
    }
  }, [src, id, strategy, attrs, onLoad]);

  return null;
}
