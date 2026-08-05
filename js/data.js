"use strict";

/* =========================================================
   DATA LAYER — Mishari
   ---------------------------------------------------------
   - SERVICES: categorie-servizio mostrate in home e nelle
     pagine immersive. Modificabili qui.
   - Firebase (Firestore + Auth): stesso progetto di MasterJobs,
     ma con collection dedicate (prefisso "fg"). Se Firebase non
     e' raggiungibile o le regole non lo permettono, tutto ricade
     automaticamente su localStorage: il sito resta funzionante.
   ========================================================= */

/* ---------------- Categorie / servizi ---------------- */
const SERVICES = [
  {
    slug: "wedding",
    tag: "Film & Photo",
    title: "Wedding",
    cover: "assets/gallery/01-wedding-film.jpg",
    intro:
      "Wedding stories with a cinematic touch: real emotion, rhythm and a tailored care for every detail.",
    operativo:
      "Location scouting and a preliminary call, full-day coverage, a second camera on request, drone footage where allowed. You receive an emotional film and an editorial photo selection.",
    gallery: [
      "assets/gallery/01-wedding-film.jpg",
      "assets/gallery/05-portrait-session.jpg",
      "assets/gallery/08-editorial-photo.jpg",
      "assets/gallery/09-behind-scenes.jpg"
    ]
  },
  {
    slug: "videoclip",
    tag: "Video",
    title: "Music Video",
    cover: "assets/gallery/02-music-video.jpg",
    intro:
      "Visual concepts for artists and creators: idea, direction and post-production at the service of the track.",
    operativo:
      "Concept development, location scouting, dynamic shooting with cinema lenses and dedicated color grading. Formats ready for YouTube and vertical social.",
    gallery: [
      "assets/gallery/02-music-video.jpg",
      "assets/gallery/07-drone-view.jpg",
      "assets/gallery/06-commercial.jpg"
    ]
  },
  {
    slug: "luxury",
    tag: "Photo & Video",
    title: "Luxury",
    cover: "assets/luxury/cover.jpg",
    coverPosition: "92% center",
    intro:
      "Luxury interiors, yachts and exclusive spaces told through clean light, refined detail and a calm editorial rhythm.",
    operativo:
      "A focused visual selection for premium locations: elegant coverage of interiors, outdoor decks, materials and atmosphere, with images ready for portfolio and social presentation.",
    gallery: [
      {
        src: "assets/luxury/detail-03.jpg",
        caption: "Yacht lounge with warm textures, sofa and relaxed composition.",
        layout: "full-wide"
      },
      {
        src: "assets/luxury/detail-01.jpg",
        caption: "Marble bathroom, mirrored light and premium interior detail.",
        layout: "vertical-pair",
        position: "center center"
      },
      {
        src: "assets/luxury/strip/01-vertical.jpg",
        caption: "Illuminated corridor detail.",
        layout: "vertical-pair",
        position: "center center"
      }
    ],
    strip: [
      {
        src: "assets/luxury/detail-02.jpg",
        caption: "Open deck and sea view, soft daylight luxury atmosphere.",
        layout: "landscape"
      },
      {
        src: "assets/luxury/strip/02-deck.jpg",
        caption: "Open yacht deck with marina view.",
        layout: "landscape"
      },
      {
        src: "assets/luxury/strip/03-sea-lounge.jpg",
        caption: "Sea-facing lounge and deck tables.",
        layout: "landscape"
      },
      {
        src: "assets/luxury/strip/04-main-salon.jpg",
        caption: "Bright main salon with soft architectural lighting.",
        layout: "landscape"
      },
      {
        src: "assets/luxury/strip/05-bridge.jpg",
        caption: "Yacht bridge and navigation controls.",
        layout: "landscape"
      },
      {
        src: "assets/luxury/strip/06-controls.jpg",
        caption: "Close control station detail.",
        layout: "landscape"
      },
      {
        src: "assets/luxury/strip/07-window-seat.jpg",
        caption: "Window seat and interior reflections.",
        layout: "landscape"
      },
      {
        src: "assets/luxury/strip/08-side-deck.jpg",
        caption: "Side deck line over the sea.",
        layout: "landscape"
      },
      {
        src: "assets/luxury/strip/09-cabin.jpg",
        caption: "Cabin interior with warm ambient light.",
        layout: "landscape"
      },
      {
        src: "assets/luxury/strip/10-rail-detail.jpg",
        caption: "Rail and sea detail.",
        layout: "landscape"
      }
    ]
  },
  {
    slug: "eventi",
    tag: "Reportage",
    title: "Events",
    cover: "assets/gallery/04-event-reportage.jpg",
    intro:
      "Video and photo reportage for parties, private and corporate events. The memory of the day, beautifully kept.",
    operativo:
      "Discreet, continuous coverage, a fast highlight video and a complete photo selection. Quick delivery for post-event communication.",
    gallery: [
      "assets/gallery/04-event-reportage.jpg",
      "assets/gallery/09-behind-scenes.jpg",
      "assets/gallery/05-portrait-session.jpg"
    ]
  },
  {
    slug: "ritratti",
    tag: "Photo",
    title: "Portraits",
    cover: "assets/gallery/05-portrait-session.jpg",
    intro:
      "Tailored portraits and editorial shoots: light, pose and mood for an image that looks like you.",
    operativo:
      "Mood shared before the shoot, set in studio or outdoors, fine-art selection and retouch. Ideal for personal branding, artists and professionals.",
    gallery: [
      "assets/gallery/05-portrait-session.jpg",
      "assets/gallery/08-editorial-photo.jpg",
      "assets/gallery/01-wedding-film.jpg"
    ]
  },
  {
    slug: "commercial",
    tag: "Video",
    title: "Commercial",
    cover: "assets/gallery/06-commercial.jpg",
    intro:
      "Ads and commercial content for products, services and food. Clean aesthetics, a direct message.",
    operativo:
      "Pre-production, product/food shooting, rhythmic editing and multiple versions for ad channels. Attention to light and texture.",
    gallery: [
      "assets/gallery/06-commercial.jpg",
      "assets/gallery/08-editorial-photo.jpg",
      "assets/gallery/03-brand-story.jpg"
    ]
  },
  {
    slug: "drone",
    tag: "Aerial",
    title: "Drone & Reel",
    cover: "assets/gallery/07-drone-view.jpg",
    intro:
      "Aerial footage and vertical formats ready for Instagram, TikTok and ad campaigns.",
    operativo:
      "Flight planning in permitted areas, stabilized aerial footage, vertical reel editing optimized for the feed.",
    gallery: [
      "assets/gallery/07-drone-view.jpg",
      "assets/gallery/04-event-reportage.jpg",
      "assets/gallery/02-music-video.jpg"
    ]
  },
  {
    slug: "editoriale",
    tag: "Photo",
    title: "Editorial",
    cover: "assets/gallery/08-editorial-photo.jpg",
    intro:
      "Editorial photography, product detail and food styling. Composition and light cared for to the millimeter.",
    operativo:
      "Styling, controlled photo set, still life and detail, color post-production. For menus, catalogues and social.",
    gallery: [
      "assets/gallery/08-editorial-photo.jpg",
      "assets/gallery/06-commercial.jpg",
      "assets/gallery/05-portrait-session.jpg"
    ]
  },
  {
    slug: "backstage",
    tag: "Photo",
    title: "Backstage",
    cover: "assets/gallery/09-behind-scenes.jpg",
    intro:
      "Behind the scenes of sets and productions: the energy of the work, told without filters.",
    operativo:
      "Backstage coverage during the shoot, a photo selection and mini-clips for the project's communication.",
    gallery: [
      "assets/gallery/09-behind-scenes.jpg",
      "assets/gallery/04-event-reportage.jpg",
      "assets/gallery/02-music-video.jpg"
    ]
  }
];

