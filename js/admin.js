"use strict";

/* =========================================================
   AREA RISERVATA — inbox richieste, clienti, categorie, analisi
   ========================================================= */
const A = window.FG;
const store = A.Store;
const esc = A.escapeHtml;
const money = A.formatMoney;
const fdate = A.formatDate;

const el = (id) => document.getElementById(id);
let selectedClientId = null;
let selectedRequestId = null;

/* ================= AUTH ================= */
async function tryLogin(email, password) {
  const ok = await A.initFirebase();
  if (!ok || !A.FB.api) throw new Error("no-firebase");
  await A.FB.api.signInWithEmailAndPassword(A.FB.auth, email, password);
}

function showConsole(cloud) {
  el("loginView").hidden = true;
  el("consoleView").hidden = false;
  el("logoutLink").hidden = false;
  el("syncState").textContent = cloud ? "● Sincronizzato" : "○ Solo locale";
  el("syncState").classList.toggle("online", !!cloud);
  bootData(cloud);
}

async function bootData(cloud) {
  if (cloud) {
    await Promise.all([A.pullQuoteRequests(), A.pullClientsAndCategories()]);
  }
  renderAll();
}

el("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fb = el("loginFeedback");
  fb.textContent = "Accesso in corso…";
  fb.className = "form-note";
  try {
    await tryLogin(el("admEmail").value.trim(), el("admPass").value);
    fb.textContent = "";
    showConsole(true);
  } catch (err) {
    fb.className = "form-note error";
    fb.textContent =
      err.message === "no-firebase"
        ? "Firebase non raggiungibile. Puoi entrare in locale."
        : "Credenziali non valide.";
  }
});

el("localMode").addEventListener("click", () => showConsole(false));

el("logoutLink").addEventListener("click", async (e) => {
  e.preventDefault();
  try { if (A.FB.ready && A.FB.auth) await A.FB.api.signOut(A.FB.auth); } catch {}
  location.reload();
});

/* ================= TABS ================= */
document.querySelectorAll(".admin-tabs .tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".admin-tabs .tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => { p.classList.remove("active"); p.hidden = true; });
    btn.classList.add("active");
    const panel = el(`tab-${btn.dataset.tab}`);
    panel.hidden = false;
    panel.classList.add("active");
    if (btn.dataset.tab === "analytics") renderAnalytics();
  });
});

/* ================= INBOX ================= */
el("refreshInbox").addEventListener("click", async () => {
  el("refreshInbox").textContent = "…";
  await A.pullQuoteRequests();
  renderInbox();
  el("refreshInbox").textContent = "Aggiorna";
});

function renderInbox() {
  const list = el("inboxList");
  const reqs = store.data.quoteRequests;
  const newCount = reqs.filter((r) => r.status === "new").length;
  el("inboxBadge").textContent = String(newCount);
  el("inboxBadge").classList.toggle("hot", newCount > 0);

  if (!reqs.length) {
    list.innerHTML = `<p class="empty">Nessuna richiesta ricevuta.</p>`;
    el("inboxDetail").innerHTML = "Seleziona una richiesta.";
    return;
  }
  list.innerHTML = reqs
    .map(
      (r) => `
      <button class="inbox-item ${r.id === selectedRequestId ? "sel" : ""} ${r.status === "new" ? "unread" : ""}" data-id="${esc(r.id)}">
        <span class="ii-name">${esc(r.name || "—")}</span>
        <span class="ii-svc">${esc(r.serviceLabel || "Generico")}</span>
        <span class="ii-date">${esc(fdate(r.createdAt))}</span>
      </button>`
    )
    .join("");
  list.querySelectorAll(".inbox-item").forEach((b) =>
    b.addEventListener("click", () => openRequest(b.dataset.id))
  );
}

