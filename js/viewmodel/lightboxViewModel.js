import { qs, qsa, clamp, delegate, on } from "../utils/dom.js";

function filenameFromPath(path) {
  const s = String(path || "");
  const parts = s.split("/");
  return parts[parts.length - 1] || s;
}

function prettyLabel(group) {
  if (group === "ongles") return "Ongles";
  if (group === "cheveux") return "Cheveux";
  return group;
}

export function initLightboxViewModel(root = document) {
  const lbRoot = qs("[data-lightbox-root]", root);
  const lbImg = qs("[data-lightbox-img]", root);
  const lbCaption = qs("[data-lightbox-caption]", root);
  const lbCloseEls = qsa("[data-lightbox-close]", root);
  const lbPrev = qs("[data-lightbox-prev]", root);
  const lbNext = qs("[data-lightbox-next]", root);

  let lastActive = null;
  let isOpen = false;
  let activeGroup = "";
  let activeIndex = 0;

  function itemsForGroup(group) {
    return qsa(`[data-lightbox][data-group="${group}"][data-src]`, root).map((el) => {
      const src = el.getAttribute("data-src") || "";
      const img = qs("img", el);
      const alt = img ? img.getAttribute("alt") || "" : "";
      return { src, alt };
    });
  }

  function setCaption() {
    if (!lbCaption) return;
    const items = itemsForGroup(activeGroup);
    const label = prettyLabel(activeGroup);
    if (!items.length) {
      lbCaption.textContent = "";
      return;
    }
    lbCaption.textContent = `${label} — ${activeIndex + 1}/${items.length} · ${filenameFromPath(items[activeIndex].src)}`;
  }

  function showAt(group, index) {
    if (!lbRoot || !lbImg) return;
    const items = itemsForGroup(group);
    if (!items.length) return;

    activeGroup = group;
    activeIndex = clamp(index, 0, items.length - 1);

    lastActive = document.activeElement;
    lbImg.src = items[activeIndex].src;
    lbImg.alt = items[activeIndex].alt || prettyLabel(group);

    lbRoot.classList.add("is-open");
    lbRoot.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    isOpen = true;

    setCaption();

    if (lbPrev) lbPrev.disabled = items.length <= 1;
    if (lbNext) lbNext.disabled = items.length <= 1;

    const closeBtn = qs(".lightbox__close", lbRoot);
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    if (!lbRoot || !lbImg) return;
    if (!lbRoot.classList.contains("is-open")) return;

    lbRoot.classList.remove("is-open");
    lbRoot.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lbImg.src = "";
    if (lbCaption) lbCaption.textContent = "";

    isOpen = false;
    if (lastActive && typeof lastActive.focus === "function") lastActive.focus();
    lastActive = null;
  }

  function go(delta) {
    const items = itemsForGroup(activeGroup);
    if (items.length <= 1 || !lbImg) return;
    activeIndex = (activeIndex + delta + items.length) % items.length;
    lbImg.src = items[activeIndex].src;
    lbImg.alt = items[activeIndex].alt || prettyLabel(activeGroup);
    setCaption();
  }

  delegate(document, "click", "[data-lightbox][data-group][data-src]", (_e, btn) => {
    const group = btn.getAttribute("data-group") || "";
    const src = btn.getAttribute("data-src") || "";
    const items = itemsForGroup(group);
    const index = Math.max(0, items.findIndex((it) => it.src === src));
    showAt(group, index);
  });

  lbCloseEls.forEach((el) => on(el, "click", close));
  if (lbPrev) on(lbPrev, "click", () => go(-1));
  if (lbNext) on(lbNext, "click", () => go(1));

  on(document, "keydown", (e) => {
    if (!isOpen) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  });

  if (lbImg) {
    let sx = 0;
    let sy = 0;
    let touching = false;

    on(
      lbImg,
      "touchstart",
      (e) => {
        if (!isOpen) return;
        const t = e.touches && e.touches[0];
        if (!t) return;
        touching = true;
        sx = t.clientX;
        sy = t.clientY;
      },
      { passive: true }
    );

    on(
      lbImg,
      "touchend",
      (e) => {
        if (!touching) return;
        touching = false;
        const t = e.changedTouches && e.changedTouches[0];
        if (!t) return;
        const dx = t.clientX - sx;
        const dy = t.clientY - sy;
        if (Math.abs(dx) < 34 || Math.abs(dx) < Math.abs(dy)) return;
        go(dx > 0 ? -1 : 1);
      },
      { passive: true }
    );
  }

  if (lbRoot) {
    on(lbRoot, "click", (e) => {
      const panel = qs(".lightbox__panel", lbRoot);
      if (panel && !panel.contains(e.target)) close();
    });
  }

  return { close, isOpen: () => isOpen };
}
