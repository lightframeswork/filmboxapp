const { useState, useEffect, useMemo } = React;

/* ================================================================
   FILMBOX — Analoger Film- & Belichtungsberater / Analog film &
   exposure companion. UI: DE/EN toggle · Code: English
   ================================================================ */

const EI_STEPS = [6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400, 8000, 10000, 12800];

const C = {
  paper: "#EFEAE0", card: "#F9F6EF", ink: "#211D17", muted: "#7B7263",
  line: "#D9D2C2", film: "#17130E", amber: "#D98E2B", amberDeep: "#B06F14",
  oxblood: "#8C3226", red: "#A32014", green: "#4A6B3A",
};

const TYPE_SHORT = { c41: "C-41", bw: "S/W", ecn2: "ECN-2", e6: "E-6" };

/* ---------- UI strings ---------- */

const L = {
  de: {
    subtitle: "Analoger Film- & Belichtungsberater",
    s1: "Film", s2: "Belichtungsindex (ISO-Rad)", s3: "Objektiv & Verschluss", s4: "Licht-Check",
    typeLabel: { c41: "Farbnegativ (C-41)", bw: "Schwarzweiß", ecn2: "Kinofilm (ECN-2)", e6: "Diafilm (E-6)" },
    bwShort: "S/W", all: "ALLE",
    search: "Suchen …", noHit: "Kein Treffer. Lege den Film unten selbst an.",
    own: "eigener", addFilm: "+ Eigenen Film anlegen", closeForm: "− Formular schließen",
    brand: "Marke", name: "Name", boxIso: "Box ISO",
    cbTolerant: "Verzeiht Überbelichtung gut (typisch Farbnegativ)",
    cbPush: "Push-geeignet (Labor-Push sinnvoll möglich)",
    cbContrast: "Kontrastreich / geringe Latitude (präzise messen)",
    cbRemjet: "Hat Remjet-Schicht (→ nur ECN-2!)",
    cbTungsten: "Kunstlicht-abgestimmt (Tungsten „T“)",
    devPh: "Wie entwickelst du? (optional, z. B. „Rodinal 1+50, 11 min“)",
    derived: (o, p, a, b) => `Abgeleitete Tendenz: Überbelichtung bis +${o} · Push bis +${p} · EI-Bereich ${a}–${b}`,
    saveFilm: "Film speichern", sessionOnly: " (nur diese Sitzung)",
    remjetBox: "Remjet: Dieser Film darf niemals in die C-41-Maschine — die Rußschicht ruiniert Chemie & Fremdfilme. Nur ECN-2, ausdrücklich deklarieren.",
    tungstenBox: "Tungsten: Farblich auf Kunstlicht (~3200 K) abgestimmt. Bei Tageslicht: 85B-Filter (kostet ⅔ Blende → EI entsprechend senken) oder Blaustich im Scan korrigieren.",
    setDial: "AM RAD EINSTELLEN", box: "Box", over: "über", under: "unter",
    labNote: "LABOR-ZETTEL", copy: "Notiz kopieren", copied: "✓ Kopiert",
    camera: "Kamera", focal: "Brennweite", focalUnit: "mm", aperture: "Blende",
    maxSpeed: "SCHNELLSTE ZEIT", maxSpeedHint: "Steht auf dem Zeitenrad deiner Kamera (Leica M: 1/1000, viele SLR: 1/2000–1/8000). Bestimmt, wann es bei Offenblende „zu hell“ wird.",
    meterlessBox: "Diese Kamera hat keinen Belichtungsmesser — der Licht-Check unten ersetzt ihn (Sunny-16-Logik).",
    lights: [
      "Pralle Sonne", "Leicht bewölkt", "Bedeckt", "Tiefer Schatten / Dämmerung",
      "Heller Innenraum", "Innenraum abends", "Nachtstraße, hell", "Nacht, schwach",
    ],
    gives: "ERGIBT", at: "bei",
    tooBright: (d, a) => `Zu hell für 1/${d} bei f/${a}.`,
    handOk: (f) => `Aus der Hand sicher (Faustregel: nicht länger als 1/${f} beim ${f}er).`,
    handEdge: "Grenzwertig — mit Technik machbar (anlehnen, ausatmen, mehrfach auslösen). Bewegte Motive verwischen.",
    handBad: "Verwacklungsgefahr — so nicht aus der Hand.",
    tooDark: (s) => `Länger als ${s} → B + Stativ.`,
    options: "DEINE OPTIONEN — PRÄZISE", metering: "MESSEN",
    optOpen: (a, s) => `Blende auf f/${a} öffnen → ${s} (weniger Schärfentiefe).`,
    optPush: (ei, p, s, a) => `EI ${ei} einstellen + Labor „Push +${p}“ → ${s} bei f/${a}. Gilt für die GANZE Rolle — vorher entscheiden!`,
    optUnderOk: "Einzelbild bewusst 1 Blende knapper belichten (Zeit eine Stufe kürzer): bei diesem Film noch brauchbar — dunklere Schatten, etwas mehr Korn.",
    optUnderBad: "Bewusste Unterbelichtung ist bei diesem Film kritisch — lieber vermeiden.",
    optBrace: "Anlehnen/auflegen, ausatmen, 2–3 Auslösungen — eine M ohne Spiegelschlag schafft oft eine Stufe unter der Faustregel.",
    optFilm: "Grundsatz: Für dieses Licht ist ein empfindlicherer Film die richtige Antwort (Entscheidung beim Einlegen).",
    optClose: (a) => `Blende auf f/${a} schließen — dann liegt die Zeit im Bereich der Kamera.`,
    optNd: (a) => `Selbst bei f/${a} zu hell → ND-Filter nötig.`,
    delCustom: (n) => `Eigene Filme löschen (${n})`,
    tapClose: "TIPPEN ZUM SCHLIESSEN",
    exTitle: "Konkretes Beispiel",
    tipLabel: "FILM-TIPP",
    delCustomHint: "",
    footer: "Richtwerte — ersetzt keine Messung am Motiv. Push/Pull gilt immer für die ganze Rolle.",
  },
  en: {
    subtitle: "Analog film & exposure companion",
    s1: "Film", s2: "Exposure index (ISO dial)", s3: "Lens & shutter", s4: "Light check",
    typeLabel: { c41: "Color negative (C-41)", bw: "Black & white", ecn2: "Cine film (ECN-2)", e6: "Slide film (E-6)" },
    bwShort: "B&W", all: "ALL",
    search: "Search …", noHit: "No match. Add the film yourself below.",
    own: "custom", addFilm: "+ Add your own film", closeForm: "− Close form",
    brand: "Brand", name: "Name", boxIso: "Box ISO",
    cbTolerant: "Handles overexposure well (typical color negative)",
    cbPush: "Push-friendly (lab push works well)",
    cbContrast: "Contrasty / narrow latitude (meter precisely)",
    cbRemjet: "Has remjet layer (→ ECN-2 only!)",
    cbTungsten: "Tungsten-balanced (“T”)",
    devPh: "How do you develop it? (optional, e.g. “Rodinal 1+50, 11 min”)",
    derived: (o, p, a, b) => `Derived tendency: overexposure up to +${o} · push up to +${p} · EI range ${a}–${b}`,
    saveFilm: "Save film", sessionOnly: " (this session only)",
    remjetBox: "Remjet: never let this film near a C-41 machine — the carbon layer ruins the chemistry and other people's films. ECN-2 only, declare it explicitly.",
    tungstenBox: "Tungsten: color-balanced for artificial light (~3200 K). In daylight: use an 85B filter (costs ⅔ stop → lower the EI accordingly) or correct the blue cast in the scan.",
    setDial: "SET ON THE DIAL", box: "Box", over: "over", under: "under",
    labNote: "LAB NOTE", copy: "Copy note", copied: "✓ Copied",
    camera: "Camera", focal: "Focal length", focalUnit: "mm", aperture: "Aperture",
    maxSpeed: "FASTEST SPEED", maxSpeedHint: "Printed on your camera's shutter dial (Leica M: 1/1000, many SLRs: 1/2000–1/8000). Determines when it gets “too bright” at wide apertures.",
    meterlessBox: "This camera has no light meter — the light check below stands in for it (Sunny-16 logic).",
    lights: [
      "Bright sun", "Slightly cloudy", "Overcast", "Deep shade / dusk",
      "Bright interior", "Interior, evening", "Night street, bright", "Night, dim",
    ],
    gives: "GIVES", at: "at",
    tooBright: (d, a) => `Too bright for 1/${d} at f/${a}.`,
    handOk: (f) => `Safe handheld (rule of thumb: no slower than 1/${f} with a ${f}mm lens).`,
    handEdge: "Borderline — doable with technique (brace, exhale, fire 2–3 frames). Moving subjects will blur.",
    handBad: "Camera-shake territory — not handheld like this.",
    tooDark: (s) => `Slower than ${s} → B + tripod.`,
    options: "YOUR OPTIONS — PRECISE", metering: "METERING",
    optOpen: (a, s) => `Open the aperture to f/${a} → ${s} (less depth of field).`,
    optPush: (ei, p, s, a) => `Set EI ${ei} + tell the lab “push +${p}” → ${s} at f/${a}. Applies to the WHOLE roll — decide before shooting!`,
    optUnderOk: "Deliberately underexpose a single frame by 1 stop (one shutter step faster): still usable on this film — darker shadows, a bit more grain.",
    optUnderBad: "Deliberate underexposure is risky on this film — better avoid it.",
    optBrace: "Lean on something, exhale, fire 2–3 frames — an M without mirror slap often gains you a stop below the rule of thumb.",
    optFilm: "Principle: for this light, a faster film is the real answer (a decision you make when loading).",
    optClose: (a) => `Stop down to f/${a} — that brings the time back into the camera's range.`,
    optNd: (a) => `Too bright even at f/${a} → you need an ND filter.`,
    delCustom: (n) => `Delete custom films (${n})`,
    tapClose: "TAP TO CLOSE",
    exTitle: "Concrete example",
    tipLabel: "FILM TIP",
    delCustomHint: "",
    footer: "Guide values — no substitute for metering the scene. Push/pull always applies to the whole roll.",
  },
};

