# Firebase — configurazione (progetto dedicato `sitoweb-2bc26`)

Il sito funziona **anche senza Firebase** (dati in `localStorage`). Firebase serve
per far arrivare le richieste di preventivo come **notifiche su più dispositivi** e
per sincronizzare clienti/categorie/analisi tra i dispositivi dell'admin.

La configurazione è già inserita in `js/data.js` (progetto `sitoweb-2bc26`).

## Collezioni usate

- `fgQuoteRequests` — richieste inviate dal form pubblico (create senza login)
- `fgStudio/clients` — anagrafica clienti (solo admin)
- `fgStudio/categories` — categorie clienti (solo admin)

## Regole Firestore (modalità produzione)

In **Firestore Database → Regole (Rules)**, incolla TUTTO questo e premi
**Pubblica**:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Richieste dal form pubblico: chiunque può inviarle,
    // solo l'admin loggato può leggerle/eliminarle.
    match /fgQuoteRequests/{document} {
      allow create: if true;
      allow read, delete: if request.auth != null;
      allow update: if false;
    }

    // Clienti, categorie: solo admin loggato.
    match /fgStudio/{document} {
      allow read, write: if request.auth != null;
    }

    // Tutto il resto: negato.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Passaggi in Console Firebase

1. **Authentication** → *Sign-in method* → abilita **Email/Password**.
2. **Authentication** → *Users* → *Add user*: crea email + password dell'admin
   (sono le credenziali del login in `admin.html`).
3. **Firestore Database** → *Crea database* → **Avvia in modalità di produzione**
   → scegli una *location* (es. `eur3` Europa) → *Attiva*.
4. **Firestore Database** → *Regole* → incolla le regole qui sopra → *Pubblica*.
5. Verifica: invia una richiesta dal form pubblico → dopo il login admin (scheda
   **Richieste**, pulsante **Aggiorna**) deve comparire.

## Nota sull'errore "billing" alla creazione di Firestore

Se durante la creazione del database compare *"This API method requires billing
to be enabled"*:

- Firestore ha un **piano gratuito (Spark)** con quote ampie: per un sito come
  questo **non paghi nulla**.
- Il messaggio compare spesso perché il progetto non ha ancora un account di
  fatturazione collegato. Opzioni:
  1. **Attendi qualche minuto e riprova** (a volte è temporaneo), oppure prova a
     scegliere una *location* diversa.
  2. Se persiste, passa al piano **Blaze**: mantiene **le stesse quote gratuite**
     (paghi solo se superi i limiti gratuiti, cosa improbabile per questo sito) ma
     richiede una carta. È la via ufficiale consigliata da Google per i progetti
     nuovi.

Finché Firestore non è attivo, l'area riservata resta utilizzabile in **modalità
locale** (pulsante "Entra in locale"): i dati restano solo sul dispositivo.
