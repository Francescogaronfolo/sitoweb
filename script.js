"use strict";

/* =========================================================
   SERVIZI — ogni voce è una foto del carosello che apre la
   propria gallery nella lightbox.
   Per aggiungere più foto a un servizio, riempi "gallery"
   con altri percorsi immagine (es. tutte le foto di ristorazione).
   ========================================================= */
const services = [
  { cover: "assets/gallery/01-wedding-film.jpg",     tag: "Video", title: "Wedding Film",     desc: "Racconti eleganti, riprese emozionali e montaggi pensati per durare.", gallery: ["assets/gallery/01-wedding-film.jpg"] },
  { cover: "assets/gallery/02-music-video.jpg",      tag: "Video", title: "Videoclip",        desc: "Concept visivi, riprese dinamiche e post-produzione per artisti e creator.", gallery: ["assets/gallery/02-music-video.jpg"] },
  { cover: "assets/gallery/03-brand-story.jpg",      tag: "Video", title: "Brand Story",      desc: "Contenuti per aziende, attività locali, campagne social e lanci prodotto.", gallery: ["assets/gallery/03-brand-story.jpg"] },
  { cover: "assets/gallery/04-event-reportage.jpg",  tag: "Video", title: "Eventi",           desc: "Reportage video e fotografici per serate, eventi privati e aziendali.", gallery: ["assets/gallery/04-event-reportage.jpg"] },
  { cover: "assets/gallery/05-portrait-session.jpg", tag: "Foto",  title: "Ritratti",         desc: "Ritratti, shooting editoriali e contenuti lifestyle su misura.", gallery: ["assets/gallery/05-portrait-session.jpg"] },
  { cover: "assets/gallery/06-commercial.jpg",       tag: "Video", title: "Commercial",       desc: "Spot e contenuti pubblicitari per prodotti, servizi e ristorazione.", gallery: ["assets/gallery/06-commercial.jpg"] },
  { cover: "assets/gallery/07-drone-view.jpg",       tag: "Drone", title: "Drone & Reel",     desc: "Riprese aeree e formati verticali pronti per Instagram, TikTok e ADV.", gallery: ["assets/gallery/07-drone-view.jpg"] },
  { cover: "assets/gallery/08-editorial-photo.jpg",  tag: "Foto",  title: "Editoriale",       desc: "Fotografia editoriale, dettaglio prodotto e food styling.", gallery: ["assets/gallery/08-editorial-photo.jpg"] },
  { cover: "assets/gallery/09-behind-scenes.jpg",    tag: "Foto",  title: "Backstage",        desc: "Il dietro le quinte di set, produzioni e progetti in corso.", gallery: ["assets/gallery/09-behind-scenes.jpg"] },
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- Lightbox / gallery del servizio ---------------- */
const openService = (function initLightbox() {
  const box = document.querySelector("#lightbox");
  if (!box) return function () {};
  const img = box.querySelector("#lbImage");
  const tagEl = box.querySelector("#lbTag");
  const titleEl = box.querySelector("#lbTitle");
  const descEl = box.querySelector("#lbDesc");
  const countEl = box.querySelector("#lbCount");
  const prevBtn = box.querySelector(".lightbox-nav.prev");
  const nextBtn = box.querySelector(".lightbox-nav.next");

  let serviceIndex = 0;
  let photoIndex = 0;
  let lastFocus = null;

  function currentGallery() {
    const s = services[serviceIndex];
    return s.gallery && s.gallery.length ? s.gallery : [s.cover];
  }

  function render() {
    const s = services[serviceIndex];
    const gal = currentGallery();
    photoIndex = ((photoIndex % gal.length) + gal.length) % gal.length;
    img.src = gal[photoIndex];
    img.alt = `${s.title} — foto ${photoIndex + 1}`;
    tagEl.textContent = s.tag;
    titleEl.textContent = s.title;
    descEl.textContent = s.desc || "";
    const multi = gal.length > 1;
    countEl.textContent = multi ? `${photoIndex + 1} / ${gal.length}` : "";
    prevBtn.hidden = nextBtn.hidden = !multi;
  }

  function open(index) {
    serviceIndex = index;
    photoIndex = 0;
    lastFocus = document.activeElement;
    render();
    box.hidden = false;
    document.body.style.overflow = "hidden";
    if (window.__carousel) window.__carousel.pause();
    box.querySelector(".lightbox-close").focus();
  }

  function close() {
    box.hidden = true;
    document.body.style.overflow = "";
    if (window.__carousel) window.__carousel.resume();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function move(dir) { photoIndex += dir; render(); }

  box.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", close));
  prevBtn.addEventListener("click", () => move(-1));
  nextBtn.addEventListener("click", () => move(1));

  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") move(-1);
    else if (e.key === "ArrowRight") move(1);
  });

  return open;
})();