/* ---------- metering advice ---------- */

const METER_DEFAULT = {
  c41: { de: "Auf die Schatten messen — Farbnegativ hält Lichter locker; wichtig ist, dass die dunklen Partien genug Licht bekommen.", en: "Meter for the shadows — color negative holds highlights easily; what matters is giving the dark areas enough light." },
  ecn2: { de: "Auf die Schatten messen — Kinofilm-Negativ hält Lichter sehr weit.", en: "Meter for the shadows — cine negative holds highlights very far." },
  bw: { de: "Auf die Schatten messen, in denen du noch Zeichnung willst — Lichter regelt die Entwicklung.", en: "Meter for the shadows where you still want detail — development takes care of the highlights." },
  e6: { de: "Auf die LICHTER messen! Dia frisst helle Stellen unwiederbringlich aus.", en: "Meter for the HIGHLIGHTS! Slide film burns bright areas irrecoverably." },
};

/* ---------- film database ---------- */
/* overTol: pleasant overexposure tolerance in stops; underTol: how much
   deliberate underexposure a single frame survives; pushMax: sensible lab push */

const FILMS = [
  // --- C-41 color negative ---
  { id: "gold200", brand: "Kodak", name: "Gold 200", type: "c41", box: 200, recEI: 100, eiMin: 50, eiMax: 800, overTol: 3, underTol: 0.7, pushMax: 2,
    tip: { de: "Der Klassiker. Verträgt Überbelichtung locker – EI 100 ist der Standard-Trick für weiche Pastellfarben und offene Schatten.", en: "The classic. Shrugs off overexposure – EI 100 is the standard trick for soft pastel colors and open shadows." } },
  { id: "fujicolor200", brand: "Fujifilm", name: "Fujicolor 200", type: "c41", box: 200, recEI: 100, eiMin: 50, eiMax: 800, overTol: 3, underTol: 0.7, pushMax: 2,
    tip: { de: "Sehr wahrscheinlich baugleich mit Kodak Gold 200 (identische Kennlinien). Gleiches Verhalten: EI 100 für den weichen +1-Look.", en: "Very likely identical to Kodak Gold 200 (matching curves). Same behavior: EI 100 for the soft +1 look." } },
  { id: "colorplus200", brand: "Kodak", name: "ColorPlus 200", type: "c41", box: 200, recEI: 125, eiMin: 50, eiMax: 400, overTol: 2.5, underTol: 0.5, pushMax: 1,
    tip: { de: "Günstiger Einstieg, wärmere Farben, etwas gröberes Korn. +1 über verkraftet er gut, Unterbelichtung weniger.", en: "Budget entry, warmer colors, slightly coarser grain. Takes +1 over well, underexposure less so." } },
  { id: "ultramax400", brand: "Kodak", name: "UltraMax 400", type: "c41", box: 400, recEI: 200, eiMin: 100, eiMax: 1600, overTol: 3, underTol: 0.7, pushMax: 2,
    tip: { de: "Vielseitiger Consumer-400er. EI 200 für satte Schatten; abends bleibt Reserve.", en: "Versatile consumer 400. EI 200 for rich shadows; keeps reserve for the evening." } },
  { id: "portra160", brand: "Kodak", name: "Portra 160", type: "c41", box: 160, recEI: 100, eiMin: 50, eiMax: 640, overTol: 3.5, underTol: 0.7, pushMax: 1,
    tip: { de: "Feinstes Korn der Portra-Reihe, gebaut für viel Licht. +1 bis +2 über bleibt völlig sauber.", en: "Finest grain of the Portra line, built for plenty of light. +1 to +2 over stays perfectly clean." } },
  { id: "portra400", brand: "Kodak", name: "Portra 400", type: "c41", box: 400, recEI: 200, eiMin: 50, eiMax: 3200, overTol: 4, underTol: 1, pushMax: 2,
    tip: { de: "Der Latitude-König: verträgt +3 über ohne Murren. Push auf 800–1600 funktioniert erstaunlich gut.", en: "The latitude king: takes +3 over without complaint. Pushing to 800–1600 works surprisingly well." } },
  { id: "portra800", brand: "Kodak", name: "Portra 800", type: "c41", box: 800, recEI: 500, eiMin: 200, eiMax: 3200, overTol: 3, underTol: 1, pushMax: 2,
    tip: { de: "Für wenig Licht gebaut. Push +1/+2 möglich, das Korn bleibt dabei zivil.", en: "Built for low light. Push +1/+2 possible, grain stays civil." } },
  { id: "ektar100", brand: "Kodak", name: "Ektar 100", type: "c41", box: 100, recEI: 100, eiMin: 50, eiMax: 200, overTol: 1.5, underTol: 0.3, pushMax: 1,
    tip: { de: "Dia-artige Sättigung, aber kleinere Latitude als Portra. Präzise messen – Unterbelichtung kippt schnell ins Bläuliche.", en: "Slide-like saturation but narrower latitude than Portra. Meter precisely – underexposure quickly shifts blue." } },
  { id: "cinestill400d", brand: "CineStill", name: "400D", type: "c41", box: 400, recEI: 250, eiMin: 100, eiMax: 1600, overTol: 2.5, underTol: 0.7, pushMax: 2,
    tip: { de: "Vision3 250D ohne Remjet, für C-41 vorbereitet. Weiche Farben, leichte Halos an Lichtquellen. Push bis +2 ordentlich.", en: "Vision3 250D without remjet, prepped for C-41. Soft colors, slight halos around light sources. Pushes to +2 decently." } },
  { id: "cinestill800t", brand: "CineStill", name: "800T", type: "c41", box: 800, recEI: 500, eiMin: 200, eiMax: 3200, overTol: 2, underTol: 1, pushMax: 2, flags: { tungsten: true },
    tip: { de: "Vision3 500T ohne Remjet: markante rote Halos an Lichtern. Kunstlicht-Film – bei Tageslicht 85B-Filter oder Blaustich einplanen.", en: "Vision3 500T without remjet: signature red halos around lights. Tungsten film – in daylight use an 85B filter or expect a blue cast." } },
  { id: "xp2", brand: "Ilford", name: "XP2 Super 400", type: "c41", box: 400, recEI: 400, eiMin: 50, eiMax: 800, overTol: 3, underTol: 1, pushMax: 0, flags: { c41only: true },
    tip: { de: "S/W-Film für den C-41-Prozess (nicht in S/W-Chemie!). Enorm flexibel: EI 50–800 auf derselben Rolle, ganz ohne Push.", en: "B&W film for the C-41 process (not B&W chemistry!). Hugely flexible: EI 50–800 on the same roll, no push at all." } },
  { id: "phoenix2", brand: "Harman", name: "Phoenix II 200", type: "c41", box: 200, recEI: 160, eiMin: 100, eiMax: 400, overTol: 1, underTol: 0.3, pushMax: 1,
    tip: { de: "Harmans eigene Farbemulsion, 2. Generation (2025): charaktervoll, kräftige Farben, kleine Latitude – Schatten laufen schnell zu. Reichlich, aber präzise belichten.", en: "Harman's own color emulsion, 2nd generation (2025): full of character, punchy colors, narrow latitude – shadows block up fast. Expose generously but precisely." },
    meter: { de: "Auf die Schatten messen und im Zweifel mehr geben — Phoenix' Schatten laufen schneller zu als bei Kodak/Fuji.", en: "Meter for the shadows and err on the generous side — Phoenix shadows block up faster than Kodak/Fuji." } },
  { id: "harmanred", brand: "Harman", name: "Red 125 (Redscale)", type: "c41", box: 125, recEI: 100, eiMin: 50, eiMax: 200, overTol: 2, underTol: 0.3, pushMax: 0,
    tip: { de: "Redscale: rückwärts konfektionierter Film, alles wird rot-orange. Je mehr Licht, desto milder der Effekt – EI steuert den Look.", en: "Redscale: film spooled backwards, everything turns red-orange. More light = milder effect – the EI controls the look." } },
  { id: "colormission200", brand: "Adox", name: "Color Mission 200", type: "c41", box: 200, recEI: 160, eiMin: 100, eiMax: 400, overTol: 2, underTol: 0.5, pushMax: 1,
    tip: { de: "Adox' Farbprojekt in Kleinserie: Vintage-Farbcharakter, moderate Latitude.", en: "Adox' small-batch color project: vintage color character, moderate latitude." } },
  { id: "nc500", brand: "ORWO/Wolfen", name: "NC500", type: "c41", box: 400, recEI: 250, eiMin: 100, eiMax: 800, overTol: 1, underTol: 0.3, pushMax: 1,
    tip: { de: "Gedämpfte, entsättigte Farben, sichtbares Korn, kleine Latitude – ein Look-Film, kein Allrounder. Großzügig belichten.", en: "Muted, desaturated colors, visible grain, narrow latitude – a look film, not an all-rounder. Expose generously." } },
  { id: "lomo100", brand: "Lomography", name: "Color Negative 100", type: "c41", box: 100, recEI: 64, eiMin: 25, eiMax: 400, overTol: 2.5, underTol: 0.5, pushMax: 1,
    tip: { de: "Solider, günstiger Farbnegativfilm mit kräftigen Farben. Verträgt +1–2 über gut.", en: "Solid, affordable color negative with punchy colors. Takes +1–2 over well." } },
  { id: "lomo400", brand: "Lomography", name: "Color Negative 400", type: "c41", box: 400, recEI: 250, eiMin: 100, eiMax: 1600, overTol: 2.5, underTol: 0.5, pushMax: 2,
    tip: { de: "Der Allrounder der Lomo-Reihe. EI 200–250 für satte Schatten.", en: "The all-rounder of the Lomo line. EI 200–250 for rich shadows." } },
  { id: "lomo800", brand: "Lomography", name: "Color Negative 800", type: "c41", box: 800, recEI: 500, eiMin: 200, eiMax: 1600, overTol: 2.5, underTol: 0.7, pushMax: 1,
    tip: { de: "Für wenig Licht und Blitz-Ästhetik. Korn deutlich, Farben warm.", en: "For low light and flash aesthetics. Distinct grain, warm colors." } },
  { id: "classicolor", brand: "Lomography", name: "Classicolor 200", type: "c41", box: 200, recEI: 125, eiMin: 50, eiMax: 400, overTol: 2.5, underTol: 0.5, pushMax: 1,
    tip: { de: "Neuere Lomo-Emulsion (2025) mit klassischem, warmem Farbcharakter.", en: "Newer Lomo emulsion (2025) with a classic, warm color character." } },
  { id: "lcpurple", brand: "Lomography", name: "LomoChrome Purple XR", type: "c41", box: 400, recEI: 200, eiMin: 100, eiMax: 400, overTol: 2, underTol: 0.3, pushMax: 0,
    tip: { de: "Falschfarben-Film: Grün wird Lila. Die EI steuert den Effekt – 100 = kräftig, 400 = subtil. Kein Push; einfach C-41.", en: "False-color film: green turns purple. The EI controls the effect – 100 = strong, 400 = subtle. No push; plain C-41." } },
  { id: "lcmetropolis", brand: "Lomography", name: "LomoChrome Metropolis XR", type: "c41", box: 400, recEI: 200, eiMin: 100, eiMax: 400, overTol: 2, underTol: 0.3, pushMax: 0,
    tip: { de: "Entsättigter, urbaner Look mit harten Kontrasten. EI 100–400 frei wählbar, steuert die Stimmung.", en: "Desaturated, urban look with hard contrast. EI 100–400 freely chosen, steers the mood." } },
  { id: "lcturquoise", brand: "Lomography", name: "LomoChrome Turquoise XR", type: "c41", box: 400, recEI: 200, eiMin: 100, eiMax: 400, overTol: 2, underTol: 0.3, pushMax: 0,
    tip: { de: "Falschfarben: Blau/Orange-Tausch, Himmel wird golden. EI = Effektregler, kein Push.", en: "False colors: blue/orange swap, skies turn golden. EI = effect dial, no push." } },

  // --- black & white ---
  { id: "trix400", brand: "Kodak", name: "Tri-X 400", type: "bw", box: 400, recEI: 400, eiMin: 100, eiMax: 3200, overTol: 1, underTol: 1, pushMax: 3,
    tip: { de: "Der Reportage-Klassiker. Box Speed läuft sauber; Push auf 1600 ist sein zweites Zuhause – Kontrast & Korn als Stilmittel.", en: "The reportage classic. Clean at box speed; pushing to 1600 is its second home – contrast & grain as a style." } },
  { id: "tmax400", brand: "Kodak", name: "T-Max 400", type: "bw", box: 400, recEI: 400, eiMin: 200, eiMax: 3200, overTol: 0.7, underTol: 0.7, pushMax: 2,
    tip: { de: "T-Korn, fein & scharf. Box Speed empfohlen, EI 250–320 für etwas mehr Schatten. Nicht stark überbelichten – dichte Negative scannen sich zäh.", en: "T-grain, fine & sharp. Box speed recommended, EI 250–320 for a bit more shadow. Don't overexpose heavily – dense negatives scan poorly." },
    meter: { de: "Auf die Schatten messen; Lichter hält T-Max sehr lange.", en: "Meter for the shadows; T-Max holds highlights very long." } },
  { id: "tmax100", brand: "Kodak", name: "T-Max 100", type: "bw", box: 100, recEI: 100, eiMin: 50, eiMax: 400, overTol: 0.7, underTol: 0.7, pushMax: 2,
    tip: { de: "Extrem feines T-Korn für viel Licht. Box Speed, präzise messen.", en: "Extremely fine T-grain for plenty of light. Box speed, meter precisely." } },
  { id: "hp5", brand: "Ilford", name: "HP5 Plus 400", type: "bw", box: 400, recEI: 320, eiMin: 100, eiMax: 3200, overTol: 1.5, underTol: 1, pushMax: 3,
    tip: { de: "Gutmütiger Allrounder. EI 200–400 je nach Geschmack; Push auf 1600 der Klassiker mit sattem Kontrast.", en: "Good-natured all-rounder. EI 200–400 to taste; the push to 1600 is the classic with rich contrast." } },
  { id: "fp4", brand: "Ilford", name: "FP4 Plus 125", type: "bw", box: 125, recEI: 100, eiMin: 50, eiMax: 400, overTol: 1.5, underTol: 0.7, pushMax: 2,
    tip: { de: "Feines klassisches Korn für Licht satt. EI 64–125, sehr gutmütig in der Entwicklung.", en: "Fine classic grain for abundant light. EI 64–125, very forgiving in development." } },
  { id: "delta100", brand: "Ilford", name: "Delta 100", type: "bw", box: 100, recEI: 100, eiMin: 50, eiMax: 400, overTol: 1, underTol: 0.5, pushMax: 2,
    tip: { de: "Modernes Flachkristall-Korn, sehr scharf und fein. Präziser als FP4, weniger verzeihend.", en: "Modern tabular grain, very sharp and fine. More precise than FP4, less forgiving." } },
  { id: "delta400", brand: "Ilford", name: "Delta 400", type: "bw", box: 400, recEI: 320, eiMin: 100, eiMax: 1600, overTol: 1, underTol: 0.7, pushMax: 2,
    tip: { de: "Feineres Korn als HP5 bei gleicher Empfindlichkeit, dafür weniger Latitude.", en: "Finer grain than HP5 at the same speed, but less latitude." } },
  { id: "panf50", brand: "Ilford", name: "Pan F Plus 50", type: "bw", box: 50, recEI: 50, eiMin: 25, eiMax: 100, overTol: 1, underTol: 0.3, pushMax: 1,
    tip: { de: "Sehr feines Korn, kleine Latitude. Achtung: das latente Bild schwächt sich ab – zeitnah entwickeln lassen!", en: "Very fine grain, narrow latitude. Caution: the latent image fades – develop promptly!" } },
  { id: "delta3200", brand: "Ilford", name: "Delta 3200", type: "bw", box: 3200, recEI: 1600, eiMin: 400, eiMax: 12800, overTol: 1.5, underTol: 1, pushMax: 2,
    tip: { de: "Echte Empfindlichkeit eher ISO 1000–1250. Bei EI 1600 oder 3200 belichten und die EI dem Labor nennen – die Entwicklungszeit richtet sich danach.", en: "True speed closer to ISO 1000–1250. Shoot at EI 1600 or 3200 and tell the lab the EI – development time follows it." } },
  { id: "ortho80", brand: "Ilford", name: "Ortho Plus 80", type: "bw", box: 80, recEI: 80, eiMin: 40, eiMax: 160, overTol: 1, underTol: 0.5, pushMax: 1,
    tip: { de: "Orthochromatisch: sieht kein Rot – rote Motive werden fast schwarz, Hauttöne dunkler. Bei Kunstlicht nur EI 40!", en: "Orthochromatic: blind to red – red subjects go nearly black, skin tones darker. Under tungsten light only EI 40!" } },
  { id: "sfx200", brand: "Ilford", name: "SFX 200", type: "bw", box: 200, recEI: 200, eiMin: 6, eiMax: 400, overTol: 1, underTol: 0.5, pushMax: 1,
    tip: { de: "Erweiterte Rotempfindlichkeit für den IR-Look – volle Wirkung nur mit tiefrotem Filter (dann EI 6–12!). Ohne Filter normaler 200er.", en: "Extended red sensitivity for the IR look – full effect only with a deep red filter (then EI 6–12!). Without filter a normal 200." } },
  { id: "hr50", brand: "Adox", name: "HR-50", type: "bw", box: 50, recEI: 50, eiMin: 25, eiMax: 100, overTol: 1, underTol: 0.3, pushMax: 1, flags: { ir: true },
    tip: { de: "Aviphot-Basis, superpanchromatisch mit IR-Anteil. Box Speed; bei kaltem/bedecktem Licht +½–1 zugeben (der Messer überschätzt). Entwickler: bevorzugt HR-DEV – Labor vorher fragen!", en: "Aviphot base, superpanchromatic with IR reach. Box speed; in cold/overcast light add +½–1 (the meter over-reads). Developer: prefer HR-DEV – ask the lab first!" },
    meter: { de: "Auf die Schatten; bei kaltem Licht (bedeckt, tiefe Sonne) bewusst +½–1 zugeben.", en: "Meter for the shadows; in cold light (overcast, low sun) deliberately add +½–1." } },
  { id: "monopan50", brand: "Leica", name: "Monopan 50", type: "bw", box: 50, recEI: 50, eiMin: 25, eiMax: 100, overTol: 1, underTol: 0.3, pushMax: 1, flags: { ir: true },
    tip: { de: "Leicas erster eigener Film (2025) – gleiche Aviphot-Basis wie Adox HR-50, minimal anders abgestimmt. Verhalten identisch behandeln.", en: "Leica's first own film (2025) – same Aviphot base as Adox HR-50, tuned slightly differently. Treat identically." },
    meter: { de: "Auf die Schatten; bei kaltem Licht bewusst +½–1 zugeben.", en: "Meter for the shadows; in cold light deliberately add +½–1." } },
  { id: "cms20", brand: "Adox", name: "CMS 20 II", type: "bw", box: 20, recEI: 12, eiMin: 6, eiMax: 25, overTol: 0.5, underTol: 0.2, pushMax: 0,
    tip: { de: "Mikrofilm-Basis, extremste Auflösung – aber nur mit Adotech-Entwickler bildmäßig nutzbar (EI 12–20). Normale S/W-Labore: vorher fragen, sonst Kontrastexplosion!", en: "Microfilm base, extreme resolution – only usable pictorially with Adotech developer (EI 12–20). Standard B&W labs: ask first, or contrast explodes!" } },
  { id: "chs100", brand: "Adox", name: "CHS 100 II", type: "bw", box: 100, recEI: 80, eiMin: 40, eiMax: 200, overTol: 1.5, underTol: 0.5, pushMax: 1,
    tip: { de: "Klassische Emulsion mit traditionellem Korn und schönem Tonwertverlauf – der „Vintage“-S/W unter den Adox.", en: "Classic emulsion with traditional grain and lovely tonality – the “vintage” B&W of the Adox line." } },
  { id: "scala50", brand: "Adox", name: "Scala 50", type: "bw", box: 50, recEI: 50, eiMin: 25, eiMax: 100, overTol: 1, underTol: 0.3, pushMax: 1,
    tip: { de: "Für S/W-Dia-Umkehrentwicklung gedacht (Scala-Prozess), läuft aber auch als Negativ. Als Dia: Belichtung präzise wie bei E-6.", en: "Meant for B&W slide reversal (Scala process), also works as a negative. As a slide: meter as precisely as E-6." } },
  { id: "fomapan400", brand: "Foma", name: "Fomapan 400", type: "bw", box: 400, recEI: 250, eiMin: 100, eiMax: 800, overTol: 1.5, underTol: 0.5, pushMax: 1,
    tip: { de: "Reale Empfindlichkeit eher ~250: EI 200–250 belichten, sonst laufen die Schatten zu.", en: "True speed closer to ~250: shoot EI 200–250, or the shadows block up." } },
  { id: "kentmere100", brand: "Kentmere", name: "Pan 100", type: "bw", box: 100, recEI: 100, eiMin: 50, eiMax: 400, overTol: 1.5, underTol: 0.7, pushMax: 2,
    tip: { de: "Ilfords Budget-Linie: weicher Grundkontrast, sehr preiswert, pusht ordentlich.", en: "Ilford's budget line: soft base contrast, very affordable, pushes decently." } },
  { id: "kentmere200", brand: "Kentmere", name: "Pan 200", type: "bw", box: 200, recEI: 160, eiMin: 100, eiMax: 800, overTol: 1.5, underTol: 0.7, pushMax: 2,
    tip: { de: "Der jüngste Kentmere (2024) – mittlere Empfindlichkeit, gleiche Budget-Tugenden.", en: "The newest Kentmere (2024) – mid speed, same budget virtues." } },
  { id: "kentmere400", brand: "Kentmere", name: "Pan 400", type: "bw", box: 400, recEI: 320, eiMin: 100, eiMax: 1600, overTol: 1.5, underTol: 0.7, pushMax: 2,
    tip: { de: "Günstiger Alltags-400er, gutmütig, etwas flacher als HP5.", en: "Affordable everyday 400, forgiving, a bit flatter than HP5." } },
  { id: "acros2", brand: "Fujifilm", name: "Neopan Acros II 100", type: "bw", box: 100, recEI: 100, eiMin: 50, eiMax: 400, overTol: 1, underTol: 0.5, pushMax: 2,
    tip: { de: "Superfeines Korn und der Langzeit-König: praktisch kein Schwarzschild-Effekt bis 2 Minuten – ideal für Nacht & Stativ.", en: "Super-fine grain and the long-exposure king: virtually no reciprocity failure up to 2 minutes – ideal for night & tripod." } },
  { id: "p30", brand: "Ferrania", name: "P30", type: "bw", box: 80, recEI: 64, eiMin: 32, eiMax: 160, overTol: 0.7, underTol: 0.3, pushMax: 1,
    tip: { de: "Kino-Erbe aus Italien: tiefes Schwarz, hoher Kontrast, sehr kleine Latitude. Präzise auf die Schatten messen.", en: "Cinema heritage from Italy: deep blacks, high contrast, very narrow latitude. Meter the shadows precisely." } },
  { id: "retro80s", brand: "Rollei", name: "Retro 80S", type: "bw", box: 80, recEI: 50, eiMin: 25, eiMax: 160, overTol: 1, underTol: 0.3, pushMax: 1, flags: { ir: true },
    tip: { de: "Aviphot-Basis wie HR-50, aber ohne Vorbelichtung: härter, kontrastreicher. Viele belichten auf EI 40–50.", en: "Aviphot base like HR-50 but without pre-flash: harder, more contrasty. Many rate it EI 40–50." } },
  { id: "rpx400", brand: "Rollei", name: "RPX 400", type: "bw", box: 400, recEI: 320, eiMin: 100, eiMax: 1600, overTol: 1.5, underTol: 0.7, pushMax: 2,
    tip: { de: "Klassischer Allrounder im HP5-Stil, gutmütig und pushfreudig.", en: "Classic HP5-style all-rounder, forgiving and push-happy." } },
  { id: "ir400", brand: "Rollei", name: "Infrared 400", type: "bw", box: 400, recEI: 400, eiMin: 6, eiMax: 400, overTol: 1, underTol: 0.5, pushMax: 1, flags: { ir: true },
    tip: { de: "Echter IR-Effekt nur mit 720-nm-Filter – dann EI 6–12 und Stativ. Ohne Filter ein normaler, etwas harter 400er.", en: "Real IR effect only with a 720 nm filter – then EI 6–12 and a tripod. Without filter a normal, slightly harsh 400." } },
  { id: "earlgrey", brand: "Lomography", name: "Earl Grey 100", type: "bw", box: 100, recEI: 100, eiMin: 50, eiMax: 400, overTol: 1.5, underTol: 0.5, pushMax: 2,
    tip: { de: "Lomos günstiger 100er: weiche Tonwerte, klassisches Korn.", en: "Lomo's affordable 100: soft tones, classic grain." } },
  { id: "ladygrey", brand: "Lomography", name: "Lady Grey 400", type: "bw", box: 400, recEI: 320, eiMin: 100, eiMax: 1600, overTol: 1.5, underTol: 0.7, pushMax: 2,
    tip: { de: "Gutmütiger 400er mit weichem Kontrast, pusht ordentlich.", en: "Forgiving 400 with soft contrast, pushes decently." } },
  { id: "berlinkino", brand: "Lomography", name: "Berlin Kino 400", type: "bw", box: 400, recEI: 250, eiMin: 100, eiMax: 800, overTol: 1, underTol: 0.5, pushMax: 1,
    tip: { de: "Kinofilm-Basis (ORWO-Erbe): weiche Grautöne, sanfter Kontrast. Reale Empfindlichkeit eher 250–320.", en: "Cine-film base (ORWO heritage): soft grays, gentle contrast. True speed closer to 250–320." } },
  { id: "potsdamkino", brand: "Lomography", name: "Potsdam Kino 100", type: "bw", box: 100, recEI: 64, eiMin: 32, eiMax: 200, overTol: 1, underTol: 0.5, pushMax: 1,
    tip: { de: "Der feinere Bruder des Berlin Kino: klassischer Kino-S/W-Look, eher auf EI 64–80 belichten.", en: "Berlin Kino's finer sibling: classic cine B&W look, better rated at EI 64–80." } },
  { id: "fantome8", brand: "Lomography", name: "Fantôme Kino 8", type: "bw", box: 8, recEI: 8, eiMin: 4, eiMax: 16, overTol: 0.5, underTol: 0.2, pushMax: 0,
    tip: { de: "ISO 8! Extremer Kontrast, fast kein Grau – Grafik-Look pur. Nur bei Sonne oder mit Stativ; gnadenlos bei Fehlbelichtung.", en: "ISO 8! Extreme contrast, almost no midtones – pure graphic look. Sun or tripod only; merciless on misexposure." } },
  { id: "babylon13", brand: "Lomography", name: "Babylon Kino 13", type: "bw", box: 13, recEI: 13, eiMin: 6, eiMax: 25, overTol: 0.7, underTol: 0.3, pushMax: 0,
    tip: { de: "ISO 13, feinste Grautöne und flacher Kontrast – das Gegenteil des Fantôme. Viel Licht nötig.", en: "ISO 13, finest grays and flat contrast – the opposite of Fantôme. Needs plenty of light." } },

  // --- ECN-2 cine ---
  { id: "vision3_50d", brand: "Kodak", name: "Vision3 50D", type: "ecn2", box: 50, recEI: 32, eiMin: 12, eiMax: 200, overTol: 3, underTol: 1, pushMax: 1, flags: { remjet: true },
    tip: { de: "Der feinkörnigste Farbfilm überhaupt – Tageslicht, Sonne satt. EI 32–50.", en: "The finest-grained color film there is – daylight, plenty of sun. EI 32–50." } },
  { id: "vision3_250d", brand: "Kodak", name: "Vision3 250D", type: "ecn2", box: 250, recEI: 160, eiMin: 64, eiMax: 1000, overTol: 3, underTol: 1, pushMax: 2, flags: { remjet: true },
    tip: { de: "Kino-Tageslichtfilm: riesige Latitude, feines Korn, spottbillig pro Meter. EI 160–250. Ab Werk mit Remjet – Händlerangabe prüfen, ob entfernt.", en: "Cine daylight film: huge latitude, fine grain, dirt cheap per meter. EI 160–250. Has remjet from the factory – check if your dealer removed it." } },
  { id: "vision3_500t", brand: "Kodak", name: "Vision3 500T", type: "ecn2", box: 500, recEI: 320, eiMin: 125, eiMax: 2000, overTol: 3, underTol: 1, pushMax: 2, flags: { remjet: true, tungsten: true },
    tip: { de: "Kino-Kunstlichtfilm für Abend, Innenraum, Neon. Mit Remjet keine Halos (anders als CineStill 800T). Tageslicht: 85B-Filter (dann EI ~320) oder Blaustich im Scan ziehen.", en: "Cine tungsten film for evenings, interiors, neon. With remjet no halos (unlike CineStill 800T). Daylight: 85B filter (then EI ~320) or pull the blue cast in the scan." } },
  { id: "eterna500t", brand: "Fujifilm", name: "Eterna 500T", type: "ecn2", box: 500, recEI: 320, eiMin: 125, eiMax: 1000, overTol: 2.5, underTol: 0.7, pushMax: 1, flags: { remjet: true, tungsten: true },
    tip: { de: "Fuji-Kinofilm (eingestellt, nur Restbestände). Weiche Kontraste, gedämpfte Farben. Alter beachten: eher großzügig belichten.", en: "Fuji cine film (discontinued, remaining stock only). Soft contrast, muted colors. Mind its age: expose generously." } },

  // --- E-6 slide ---
  { id: "e100", brand: "Kodak", name: "Ektachrome E100", type: "e6", box: 100, recEI: 100, eiMin: 50, eiMax: 200, overTol: 0.5, underTol: 0.3, pushMax: 1,
    tip: { de: "Diafilm: Latitude ±½ Blende, Lichter fressen gnadenlos aus. Push maximal +1.", en: "Slide film: latitude ±½ stop, highlights burn mercilessly. Push +1 at most." } },
  { id: "provia100f", brand: "Fujifilm", name: "Provia 100F", type: "e6", box: 100, recEI: 100, eiMin: 50, eiMax: 400, overTol: 0.5, underTol: 0.3, pushMax: 2,
    tip: { de: "Der gutmütigste Dia-Film. Push +1 sauber, +2 mit sichtbarem Kontrastanstieg.", en: "The most forgiving slide film. Push +1 clean, +2 with visible contrast gain." } },
  { id: "velvia50", brand: "Fujifilm", name: "Velvia 50", type: "e6", box: 50, recEI: 40, eiMin: 25, eiMax: 100, overTol: 0.3, underTol: 0.3, pushMax: 1,
    tip: { de: "Extreme Sättigung, gnadenlos bei Fehlbelichtung. Viele belichten auf EI 40.", en: "Extreme saturation, merciless on misexposure. Many rate it EI 40." } },
];

