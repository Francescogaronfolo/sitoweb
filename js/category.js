"use strict";

/* =========================================================
   PAGINA CATEGORIA — layout immersivo del servizio
   ========================================================= */
(function initCategory() {
  const FGc = window.FG;
  const root = document.querySelector("#catRoot");
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const slug = params.get("cat");
  const service = FGc.getService(slug);

  if (!service) {
    root.innerHTML = `
      <section class="cat-missing">
        <p class="eyebrow">Servizio non trovato</p>
        <h1>Categoria non disponibile</h1>
        <a class="btn btn-primary" href="index.html#portfolio">Torna ai servizi</a>
      </section>`;
    return;
  }

  document.title = `${service.title} | Francesco Garonfolo`;
  const esc = FGc.escapeHtml;
  const gallery = service.gallery && service.gallery.length ? service.gallery : [service.cover];

  // Layout "collana" immersivo: le foto si alternano fra pieni e ritmi diversi.
  const shots = gallery
    .map((src, i) => {
      const kind = i % 3 === 0 ? "wide" : i % 3 === 1 ? "tall" : "std";
      return `
        <figure class="shot ${kind}" data-idx="${i}" tabindex="0" role="button" aria-label="Ingrandisci foto ${i + 1}">
          <img src="${esc(src)}" alt="${esc(service.title)} — foto ${i + 1}" loading="lazy" decoding="async" />
        </figure>`;
    })
    .join("");

  root.innerHTML = `
    <section class="cat-hero" style="--cover:url('${esc(service.cover)}')">
      <div class="cat-hero-scrim"></div>
      <a class="cat-back" href="index.html#portfolio">← Tutti i servizi</a>
      <div class="cat-hero-inner">
        <p class="eyebrow">${esc(service.tag)}</p>
        <h1>${esc(service.title)}</h1>
        <p class="cat-intro">${esc(service.intro)}</p>
      </div>
    </section>

    <section class="cat-gallery" aria-label="Galleria ${esc(service.title)}">
      ${shots}
    </section>

    <section class="cat-body">
      <div class="cat-operativo reveal">
        <p class="eyebrow">Come lavoro</p>
        <p class="cat-operativo-text">${esc(service.operativo)}</p>
      </div>
      <div class="cat-cta reveal">
        <h2>Interessato a un progetto ${esc(service.title.toLowerCase())}?</h2>
        <p class="section-sub">Scrivimi: costruiamo insieme la proposta su misura.</p>
        <button class="btn btn-primary quote-open" type="button" data-service="${esc(service.slug)}">Richiedi preventivo</button>
        <div class="cat-contacts">
          <a href="mailto:info@example.com"><span class="contact-label">Email</span><span class="contact-value">info@example.com</span></a>
          <a href="tel:+390000000000"><span class="contact-label">Telefono</span><span class="contact-value">+39 000 000 0000</span></a>
        </div>
      </div>
    </section>

    <footer class="site-footer">
      <span>© <span id="year"></span> Francesco Garonfolo</span>
      <a href="index.html">Torna alla home</a>
    </footer>`;

  const y = root.querySelector("#year");
  if (y) y.textContent = String(new Date().getFullYear());

  // Collega il pulsante preventivo (site.js espone FGopenQuote)
  root.querySelectorAll(".quote-open").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (window.FGopenQuote) window.FGopenQuote(btn.dataset.service);
    })
  );

  // Reveal per gli elementi aggiunti dopo il caricamento
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
      }, { threshold: 0.16 })
    : null;
  root.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("is-visible")));

  /* ---------------- Lightbox foto ---------------- */
  const box = document.querySelector("#lightbox");
  const img = box.querySelector("#lbImage");
  let idx = 0;

  function render() {
    idx = ((idx % gallery.length) + gallery.length) % gallery.length;
    img.src = gallery[idx];
    img.alt = `${service.title} — foto ${idx + 1}`;
  }
  function open(i) { idx = i; render(); box.hidden = false; document.body.style.overflow = "hidden"; box.querySelector(".lightbox-close").focus(); }
  function close() { box.hidden = true; document.body.style.overflow = ""; }
  function move(d) { idx += d; render(); }

  root.querySelectorAll(".shot").forEach((fig) => {
    const i = Number(fig.dataset.idx);
    fig.addEventListener("click", () => open(i));
    fig.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } });
  });
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