/* ---------------- Carosello a scorrimento continuo ---------------- */
(function initCarousel() {
  const track = document.querySelector("#carouselTrack");
  const root = document.querySelector("#carousel");
  const viewport = document.querySelector(".carousel-viewport");
  if (!track || !root) return;

  const N = services.length;
  const COPIES = 3;            // copie del set per lo scorrimento infinito
  const AUTO_SPEED = 26;       // px al secondo — lento
  let pos = 0;                 // pixel scorsi (verso sinistra)
  let step = 0;                // larghezza card + gap
  let setWidth = 0;            // larghezza di un set completo (N card)
  let paused = false;          // pausa su hover
  let tween = null;            // spostamento manuale con le frecce
  let lastTs = 0;

  function buildCard(service, index) {
    const card = document.createElement("article");
    card.className = "gallery-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Apri la gallery: ${service.title}`);

    const img = document.createElement("img");
    img.src = service.cover;
    img.alt = service.title;
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;
    img.addEventListener("error", () => { img.style.display = "none"; });

    const caption = document.createElement("div");
    caption.className = "gallery-caption";
    caption.innerHTML =
      `<span class="tag">${service.tag}</span>` +
      `<span class="title">${service.title}</span>` +
      `<span class="view">Apri gallery →</span>`;

    card.append(img, caption);
    const open = () => openService(index);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
    return card;
  }

  // Render COPIES set completi (buffer per il loop senza stacchi)
  const frag = document.createDocumentFragment();
  for (let c = 0; c < COPIES; c++) {
    services.forEach((service, i) => frag.appendChild(buildCard(service, i)));
  }
  track.appendChild(frag);

  function measure() {
    const gapPx = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.style.setProperty("--gap", gapPx + "px");
    const card = track.children[0];
    const cardW = card ? card.getBoundingClientRect().width : 0;
    step = cardW + gapPx;
    setWidth = step * N;
    if (setWidth > 0) pos = ((pos % setWidth) + setWidth) % setWidth;
    apply();
  }

  function apply() {
    track.style.transform = `translate3d(${-pos}px, 0, 0)`;
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function frame(ts) {
    const dt = lastTs ? ts - lastTs : 16;
    lastTs = ts;

    if (tween) {
      const t = Math.min(1, (ts - tween.start) / tween.dur);
      pos = tween.from + (tween.to - tween.from) * easeOutCubic(t);
      if (t >= 1) tween = null;
    } else if (!paused && !reduceMotion) {
      pos += AUTO_SPEED * (dt / 1000);
    }

    if (setWidth > 0) {
      while (pos >= setWidth) pos -= setWidth;
      while (pos < 0) pos += setWidth;
    }
    apply();
    requestAnimationFrame(frame);
  }

  function nudge(dir) {
    const from = tween ? tween.to : pos;
    tween = { from, to: from + dir * step, start: performance.now(), dur: 620 };
  }

  root.querySelector(".carousel-arrow.next").addEventListener("click", () => nudge(1));
  root.querySelector(".carousel-arrow.prev").addEventListener("click", () => nudge(-1));

  // Pausa su hover / focus / tab nascosta
  viewport.addEventListener("mouseenter", () => { paused = true; });
  viewport.addEventListener("mouseleave", () => { paused = false; });
  viewport.addEventListener("focusin", () => { paused = true; });
  viewport.addEventListener("focusout", () => { paused = false; });
  document.addEventListener("visibilitychange", () => { paused = document.hidden; });

  let resizeId;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeId);
    resizeId = window.setTimeout(measure, 150);
  });
  window.addEventListener("load", measure);

  measure();
  requestAnimationFrame(frame);

  // esposto alla lightbox per mettere in pausa quando è aperta
  window.__carousel = {
    pause() { paused = true; },
    resume() { paused = false; },
  };
})();

/* ---------------- Header dinamico ---------------- */
(function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ---------------- Reveal allo scroll ---------------- */
(function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );
  items.forEach((el) => io.observe(el));
})();

/* ---------------- Anno nel footer ---------------- */
(function initYear() {
  const y = document.querySelector("#year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