/* ---------- shutter ---------- */

const SPEED_LADDER = [8000, 4000, 2000, 1000, 500, 250, 125, 60, 30, 15, 8, 4, 2, 1];
const MAX_SPEED_OPTIONS = [500, 1000, 2000, 4000, 8000];

const APERTURES = [1, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];
const FOCAL_PRESETS = [21, 28, 35, 40, 50, 75, 90, 135];
const LIGHT_EVS = [15, 13, 12, 10, 8, 6, 4, 2];

/* ---------- helpers ---------- */

const log2 = (x) => Math.log(x) / Math.log(2);

function fmtShutter(sec) {
  if (sec >= 1) return `${Math.round(sec * 10) / 10} s`;
  return `1/${Math.round(1 / sec)}`;
}

/* stops → "⅓", "⅔", "1", "1⅓" … */
function frac(x) {
  const t = Math.round(Math.abs(x) * 3);
  const w = Math.floor(t / 3);
  const r = t % 3;
  const f = r === 1 ? "⅓" : r === 2 ? "⅔" : "";
  if (w === 0) return f || "0";
  return f ? `${w}${f}` : `${w}`;
}

function nearestIdx(arr, val) {
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < arr.length; i++) {
    const d = Math.abs(log2(arr[i] / val));
    if (d < bestDiff) { bestDiff = d; best = i; }
  }
  return best;
}