function getService(slug) {
  return SERVICES.find((s) => s.slug === slug) || null;
}

/* ---------------- Collana foto (pagina categoria) ----------------
   10 scatti che scorrono col mouse; clic = ingrandimento + descrizione.
   Placeholder condivisi: sostituisci src/caption (o definisci "strip"
   dentro un SERVICE) con le foto reali della categoria. */
const STRIP_PLACEHOLDER = Array.from({ length: 10 }, (_, i) => ({
  src: `assets/gallery/strip/${String(i + 1).padStart(2, "0")}.jpg`,
  caption: `Untitled — ${String(i + 1).padStart(2, "0")}`
}));

function getStrip(service) {
  return service && Array.isArray(service.strip) && service.strip.length
    ? service.strip
    : STRIP_PLACEHOLDER;
}

/* ---------------- Utility condivise ---------------- */
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatMoney(n) {
  const value = Number(n) || 0;
  return value.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  });
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

/* =========================================================
   STORE — quote requests, clienti, categorie
   localStorage come base sempre funzionante; Firebase come
   sincronizzazione opzionale.
   ========================================================= */
const STORE_KEY = "fgStudioData";

function emptyStore() {
  return {
    quoteRequests: [], // richieste dal form pubblico (inbox / notifiche)
    clients: [],       // { id, name, email, phone, service, categoryId, note, createdAt, quotes:[{id,date,label,amount}] }
    categories: []     // { id, name, color }
  };
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    return { ...emptyStore(), ...parsed };
  } catch {
    return emptyStore();
  }
}