function openRequest(id) {
  selectedRequestId = id;
  const r = store.data.quoteRequests.find((x) => x.id === id);
  if (!r) return;
  if (r.status === "new") { r.status = "read"; store.save(); }
  renderInbox();
  const detail = el("inboxDetail");
  detail.innerHTML = `
    <div class="detail-head">
      <h3>${esc(r.name || "—")}</h3>
      <span class="pill">${esc(r.serviceLabel || "Generico")}</span>
    </div>
    <dl class="detail-grid">
      <div><dt>Email</dt><dd><a href="mailto:${esc(r.email)}">${esc(r.email || "—")}</a></dd></div>
      <div><dt>Telefono</dt><dd>${esc(r.phone || "—")}</dd></div>
      <div><dt>Data</dt><dd>${esc(fdate(r.createdAt))}</dd></div>
    </div>
    <p class="detail-msg">${esc(r.message || "Nessun messaggio.")}</p>
    <div class="detail-actions">
      <button class="btn btn-primary" id="toClient">Aggiungi ai clienti</button>
      <button class="btn btn-ghost" id="delReq">Elimina</button>
    </div>`;
  el("toClient").addEventListener("click", () => convertToClient(r));
  el("delReq").addEventListener("click", async () => {
    await A.deleteQuoteRequest(r);
    selectedRequestId = null;
    renderInbox();
    el("inboxDetail").innerHTML = "Seleziona una richiesta.";
  });
}

function convertToClient(r) {
  let client = store.data.clients.find(
    (c) => (c.email && c.email === r.email) || c.name.toLowerCase() === (r.name || "").toLowerCase()
  );
  if (!client) {
    client = {
      id: A.createId("cli"),
      name: r.name || "Senza nome",
      email: r.email || "",
      phone: r.phone || "",
      categoryId: "",
      service: r.serviceLabel || "",
      note: r.message || "",
      createdAt: new Date().toISOString(),
      quotes: []
    };
    store.data.clients.push(client);
  }
  store.save();
  A.pushClients();
  selectedClientId = client.id;
  switchTab("clients");
  renderClients();
  openClient(client.id);
}

function switchTab(name) {
  document.querySelector(`.admin-tabs .tab[data-tab="${name}"]`)?.click();
}

/* ================= CLIENTI ================= */
el("newClient").addEventListener("click", () => {
  const client = {
    id: A.createId("cli"),
    name: "Nuovo cliente",
    email: "",
    phone: "",
    categoryId: "",
    service: "",
    note: "",
    createdAt: new Date().toISOString(),
    quotes: []
  };
  store.data.clients.push(client);
  store.save();
  A.pushClients();
  selectedClientId = client.id;
  renderClients();
  openClient(client.id);
});

function renderClients() {
  const list = el("clientList");
  const clients = [...store.data.clients].sort((a, b) => a.name.localeCompare(b.name));
  if (!clients.length) {
    list.innerHTML = `<p class="empty">Nessun cliente.</p>`;
    return;
  }
  list.innerHTML = clients
    .map((c) => {
      const cat = store.data.categories.find((k) => k.id === c.categoryId);
      const total = (c.quotes || []).reduce((s, q) => s + (Number(q.amount) || 0), 0);
      return `
      <button class="client-item ${c.id === selectedClientId ? "sel" : ""}" data-id="${esc(c.id)}">
        <span class="ci-dot" style="background:${cat ? esc(cat.color) : "#555"}"></span>
        <span class="ci-name">${esc(c.name)}</span>
        <span class="ci-total">${money(total)}</span>
      </button>`;
    })
    .join("");
  list.querySelectorAll(".client-item").forEach((b) =>
    b.addEventListener("click", () => openClient(b.dataset.id))
  );
}

