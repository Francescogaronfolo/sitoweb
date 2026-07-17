# Sito Portfolio — Videomaker &amp; Photographer

Sito statico (HTML/CSS/JS puro, senza build) per un videomaker e fotografo.

## Struttura

- `index.html` — contenuti: hero, carosello servizi, contatti, social, lightbox.
- `styles.css` — layout, tema cinematografico elegante, responsive e reduced-motion.
- `script.js` — carosello a **scorrimento continuo e lento**, pausa su hover, frecce manuali, **lightbox con gallery per servizio**, header dinamico, reveal allo scroll.
- `assets/hero/studio-hero.png` — immagine del banner (sostituibile con foto o video).
- `assets/gallery/` — immagini del carosello (placeholder da sostituire).
- `vercel.json` — configurazione per il deploy su Vercel.

## Come funziona il carosello

- Le foto scorrono **in modo continuo e lento**, senza scatti.
- Lo scorrimento **si ferma quando passi sopra con il mouse** (o con il focus da tastiera).
- **Clic su una foto** → si apre la **lightbox** che ingrandisce l'immagine e mostra la gallery di quel servizio.
- Le **frecce ai lati** del carosello fanno scorrere manualmente.
- Nella lightbox: frecce/←→ per sfogliare le foto del servizio, `Esc` o clic fuori per chiudere.

## Cosa personalizzare

1. **Servizi e gallery** — in `script.js`, l'array `services` definisce ogni foto del carosello:
   - `cover` — immagine mostrata nel carosello,
   - `tag`, `title`, `desc` — etichetta, titolo e descrizione,
   - `gallery` — **elenco delle foto del servizio** mostrate nella lightbox.
   Per collegare più foto a un servizio (es. tutte le foto di ristorazione), aggiungi i percorsi in `gallery`:
   ```js
   { cover: "assets/gallery/ristorazione/01.jpg", tag: "Foto", title: "Ristorazione",
     desc: "Food photography per menu, social e delivery.",
     gallery: [
       "assets/gallery/ristorazione/01.jpg",
       "assets/gallery/ristorazione/02.jpg",
       "assets/gallery/ristorazione/03.jpg"
     ] }
   ```
   Con più di una foto compaiono automaticamente le frecce e il contatore nella lightbox.
2. **Banner** — sostituisci `assets/hero/studio-hero.png`. Per usare un **video** al posto della foto, in `index.html` c'è già il markup pronto da scommentare (`<video autoplay muted loop playsinline>`).
3. **Contatti** — in `index.html`, sezione `#contatti`: aggiorna email, telefono e partita IVA.
4. **Social** — nella `social-dock` in fondo a sinistra, inserisci i link reali di Instagram e TikTok.
5. **Nome/brand** — aggiorna "Francesco Garonfolo" nell'header, nell'hero e nel footer.

## Pubblicazione

- **Vercel**: import del repo → deploy automatico (usa `vercel.json`).
- **GitHub Pages**: pubblica dalla branch dei sorgenti, root del progetto.

Nessuna dipendenza da installare: basta aprire `index.html`.
