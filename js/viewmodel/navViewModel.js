import { qs, qsa, on } from "../utils/dom.js";

export function initNavViewModel(root = document) {
  const navToggle = qs("[data-nav-toggle]", root);
  const navPanel = qs("[data-nav-panel]", root);

  function setNavOpen(open) {
    document.body.classList.toggle("nav-open", open);
    if (navToggle) navToggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  }

  if (navToggle && navPanel) {
    on(navToggle, "click", () => {
      setNavOpen(!document.body.classList.contains("nav-open"));
    });

    qsa("a", navPanel).forEach((a) => {
      on(a, "click", () => setNavOpen(false));
    });
  }

  return { setNavOpen };
}