function openClient(id) {
  selectedClientId = id;
  const c = store.data.clients.find((x) => x.id === id);
  const detail = el("clientDetail");
  if (!c) { detail.innerHTML = "Seleziona o crea un cliente."; return; }
  renderClients();

  const catOptions =
    `<option value="">Senza categoria</option>` +
    store.data.categories.map((k) => `<option value="${esc(k.id)}" ${k.id === c.categoryId ? "selected" : ""}>${esc(k.name)}</option>`).join("");

  const quotes = (c.quotes || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const total = (c.quotes || []).reduce((s, q) => s + (Number(q.amount) || 0), 0);

  detail.innerHTML = `
    <form class="client-form" id="clientForm">
      <div class="cf-grid">
        <label>Nome<input name="name" value="${esc(c.name)}" /></label>
        <label>Categoria<select name="categoryId">${catOptions}</select></label>
        <label>Email<input name="email" type="email" value="${esc(c.email)}" /></label>
        <label>Telefono<input name="phone" value="${esc(c.phone)}" /></label>
      </div>
      <label>Note<textarea name="note" rows="2">${esc(c.note || "")}</textarea></label>
      <div class="cf-actions">
        <button class="btn btn-primary" type="submit">Salva</button>
        <button class="btn btn-ghost" type="button" id="delClient">Elimina cliente</button>
      </div>
    </form>

    <div class="quotes-block">
      <div class="qb-head">
        <h3>Storico preventivi</h3>
        <span class="qb-total">Totale ${money(total)}</span>
      </div>
      <div class="quotes-list" id="quotesList">
        ${quotes.length ? quotes.map(quoteRow).join("") : `<p class="empty">Nessun preventivo registrato.</p>`}
      </div>
      <form class="quote-add" id="quoteAdd">
        <input type="date" name="date" value="${new Date().toISOString().slice(0, 10)}" required />
        <input type="text" name="label" placeholder="Descrizione (es. Wedding luglio)" />
        <input type="number" name="amount" placeholder="Importo €" min="0" step="1" required />
        <button class="btn btn-primary" type="submit">+ Aggiungi</button>
      </form>
    </div>`;

  el("clientForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    Object.assign(c, { name: d.name.trim() || "Senza nome", email: d.email.trim(), phone: d.phone.trim(), categoryId: d.categoryId, note: d.note.trim() });
    store.save(); A.pushClients();
    renderClients(); openClient(c.id);
    toast("Cliente salvato");
  });

  el("delClient").addEventListener("click", () => {
    if (!confirm(`Eliminare ${c.name}?`)) return;
    store.data.clients = store.data.clients.filter((x) => x.id !== c.id);
    selectedClientId = null;
    store.save(); A.pushClients();
    renderClients();
    el("clientDetail").innerHTML = "Seleziona o crea un cliente.";
  });

  el("quoteAdd").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    if (!d.amount) return;
    c.quotes = c.quotes || [];
    c.quotes.push({ id: A.createId("q"), date: d.date, label: (d.label || "").trim(), amount: Number(d.amount) });
    store.save(); A.pushClients();
    openClient(c.id);
  });

  el("quotesList").querySelectorAll("[data-del]").forEach((b) =>
    b.addEventListener("click", () => {
      c.quotes = c.quotes.filter((q) => q.id !== b.dataset.del);
      store.save(); A.pushClients();
      openClient(c.id);
    })
  );
  el("quotesList").querySelectorAll("[data-edit]").forEach((inp) =>
    inp.addEventListener("change", () => {
      const q = c.quotes.find((x) => x.id === inp.dataset.edit);
      if (!q) return;
      if (inp.dataset.field === "amount") q.amount = Number(inp.value) || 0;
      else q[inp.dataset.field] = inp.value;
      store.save(); A.pushClients();
      renderClients();
    })
  );
}

function quoteRow(q) {
  return `
    <div class="quote-item">
      <input class="qi-date" type="date" value="${esc(q.date)}" data-edit="${esc(q.id)}" data-field="date" />
      <input class="qi-label" type="text" value="${esc(q.label || "")}" data-edit="${esc(q.id)}" data-field="label" placeholder="Descrizione" />
      <input class="qi-amount" type="number" value="${esc(q.amount)}" data-edit="${esc(q.id)}" data-field="amount" />
      <button class="qi-del" type="button" data-del="${esc(q.id)}" aria-label="Elimina">✕</button>
    </div>`;
}

