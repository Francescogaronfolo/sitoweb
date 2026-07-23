"use strict";

/* =========================================================
   PAGINA CATEGORIA
   - Intestazione compatta (testo in alto).
   - "Collana" di foto che scorre col mouse (come la home, ~1/4).
   - Clic su una foto -> ingrandimento con piccola descrizione.
   ========================================================= */
(function initCategory() {
  const FGc = window.FG;
  const root = document.querySelector("#catRoot");
  if (!root) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const params = new URLSearchParams(location.search);
  const slug = params.get("cat");
  const service = FGc.getService(slug);

  if (!service) {
    root.innerHTML = `
      <section class="cat-missing">
        <p class="eyebrow">Service not found</p>
        <h1>Category not available</h1>
        <a class="btn btn-primary" href="index.html#portfolio">Back to services</a>
      </section>`;
    return;
  }

  document.title = `${service.title} | Mishari`;
  const esc = FGc.escapeHtml;
  const strip = FGc.getStrip(service);

  root.innerHTML = `
    <section class="cat-head" style="--cover:url('${esc(service.cover)}')">
      <div class="cat-head-scrim"></div>
      <a class="cat-back" href="index.html#portfolio">← All services</a>
      <div class="cat-head-inner">
        <p class="eyebrow">${esc(service.tag)}</p>
        <h1>${esc(service.title)}</h1>
        <p class="cat-intro">${esc(service.intro)}</p>
      </div>
    </section>

    <section class="cat-strip" aria-label="${esc(service.title)} gallery">
      <div class="strip-viewport" id="stripViewport">
        <div class="strip-track" id="stripTrack"></div>
      </div>
      <div class="strip-edge prev" id="stripPrev" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="strip-edge next" id="stripNext" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    </section>

    <section class="cat-body">
      <div class="cat-operativo reveal">
        <p class="eyebrow">How I work</p>
        <p class="cat-operativo-text">${esc(service.operativo)}</p>
      </div>
      <div class="cat-cta reveal">
        <h2>Interested in a ${esc(service.title.toLowerCase())} project?</h2>
        <p class="section-sub">Get in touch — let's shape a tailored proposal together.</p>
        <button class="btn-soft quote-open" type="button" data-service="${esc(service.slug)}">Let's talk <span aria-hidden="true">→</span></button>
        <div class="cat-contacts">
          <a href="mailto:info@example.com"><span class="contact-label">Email</span><span class="contact-value">info@example.com</span></a>
          <a href="tel:+390000000000"><span class="contact-label">Phone</span><span class="contact-value">+39 000 000 0000</span></a>
        </div>
      </div>
    </section>

    <footer class="site-footer">
      <span>© <span id="year"></span> Mishari</span>
      <a href="index.html">Back to home</a>
    </footer>`;

  const y = root.querySelector("#year");
  if (y) y.textContent = String(new Date().getFullYear());

  root.querySelectorAll(".quote-open").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (window.FGopenQuote) window.FGopenQuote(btn.dataset.service);
    })
  );

  // Reveal
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
      }, { threshold: 0.16 })
    : null;
  root.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("is-visible")));

  /* ---------------- Collana a scorrimento col mouse ---------------- */
  (function initStrip() {
    const track = root.querySelector("#stripTrack");
    const viewport = root.querySelector("#stripViewport");
    const edgePrev = root.querySelector("#stripPrev");
    const edgeNext = root.querySelector("#stripNext");
    const N = strip.length;
    const COPIES = 3;
    const MAX_SPEED = 640;
    const IDLE_SPEED = 16;
    const DEADZONE = 0.12;
    const FRICTION = 0.94;
    const MAX_FLING = 3200;
    const isTouch = window.matchMedia("(hover: none)").matches;
    const idleSpeed = isTouch ? 0 : IDLE_SPEED;

    let pos = 0, setWidth = 0, velocity = 0, targetVel = 0, hovering = false, lastTs = 0;
    let dragging = false, flinging = false;

    function buildTile(item, index) {
      const tile = document.createElement("button");
      tile.className = "strip-tile";
      tile.type = "button";
      tile.setAttribute("aria-label", `Open photo ${index + 1}`);
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.caption || `${service.title} — ${index + 1}`;
      img.loading = "lazy";
      img.decoding = "async";
      img.draggable = false;
      img.addEventListener("error", () => { img.style.display = "none"; });
      tile.appendChild(img);
      tile.addEventListener("click", () => openLightbox(index));
      return tile;
    }

    const frag = document.createDocumentFragment();
    for (let c = 0; c < COPIES; c++) strip.forEach((it, i) => frag.appendChild(buildTile(it, i)));
    track.appendChild(frag);

    function measure() {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const tile = track.children[0];
      const w = tile ? tile.getBoundingClientRect().width : 0;
      setWidth = (w + gap) * N;
      if (setWidth > 0) { pos = ((pos % setWidth) + setWidth) % setWidth; if (pos < setWidth) pos += setWidth; }
      apply();
    }
    function apply() { track.style.transform = `translate3d(${-pos}px,0,0)`; }

    function setTarget(clientX) {
      const r = viewport.getBoundingClientRect();
      const norm = ((clientX - r.left) / r.width) * 2 - 1;
      if (Math.abs(norm) < DEADZONE) targetVel = 0;
      else {
        const sign = Math.sign(norm);
        const mag = (Math.abs(norm) - DEADZONE) / (1 - DEADZONE);
        targetVel = sign * Math.pow(mag, 1.6) * MAX_SPEED;
      }
      edgePrev?.classList.toggle("active", targetVel < -1);
      edgeNext?.classList.toggle("active", targetVel > 1);
    }

    function wrap() {
      if (setWidth > 0) { while (pos >= setWidth * 2) pos -= setWidth; while (pos < setWidth) pos += setWidth; }
    }

    function frame(ts) {
      const dt = lastTs ? Math.min(48, ts - lastTs) : 16;
      lastTs = ts;
      if (!reduceMotion && !dragging) {
        if (flinging) {
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
    viewport.addEventListener("mousemove", (e) => { hovering = true; flinging = false; setTarget(e.clientX); });
    viewport.addEventListener("mouseleave", () => { hovering = false; targetVel = 0; edgePrev?.classList.remove("active"); edgeNext?.classList.remove("active"); });

    // Touch con momentum e blocco dell'asse
    let axis = null, startX = 0, startY = 0, lastX = 0, lastMoveT = 0;
    viewport.addEventListener("touchstart", (e) => {
      dragging = true; flinging = false; hovering = false; axis = null;
      const t = e.touches[0];
      startX = lastX = t.clientX; startY = t.clientY; lastMoveT = performance.now(); velocity = 0;
    }, { passive: true });
    viewport.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      const t = e.touches[0];
      const dx = t.clientX - startX, dy = t.clientY - startY;
      if (!axis) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) axis = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
        else return;
      }
      if (axis === "v") { dragging = false; return; }
      e.preventDefault();
      const now = performance.now();
      const move = t.clientX - lastX;
      pos -= move; wrap(); apply();
      const dtms = now - lastMoveT;
      if (dtms > 0) { const inst = -move / (dtms / 1000); velocity = velocity * 0.4 + inst * 0.6; }
      lastX = t.clientX; lastMoveT = now;
    }, { passive: false });
    function endTouch() {
      if (dragging && axis === "h") {
        velocity = Math.max(-MAX_FLING, Math.min(MAX_FLING, velocity));
        flinging = Math.abs(velocity) > 40;
      }
      dragging = false; axis = null;
    }
    viewport.addEventListener("touchend", endTouch);
    viewport.addEventListener("touchcancel", endTouch);

    let rid;
    window.addEventListener("resize", () => { clearTimeout(rid); rid = setTimeout(measure, 150); });
    window.addEventListener("load", measure);
    measure();
    requestAnimationFrame(frame);
  })();

  /* ---------------- Lightbox con descrizione ---------------- */
  const box = document.querySelector("#lightbox");
  const img = box.querySelector("#lbImage");
  const capEl = box.querySelector("#lbCap");
  const countEl = box.querySelector("#lbCount");
  let idx = 0;

  function render() {
    idx = ((idx % strip.length) + strip.length) % strip.length;
    const item = strip[idx];
    img.src = item.src;
    img.alt = item.caption || `${service.title} — ${idx + 1}`;
    if (capEl) capEl.textContent = item.caption || "";
    if (countEl) countEl.textContent = `${idx + 1} / ${strip.length}`;
  }
  function openLightbox(i) { idx = i; render(); box.hidden = false; document.body.style.overflow = "hidden"; box.querySelector(".lightbox-close").focus(); }
  function close() { box.hidden = true; document.body.style.overflow = ""; }
  function move(d) { idx += d; render(); }

  box.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", close));
  box.querySelector(".lightbox-nav.prev").addEventListener("click", () => move(-1));
  box.querySelector(".lightbox-nav.next").addEventListener("click", () => move(1));
  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") move(-1);
    else if (e.key === "ArrowRight") move(1);
  });
})();