function nearestSpeed(dens, tSec) {
  let best = 1 / dens[0];
  let bestDiff = Infinity;
  for (const d of dens) {
    const s = 1 / d;
    const diff = Math.abs(log2(tSec / s));
    if (diff < bestDiff) { bestDiff = diff; best = s; }
  }
  return best;
}

/* ---------- verdict: beginner-friendly, bilingual ---------- */

function getVerdict(film, ei, lang) {
  const diff = log2(ei / film.box);
  const F = frac(diff);
  const de = lang === "de";

  if (Math.abs(diff) < 0.2) {
    return { kind: "box", level: "ok", diff,
      title: de ? "Box Speed — wie auf der Packung" : "Box speed — as printed on the box",
      short: de ? "Normale Entwicklung — dem Labor nichts angeben." : "Normal development — nothing to tell the lab.",
      text: de
        ? "Du belichtest genau so, wie der Hersteller den Film ausgelegt hat. Normale Entwicklung — dem Labor musst du nichts sagen."
        : "You're exposing exactly as the manufacturer designed the film. Normal development — nothing to tell the lab." };
  }

  if (diff < 0) {
    const over = -diff;
    if (over <= film.overTol) {
      return { kind: "over", level: "ok", diff,
        title: de ? `+${F} Blende mehr Licht — gewollt & gut` : `+${F} stop more light — intentional & good`,
        short: de ? "KEIN Push/Pull angeben — ganz normal entwickeln lassen." : "NO push/pull — just develop normally.",
        text: de
          ? `Du hast am ISO-Rad ${ei} eingestellt, obwohl auf der Packung ${film.box} steht. Der Belichtungsmesser verlangt dadurch bei jedem Bild ${F} Blende mehr Licht — man nennt das „Überbelichten“. Das ist kein Fehler, sondern ein beliebter Trick${film.type === "c41" || film.type === "ecn2" ? " bei Negativfilm" : ""}: offenere Schatten, weichere Kontraste${film.type === "c41" ? ", pastelligere Farben" : ""}. Wichtig: Dem Labor NICHTS sagen — ganz normal entwickeln lassen.`
          : `You've set ${ei} on the ISO dial although the box says ${film.box}. The light meter therefore asks for ${F} stop more light on every frame — that's called “overexposing”. Not a mistake but a popular trick${film.type === "c41" || film.type === "ecn2" ? " with negative film" : ""}: open shadows, softer contrast${film.type === "c41" ? ", pastel colors" : ""}. Important: tell the lab NOTHING — develop completely normally.` };
    }
    return { kind: "over", level: "warn", diff,
      title: de ? `+${F} Blenden — mehr als der Film gut verträgt` : `+${F} stops — more than this film handles well`,
      short: de ? `Regler zurück Richtung EI ${film.recEI}.` : `Slide back toward EI ${film.recEI}.`,
      text: film.type === "e6"
        ? (de ? "Diafilm verzeiht praktisch nichts nach oben: Die hellen Stellen fressen aus und sind unrettbar. Zurück Richtung Box Speed." : "Slide film forgives almost nothing upward: bright areas burn out irrecoverably. Go back toward box speed.")
        : (de ? `Über der Wohlfühlgrenze dieses Films (~+${frac(film.overTol)}): Die Negative werden sehr dicht und lassen sich schlecht scannen (zähe, zugelaufene Lichter). Schieb den Regler näher an die Empfehlung.` : `Beyond this film's comfort zone (~+${frac(film.overTol)}): negatives get very dense and scan poorly (muddy, blocked highlights). Move the slider back toward the recommendation.`) };
  }

  const under = diff;
  if (under <= 0.45) {
    return { kind: "box", level: film.type === "e6" ? "warn" : "ok", diff,
      title: de ? `−${F} Blende knapp unter Box` : `−${F} stop just under box`,
      short: film.type === "e6"
        ? (de ? "Lieber exakt auf Box Speed." : "Better stay exactly at box speed.")
        : (de ? "Normale Entwicklung — Negativfilm steckt das weg." : "Normal development — negative film absorbs this."),
      text: film.type === "e6"
        ? (de ? "Bei Diafilm zählt jede Drittelblende — lieber exakt auf Box Speed." : "With slide film every third of a stop counts — better stay exactly at box speed.")
        : (de ? `Nur ${F} Blende zu wenig — das steckt Negativfilm ohne Push weg (Schatten minimal dunkler). Normale Entwicklung, keine Angabe nötig.` : `Only ${F} stop short — negative film absorbs that without a push (shadows minimally darker). Normal development, nothing to declare.`) };
  }

  const push = Math.max(1, Math.round(under));
  const between = Math.abs(under - push) > 0.2;
  if (push <= film.pushMax) {
    return { kind: "push", level: "info", diff, push,
      title: de ? `−${F} Blende zu wenig Licht → Labor-Push +${push}` : `−${F} stop too little light → lab push +${push}`,
      short: de ? `Labor sagen: „Push +${push}“ — gilt für die GANZE Rolle.` : `Tell the lab: “push +${push}” — applies to the WHOLE roll.`,
      text: de
        ? `Du hast einen höheren Wert eingestellt, als der Film von Haus aus kann — jedes Bild bekommt ${F} Blende zu wenig Licht. Damit trotzdem normale Helligkeit herauskommt, muss das Labor länger entwickeln. Genau das heißt „Push“. Sag dem Labor: „Push +${push}“ — Labore pushen in ganzen Blenden, und es gilt zwingend für die GANZE Rolle, nicht für einzelne Bilder.${between ? ` (Dein Wert liegt zwischen den Stufen — üblich: auf +${push} runden oder die EI passend auf ${film.box * Math.pow(2, push)} stellen.)` : ""} Nebenwirkung: ${film.type === "bw" ? "mehr Kontrast, kräftigeres Korn — bei S/W oft ein gewollter Look." : film.type === "e6" ? "Kontrastanstieg und mögliche Farbverschiebung." : "mehr Kontrast, gröberes Korn, Farben können kippen — nur machen, wenn das Licht es erzwingt."}`
        : `You've set a higher value than the film natively delivers — every frame gets ${F} stop too little light. To still get normal brightness, the lab has to develop longer. That is exactly what “push” means. Tell the lab: “push +${push}” — labs push in whole stops, and it applies to the WHOLE roll, never single frames.${between ? ` (Your value sits between steps — common practice: round to +${push}, or set the EI to ${film.box * Math.pow(2, push)} so exposure and development match.)` : ""} Side effect: ${film.type === "bw" ? "more contrast, stronger grain — often a deliberate look in B&W." : film.type === "e6" ? "contrast gain and possible color shift." : "more contrast, coarser grain, colors may shift — only do it when the light forces you."}` };
  }
  return { kind: "push", level: "error", diff, push,
    title: de ? `−${F} — jenseits der Push-Grenze` : `−${F} — beyond the push limit`,
    short: de ? "Empfindlicheren Film wählen — oder EI zurück." : "Pick a faster film — or lower the EI.",
    text: de
      ? `Sinnvolle Push-Grenze dieses Films: +${film.pushMax}. Darüber drohen leere Schatten und harter Qualitätsverlust. Nimm einen empfindlicheren Film — oder die EI zurück.`
      : `This film's sensible push limit: +${film.pushMax}. Beyond it you get empty shadows and a hard quality drop. Use a faster film — or bring the EI back down.` };
}