/* ================= CATEGORIE ================= */
el("catForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = el("catName").value.trim();
  if (!name) return;
  store.data.categories.push({ id: A.createId("cat"), name, color: el("catColor").value });
  store.save(); A.pushCategories();
  el("catName").value = "";
  renderCategories();
});

function renderCategories() {
  const wrap = el("catChips");
  const cats = store.data.categories;
  if (!cats.length) { wrap.innerHTML = `<p class="empty">Nessuna categoria. Creane una per segmentare i clienti.</p>`; return; }
  wrap.innerHTML = cats
    .map((k) => {
      const count = store.data.clients.filter((c) => c.categoryId === k.id).length;
      return `
      <div class="cat-chip" style="--c:${esc(k.color)}">
        <span class="cc-dot"></span>
        <input class="cc-name" value="${esc(k.name)}" data-id="${esc(k.id)}" />
        <span class="cc-count">${count} clienti</span>
        <button class="cc-del" data-del="${esc(k.id)}" aria-label="Elimina categoria">✕</button>
      </div>`;
    })
    .join("");
  wrap.querySelectorAll(".cc-name").forEach((inp) =>
    inp.addEventListener("change", () => {
      const k = store.data.categories.find((x) => x.id === inp.dataset.id);
      if (k) { k.name = inp.value.trim() || k.name; store.save(); A.pushCategories(); renderCategories(); }
    })
  );
  wrap.querySelectorAll(".cc-del").forEach((b) =>
    b.addEventListener("click", () => {
      if (!confirm("Eliminare la categoria? I clienti resteranno senza categoria.")) return;
      store.data.clients.forEach((c) => { if (c.categoryId === b.dataset.del) c.categoryId = ""; });
      store.data.categories = store.data.categories.filter((x) => x.id !== b.dataset.del);
      store.save(); A.pushCategories(); A.pushClients();
      renderCategories();
    })
  );
}

/* ================= ANALISI ================= */
const UNCAT = { id: "", name: "Senza categoria", color: "#6b6b6b" };

