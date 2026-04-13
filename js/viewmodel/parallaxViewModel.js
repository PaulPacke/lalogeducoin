import { qs } from "../utils/dom.js";

export function initParallaxViewModel(root = document) {
  const parallaxEl = qs("[data-parallax]", root);
  if (!parallaxEl) return;

  let raf = 0;

  function onScroll() {
    if (raf) return;
    raf = window.requestAnimationFrame(() => {
      raf = 0;
      const y = window.scrollY || 0;
      const offset = Math.min(120, y * 0.12);
      parallaxEl.style.transform = `translateY(${offset}px) scale(1.03)`;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