/* ---------- lab note ---------- */

function labNote(film, ei, verdict, lang) {
  const de = lang === "de";
  const lines = [];
  if (film.flags?.remjet) {
    lines.push(de
      ? "⚠️ KINOFILM MIT REMJET — zwingend ECN-2 entwickeln, NIEMALS C-41! Bitte als ECN-2 deklarieren."
      : "⚠️ CINE FILM WITH REMJET — must be developed in ECN-2, NEVER C-41! Please declare as ECN-2.");
  }
  if (film.flags?.c41only) {
    lines.push(de
      ? "Hinweis: chromogener S/W-Film → C-41-Prozess, NICHT S/W-Chemie."
      : "Note: chromogenic B&W film → C-41 process, NOT B&W chemistry.");
  }
  const proc = film.flags?.remjet ? "ECN-2" : TYPE_SHORT[film.type];
  if (verdict.kind === "push") {
    lines.push(de
      ? `${proc}: Push +${verdict.push} für die gesamte Rolle. Belichtet auf EI ${ei} (Box ${film.box}).`
      : `${proc}: push +${verdict.push} for the entire roll. Exposed at EI ${ei} (box ${film.box}).`);
  } else if (verdict.kind === "over" && verdict.level === "ok" && Math.abs(verdict.diff) >= 0.2) {
    lines.push(de
      ? `${proc} normal entwickeln, kein Push/Pull. Film bewusst +${frac(verdict.diff)} überbelichtet (EI ${ei}).`
      : `${proc} develop normally, no push/pull. Film deliberately overexposed +${frac(verdict.diff)} (EI ${ei}).`);
    if (film.type === "c41") {
      lines.push(de
        ? "Bitte neutral/flach scannen ohne Auto-Helligkeits-/Farbkorrektur — der Look ist gewollt."
        : "Please scan neutral/flat without auto brightness/color correction — the look is intentional.");
    }
  } else {
    lines.push(de
      ? `${proc} normal entwickeln. Belichtet auf EI ${ei}.`
      : `${proc} develop normally. Exposed at EI ${ei}.`);
  }
  return lines.join("\n");
}

