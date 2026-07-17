# Sito Portfolio — Videomaker &amp; Photographer

Sito statico (HTML/CSS/JS puro, senza build) per un videomaker e fotografo.

## Struttura

- `index.html` — contenuti: hero, carosello, portfolio, contatti, social.
- `styles.css` — layout, tema cinematografico, responsive e reduced-motion.
- `script.js` — carosello "revolver" (9 immagini, 3 visibili, scorrimento infinito), header dinamico, reveal allo scroll.
- `assets/hero/studio-hero.png` — immagine del banner (sostituibile con foto o video).
- `assets/gallery/` — 9 immagini del carosello (placeholder da sostituire).
- `vercel.json` — configurazione per il deploy su Vercel.

## Cosa personalizzare

1. **Foto del carosello** — sostituisci le 9 immagini in `assets/gallery/` mantenendo gli stessi nomi, oppure aggiorna la lista `galleryImages` in `script.js` (src, alt, tag, title).
2. **Banner** — sostituisci `assets/hero/studio-hero.png`. Per usare un **video** al posto della foto, in `index.html` c'è già il markup pronto da scommentare (`<video autoplay muted loop playsinline>`).
3. **Contatti** — in `index.html`, sezione `#contatti`: aggiorna email, telefono e partita IVA.
4. **Social** — nella `social-dock` in fondo a sinistra, inserisci i link reali di Instagram e TikTok.
5. **Nome/brand** — aggiorna "Francesco Garonfolo" nell'header, nell'hero e nel footer.

## Pubblicazione

- **Vercel**: import del repo → deploy automatico (usa `vercel.json`).
- **GitHub Pages**: pubblica dalla branch dei sorgenti, root del progetto.

Nessuna dipendenza da installare: basta aprire `index.html`.