function yearsWithData() {
  const set = new Set();
  store.data.clients.forEach((c) => (c.quotes || []).forEach((q) => {
    const y = String(q.date || "").slice(0, 4);
    if (y) set.add(y);
  }));
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

function availableYears() {
  const set = new Set(yearsWithData());
  set.add(String(new Date().getFullYear()));
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

function currentYear() {
  const v = el("yearSelect").value;
  return v || String(new Date().getFullYear());
}

function quotesInScope(client, year) {
  const qs = client.quotes || [];
  if (year === "all") return qs;
  return qs.filter((q) => String(q.date || "").startsWith(year));
}

function categoryOf(client) {
  return store.data.categories.find((k) => k.id === client.categoryId) || UNCAT;
}

function computeCategoryStats(year) {
  const map = new Map(); // catId -> {cat, count, total}
  const ensure = (cat) => {
    if (!map.has(cat.id)) map.set(cat.id, { cat, count: 0, total: 0, clients: new Set() });
    return map.get(cat.id);
  };
  store.data.clients.forEach((c) => {
    const cat = categoryOf(c);
    const rec = ensure(cat);
    quotesInScope(c, year).forEach((q) => { rec.count += 1; rec.total += Number(q.amount) || 0; });
    if (quotesInScope(c, year).length) rec.clients.add(c.id);
  });
  return Array.from(map.values())
    .map((r) => ({ ...r, avg: r.count ? r.total / r.count : 0 }))
    .filter((r) => r.count > 0);
}

function computeClientStats(year) {
  return store.data.clients
    .map((c) => {
      const qs = quotesInScope(c, year);
      const total = qs.reduce((s, q) => s + (Number(q.amount) || 0), 0);
      return { client: c, cat: categoryOf(c), count: qs.length, total, avg: qs.length ? total / qs.length : 0 };
    })
    .filter((r) => r.count > 0);
}

function renderAnalytics() {
  // popola anni una sola volta / se cambia
  const sel = el("yearSelect");
  const years = availableYears();
  const wanted = years.concat(["all"]);
  if (sel.options.length !== wanted.length) {
    sel.innerHTML = years.map((y) => `<option value="${y}">${y}</option>`).join("") + `<option value="all">Tutti gli anni</option>`;
    // default sull'anno più recente che contiene dati (o anno corrente)
    const withData = yearsWithData();
    sel.value = withData[0] || years[0];
  }
  const year = currentYear();

  const catStats = computeCategoryStats(year);
  const cliStats = computeClientStats(year);

  // KPI
  const totalRevenue = catStats.reduce((s, r) => s + r.total, 0);
  const totalQuotes = catStats.reduce((s, r) => s + r.count, 0);
  const topCat = [...catStats].sort((a, b) => b.total - a.total)[0];
  el("kpiRow").innerHTML = [
    kpi("Fatturato", money(totalRevenue), year === "all" ? "tutti gli anni" : `anno ${year}`),
    kpi("Preventivi", String(totalQuotes), "totale registrati"),
    kpi("Clienti attivi", String(cliStats.length), "con almeno 1 preventivo"),
    kpi("Categoria top", topCat ? esc(topCat.cat.name) : "—", topCat ? money(topCat.total) : "")
  ].join("");

  // Grafici a torta
  drawPie(el("chartWork"), catStats.map((r) => ({ value: r.count, color: r.cat.color, label: r.cat.name })));
  renderLegend(el("legendWork"), catStats.map((r) => ({ color: r.cat.color, label: r.cat.name, val: `${r.count} prev.` })));
  drawPie(el("chartRevenue"), catStats.map((r) => ({ value: r.total, color: r.cat.color, label: r.cat.name })));
  renderLegend(el("legendRevenue"), catStats.map((r) => ({ color: r.cat.color, label: r.cat.name, val: money(r.total) })));

  // Ranking
  rank(el("rankCatAvg"), [...catStats].sort((a, b) => b.avg - a.avg), (r) => r.cat.name, (r) => money(r.avg), (r) => r.cat.color);
  rank(el("rankCatYear"), [...catStats].sort((a, b) => b.total - a.total), (r) => r.cat.name, (r) => money(r.total), (r) => r.cat.color);
  rank(el("rankCliAvg"), [...cliStats].sort((a, b) => b.avg - a.avg), (r) => r.client.name, (r) => money(r.avg), (r) => r.cat.color);
  rank(el("rankCliYear"), [...cliStats].sort((a, b) => b.total - a.total), (r) => r.client.name, (r) => money(r.total), (r) => r.cat.color);

  // datalist hints: nomi clienti + *categorie
  el("searchHints").innerHTML =
    store.data.clients.map((c) => `<option value="${esc(c.name)}">`).join("") +
    store.data.categories.map((k) => `<option value="*${esc(k.name)}">`).join("");

  runSearch();
}

el("yearSelect").addEventListener("change", renderAnalytics);
el("searchBox").addEventListener("input", runSearch);

function runSearch() {
  const raw = el("searchBox").value.trim();
  const year = currentYear();
  let results = [];
  if (raw.startsWith("*")) {
    const catName = raw.slice(1).trim().toLowerCase();
    results = store.data.clients.filter((c) => categoryOf(c).name.toLowerCase().includes(catName) && catName);
    if (!catName) results = store.data.clients;
  } else if (raw) {
    results = store.data.clients.filter((c) => c.name.toLowerCase().includes(raw.toLowerCase()));
  } else {
    results = store.data.clients;
  }

  const box = el("searchResults");
  if (!results.length) { box.innerHTML = `<p class="empty">Nessun cliente corrisponde alla ricerca.</p>`; return; }

  box.innerHTML = results
    .map((c) => {
      const cat = categoryOf(c);
      const qs = quotesInScope(c, year);
      const total = qs.reduce((s, q) => s + (Number(q.amount) || 0), 0);
      const avg = qs.length ? total / qs.length : 0;
      const allTotal = (c.quotes || []).reduce((s, q) => s + (Number(q.amount) || 0), 0);
      const history = (c.quotes || [])
        .slice()
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .map((q) => `<li><span>${esc(fdate(q.date))}</span><span>${esc(q.label || "—")}</span><strong>${money(q.amount)}</strong></li>`)
        .join("");
      return `
      <article class="result-card">
        <div class="rc-head">
          <span class="ci-dot" style="background:${esc(cat.color)}"></span>
          <h3>${esc(c.name)}</h3>
          <span class="rc-cat">${esc(cat.name)}</span>
          <button class="btn btn-ghost rc-open" data-open="${esc(c.id)}">Apri scheda</button>
        </div>
        <div class="rc-metrics">
          <div><span>Fatturato ${year === "all" ? "totale" : year}</span><strong>${money(total)}</strong></div>
          <div><span>Media / preventivo</span><strong>${money(avg)}</strong></div>
          <div><span>Preventivi (${year === "all" ? "tutti" : year})</span><strong>${qs.length}</strong></div>
          <div><span>Storico totale</span><strong>${money(allTotal)}</strong></div>
        </div>
        <ul class="rc-history">${history || "<li>Nessun preventivo</li>"}</ul>
      </article>`;
    })
    .join("");
  box.querySelectorAll(".rc-open").forEach((b) =>
    b.addEventListener("click", () => { switchTab("clients"); openClient(b.dataset.open); })
  );
}

/* ---- helpers UI analisi ---- */
function kpi(label, value, sub) {
  return `<div class="kpi"><span class="kpi-label">${esc(label)}</span><strong class="kpi-value">${value}</strong><span class="kpi-sub">${esc(sub)}</span></div>`;
}

function rank(container, rows, nameFn, valFn, colorFn) {
  if (!rows.length) { container.innerHTML = `<p class="empty">Nessun dato.</p>`; return; }
  container.innerHTML = rows
    .slice(0, 6)
    .map((r, i) => `
      <div class="rank-item">
        <span class="rk-pos">${i + 1}</span>
        <span class="rk-dot" style="background:${esc(colorFn(r))}"></span>
        <span class="rk-name">${esc(nameFn(r))}</span>
        <strong class="rk-val">${valFn(r)}</strong>
      </div>`)
    .join("");
}

function renderLegend(container, items) {
  if (!items.length) { container.innerHTML = ""; return; }
  container.innerHTML = items
    .map((it) => `<span class="lg-item"><span class="lg-dot" style="background:${esc(it.color)}"></span>${esc(it.label)} · ${esc(it.val)}</span>`)
    .join("");
}

function drawPie(canvas, segments) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 8, inner = r * 0.56;
  const total = segments.reduce((s, seg) => s + (seg.value || 0), 0);
  if (total <= 0) {
    ctx.fillStyle = "rgba(244,239,230,0.4)";
    ctx.font = "16px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Nessun dato", cx, cy);
    return;
  }
  let start = -Math.PI / 2;
  segments.forEach((seg) => {
    const angle = ((seg.value || 0) / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = seg.color || "#888";
    ctx.fill();
    start += angle;
  });
  // foro centrale (donut)
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fillStyle = "#131413";
  ctx.fill();
  ctx.fillStyle = "rgba(244,239,230,0.9)";
  ctx.font = "600 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(segments.length), cx, cy - 8);
  ctx.fillStyle = "rgba(169,161,150,0.9)";
  ctx.font = "11px Inter, sans-serif";
  ctx.fillText("categorie", cx, cy + 12);
}

/* ================= TOAST ================= */
let toastTimer = null;
function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

/* ================= RENDER GLOBALE ================= */
function renderAll() {
  renderInbox();
  renderClients();
  renderCategories();
}

// aggiorna badge inbox se i dati cambiano altrove
window.addEventListener("fg:data-updated", () => {
  const badge = el("inboxBadge");
  if (badge) {
    const n = store.data.quoteRequests.filter((r) => r.status === "new").length;
    badge.textContent = String(n);
    badge.classList.toggle("hot", n > 0);
  }
});