function persistStore(store) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* quota o storage non disponibile: si prosegue in memoria */
  }
}

const Store = {
  data: loadStore(),
  save() {
    persistStore(this.data);
    window.dispatchEvent(new CustomEvent("fg:data-updated"));
  }
};

/* ---------------- Firebase (opzionale) ---------------- */
const firebaseConfig = {
  apiKey: "AIzaSyDVnnoqQz11K8kBcpVsBkSQc3H19QXvqoI",
  authDomain: "sitoweb-2bc26.firebaseapp.com",
  projectId: "sitoweb-2bc26",
  storageBucket: "sitoweb-2bc26.firebasestorage.app",
  messagingSenderId: "245019396411",
  appId: "1:245019396411:web:099bf93f49a1e1e28d8f1e"
};

// Progetto Firebase dedicato a questo sito.
const COL_REQUESTS = "fgQuoteRequests";
const DOC_CLIENTS = { col: "fgStudio", id: "clients" };
const DOC_CATEGORIES = { col: "fgStudio", id: "categories" };

const FB = {
  ready: false,
  app: null,
  db: null,
  auth: null,
  api: null
};

async function initFirebase() {
  try {
    const [{ initializeApp }, firestore, authMod] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js")
    ]);
    FB.app = initializeApp(firebaseConfig, "fgStudio");
    FB.db = firestore.getFirestore(FB.app);
    FB.auth = authMod.getAuth(FB.app);
    FB.api = { ...firestore, ...authMod };
    FB.ready = true;
    return true;
  } catch (err) {
    console.warn("Firebase non disponibile, uso archivio locale.", err);
    FB.ready = false;
    return false;
  }
}

