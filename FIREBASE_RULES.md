# Firebase — sincronizzazione opzionale

Il sito funziona **senza Firebase** (dati in `localStorage`). Firebase serve solo
per far arrivare le richieste di preventivo come **notifiche su più dispositivi**
e per sincronizzare clienti/categorie tra i dispositivi dell'admin.

Si riusa lo stesso progetto di **MasterJobs** (`js/data.js`), ma con collection
dedicate, così i dati dei due siti restano separati:

- `fgQuoteRequests` — richieste inviate dal form pubblico (create senza login)
- `fgStudio/clients` — anagrafica clienti (solo admin)
- `fgStudio/categories` — categorie clienti (solo admin)

## Regole Firestore da aggiungere

Aggiungi questi blocchi alle regole esistenti del progetto (prima del blocco
finale `match /{document=**}`):

```js
// --- Sito Francesco Garonfolo ---
match /fgQuoteRequests/{document} {
  allow create: if true;                 // il pubblico può inviare richieste
  allow read, delete: if request.auth != null;
  allow update: if false;
}

match /fgStudio/{document} {
  allow read, write: if request.auth != null;  // solo admin loggato
}
```

## Attivazione

1. In **Authentication** crea l'utente admin (Email/Password): sono le credenziali
   usate in `admin.html`.
2. Pubblica le regole qui sopra.
3. Verifica: invia una richiesta dal form pubblico → deve comparire nella scheda
   **Richieste** dopo il login admin (pulsante **Aggiorna**).

Senza queste regole (o senza login) l'area riservata resta comunque utilizzabile
in **modalità locale**: i dati vengono salvati solo sul dispositivo corrente.

> Nota sicurezza: essendo un sito statico, la "modalità locale" è pensata per
> l'uso sul dispositivo del titolare. Per un accesso realmente protetto, usa il
> login Firebase e le regole sopra.
