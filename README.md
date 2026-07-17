# Filmbox

Analoger Film- & Belichtungsberater · Analog film & exposure companion

**Live:** `https://<DEIN-GITHUB-NAME>.github.io/filmboxapp/`
© lightbetweendays · [@light_between_days](https://www.instagram.com/light_between_days) · [lightbetweendays.de](https://www.lightbetweendays.de)

---

## Dateien im Repo (genau diese, nichts weiter nötig)

```
filmboxapp/
├── index.html                 ← Einstiegsseite (lädt React + App)
├── app.jsx                    ← die komplette App (Logik, Datenbank, UI)
├── manifest.webmanifest       ← macht die Seite "installierbar" (Homescreen)
├── README.md                  ← diese Datei
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── apple-touch-icon.png   ← iPhone-Homescreen-Icon
```

Kein Build-Schritt, kein npm — alles läuft direkt im Browser
(React, Tailwind und Babel kommen per CDN).

## Deploy auf GitHub Pages (einmalig, ~3 Minuten)

1. Auf GitHub ein neues Repository **`filmboxapp`** anlegen (Public).
2. Alle Dateien aus diesem Ordner hochladen
   (Web-Oberfläche: *Add file → Upload files*, den ganzen Ordnerinhalt
   inkl. `icons/`-Ordner reinziehen, committen).
3. Im Repo: **Settings → Pages**
   - *Source:* **Deploy from a branch**
   - *Branch:* **main**, Ordner **/(root)** → **Save**
4. Nach 1–2 Minuten ist die App erreichbar unter
   `https://<DEIN-GITHUB-NAME>.github.io/filmboxapp/`

## Auf den iPhone-Homescreen

1. Die URL in **Safari** öffnen (nicht Chrome — nur Safari kann das).
2. **Teilen-Symbol → „Zum Home-Bildschirm"**.
3. Filmbox startet dann im Vollbild wie eine App, mit eigenem Icon.

Android: Chrome → Menü (⋮) → „App installieren" / „Zum Startbildschirm".

## Updates einspielen

Einfach die geänderte Datei (meist `app.jsx`) im Repo ersetzen und
committen — GitHub Pages veröffentlicht automatisch neu.
Eigene angelegte Filme der Nutzer bleiben erhalten (localStorage im Browser).

## Hinweise

- Die App braucht beim ersten Laden Internet (CDN); danach cached der
  Browser die Bibliotheken.
- Eigene Filme & Spracheinstellung werden pro Gerät/Browser gespeichert.
- Richtwerte — ersetzt keine Messung am Motiv.
