"use strict";

/* =========================================================
   Contenuti della gallery — 9 immagini, 3 visibili alla volta.
   Sostituisci src/alt/tag/title con i tuoi lavori reali.
   ========================================================= */
const galleryImages = [
  { src: "assets/gallery/01-wedding-film.jpg",     alt: "Wedding film",        tag: "Video", title: "Wedding Film" },
  { src: "assets/gallery/02-music-video.jpg",      alt: "Videoclip musicale",  tag: "Video", title: "Music Video" },
  { src: "assets/gallery/03-brand-story.jpg",      alt: "Brand story",         tag: "Video", title: "Brand Story" },
  { src: "assets/gallery/04-event-reportage.jpg",  alt: "Reportage evento",    tag: "Video", title: "Event Reportage" },
  { src: "assets/gallery/05-portrait-session.jpg", alt: "Sessione ritratto",   tag: "Foto",  title: "Portrait Session" },
  { src: "assets/gallery/06-commercial.jpg",       alt: "Contenuto commerciale", tag: "Video", title: "Commercial" },
  { src: "assets/gallery/07-drone-view.jpg",       alt: "Riprese drone",       tag: "Drone", title: "Drone View" },
  { src: "assets/gallery/08-editorial-photo.jpg",  alt: "Fotografia editoriale", tag: "Foto",  title: "Editorial Photo" },
  { src: "assets/gallery/09-behind-scenes.jpg",    alt: "Backstage",           tag: "Foto",  title: "Behind Scenes" },
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- Carosello ---------------- */
(function initCarousel() {
  const track = document.querySelector("#carouselTrack");
  const dotsWrap = document.querySelector("#carouselDots");
  const root = document.querySelector("#carousel");
  if (!track || !root) return;

  const N = galleryImages.length;
  const COPIES = 3;                 // buffer a sinistra e a destra
  let position = N;                 // parte dalla copia centrale
  let step = 0;                     // larghezza card + gap, in px
  let autoplayId = null;
  const INTERVAL = 3600;

  function buildCard(image) {
    const card = document.createElement("article");
    card.className = "gallery-card";

    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => { img.style.display = "none"; });

    const caption = document.createElement("div");
    caption.className = "gallery-caption";
    caption.innerHTML =
      `<span class="tag">${image.tag}</span><span class="title">${image.title}</span>`;

    card.append(img, caption);
    return card;
  }

  // Render 3 copie complete (buffer per lo scorrimento infinito)
  const frag = document.createDocumentFragment();
  for (let c = 0; c < COPIES; c++) {
    galleryImages.forEach((image) => frag.appendChild(buildCard(image)));
  }
  track.appendChild(frag);

  // Dots (una per immagine)
  const dots = [];
  for (let i = 0; i < N; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `Vai all'immagine ${i + 1}`);
    b.addEventListener("click", () => goToImage(i));
    dotsWrap.appendChild(b);
    dots.push(b);
  }

  function measure() {
    const gapPx = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.style.setProperty("--gap", gapPx + "px");
    const card = track.children[0];
    step = card ? card.getBoundingClientRect().width + gapPx : 0;
    setX(false);
  }

  function setX(animate) {
    track.style.transition = animate && !reduceMotion
      ? "transform 0.7s cubic-bezier(0.22,0.61,0.36,1)"
      : "none";
    track.style.transform = `translate3d(${-position * step}px, 0, 0)`;
  }

  function activeImage() {
    return ((position % N) + N) % N;
  }

  function updateDots() {
    const a = activeImage();
    dots.forEach((d, i) => d.classList.toggle("active", i === a));
  }

  function normalize() {
    // Riporta la posizione nella banda centrale senza animazione
    if (position >= 2 * N) position -= N;
    else if (position < N) position += N;
    else return;
    setX(false);
  }

  function move(dir) {
    position += dir;
    setX(true);
    updateDots();
  }

  function goToImage(i) {
    let delta = i - activeImage();
    // scegli il percorso più breve sul cerchio delle 9 immagini
    if (delta > N / 2) delta -= N;
    if (delta < -N / 2) delta += N;
    move(delta);
  }

  // Quando l'animazione finisce, se necessario, ricentra istantaneamente
  track.addEventListener("transitionend", normalize);

  // Autoplay: le immagini entrano da sinistra ed escono a destra (effetto revolver)
  function startAutoplay() {
    if (reduceMotion || autoplayId !== null) return;
    autoplayId = window.setInterval(() => move(-1), INTERVAL);
  }
  function stopAutoplay() {
    if (autoplayId !== null) { window.clearInterval(autoplayId); autoplayId = null; }
  }

  // Frecce manuali
  root.querySelector(".carousel-arrow.next").addEventListener("click", () => { move(1); });
  root.querySelector(".carousel-arrow.prev").addEventListener("click", () => { move(-1); });

  // Pausa su hover / focus / tab nascosta
  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  root.addEventListener("focusin", stopAutoplay);
  root.addEventListener("focusout", startAutoplay);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  // Resize (debounced)
  let resizeId;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeId);
    resizeId = window.setTimeout(measure, 150);
  });
  window.addEventListener("load", measure);

  measure();
  updateDots();
  startAutoplay();
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
