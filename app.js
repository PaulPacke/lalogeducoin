(() => {
   const qs = (sel, root = document) => root.querySelector(sel);
   const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

   const year = qs("[data-year]");
   if (year) year.textContent = String(new Date().getFullYear());

   const navToggle = qs("[data-nav-toggle]");
   const navPanel = qs("[data-nav-panel]");

   function setNavOpen(open) {
     document.body.classList.toggle("nav-open", open);
     if (navToggle) navToggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
   }

   if (navToggle && navPanel) {
     navToggle.addEventListener("click", () => {
       setNavOpen(!document.body.classList.contains("nav-open"));
     });

     qsa("a", navPanel).forEach((a) => {
       a.addEventListener("click", () => setNavOpen(false));
     });
   }

   document.addEventListener("keydown", (e) => {
     if (e.key === "Escape") {
       setNavOpen(false);
       closeLightbox();
     }
   });

   const revealEls = qsa(".reveal");
   if (revealEls.length) {
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

   const parallaxEl = qs("[data-parallax]");
   let raf = 0;
   function onScroll() {
     if (!parallaxEl) return;
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

   const lbRoot = qs("[data-lightbox-root]");
   const lbImg = qs("[data-lightbox-img]");
   const lbCaption = qs("[data-lightbox-caption]");
   const lbCloseEls = qsa("[data-lightbox-close]");
   const lbPrev = qs("[data-lightbox-prev]");
   const lbNext = qs("[data-lightbox-next]");

   let lastActive = null;
   let isLightboxOpen = false;
   let activeGroup = "";
   let activeIndex = 0;

   function itemsForGroup(group) {
     return qsa(`[data-lightbox][data-group="${group}"][data-src]`).map((el) => {
       const src = el.getAttribute("data-src") || "";
       const img = qs("img", el);
       const alt = img ? img.getAttribute("alt") || "" : "";
       return { src, alt };
     });
   }

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

   function setLightboxCaption() {
     if (!lbCaption) return;
     const items = itemsForGroup(activeGroup);
     const label = prettyLabel(activeGroup);
     if (!items.length) {
       lbCaption.textContent = "";
       return;
     }
     lbCaption.textContent = `${label} — ${activeIndex + 1}/${items.length} · ${filenameFromPath(items[activeIndex].src)}`;
   }

   function showLightboxAt(group, index) {
     if (!lbRoot || !lbImg) return;
     const items = itemsForGroup(group);
     if (!items.length) return;

     activeGroup = group;
     activeIndex = Math.max(0, Math.min(index, items.length - 1));
     const src = items[activeIndex].src;
     const alt = items[activeIndex].alt;

     lastActive = document.activeElement;
     lbImg.src = src;
     lbImg.alt = alt || prettyLabel(group);
     lbRoot.classList.add("is-open");
     lbRoot.setAttribute("aria-hidden", "false");
     document.body.style.overflow = "hidden";
     isLightboxOpen = true;
     setLightboxCaption();

     if (lbPrev) lbPrev.disabled = items.length <= 1;
     if (lbNext) lbNext.disabled = items.length <= 1;

     const closeBtn = qs(".lightbox__close", lbRoot);
     if (closeBtn) closeBtn.focus();
   }

   function closeLightbox() {
     if (!lbRoot || !lbImg) return;
     if (!lbRoot.classList.contains("is-open")) return;
     lbRoot.classList.remove("is-open");
     lbRoot.setAttribute("aria-hidden", "true");
     document.body.style.overflow = "";
     lbImg.src = "";
     if (lbCaption) lbCaption.textContent = "";
     isLightboxOpen = false;
     if (lastActive && typeof lastActive.focus === "function") lastActive.focus();
     lastActive = null;
   }

   function go(delta) {
     const items = itemsForGroup(activeGroup);
     if (items.length <= 1) return;
     const next = (activeIndex + delta + items.length) % items.length;
     activeIndex = next;
     lbImg.src = items[activeIndex].src;
     lbImg.alt = items[activeIndex].alt || prettyLabel(activeGroup);
     setLightboxCaption();
   }

   function bindGalleryClicks() {
     document.addEventListener("click", (e) => {
       const t = e.target;
       if (!(t instanceof Element)) return;
       const btn = t.closest("[data-lightbox][data-group][data-src]");
       if (!btn) return;
       const group = btn.getAttribute("data-group") || "";
       const src = btn.getAttribute("data-src") || "";
       const items = itemsForGroup(group);
       const index = Math.max(
         0,
         items.findIndex((it) => it.src === src)
       );
       showLightboxAt(group, index);
     });
   }

   lbCloseEls.forEach((el) => el.addEventListener("click", closeLightbox));

   if (lbPrev) lbPrev.addEventListener("click", () => go(-1));
   if (lbNext) lbNext.addEventListener("click", () => go(1));

   document.addEventListener("keydown", (e) => {
     if (!isLightboxOpen) return;
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

     lbImg.addEventListener(
       "touchstart",
       (e) => {
         if (!isLightboxOpen) return;
         const t = e.touches && e.touches[0];
         if (!t) return;
         touching = true;
         sx = t.clientX;
         sy = t.clientY;
       },
       { passive: true }
     );

     lbImg.addEventListener(
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
     lbRoot.addEventListener("click", (e) => {
       const panel = qs(".lightbox__panel", lbRoot);
       if (panel && !panel.contains(e.target)) closeLightbox();
     });
   }

   bindGalleryClicks();
 })();
