import { initYearViewModel } from "./viewmodel/yearViewModel.js";
import { initNavViewModel } from "./viewmodel/navViewModel.js";
import { initRevealViewModel } from "./viewmodel/revealViewModel.js";
import { initParallaxViewModel } from "./viewmodel/parallaxViewModel.js";
import { initLightboxViewModel } from "./viewmodel/lightboxViewModel.js";

function init() {
  initYearViewModel(document);
  const nav = initNavViewModel(document);
  initRevealViewModel(document);
  initParallaxViewModel(document);
  const lightbox = initLightboxViewModel(document);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (nav && typeof nav.setNavOpen === "function") nav.setNavOpen(false);
    if (lightbox && typeof lightbox.close === "function") lightbox.close();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
