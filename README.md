# Sito Portfolio — Francesco Garonfolo (Videomaker &amp; Photographer)

Sito statico (HTML/CSS/JS puro, senza build) minimale e "photo-first", con
area riservata per notifiche richieste e analisi clienti.

## Pagine

- `index.html` — home minimale: banner ridotto e **vetrina a scorrimento guidato
  dal mouse** (mouse a destra = avanti, a sinistra = indietro, fluido, senza click).
  Ogni foto è la **copertina di una categoria**.
- `category.html?cat=SLUG` — **pagina immersiva** del servizio: hero, galleria
  "collana" asimmetrica (lightbox), descrizione operativa e **contatti** (email +
  telefono, nessun prezzo) con pulsante **Richiedi preventivo**.
- `admin.html` — **area riservata** (accesso dal segnalibro in alto): notifiche
  richieste, clienti, categorie e analisi.

## File

```text
sitoweb/
  index.html            home pubblica
  category.html         pagina categoria immersiva
  admin.html            area riservata
  styles.css            stile base condiviso
  category.css          stile pagina categoria + lightbox
  admin.css             stile area riservata
  js/data.js            dati servizi + data layer (Firebase opzionale + localStorage)
  js/site.js            vetrina a mouse + modale preventivo
  js/category.js        rendering pagina categoria + lightbox
  js/admin.js           login, inbox, clienti, categorie, analisi
  assets/gallery/       immagini delle categorie (placeholder da sostituire)
```

## Personalizzare i servizi

In `js/data.js`, l'array `SERVICES` definisce ogni categoria:

```js
{
  slug: "wedding",              // usato nell'URL: category.html?cat=wedding
  tag: "Film & Foto",
  title: "Wedding",
  cover: "assets/gallery/01-wedding-film.jpg",
  intro: "Frase di presentazione…",
  operativo: "Descrizione di come lavori…",
  gallery: ["assets/gallery/…", "assets/gallery/…"]  // foto della pagina immersiva
}
```

Aggiungi/rimuovi voci o sostituisci le immagini in `assets/gallery/`.
Aggiorna email/telefono in `index.html`, `js/category.js` (blocco contatti) e
`admin.html`.

## Area riservata

Accesso dal **segnalibro** in alto (icona a forma di bookmark) → `admin.html`.

- **Richieste**: le richieste inviate dal form "Richiedi preventivo" arrivano qui
  come notifiche (badge). Da una richiesta puoi creare un cliente con un click.
- **Clienti**: anagrafica con categoria, note e **storico preventivi** (data,
  descrizione, importo) inseriti/modificati manualmente.
- **Categorie**: crea categorie colorate per segmentare i clienti.
- **Analisi**: barra di ricerca (nome cliente, oppure `*categoria` per filtrare
  per categoria), grafici a torta (carico di lavoro e fatturato per categoria) e
  classifiche per **media a preventivo** e **fatturato annuo**, sia per categoria
  sia per singolo cliente. Selettore anno in alto a destra.

### Accesso e sincronizzazione

- **Firebase** (Firestore + Auth): opzionale, riusa lo stesso progetto di
  MasterJobs con collection dedicate (`fgQuoteRequests`, `fgStudio/*`) — non tocca
  i dati di MasterJobs. Con l'accesso email/password le richieste si sincronizzano
  tra dispositivi (come le notifiche di MasterJobs).
- **Solo locale**: se Firebase non è configurato/raggiungibile, tutto funziona con
  `localStorage` sul dispositivo (pulsante "Entra in locale"). Vedi
  `FIREBASE_RULES.md` per abilitare la sincronizzazione online.

## Pubblicazione

- **Vercel**: import del repo → deploy automatico (usa `vercel.json`).
- **GitHub Pages**: pubblica dalla branch dei sorgenti, root del progetto.

Nessuna dipendenza da installare: basta aprire `index.html`.
