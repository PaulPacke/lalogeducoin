export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function on(el, event, handler, opts) {
  if (!el) return () => {};
  el.addEventListener(event, handler, opts);
  return () => el.removeEventListener(event, handler, opts);
}

export function delegate(root, event, selector, handler, opts) {
  if (!root) return () => {};
  const fn = (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const match = t.closest(selector);
    if (!match || !root.contains(match)) return;
    handler(e, match);
  };
  root.addEventListener(event, fn, opts);
  return () => root.removeEventListener(event, fn, opts);
}