/* ---------------- API pubblica del data layer ---------------- */
const DataLayer = {
  SERVICES,
  getService,
  getStrip,
  STRIP_PLACEHOLDER,
  escapeHtml,
  createId,
  formatMoney,
  formatDate,
  Store,
  FB,
  initFirebase,

  /* -- Invio richiesta preventivo (pubblico) -- */
  async submitQuoteRequest(request) {
    const entry = {
      id: createId("req"),
      status: "new",
      createdAt: new Date().toISOString(),
      ...request
    };
    // Salvataggio locale immediato (fallback sempre valido).
    Store.data.quoteRequests.unshift(entry);
    Store.save();

    // Tentativo di salvataggio online (notifica cross-device come MasterJobs).
    try {
      if (!FB.ready) await initFirebase();
      if (FB.ready) {
        await FB.api.addDoc(FB.api.collection(FB.db, COL_REQUESTS), {
          ...entry,
          source: "fg-web",
          createdAtServer: FB.api.serverTimestamp()
        });
      }
    } catch (err) {
      console.warn("Richiesta salvata solo in locale:", err);
    }
    return entry;
  },

  /* -- Sincronizzazione richieste dal cloud (admin) -- */
  async pullQuoteRequests() {
    try {
      if (!FB.ready) await initFirebase();
      if (!FB.ready) return null;
      const snap = await FB.api.getDocs(FB.api.collection(FB.db, COL_REQUESTS));
      const remote = snap.docs.map((d) => ({ firebaseId: d.id, ...d.data() }));
      // Merge per id, mantenendo lo stato locale (letto/archiviato).
      const byId = new Map(Store.data.quoteRequests.map((r) => [r.id, r]));
      remote.forEach((r) => {
        const existing = byId.get(r.id);
        if (existing) {
          existing.firebaseId = r.firebaseId;
        } else {
          byId.set(r.id, r);
        }
      });
      Store.data.quoteRequests = Array.from(byId.values()).sort((a, b) =>
        String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
      );
      Store.save();
      return Store.data.quoteRequests;
    } catch (err) {
      console.warn("Sync richieste non riuscita:", err);
      return null;
    }
  },

  async deleteQuoteRequest(entry) {
    Store.data.quoteRequests = Store.data.quoteRequests.filter((r) => r.id !== entry.id);
    Store.save();
    try {
      if (FB.ready && entry.firebaseId) {
        await FB.api.deleteDoc(FB.api.doc(FB.db, COL_REQUESTS, entry.firebaseId));
      }
    } catch (err) {
      console.warn("Eliminazione remota non riuscita:", err);
    }
  },

  /* -- Clienti & categorie: persistenza documento unico -- */
  async pushClients() {
    try {
      if (FB.ready && FB.auth?.currentUser) {
        await FB.api.setDoc(
          FB.api.doc(FB.db, DOC_CLIENTS.col, DOC_CLIENTS.id),
          { clients: Store.data.clients, updatedAtServer: FB.api.serverTimestamp() },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn("Salvataggio clienti in cloud non riuscito:", err);
    }
  },

  async pushCategories() {
    try {
      if (FB.ready && FB.auth?.currentUser) {
        await FB.api.setDoc(
          FB.api.doc(FB.db, DOC_CATEGORIES.col, DOC_CATEGORIES.id),
          { categories: Store.data.categories, updatedAtServer: FB.api.serverTimestamp() },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn("Salvataggio categorie in cloud non riuscito:", err);
    }
  },

  async pullClientsAndCategories() {
    try {
      if (!FB.ready) await initFirebase();
      if (!FB.ready) return;
      const [cSnap, catSnap] = await Promise.all([
        FB.api.getDoc(FB.api.doc(FB.db, DOC_CLIENTS.col, DOC_CLIENTS.id)),
        FB.api.getDoc(FB.api.doc(FB.db, DOC_CATEGORIES.col, DOC_CATEGORIES.id))
      ]);
      if (cSnap.exists() && Array.isArray(cSnap.data().clients)) {
        Store.data.clients = cSnap.data().clients;
      }
      if (catSnap.exists() && Array.isArray(catSnap.data().categories)) {
        Store.data.categories = catSnap.data().categories;
      }
      Store.save();
    } catch (err) {
      console.warn("Sync clienti/categorie non riuscita:", err);
    }
  }
};

window.FG = DataLayer;
