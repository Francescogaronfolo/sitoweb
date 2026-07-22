"use strict";

/* =========================================================
   DATA LAYER — Francesco Garonfolo
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
    tag: "Film & Foto",
    title: "Wedding",
    cover: "assets/gallery/01-wedding-film.jpg",
    intro:
      "Racconti di matrimonio con taglio cinematografico: emozione vera, ritmo e una cura sartoriale del dettaglio.",
    operativo:
      "Sopralluogo e call preliminare, copertura dell'intera giornata, seconda camera su richiesta, riprese drone dove consentito. Consegna di un film emozionale e di una selezione fotografica editoriale.",
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
    title: "Videoclip",
    cover: "assets/gallery/02-music-video.jpg",
    intro:
      "Concept visivi per artisti e creator: idea, regia e post-produzione al servizio del brano.",
    operativo:
      "Sviluppo del concept, scouting location, riprese dinamiche con ottiche cinema e color grading dedicato. Formati pronti per YouTube e social verticali.",
    gallery: [
      "assets/gallery/02-music-video.jpg",
      "assets/gallery/07-drone-view.jpg",
      "assets/gallery/06-commercial.jpg"
    ]
  },
  {
    slug: "brand",
    tag: "Video",
    title: "Brand Story",
    cover: "assets/gallery/03-brand-story.jpg",
    intro:
      "Contenuti per aziende e attivita: identita visiva, prodotto e persone raccontati con eleganza.",
    operativo:
      "Analisi del brand, storyboard, riprese in studio o in sede, montaggio e pacchetto di contenuti social. Focus su coerenza estetica e messaggio.",
    gallery: [
      "assets/gallery/03-brand-story.jpg",
      "assets/gallery/06-commercial.jpg",
      "assets/gallery/08-editorial-photo.jpg"
    ]
  },
  {
    slug: "eventi",
    tag: "Reportage",
    title: "Eventi",
    cover: "assets/gallery/04-event-reportage.jpg",
    intro:
      "Reportage video e fotografico per serate, eventi privati e aziendali. La memoria della giornata, curata.",
    operativo:
      "Copertura discreta e continua, highlight video veloce e selezione fotografica completa. Consegna rapida per la comunicazione post-evento.",
    gallery: [
      "assets/gallery/04-event-reportage.jpg",
      "assets/gallery/09-behind-scenes.jpg",
      "assets/gallery/05-portrait-session.jpg"
    ]
  },
  {
    slug: "ritratti",
    tag: "Foto",
    title: "Ritratti",
    cover: "assets/gallery/05-portrait-session.jpg",
    intro:
      "Ritratti e shooting editoriali su misura: luce, posa e atmosfera per un'immagine che ti somiglia.",
    operativo:
      "Mood condiviso prima dello shooting, set in studio o in esterna, selezione e ritocco fine-art. Ideale per personal brand, artisti e professionisti.",
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
      "Spot e contenuti pubblicitari per prodotti, servizi e ristorazione. Estetica pulita, messaggio diretto.",
    operativo:
      "Pre-produzione, riprese prodotto/food, montaggio ritmato e versioni multiple per i canali ADV. Attenzione a luce e materia.",
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
      "Riprese aeree e formati verticali pronti per Instagram, TikTok e campagne ADV.",
    operativo:
      "Pianificazione voli in aree consentite, riprese aeree stabilizzate, montaggio reel verticale ottimizzato per il feed.",
    gallery: [
      "assets/gallery/07-drone-view.jpg",
      "assets/gallery/04-event-reportage.jpg",
      "assets/gallery/02-music-video.jpg"
    ]
  },
  {
    slug: "editoriale",
    tag: "Foto",
    title: "Editoriale",
    cover: "assets/gallery/08-editorial-photo.jpg",
    intro:
      "Fotografia editoriale, dettaglio prodotto e food styling. Composizione e luce curate al millimetro.",
    operativo:
      "Styling, set fotografico controllato, still life e dettaglio, post-produzione cromatica. Per menu, cataloghi e social.",
    gallery: [
      "assets/gallery/08-editorial-photo.jpg",
      "assets/gallery/06-commercial.jpg",
      "assets/gallery/05-portrait-session.jpg"
    ]
  },
  {
    slug: "backstage",
    tag: "Foto",
    title: "Backstage",
    cover: "assets/gallery/09-behind-scenes.jpg",
    intro:
      "Il dietro le quinte di set e produzioni: l'energia del lavoro, raccontata senza filtri.",
    operativo:
      "Copertura backstage durante le riprese, selezione fotografica e mini-clip per la comunicazione del progetto.",
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
  apiKey: "AIzaSyA76c2X0mPs2ybNZrZM05O1hD_pWLrFx9o",
  authDomain: "masterjobs-39de1.firebaseapp.com",
  projectId: "masterjobs-39de1",
  storageBucket: "masterjobs-39de1.firebasestorage.app",
  messagingSenderId: "371668424027",
  appId: "1:371668424027:web:be9df60cfa5a9f42b5f67e"
};

// Collezioni dedicate a questo sito (non toccano i dati di MasterJobs).
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
