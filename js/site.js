"use strict";

/* =========================================================
   SITO PUBBLICO — Mishari
   - Vetrina a scorrimento guidato dal mouse (stile Squarespace):
     mouse a destra = avanti, a sinistra = indietro, fluido.
   - Clic su una copertina -> pagina immersiva della categoria.
   - Modale "Richiedi preventivo".
   ========================================================= */

const FGsite = window.FG;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- Vetrina categorie ---------------- */
(function initStage() {
  const track = document.querySelector("#stageTrack");
  const viewport = document.querySelector("#stageViewport");
  const edgePrev = document.querySelector("#edgePrev");
  const edgeNext = document.querySelector("#edgeNext");
  if (!track || !viewport) return;

  const services = FGsite.SERVICES;
  const N = services.length;
  const COPIES = 3;
  const MAX_SPEED = 720;   // px/s al bordo estremo
  const IDLE_SPEED = 20;   // deriva lenta quando il mouse è fuori (solo desktop)
  const DEADZONE = 0.12;   // zona centrale ferma
  const FRICTION = 0.94;   // attrito del momentum (più basso = frena prima)
  const MAX_FLING = 3200;  // limite velocità del flick

  // Su dispositivi touch niente deriva automatica: resta stabile finché non trascini.
  const isTouch = window.matchMedia("(hover: none)").matches;
  const idleSpeed = isTouch ? 0 : IDLE_SPEED;

  let pos = 0;
  let setWidth = 0;
  let velocity = 0;
  let targetVel = 0;
  let hovering = false;
  let dragging = false;
  let flinging = false;
  let lastTs = 0;

  function buildCard(service) {
    const card = document.createElement("a");
    card.className = "stage-card";
    card.href = `category.html?cat=${encodeURIComponent(service.slug)}`;
    card.setAttribute("aria-label", `Apri ${service.title}`);

    const img = document.createElement("img");
    img.src = service.cover;
    img.alt = service.title;
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;
    img.addEventListener("error", () => { img.style.display = "none"; });

    const cap = document.createElement("div");
    cap.className = "stage-caption";
    cap.innerHTML =
      `<span class="tag">${FGsite.escapeHtml(service.tag)}</span>` +
      `<span class="title">${FGsite.escapeHtml(service.title)}</span>` +
      `<span class="enter">Enter →</span>`;

    card.append(img, cap);
    return card;
  }

  const frag = document.createDocumentFragment();
  for (let c = 0; c < COPIES; c++) {
    services.forEach((s) => frag.appendChild(buildCard(s)));
  }
  track.appendChild(frag);

  function measure() {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const card = track.children[0];
    const cardW = card ? card.getBoundingClientRect().width : 0;
    setWidth = (cardW + gap) * N;
    if (setWidth > 0) {
      pos = ((pos % setWidth) + setWidth) % setWidth;
      // parti dal secondo set per avere buffer su entrambi i lati
      if (pos < setWidth) pos += setWidth;
    }
    apply();
  }

  function apply() {
    track.style.transform = `translate3d(${-pos}px, 0, 0)`;
  }

  function setTargetFromX(clientX) {
    const rect = viewport.getBoundingClientRect();
    const norm = ((clientX - rect.left) / rect.width) * 2 - 1; // -1..1
    if (Math.abs(norm) < DEADZONE) {
      targetVel = 0;
    } else {
      const sign = Math.sign(norm);
      const mag = (Math.abs(norm) - DEADZONE) / (1 - DEADZONE);
      targetVel = sign * Math.pow(mag, 1.6) * MAX_SPEED;
    }
    edgePrev?.classList.toggle("active", targetVel < -1);
    edgeNext?.classList.toggle("active", targetVel > 1);
  }

  function wrap() {
    if (setWidth > 0) {
      while (pos >= setWidth * 2) pos -= setWidth;
      while (pos < setWidth) pos += setWidth;
    }
  }

  function frame(ts) {
    const dt = lastTs ? Math.min(48, ts - lastTs) : 16;
    lastTs = ts;

    if (!reduceMotion && !dragging) {
      if (flinging) {
        // Inerzia dopo il flick: scivola e frena dolcemente
        pos += velocity * (dt / 1000);
        velocity *= Math.pow(FRICTION, dt / 16.67);
        if (Math.abs(velocity) <= idleSpeed + 2) { flinging = false; velocity = idleSpeed; }
      } else {
        const goal = hovering ? targetVel : idleSpeed;
        velocity += (goal - velocity) * Math.min(1, dt / 180);
        pos += velocity * (dt / 1000);
      }
      wrap();
      apply();
    }
    requestAnimationFrame(frame);
  }

  viewport.addEventListener("mouseenter", () => { hovering = true; });
  viewport.addEventListener("mousemove", (e) => { hovering = true; flinging = false; setTargetFromX(e.clientX); });
  viewport.addEventListener("mouseleave", () => {
    hovering = false;
    targetVel = 0;
    edgePrev?.classList.remove("active");
    edgeNext?.classList.remove("active");
  });

  // Trascinamento touch con momentum e blocco dell'asse
  let axis = null;      // 'h' orizzontale (trascina), 'v' verticale (scroll pagina)
  let startX = 0, startY = 0, lastX = 0, lastMoveT = 0;
  viewport.addEventListener("touchstart", (e) => {
    dragging = true;
    flinging = false;
    hovering = false;
    axis = null;
    const t = e.touches[0];
    startX = lastX = t.clientX;
    startY = t.clientY;
    lastMoveT = performance.now();
    velocity = 0;
  }, { passive: true });
  viewport.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    const dx = t.clientX - startX, dy = t.clientY - startY;
    if (!axis) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) axis = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
      else return;
    }
    if (axis === "v") { dragging = false; return; } // lascia scorrere la pagina
    e.preventDefault(); // blocca sull'orizzontale: niente scatti con lo scroll
    const now = performance.now();
    const move = t.clientX - lastX;
    pos -= move;
    wrap();
    apply();
    const dtms = now - lastMoveT;
    if (dtms > 0) {
      const inst = -move / (dtms / 1000);
      // media pesata per una velocità stabile (meno "nervosa")
      velocity = velocity * 0.4 + inst * 0.6;
    }
    lastX = t.clientX;
    lastMoveT = now;
  }, { passive: false });
  function endTouch() {
    if (dragging && axis === "h") {
      velocity = Math.max(-MAX_FLING, Math.min(MAX_FLING, velocity));
      flinging = Math.abs(velocity) > 40;
    }
    dragging = false;
    axis = null;
  }
  viewport.addEventListener("touchend", endTouch);
  viewport.addEventListener("touchcancel", endTouch);

  let resizeId;
  window.addEventListener("resize", () => {
    clearTimeout(resizeId);
    resizeId = setTimeout(measure, 150);
  });
  window.addEventListener("load", measure);

  measure();
  requestAnimationFrame(frame);
})();

