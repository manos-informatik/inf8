/* Variablen - Übersicht, Klasse 8, Algorithmierung
   Nachschlagewerk: Beispiele und Gegenüberstellungen. Keine Aufgaben, keine Bewertung.
   Die Auswahl wird automatisch gesichert - keine Speichern-Knöpfe. */

(() => {
  "use strict";

  const STORAGE_KEY = "inf8-variablen-uebersicht-v1";

  const TYPEN = ["int", "float", "boolean", "char", "String"];
  const SCHRITTE = ["deklaration", "initialisierung", "zuweisung"];
  const BLICKE = ["setup", "draw"];
  const GROESSEN = { "400x400": [400, 400], "500x300": [500, 300] };

  const state = {
    typ: "int",
    schritt: "deklaration",
    blick: "setup",
    zyklen: 3,
    groesse: "400x400",
    mausX: null,
    mausY: null
  };

  const persist = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Speichern ist optional; ohne localStorage geht nur die Auswahl zwischen Besuchen verloren.
    }
  };

  const restore = () => {
    try {
      const roh = localStorage.getItem(STORAGE_KEY);
      if (!roh) return;
      const d = JSON.parse(roh);
      if (!d || typeof d !== "object") return;
      if (TYPEN.includes(d.typ)) state.typ = d.typ;
      if (SCHRITTE.includes(d.schritt)) state.schritt = d.schritt;
      if (BLICKE.includes(d.blick)) state.blick = d.blick;
      if (Number.isInteger(d.zyklen) && d.zyklen >= 1 && d.zyklen <= 6) state.zyklen = d.zyklen;
      if (GROESSEN[d.groesse]) state.groesse = d.groesse;
      if (Number.isFinite(d.mausX)) state.mausX = d.mausX;
      if (Number.isFinite(d.mausY)) state.mausY = d.mausY;
    } catch {
      // ungültige Daten ignorieren, Seite startet mit den Vorgaben
    }
  };

  /* ---------- kleine Helfer ---------- */

  const $ = (id) => document.getElementById(id);

  /* Eine Codezeile besteht aus Teilen [klasse, text]; klasse darf null sein. */
  const renderCode = (ziel, zeilen) => {
    ziel.textContent = "";
    zeilen.forEach((z) => {
      const zeile = document.createElement("span");
      zeile.className = "code-line";
      if (z.gilt) zeile.classList.add("is-scope");
      if (z.aktiv) zeile.classList.add("is-active");
      if (z.fehler) zeile.classList.add("is-broken");
      (z.teile || []).forEach(([klasse, text]) => {
        if (!klasse) { zeile.appendChild(document.createTextNode(text)); return; }
        const tok = document.createElement("span");
        tok.className = klasse;
        tok.textContent = text;
        zeile.appendChild(tok);
      });
      ziel.appendChild(zeile);
    });
  };

  const setzeText = (el, text, klasse) => {
    if (el.textContent !== text) el.textContent = text;
    el.classList.remove("gilt", "gilt-nicht");
    if (klasse) el.classList.add(klasse);
  };

  const drueckeGruppe = (knoepfe, attribut, wert) => {
    knoepfe.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset[attribut] === wert)));
  };

  /* ================================================================
     Datentypen
     ================================================================ */

  const TYP_BEISPIEL = {
    int: {
      code: [
        { teile: [["type", "int"], [null, " "], ["var", "punkte"], [null, " = "], ["num", "0"], [null, ";"]] },
        { teile: [] },
        { teile: [["keyword", "void"], [null, " "], ["fn", "draw"], [null, "() {"]] },
        { teile: [[null, "  "], ["var", "punkte"], [null, " = "], ["var", "punkte"], [null, " + "], ["num", "1"], [null, ";"]] },
        { teile: [[null, "}"]] }
      ],
      fehler: [{ teile: [["type", "int"], [null, " "], ["var", "punkte"], [null, " = "], ["num", "0.5"], [null, ";"]], fehler: true }],
      fazit: "int speichert nur ganze Zahlen. Für 0.5 brauchst du float."
    },
    float: {
      code: [
        { teile: [["type", "float"], [null, " "], ["var", "temperatur"], [null, " = "], ["num", "22.5"], [null, ";"]] },
        { teile: [] },
        { teile: [["keyword", "void"], [null, " "], ["fn", "draw"], [null, "() {"]] },
        { teile: [[null, "  "], ["var", "temperatur"], [null, " = "], ["var", "temperatur"], [null, " + "], ["num", "0.1"], [null, ";"]] },
        { teile: [[null, "}"]] }
      ],
      fehler: [{ teile: [["type", "float"], [null, " "], ["var", "temperatur"], [null, " = "], ["num", "22,5"], [null, ";"]], fehler: true }],
      fazit: "Processing schreibt Kommazahlen mit Punkt, nicht mit Komma."
    },
    boolean: {
      code: [
        { teile: [["type", "boolean"], [null, " "], ["var", "sichtbar"], [null, " = "], ["keyword", "true"], [null, ";"]] },
        { teile: [] },
        { teile: [["keyword", "void"], [null, " "], ["fn", "draw"], [null, "() {"]] },
        { teile: [[null, "  "], ["fn", "println"], [null, "("], ["var", "sichtbar"], [null, ");"]] },
        { teile: [[null, "}"]] }
      ],
      fehler: [{ teile: [["type", "boolean"], [null, " "], ["var", "sichtbar"], [null, " = "], ["num", "1"], [null, ";"]], fehler: true }],
      fazit: "Ein boolean kennt nur true und false, keine Zahlen."
    },
    char: {
      code: [
        { teile: [["type", "char"], [null, " "], ["var", "note"], [null, " = "], ["str", "'A'"], [null, ";"]] },
        { teile: [] },
        { teile: [["keyword", "void"], [null, " "], ["fn", "draw"], [null, "() {"]] },
        { teile: [[null, "  "], ["fn", "println"], [null, "("], ["var", "note"], [null, ");"]] },
        { teile: [[null, "}"]] }
      ],
      fehler: [{ teile: [["type", "char"], [null, " "], ["var", "note"], [null, " = "], ["str", '"A"'], [null, ";"]], fehler: true }],
      fazit: "Ein char steht in einfachen Anführungszeichen, doppelte gehören zu String."
    },
    String: {
      code: [
        { teile: [["type", "String"], [null, " "], ["var", "name"], [null, " = "], ["str", '"Ada"'], [null, ";"]] },
        { teile: [] },
        { teile: [["keyword", "void"], [null, " "], ["fn", "draw"], [null, "() {"]] },
        { teile: [[null, "  "], ["fn", "println"], [null, "("], ["str", '"Hallo "'], [null, " + "], ["var", "name"], [null, ");"]] },
        { teile: [[null, "}"]] }
      ],
      fehler: [{ teile: [["type", "String"], [null, " "], ["var", "name"], [null, " = "], ["str", "'Ada'"], [null, ";"]], fehler: true }],
      fazit: "Ein String steht in doppelten Anführungszeichen, einfache gehören zu char."
    }
  };

  const typKnoepfe = [...document.querySelectorAll("[data-typ]")];

  const renderTypen = () => {
    const b = TYP_BEISPIEL[state.typ];
    drueckeGruppe(typKnoepfe, "typ", state.typ);
    renderCode($("typCode"), b.code);
    renderCode($("typFehler"), b.fehler);
    setzeText($("typFazit"), b.fazit, "gilt-nicht");
  };

  typKnoepfe.forEach((b) => b.addEventListener("click", () => {
    state.typ = b.dataset.typ;
    persist();
    renderTypen();
  }));

  /* ================================================================
     Deklarieren, initialisieren, zuweisen
     ================================================================ */

  const SCHRITT_ZEILE = { deklaration: 0, initialisierung: 3, zuweisung: 7 };

  const SCHRITT_TEXT = {
    deklaration: "Zeile 1 legt Datentyp und Name fest. Die Variable existiert, hat aber noch keinen Wert.",
    initialisierung: "Zeile 4 gibt der Variablen zum ersten Mal einen Wert.",
    zuweisung: "Zeile 8 ändert den Wert. Rechts wird zuerst gerechnet, dann wird das Ergebnis eingesetzt."
  };

  const schrittKnoepfe = [...document.querySelectorAll("[data-schritt]")];

  const renderSchritte = () => {
    const treffer = SCHRITT_ZEILE[state.schritt];
    drueckeGruppe(schrittKnoepfe, "schritt", state.schritt);

    const zeilen = [
      { teile: [["type", "int"], [null, " "], ["var", "x"], [null, ";"]] },
      { teile: [] },
      { teile: [["keyword", "void"], [null, " "], ["fn", "setup"], [null, "() {"]] },
      { teile: [[null, "  "], ["var", "x"], [null, " = "], ["num", "0"], [null, ";"]] },
      { teile: [[null, "}"]] },
      { teile: [] },
      { teile: [["keyword", "void"], [null, " "], ["fn", "draw"], [null, "() {"]] },
      { teile: [[null, "  "], ["var", "x"], [null, " = "], ["var", "x"], [null, " + "], ["num", "2"], [null, ";"]] },
      { teile: [[null, "}"]] }
    ];
    zeilen[treffer].aktiv = true;
    renderCode($("schrittCode"), zeilen);
    setzeText($("schrittFazit"), SCHRITT_TEXT[state.schritt], null);
  };

  schrittKnoepfe.forEach((b) => b.addEventListener("click", () => {
    state.schritt = b.dataset.schritt;
    persist();
    renderSchritte();
  }));

  /* ================================================================
     Global oder lokal - Gegenüberstellung
     ================================================================ */

  const blickKnoepfe = [...document.querySelectorAll("[data-blick]")];

  const printlnZeile = (einzug, variable) => ({
    teile: [[null, einzug], ["fn", "println"], [null, "("], ["var", variable], [null, ");"]]
  });

  const renderGueltig = () => {
    const ausSetup = state.blick === "setup";
    drueckeGruppe(blickKnoepfe, "blick", state.blick);

    // links: global - gilt von der Deklaration bis zum Dateiende
    const global = [
      { teile: [["type", "int"], [null, " "], ["var", "wert"], [null, " = "], ["num", "100"], [null, ";"]], gilt: true },
      { teile: [], gilt: true },
      { teile: [["keyword", "void"], [null, " "], ["fn", "setup"], [null, "() {"]], gilt: true },
      { ...printlnZeile("  ", "wert"), gilt: true, aktiv: ausSetup },
      { teile: [[null, "}"]], gilt: true },
      { teile: [], gilt: true },
      { teile: [["keyword", "void"], [null, " "], ["fn", "draw"], [null, "() {"]], gilt: true },
      { ...printlnZeile("  ", "wert"), gilt: true, aktiv: !ausSetup },
      { teile: [[null, "}"]], gilt: true }
    ];

    // rechts: lokal - gilt nur im Block von draw()
    const lokal = [
      { teile: [["keyword", "void"], [null, " "], ["fn", "setup"], [null, "() {"]] },
      // Zeile 2 ist immer kaputt - das Programm startet in keinem Blickwinkel
      { ...printlnZeile("  ", "wert"), aktiv: ausSetup, fehler: true },
      { teile: [[null, "}"]] },
      { teile: [] },
      { teile: [["keyword", "void"], [null, " "], ["fn", "draw"], [null, "() {"]] },
      { teile: [[null, "  "], ["type", "int"], [null, " "], ["var", "wert"], [null, " = "], ["num", "5"], [null, ";"]], gilt: true },
      { ...printlnZeile("  ", "wert"), gilt: true, aktiv: !ausSetup },
      { teile: [[null, "}"]] }
    ];

    renderCode($("globalCode"), global);
    renderCode($("lokalCode"), lokal);

    setzeText($("globalFazit"),
      ausSetup ? "Zeile 4 gibt 100 aus - wert gilt ab Zeile 1 überall."
               : "Zeile 8 gibt 100 aus - es ist dieselbe Variable wie in setup().",
      "gilt");

    setzeText($("lokalFazit"),
      ausSetup ? "Zeile 2 kennt wert nicht - hier bricht Processing ab."
               : "Zeile 7 würde 5 ausgeben, aber wegen Zeile 2 startet das Programm nicht.",
      "gilt-nicht");
  };

  blickKnoepfe.forEach((b) => b.addEventListener("click", () => {
    state.blick = b.dataset.blick;
    persist();
    renderGueltig();
  }));

  /* ================================================================
     print() und println()
     ================================================================ */

  const regler = $("zyklen");

  /* Beide Panels zeigen dasselbe Programm; nur die Ausgabefunktion in Zeile 5
     unterscheidet sich. Die Konsole daneben wird aus genau diesem Programm
     abgeleitet: x startet bei 0 und wächst pro draw()-Zyklus um 2. */
  const konsolenProgramm = (fn) => [
    { teile: [["type", "int"], [null, " "], ["var", "x"], [null, " = "], ["num", "0"], [null, ";"]] },
    { teile: [] },
    { teile: [["keyword", "void"], [null, " "], ["fn", "draw"], [null, "() {"]] },
    { teile: [[null, "  "], ["var", "x"], [null, " = "], ["var", "x"], [null, " + "], ["num", "2"], [null, ";"]] },
    {
      teile: [
        [null, "  "], ["fn", fn], [null, "("], ["str", '"x = "'],
        [null, " + "], ["var", "x"], [null, ");"]
      ],
      aktiv: true
    },
    { teile: [[null, "}"]] }
  ];

  const renderKonsolen = () => {
    renderCode($("codePrintln"), konsolenProgramm("println"));
    renderCode($("codePrint"), konsolenProgramm("print"));

    // ein Zyklus = eine Ausführung von draw(): erst x erhöhen, dann ausgeben
    const stuecke = [];
    for (let x = 0, i = 0; i < state.zyklen; i += 1) {
      x = x + 2;
      stuecke.push("x = " + x);
    }

    const fuelle = (ziel, zeilen) => {
      ziel.textContent = "";
      zeilen.forEach((t) => {
        const el = document.createElement("span");
        el.className = "console-line";
        el.textContent = t;
        ziel.appendChild(el);
      });
    };

    fuelle($("konsolePrintln"), stuecke);          // println: je Zyklus eine Zeile
    fuelle($("konsolePrint"), [stuecke.join("")]); // print: alles in einer Zeile
    $("zyklenWert").textContent = String(state.zyklen);
    regler.value = String(state.zyklen);
  };

  regler.addEventListener("input", () => {
    const n = Number(regler.value);
    state.zyklen = Number.isInteger(n) ? n : 3;
    persist();
    renderKonsolen();
  });

  /* ================================================================
     Systemvariablen
     ================================================================ */

  const sys = {
    auswahl: $("groesse"), stack: $("stack"), zeichnung: $("zeichnung"), raster: $("raster"),
    code: $("sysCode"), aufruf: $("aufruf")
  };

  const zeichneRaster = (w, h) => {
    const ctx = sys.raster.getContext("2d");
    ctx.clearRect(0, 0, w, h);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(100, 116, 139, 0.25)";
    ctx.beginPath();
    for (let x = 10; x < w; x += 10) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
    for (let y = 10; y < h; y += 10) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();

    // jede fünfte Linie kräftiger, damit man 50er-Schritte abzählen kann
    ctx.strokeStyle = "rgba(100, 116, 139, 0.5)";
    ctx.beginPath();
    for (let x = 50; x < w; x += 50) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
    for (let y = 50; y < h; y += 50) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();

    ctx.strokeStyle = "rgba(37, 99, 235, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 1); ctx.lineTo(w, 1);
    ctx.moveTo(1, 0); ctx.lineTo(1, h);
    ctx.stroke();

    ctx.fillStyle = "#475569";
    ctx.font = "11px 'Segoe UI', sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("(0, 0)", 6, 6);
    ctx.textAlign = "right";
    ctx.fillText(`(${w}, 0)`, w - 6, 6);
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(`(0, ${h})`, 6, h - 6);
    ctx.textBaseline = "alphabetic";
  };

  const zeichneFlaeche = (w, h) => {
    const ctx = sys.zeichnung.getContext("2d");
    ctx.fillStyle = "#dcdcdc";              // background(220)
    ctx.fillRect(0, 0, w, h);
    if (state.mausX === null) return;
    ctx.beginPath();
    ctx.arc(state.mausX, state.mausY, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    ctx.stroke();
  };

  const renderSystem = () => {
    const [w, h] = GROESSEN[state.groesse];
    sys.auswahl.value = state.groesse;
    sys.stack.style.setProperty("--cw", String(w));
    sys.stack.style.setProperty("--ch", String(h));
    [sys.zeichnung, sys.raster].forEach((c) => {
      if (c.width !== w) c.width = w;
      if (c.height !== h) c.height = h;
    });

    const gesetzt = state.mausX !== null;
    $("sysMouseX").textContent = gesetzt ? String(state.mausX) : "–";
    $("sysMouseY").textContent = gesetzt ? String(state.mausY) : "–";
    $("sysWidth").textContent = String(w);
    $("sysHeight").textContent = String(h);

    renderCode(sys.code, [
      { teile: [["keyword", "void"], [null, " "], ["fn", "setup"], [null, "() {"]] },
      { teile: [[null, "  "], ["fn", "size"], [null, "("], ["num", String(w)], [null, ", "], ["num", String(h)], [null, ");"]] },
      { teile: [[null, "}"]] },
      { teile: [] },
      { teile: [["keyword", "void"], [null, " "], ["fn", "draw"], [null, "() {"]] },
      { teile: [[null, "  "], ["fn", "background"], [null, "("], ["num", "220"], [null, ");"]] },
      { teile: [[null, "  "], ["fn", "circle"], [null, "("], ["var", "mouseX"], [null, ", "], ["var", "mouseY"], [null, ", "], ["num", "40"], [null, ");"]] },
      { teile: [[null, "}"]] }
    ]);

    zeichneRaster(w, h);
    zeichneFlaeche(w, h);
    const text = gesetzt ? `circle(${state.mausX}, ${state.mausY}, 40)` : "noch nichts gezeichnet";
    if (sys.aufruf.textContent !== text) sys.aufruf.textContent = text;
  };

  const setzeMaus = (x, y) => {
    const [w, h] = GROESSEN[state.groesse];
    state.mausX = Math.max(0, Math.min(w, Math.round(x)));
    state.mausY = Math.max(0, Math.min(h, Math.round(y)));
    persist();
    renderSystem();
  };

  sys.stack.addEventListener("pointermove", (e) => {
    const [w, h] = GROESSEN[state.groesse];
    const kasten = sys.stack.getBoundingClientRect();
    if (!kasten.width || !kasten.height) return;
    setzeMaus((e.clientX - kasten.left) * (w / kasten.width),
              (e.clientY - kasten.top) * (h / kasten.height));
  });

  sys.stack.addEventListener("keydown", (e) => {
    const schritte = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
    const schritt = schritte[e.key];
    if (!schritt) return;
    e.preventDefault();
    const [w, h] = GROESSEN[state.groesse];
    const startX = state.mausX === null ? Math.round(w / 2) : state.mausX;
    const startY = state.mausY === null ? Math.round(h / 2) : state.mausY;
    setzeMaus(startX + schritt[0], startY + schritt[1]);
  });

  sys.auswahl.addEventListener("change", () => {
    state.groesse = GROESSEN[sys.auswahl.value] ? sys.auswahl.value : "400x400";
    const [w, h] = GROESSEN[state.groesse];
    if (state.mausX !== null) {
      state.mausX = Math.min(state.mausX, w);
      state.mausY = Math.min(state.mausY, h);
    }
    persist();
    renderSystem();
  });

  /* ================================================================
     Kopieren
     ================================================================ */

  const inZwischenablage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // unsicherer Kontext oder alter Browser
    }
    try {
      const feld = document.createElement("textarea");
      feld.value = text;
      feld.setAttribute("readonly", "");
      feld.style.position = "fixed";
      feld.style.top = "-1000px";
      document.body.appendChild(feld);
      feld.select();
      const geklappt = document.execCommand("copy");
      document.body.removeChild(feld);
      return geklappt;
    } catch {
      return false;
    }
  };

  document.querySelectorAll("[data-kopieren]").forEach((b) => {
    const urspruenglich = b.textContent;
    b.addEventListener("click", async () => {
      const text = [...$(b.dataset.kopieren).querySelectorAll(".code-line")]
        .map((z) => z.textContent.replace(/\s+$/, ""))
        .join("\n");
      const geklappt = await inZwischenablage(text);
      b.textContent = geklappt ? "Kopiert" : "Klappt nicht";
      window.setTimeout(() => { b.textContent = urspruenglich; }, 1600);
    });
  });

  /* ================================================================
     Start
     ================================================================ */

  restore();
  renderTypen();
  renderSchritte();
  renderGueltig();
  renderKonsolen();
  renderSystem();
})();