/* ---------- custom film derivation ---------- */

function deriveCustom(form) {
  const box = Number(form.box) || 100;
  let overTol = form.type === "e6" ? 0.5 : form.type === "bw" ? 1 : 2;
  let pushMax = 1;
  let underTol = 0.5;
  if (form.tolerant) overTol = form.type === "e6" ? 0.5 : 3;
  if (form.pushable) pushMax = form.type === "bw" ? 3 : 2;
  if (form.contrasty) { overTol = Math.min(overTol, 1); underTol = 0.3; }
  return {
    id: `custom_${Date.now()}`,
    brand: form.brand || (form.lang === "en" ? "Custom" : "Eigener"),
    name: form.name || "Film",
    type: form.type, box,
    recEI: form.tolerant && (form.type === "c41" || form.type === "ecn2") ? Math.round(box / 2) : box,
    eiMin: Math.max(6, Math.round(box / 4)),
    eiMax: box * Math.pow(2, Math.max(1, pushMax)),
    overTol, underTol, pushMax,
    flags: {
      remjet: form.type === "ecn2" && form.remjet ? true : undefined,
      tungsten: form.tungsten ? true : undefined,
    },
    tip: {
      de: form.devNote ? `Eigener Film. Entwicklung: ${form.devNote}` : "Eigener Film — Tendenzen aus deinen Angaben abgeleitet.",
      en: form.devNote ? `Custom film. Development: ${form.devNote}` : "Custom film — tendencies derived from your inputs.",
    },
    custom: true,
  };
}

/* ---------- small UI ---------- */

function Sprockets() {
  return (
    <div className="flex justify-between px-2" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} style={{ width: 10, height: 13, borderRadius: 2, background: C.paper, opacity: 0.92 }} />
      ))}
    </div>
  );
}

function SectionTitle({ index, children }) {
  return (
    <div className="flex items-baseline gap-3 mb-3">
      <span style={{ fontFamily: "'Space Mono', monospace", color: C.amberDeep, fontSize: 12, letterSpacing: 2 }}>{index}</span>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: C.ink }}>{children}</h2>
    </div>
  );
}

