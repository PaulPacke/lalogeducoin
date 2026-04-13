import { qsa } from "../utils/dom.js";

export function initRevealViewModel(root = document) {
  const revealEls = qsa(".reveal", root);
  if (!revealEls.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "-10% 0px -10% 0px", threshold: 0.1 }
  );

  revealEls.forEach((el) => io.observe(el));
}