/* ---------------- Modale preventivo ---------------- */
(function initQuoteModal() {
  const modal = document.querySelector("#quoteModal");
  if (!modal) return;
  const form = modal.querySelector("#quoteForm");
  const feedback = modal.querySelector("#quoteFeedback");
  const serviceSel = modal.querySelector("#quoteService");
  let lastFocus = null;

  // popola tendina servizi
  serviceSel.innerHTML =
    `<option value="">Not sure yet</option>` +
    FGsite.SERVICES.map((s) => `<option value="${s.slug}">${FGsite.escapeHtml(s.title)}</option>`).join("");

  function open(preselect) {
    lastFocus = document.activeElement;
    if (preselect) serviceSel.value = preselect;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector("input[name='name']").focus();
  }
  function close() {
    modal.hidden = true;
    document.body.style.overflow = "";
    feedback.textContent = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  modal.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (!modal.hidden && e.key === "Escape") close();
  });
  document.querySelectorAll(".quote-open").forEach((btn) =>
    btn.addEventListener("click", () => open(btn.dataset.service))
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name?.trim() || !data.email?.trim()) {
      feedback.textContent = "Please enter your name and email.";
      feedback.className = "form-note error";
      return;
    }
    const svc = FGsite.getService(data.service);
    feedback.textContent = "Sending…";
    feedback.className = "form-note";
    try {
      await FGsite.submitQuoteRequest({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: (data.phone || "").trim(),
        service: data.service || "",
        serviceLabel: svc ? svc.title : "General",
        message: (data.message || "").trim()
      });
      feedback.textContent = "Message sent. I'll get back to you soon.";
      feedback.className = "form-note success";
      form.reset();
      setTimeout(close, 1600);
    } catch {
      feedback.textContent = "Saved locally. Please try again later.";
      feedback.className = "form-note error";
    }
  });

  // espone open() ad altre pagine/pulsanti
  window.FGopenQuote = open;
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

/* ---------------- Anno footer ---------------- */
(function initYear() {
  const y = document.querySelector("#year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