function InfoTip({ hint, children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Info"
        style={{ width: 18, height: 18, borderRadius: "50%", border: `1px solid ${C.amberDeep}`, background: open ? C.amberDeep : "transparent", color: open ? "#FDFBF5" : C.amberDeep, fontFamily: "'Space Mono', monospace", fontSize: 11, lineHeight: "15px", cursor: "pointer", padding: 0, marginLeft: 6, verticalAlign: "middle", flexShrink: 0 }}>
        ?
      </button>
      {open && (
        <div onClick={() => setOpen(false)} role="note"
          style={{ marginTop: 6, padding: "10px 12px", border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.amberDeep}`, background: "#FFFEFA", borderRadius: 6, fontSize: 13, lineHeight: 1.55, cursor: "pointer", color: C.ink, width: "100%", flexBasis: "100%", order: 99 }}>
          {children}
          <div style={{ marginTop: 6, fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1, color: C.muted }}>{hint}</div>
        </div>
      )}
    </>
  );
}

function Badge({ children, tone = "muted" }) {
  const bg = tone === "amber" ? C.amber : tone === "ox" ? C.oxblood : "#E4DECF";
  const fg = tone === "muted" ? C.muted : "#FDFBF5";
  return (
    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1, background: bg, color: fg, padding: "2px 7px", borderRadius: 3, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

/* ================================================================ */

function App() {
  const [lang, setLang] = useState("de");
  const s = L[lang];

  const [customFilms, setCustomFilms] = useState([]);
  const [storageOk, setStorageOk] = useState(false);

  const allFilms = useMemo(() => [...FILMS, ...customFilms], [customFilms]);

  const [filmId, setFilmId] = useState("fujicolor200");
  const [ei, setEi] = useState(100);
  const [maxDen, setMaxDen] = useState(1000);
  const [focal, setFocal] = useState(50);
  const [aperture, setAperture] = useState(5.6);
  const [lightEv, setLightEv] = useState(12);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilmForm, setShowFilmForm] = useState(false);
  const [copied, setCopied] = useState(false);

  const film = allFilms.find((f) => f.id === filmId) || allFilms[0];
  const dens = useMemo(() => SPEED_LADDER.filter((d) => d <= maxDen), [maxDen]);

  useEffect(() => {
    (async () => {
      try {
        if (typeof window === "undefined") return;
        let raw = null;
        if (window.storage) {
          setStorageOk(true);
          try {
            const res = await window.storage.get("filmbox-data");
            raw = res && res.value ? res.value : null;
          } catch (e) { /* key missing */ }
        } else if (window.localStorage) {
          setStorageOk(true);
          raw = window.localStorage.getItem("filmbox-data");
        }
        if (raw) {
          const data = JSON.parse(raw);
          if (Array.isArray(data.films)) setCustomFilms(data.films);
          if (data.lang === "de" || data.lang === "en") setLang(data.lang);
        }
      } catch (e) { /* first run */ }
    })();
  }, []);

  async function persist(films, language) {
    const payload = JSON.stringify({ films, lang: language });
    try {
      if (typeof window === "undefined") return;
      if (window.storage) { await window.storage.set("filmbox-data", payload); return; }
      if (window.localStorage) window.localStorage.setItem("filmbox-data", payload);
    } catch (e) { console.error("persist failed", e); }
  }

  function switchLang(l) {
    setLang(l);
    persist(customFilms, l);
  }

  function selectFilm(id) {
    setFilmId(id);
    const f = allFilms.find((x) => x.id === id);
    if (f) {
      const steps = EI_STEPS.filter((x) => x >= f.eiMin && x <= f.eiMax);
      setEi(steps[nearestIdx(steps, f.recEI || f.box)]);
    }
  }

  const eiSteps = useMemo(() => EI_STEPS.filter((x) => x >= film.eiMin && x <= film.eiMax), [film]);
  const eiIndex = eiSteps.includes(ei) ? eiSteps.indexOf(ei) : nearestIdx(eiSteps, ei);
  const boxIdx = nearestIdx(eiSteps, film.box);
  const boxPct = Math.min(90, Math.max(10, eiSteps.length > 1 ? (boxIdx / (eiSteps.length - 1)) * 100 : 50));

  const verdict = getVerdict(film, ei, lang);
  const note = labNote(film, ei, verdict, lang);
  const meterAdvice = film.meter ? film.meter[lang] : METER_DEFAULT[film.type][lang];

  /* concrete example for the verdict info box, based on current light check */
  const lightIdx = LIGHT_EVS.indexOf(lightEv);
  const exSnap = (targetEi) => {
    const t = (aperture * aperture) / Math.pow(2, lightEv + log2(targetEi / 100));
    const fast = 1 / dens[0];
    const slow = 1 / dens[dens.length - 1];
    return fmtShutter(nearestSpeed(dens, Math.min(Math.max(t, fast), slow)));
  };
  let example = "";
  if (Math.abs(verdict.diff) >= 0.2) {
    const tBoxS = exSnap(film.box);
    const tEiS = exSnap(ei);
    const lightName = L[lang].lights[lightIdx] || "";
    if (verdict.diff < 0) {
      example = lang === "de"
        ? `Bei „${lightName}“ und f/${aperture}: Mit Box ${film.box} verlangt der Messer ${tBoxS} — mit EI ${ei} verlangt er ${tEiS}. Gleiche Blende, längere Zeit: Genau so kommt die ${frac(verdict.diff)} Blende mehr Licht auf den Film. Alternativ die Blende öffnen (z. B. eine Stufe = 1 Blende) und die Zeit lassen.`
        : `In “${lightName}” at f/${aperture}: at box ${film.box} the meter asks for ${tBoxS} — at EI ${ei} it asks for ${tEiS}. Same aperture, longer time: that's exactly how the extra ${frac(verdict.diff)} stop of light reaches the film. Alternatively open the aperture (one step = 1 stop) and keep the time.`;
    } else {
      example = lang === "de"
        ? `Bei „${lightName}“ und f/${aperture}: Mit Box ${film.box} verlangt der Messer ${tBoxS} — mit EI ${ei} nur noch ${tEiS}. Die kürzere Zeit heißt: ${frac(verdict.diff)} Blende weniger Licht auf dem Film. ${verdict.kind === "push" ? "Diese fehlende Belichtung gleicht später die Push-Entwicklung aus." : ""}`
        : `In “${lightName}” at f/${aperture}: at box ${film.box} the meter asks for ${tBoxS} — at EI ${ei} only ${tEiS}. The shorter time means ${frac(verdict.diff)} stop less light on the film. ${verdict.kind === "push" ? "Push development later compensates for this missing exposure." : ""}`;
    }
  }

  /* exposure calc */
  const foc = Math.min(800, Math.max(8, Number(focal) || 50));
  const tNeeded = (aperture * aperture) / Math.pow(2, lightEv + log2(ei / 100));
  const fastest = 1 / dens[0];
  const slowest = 1 / dens[dens.length - 1];
  const tooBright = tNeeded < fastest / 1.4;
  const tooDark = tNeeded > slowest * 1.4;
  const snapped = nearestSpeed(dens, Math.min(Math.max(tNeeded, fastest), slowest));
  const handLimit = 1 / foc;

  let handState = "ok";
  if (!tooBright) {
    if (snapped <= handLimit * 1.4) handState = "ok";
    else if (snapped <= handLimit * 2.9) handState = "edge";
    else handState = "bad";
  }

  const options = [];
  if (!tooBright && (handState !== "ok" || tooDark)) {
    if (aperture > APERTURES[0]) {
      const tOpen = (APERTURES[0] * APERTURES[0]) / Math.pow(2, lightEv + log2(ei / 100));
      options.push(s.optOpen(APERTURES[0], fmtShutter(nearestSpeed(dens, Math.min(Math.max(tOpen, fastest), slowest)))));
    }
    if (film.pushMax >= 1) {
      const targetEi = Math.min(film.box * Math.pow(2, film.pushMax), film.eiMax);
      const push = Math.round(log2(targetEi / film.box));
      if (push >= 1 && targetEi > ei) {
        const tP = (aperture * aperture) / Math.pow(2, lightEv + log2(targetEi / 100));
        options.push(s.optPush(targetEi, push, fmtShutter(nearestSpeed(dens, Math.min(Math.max(tP, fastest), slowest))), aperture));
      }
    }
    options.push(film.underTol >= 0.7 ? s.optUnderOk : s.optUnderBad);
    options.push(s.optBrace);
    options.push(s.optFilm);
  }
  if (tooBright) {
    const idealAp = APERTURES.find((a) => (a * a) / Math.pow(2, lightEv + log2(ei / 100)) >= fastest / 1.05);
    options.push(idealAp ? s.optClose(idealAp) : s.optNd(APERTURES[APERTURES.length - 1]));
  }

  const filteredFilms = allFilms.filter((f) => {
    if (typeFilter !== "all" && f.type !== typeFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${f.brand} ${f.name}`.toLowerCase().includes(q);
  });

  const [filmForm, setFilmForm] = useState({ brand: "", name: "", type: "c41", box: 400, tolerant: true, pushable: false, contrasty: false, remjet: false, tungsten: false, devNote: "" });

  async function addCustomFilm() {
    const f = deriveCustom({ ...filmForm, lang });
    const films = [...customFilms, f];
    setCustomFilms(films);
    await persist(films, lang);
    setShowFilmForm(false);
    setFilmId(f.id);
    setEi(f.recEI);
  }

  async function resetCustom() {
    setCustomFilms([]);
    await persist([], lang);
  }

  function copyNote() {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1600); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(note).then(done, done);
      } else {
        const ta = document.createElement("textarea");
        ta.value = note; document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); document.body.removeChild(ta); done();
      }
    } catch (e) { done(); }
  }

  const verdictColor = verdict.level === "ok" ? C.green : verdict.level === "info" ? C.amberDeep : verdict.level === "warn" ? C.oxblood : C.red;
  const handColor = handState === "ok" ? C.green : handState === "edge" ? C.amberDeep : C.red;

  const inputStyle = { fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.ink, background: "#FFFEFA", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 10px", width: "100%" };
  const selectStyle = { ...inputStyle, appearance: "auto" };
  const derived = deriveCustom({ ...filmForm, lang });

  return (
    <div style={{ background: C.paper, minHeight: "100vh", color: C.ink, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
        input[type=range]{ -webkit-appearance:none; appearance:none; width:100%; height:4px; border-radius:2px; background:${C.line}; outline:none; }
        input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; appearance:none; width:26px; height:26px; border-radius:50%; background:${C.amber}; border:3px solid ${C.film}; cursor:pointer; }
        input[type=range]::-moz-range-thumb{ width:22px; height:22px; border-radius:50%; background:${C.amber}; border:3px solid ${C.film}; cursor:pointer; }
        button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid ${C.amber}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce){ *{ transition:none !important; } }
      `}</style>

      {/* ---- film strip header ---- */}
      <header style={{ background: C.film, paddingTop: 8, paddingBottom: 8 }}>
        <Sprockets />
        <div className="px-4 py-3 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: 28, color: "#F3EDE1", letterSpacing: 0.5 }}>
              Filmbox
            </div>
            <div className="flex" style={{ border: `1px solid #4A4232`, borderRadius: 6, overflow: "hidden" }}>
              {["de", "en"].map((l) => (
                <button key={l} onClick={() => switchLang(l)}
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 1, padding: "5px 12px", border: "none", cursor: "pointer", background: lang === l ? C.amber : "transparent", color: lang === l ? C.film : "#9A8E79" }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: C.amber, letterSpacing: 2, textTransform: "uppercase" }}>
            {film.brand} {film.name} ▸ EI {ei} ▸ {TYPE_SHORT[film.type]}
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#9A8E79", letterSpacing: 1 }}>
            {s.subtitle}
          </div>
        </div>
        <Sprockets />
      </header>

      <main className="px-4 py-6 flex flex-col gap-8 max-w-xl mx-auto">
        {/* ---- 01 FILM ---- */}
        <section>
          <SectionTitle index="01">{s.s1}</SectionTitle>
          <div className="flex gap-2 mb-2">
            <input aria-label={s.search} placeholder={s.search} value={search} onChange={(e) => setSearch(e.target.value)} style={inputStyle} />
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {["all", "c41", "bw", "ecn2", "e6"].map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)}
                style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 1, padding: "5px 10px", borderRadius: 999, border: `1px solid ${typeFilter === t ? C.ink : C.line}`, background: typeFilter === t ? C.ink : "transparent", color: typeFilter === t ? "#F3EDE1" : C.muted, cursor: "pointer" }}>
                {t === "all" ? s.all : t === "bw" ? s.bwShort : TYPE_SHORT[t]}
              </button>
            ))}
          </div>
          <div style={{ border: `1px solid ${C.line}`, borderRadius: 8, background: C.card, maxHeight: 280, overflowY: "auto" }}>
            {filteredFilms.map((f) => (
              <button key={f.id} onClick={() => selectFilm(f.id)}
                className="w-full text-left flex items-center justify-between gap-2 px-3 py-2"
                style={{ borderBottom: `1px solid ${C.line}`, background: f.id === film.id ? "#F2E3C8" : "transparent", cursor: "pointer" }}>
                <span style={{ fontSize: 14, fontWeight: f.id === film.id ? 600 : 400 }}>
                  {f.brand} {f.name}{f.custom ? ` · ${s.own}` : ""}
                </span>
                <span className="flex gap-1 items-center">
                  {f.flags?.remjet && <Badge tone="ox">REMJET</Badge>}
                  {f.flags?.tungsten && <Badge>TUNGSTEN</Badge>}
                  <Badge tone="amber">ISO {f.box}</Badge>
                </span>
              </button>
            ))}
            {filteredFilms.length === 0 && (
              <div className="px-3 py-4" style={{ color: C.muted, fontSize: 13 }}>{s.noHit}</div>
            )}
          </div>
          <button onClick={() => setShowFilmForm(!showFilmForm)}
            style={{ marginTop: 8, fontFamily: "'Space Mono', monospace", fontSize: 12, color: C.amberDeep, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            {showFilmForm ? s.closeForm : s.addFilm}
          </button>

          {showFilmForm && (
            <div className="mt-2 p-3 flex flex-col gap-2" style={{ border: `1px dashed ${C.line}`, borderRadius: 8, background: C.card }}>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder={s.brand} value={filmForm.brand} onChange={(e) => setFilmForm({ ...filmForm, brand: e.target.value })} style={inputStyle} />
                <input placeholder={s.name} value={filmForm.name} onChange={(e) => setFilmForm({ ...filmForm, name: e.target.value })} style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={filmForm.type} onChange={(e) => setFilmForm({ ...filmForm, type: e.target.value })} style={selectStyle}>
                  {["c41", "bw", "ecn2", "e6"].map((t) => <option key={t} value={t}>{s.typeLabel[t]}</option>)}
                </select>
                <select value={filmForm.box} onChange={(e) => setFilmForm({ ...filmForm, box: Number(e.target.value) })} style={selectStyle}>
                  {EI_STEPS.filter((x) => x >= 12 && x <= 3200).map((x) => <option key={x} value={x}>{s.boxIso} {x}</option>)}
                </select>
              </div>
              {[
                ["tolerant", s.cbTolerant],
                ["pushable", s.cbPush],
                ["contrasty", s.cbContrast],
                ...(filmForm.type === "ecn2" ? [["remjet", s.cbRemjet]] : []),
                ["tungsten", s.cbTungsten],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2" style={{ fontSize: 13 }}>
                  <input type="checkbox" checked={!!filmForm[key]} onChange={(e) => setFilmForm({ ...filmForm, [key]: e.target.checked })} />
                  {label}
                </label>
              ))}
              <input placeholder={s.devPh} value={filmForm.devNote} onChange={(e) => setFilmForm({ ...filmForm, devNote: e.target.value })} style={inputStyle} />
              <div style={{ fontSize: 12, color: C.muted }}>
                {s.derived(derived.overTol, derived.pushMax, derived.eiMin, derived.eiMax)}
              </div>
              <button onClick={addCustomFilm} style={{ background: C.ink, color: "#F3EDE1", border: "none", borderRadius: 6, padding: "9px 12px", fontFamily: "'Space Mono', monospace", fontSize: 13, cursor: "pointer" }}>
                {s.saveFilm}{storageOk ? "" : s.sessionOnly}
              </button>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-1">
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 1, color: C.muted }}>{s.tipLabel}</span>
            <InfoTip hint={s.tapClose}>{film.tip ? film.tip[lang] : ""}</InfoTip>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 1, color: C.muted, marginLeft: 14 }}>{s.metering}</span>
            <InfoTip hint={s.tapClose}>{meterAdvice}</InfoTip>
            {film.flags?.tungsten && (
              <>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 1, color: C.amberDeep, marginLeft: 14 }}>TUNGSTEN</span>
                <InfoTip hint={s.tapClose}>{s.tungstenBox}</InfoTip>
              </>
            )}
          </div>
          {film.flags?.remjet && (
            <div className="mt-2 p-3" style={{ borderLeft: `3px solid ${C.red}`, background: "#F6E4DE", fontSize: 13, borderRadius: 4 }}>
              <strong>{s.remjetBox.split(":")[0]}:</strong>{s.remjetBox.substring(s.remjetBox.indexOf(":") + 1)}
            </div>
          )}
        </section>

        {/* ---- 02 EI ---- */}
        <section>
          <SectionTitle index="02">{s.s2}</SectionTitle>
          <div className="p-4" style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10 }}>
            <div className="flex items-end justify-between mb-1">
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 2, color: C.muted }}>{s.setDial}</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 56, fontWeight: 900, lineHeight: 1 }}>{ei}</div>
              </div>
              <div className="text-right" style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: C.muted }}>
                {s.box} {film.box}<br />
                {verdict.diff < -0.15 ? `+${frac(verdict.diff)} ${s.over}` : verdict.diff > 0.15 ? `−${frac(verdict.diff)} ${s.under}` : "±0"}
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <input type="range" min={0} max={eiSteps.length - 1} value={eiIndex}
                onChange={(e) => setEi(eiSteps[Number(e.target.value)])} aria-label={s.s2} />
              <div aria-hidden="true" style={{ position: "absolute", top: "100%", left: `calc(13px + ${boxPct} * (100% - 26px) / 100)`, transform: "translateX(-50%)", fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.muted, whiteSpace: "nowrap", lineHeight: 1.2, textAlign: "center", pointerEvents: "none" }}>
                ▲<br />{s.box} {film.box}
              </div>
            </div>
            <div className="flex justify-between mt-1" style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.muted, marginBottom: 26 }}>
              <span>{eiSteps[0]}</span>
              <span>{eiSteps[eiSteps.length - 1]}</span>
            </div>

            <div className="mt-4 p-3" style={{ borderLeft: `3px solid ${verdictColor}`, background: "#FFFEFA", borderRadius: 4 }}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div style={{ fontWeight: 600, fontSize: 14, color: verdictColor, flex: "1 1 auto" }}>{verdict.title}</div>
                <InfoTip hint={s.tapClose}>
                  <div>{verdict.text}</div>
                  {example && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${C.line}` }}>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1, color: C.amberDeep }}>{s.exTitle.toUpperCase()} · </span>
                      {example}
                    </div>
                  )}
                </InfoTip>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.55, marginTop: 4 }}>{verdict.short}</div>
            </div>

            <div className="mt-3">
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 4 }}>{s.labNote}</div>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "'Space Mono', monospace", fontSize: 12, lineHeight: 1.6, background: C.film, color: "#EFE6D4", padding: "10px 12px", borderRadius: 6, margin: 0 }}>{note}</pre>
              <button onClick={copyNote} style={{ marginTop: 6, background: "none", border: `1px solid ${C.line}`, borderRadius: 6, padding: "6px 10px", fontFamily: "'Space Mono', monospace", fontSize: 12, cursor: "pointer", color: C.ink }}>
                {copied ? s.copied : s.copy}
              </button>
            </div>
          </div>
        </section>

        {/* ---- 03 LENS & SHUTTER ---- */}
        <section>
          <SectionTitle index="03">{s.s3}</SectionTitle>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 6 }}>{s.focal.toUpperCase()}</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {FOCAL_PRESETS.map((f) => (
                  <button key={f} onClick={() => setFocal(f)}
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, padding: "5px 10px", borderRadius: 999, border: `1px solid ${foc === f ? C.ink : C.line}`, background: foc === f ? C.ink : "transparent", color: foc === f ? "#F3EDE1" : C.muted, cursor: "pointer" }}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min={8} max={800} value={focal} onChange={(e) => setFocal(e.target.value)} style={{ ...inputStyle, width: 110 }} aria-label={s.focal} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: C.muted }}>{s.focalUnit}</span>
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center" style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 6 }}>
                {s.maxSpeed}
                <InfoTip hint={s.tapClose}>{s.maxSpeedHint}</InfoTip>
              </div>
              <div className="flex flex-wrap gap-2">
                {MAX_SPEED_OPTIONS.map((d) => (
                  <button key={d} onClick={() => setMaxDen(d)}
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, padding: "5px 10px", borderRadius: 999, border: `1px solid ${maxDen === d ? C.ink : C.line}`, background: maxDen === d ? C.ink : "transparent", color: maxDen === d ? "#F3EDE1" : C.muted, cursor: "pointer" }}>
                    1/{d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---- 04 LIGHT CHECK ---- */}
        <section>
          <SectionTitle index="04">{s.s4}</SectionTitle>
          <div className="flex flex-wrap gap-2 mb-3">
            {LIGHT_EVS.map((ev, i) => (
              <button key={ev} onClick={() => setLightEv(ev)}
                style={{ fontSize: 12, padding: "6px 10px", borderRadius: 999, border: `1px solid ${lightEv === ev ? C.ink : C.line}`, background: lightEv === ev ? C.ink : "transparent", color: lightEv === ev ? "#F3EDE1" : C.muted, cursor: "pointer" }}>
                {s.lights[i]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: C.muted }}>{s.aperture}</span>
            <select value={aperture} onChange={(e) => setAperture(Number(e.target.value))} style={{ ...selectStyle, width: "auto" }} aria-label={s.aperture}>
              {APERTURES.map((a) => <option key={a} value={a}>f/{a}</option>)}
            </select>
          </div>

          <div className="p-4" style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10 }}>
            {tooBright ? (
              <div style={{ fontSize: 14, color: C.oxblood, fontWeight: 600 }}>
                {s.tooBright(dens[0], aperture)}
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 2, color: C.muted }}>{s.gives}</div>
                <div className="flex items-baseline gap-3">
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: 44, fontWeight: 900 }}>{fmtShutter(snapped)}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: C.muted }}>{s.at} f/{aperture} · EI {ei} · {foc}mm</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: handColor, marginTop: 4 }}>
                  {handState === "ok" && s.handOk(foc)}
                  {handState === "edge" && s.handEdge}
                  {handState === "bad" && s.handBad}
                </div>
                {tooDark && <div style={{ fontSize: 13, color: C.red, marginTop: 4 }}>{s.tooDark(fmtShutter(slowest))}</div>}
              </>
            )}
            <div className="mt-3 flex flex-wrap items-center" style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 1, color: C.muted }}>
              {s.metering}
              <InfoTip hint={s.tapClose}>{meterAdvice}</InfoTip>
            </div>
            {options.length > 0 && (
              <div className="mt-3">
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 4 }}>{s.options}</div>
                <ol className="flex flex-col gap-2" style={{ fontSize: 13, lineHeight: 1.5, paddingLeft: 18 }}>
                  {options.map((o, i) => <li key={i}>{o}</li>)}
                </ol>
              </div>
            )}
          </div>
        </section>

        {/* ---- footer ---- */}
        <footer className="pt-2 pb-6">
          {customFilms.length > 0 && (
            <button onClick={resetCustom} style={{ fontSize: 12, color: C.oxblood, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 10 }}>
              {s.delCustom(customFilms.length)}
            </button>
          )}
          <div style={{ background: C.film, borderRadius: 6, paddingTop: 6, paddingBottom: 6 }}>
            <div className="px-3 flex justify-between" style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.amber, letterSpacing: 2 }}>
              <span>▸ 24 · 24A</span>
              <span>FILMBOX</span>
              <span>25 · 25A ▸</span>
            </div>
          </div>
          <p className="mt-3" style={{ fontSize: 10, color: C.muted, lineHeight: 1.5 }}>
            {s.footer}
          </p>
          <div className="mt-2 flex items-center justify-between" style={{ fontSize: 11, color: C.muted }}>
            <span>© {new Date().getFullYear()} lightbetweendays</span>
            <a href="https://www.instagram.com/light_between_days" target="_blank" rel="noreferrer" aria-label="Instagram: @light_between_days"
              style={{ color: C.amberDeep, display: "inline-flex" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
            </a>
            <a href="https://www.lightbetweendays.de" target="_blank" rel="noreferrer" style={{ color: C.amberDeep, textDecoration: "none" }}>
              lightbetweendays.de
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}


ReactDOM.createRoot(document.getElementById("root")).render(<App />);
