/* Funktionen - Übersicht, Klasse 8, Algorithmierung
   Nachschlagewerk: Beispiele und Gegenüberstellungen. Keine Aufgaben, keine Bewertung.
   Die Auswahl wird automatisch gesichert - keine Speichern-Knöpfe. */

(() => {
  "use strict";

  const STORAGE_KEY = "inf8-funktionen-uebersicht-v1";

  const TEILE = ["void", "name", "klammern", "rumpf"];
  const TEILAUFGABEN = ["hintergrund", "position", "figur"];
  const VARIANTEN_NAMEN = ["global", "lokal"];

  const state = { teil: "void", teilaufgabe: "hintergrund", variante: "global", zyklus: 1, schritt: 0 };

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
      if (TEILE.includes(d.teil)) state.teil = d.teil;
      if (TEILAUFGABEN.includes(d.teilaufgabe)) state.teilaufgabe = d.teilaufgabe;
      if (VARIANTEN_NAMEN.includes(d.variante)) state.variante = d.variante;
      if (Number.isInteger(d.zyklus) && d.zyklus >= 1 && d.zyklus <= 200) state.zyklus = d.zyklus;
      // Schritt erst nach dem Wiederherstellen der Variante begrenzen
      if (Number.isInteger(d.schritt) && d.schritt >= 0) {
        state.schritt = Math.min(d.schritt, VARIANTEN[state.variante].schritte.length);
      }
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

  /* Markiert Zeilen anhand ihrer Nummer - die Listen stehen bei jeder Karte dabei. */
  const markiere = (zeilen, nummern, schluessel) => zeilen.map((z, i) =>
    (nummern.includes(i) ? { ...z, [schluessel]: true } : z));

  const leer = { teile: [] };

  /* ================================================================
     Aufbau einer Funktion
     ================================================================ */

  const TEIL_TEXT = {
    void: ["void heißt: die Funktion gibt keinen Wert zurück, sie erledigt nur etwas.",
           "Im Aufruf steht kein void - das gehört nur zur Definition."],
    name: ["Der Name steht für den ganzen Rumpf. Er beginnt mit einem Verb und wird klein geschrieben.",
           "Definition und Aufruf müssen denselben Namen tragen, Buchstabe für Buchstabe."],
    klammern: ["Die Klammern bleiben leer: diese Funktion bekommt keine Werte mit.",
               "Auch im Aufruf stehen die Klammern, selbst wenn nichts dazwischen steht."],
    rumpf: ["Zwischen den geschweiften Klammern steht, was die Funktion tut.",
            "Beim Aufruf wird der Rumpf ausgeführt und danach geht es in draw() weiter."]
  };

  /* gibt die Klasse zurück und hängt die Markierung an, wenn der Teil gewählt ist */
  const teilKlasse = (teil, klasse) => (state.teil === teil ? (klasse ? klasse + " ist-teil" : "ist-teil") : klasse);

  const teilKnoepfe = [...document.querySelectorAll("[data-teil]")];

  const renderAufbau = () => {
    drueckeGruppe(teilKnoepfe, "teil", state.teil);

    renderCode($("defCode"), [
      {
        teile: [
          [teilKlasse("void", "keyword"), "void"], [null, " "],
          [teilKlasse("name", "fn"), "zeichneFigur"],
          [teilKlasse("klammern", null), "()"], [null, " {"]
        ]
      },
      { teile: [[null, "  "], ["fn", "circle"], [null, "("], ["var", "x"], [null, ", "], ["num", "200"], [null, ", "], ["num", "40"], [null, ");"]], aktiv: state.teil === "rumpf" },
      { teile: [[null, "}"]] }
    ]);

    renderCode($("aufrufCode"), [
      { teile: [["keyword", "void"], [null, " "], ["fn", "draw"], [null, "() {"]] },
      {
        teile: [
          [null, "  "], [teilKlasse("name", "fn"), "zeichneFigur"],
          [teilKlasse("klammern", null), "()"], [null, ";"]
        ]
      },
      { teile: [[null, "}"]] }
    ]);

    setzeText($("defFazit"), TEIL_TEXT[state.teil][0], null);
    setzeText($("aufrufFazit"), TEIL_TEXT[state.teil][1], null);
  };

  teilKnoepfe.forEach((b) => b.addEventListener("click", () => {
    state.teil = b.dataset.teil;
    persist();
    renderAufbau();
  }));

  /* ================================================================
     Ein draw() oder viele Funktionen
     ================================================================ */

  const kopf = [
    { teile: [["type", "int"], [null, " "], ["var", "x"], [null, ";"]] },
    { teile: [["type", "int"], [null, " "], ["var", "y"], [null, ";"]] },
    leer,
    { teile: [["keyword", "void"], [null, " "], ["fn", "setup"], [null, "() {"]] },
    { teile: [[null, "  "], ["fn", "size"], [null, "("], ["num", "400"], [null, ", "], ["num", "400"], [null, ");"]] },
    { teile: [[null, "}"]] },
    leer
  ];

  const def = (name) => ({ teile: [["keyword", "void"], [null, " "], ["fn", name], [null, "() {"]] });
  const ruf = (name) => ({ teile: [[null, "  "], ["fn", name], [null, "();"]] });
  const zu = { teile: [[null, "}"]] };

  const hintergrundZeile = { teile: [[null, "  "], ["fn", "background"], [null, "("], ["num", "220"], [null, ");"]] };
  const posZeilen = [
    { teile: [[null, "  "], ["var", "x"], [null, " = "], ["var", "mouseX"], [null, ";"]] },
    { teile: [[null, "  "], ["var", "y"], [null, " = "], ["var", "mouseY"], [null, ";"]] }
  ];
  const figurZeile = { teile: [[null, "  "], ["fn", "circle"], [null, "("], ["var", "x"], [null, ", "], ["var", "y"], [null, ", "], ["num", "30"], [null, ");"]] };

  const LANG = [...kopf, def("draw"), hintergrundZeile, ...posZeilen, figurZeile, zu];

  const ZERLEGT = [
    ...kopf,
    def("draw"), ruf("zeichneHintergrund"), ruf("aktualisierePosition"), ruf("zeichneSpielfigur"), zu,
    leer,
    def("zeichneHintergrund"), hintergrundZeile, zu,
    leer,
    def("aktualisierePosition"), ...posZeilen, zu,
    leer,
    def("zeichneSpielfigur"), figurZeile, zu
  ];

  /* Zeilennummern der Teilaufgaben - links im langen draw(), rechts Aufruf und Definition. */
  const TEILAUFGABE = {
    hintergrund: { lang: [8], zerlegt: [8, 13, 14, 15],
      fazit: "Eine Zeile links, eine Funktion rechts. Der Aufruf steht an genau der Stelle, an der vorher die Zeile stand." },
    position: { lang: [9, 10], zerlegt: [9, 17, 18, 19, 20],
      fazit: "Zwei Zeilen werden zu einer Funktion mit einem Namen, der sagt, was sie tun." },
    figur: { lang: [11], zerlegt: [10, 22, 23, 24],
      fazit: "In draw() steht rechts nur noch der Bauplan: erst Hintergrund, dann Position, dann Figur." }
  };

  const teilaufgabeKnoepfe = [...document.querySelectorAll("[data-teilaufgabe]")];

  const renderZerlegt = () => {
    const wahl = TEILAUFGABE[state.teilaufgabe];
    drueckeGruppe(teilaufgabeKnoepfe, "teilaufgabe", state.teilaufgabe);
    renderCode($("langCode"), markiere(LANG, wahl.lang, "gilt"));
    renderCode($("zerlegtCode"), markiere(ZERLEGT, wahl.zerlegt, "gilt"));
    setzeText($("zerlegtFazit"), wahl.fazit, "gilt");
  };

  teilaufgabeKnoepfe.forEach((b) => b.addEventListener("click", () => {
    state.teilaufgabe = b.dataset.teilaufgabe;
    persist();
    renderZerlegt();
  }));

  /* ================================================================
     Warum die Position global sein muss
     Schritt für Schritt durch dasselbe Programm, einmal mit globaler
     und einmal mit lokaler Variablen. Code und Zeichenfläche stammen
     aus derselben Beschreibung, damit sie nicht auseinanderlaufen.
     ================================================================ */

  const bg = { teile: [[null, "  "], ["fn", "background"], [null, "("], ["num", "220"], [null, ");"]] };
  const kreis = { teile: [[null, "  "], ["fn", "circle"], [null, "("], ["var", "x"], [null, ", "], ["num", "200"], [null, ", "], ["num", "40"], [null, ");"]] };
  const plusDrei = { teile: [[null, "  "], ["var", "x"], [null, " = "], ["var", "x"], [null, " + "], ["num", "3"], [null, ";"]] };
  const lokalesX = { teile: [[null, "  "], ["type", "int"], [null, " "], ["var", "x"], [null, " = "], ["num", "50"], [null, ";"]] };
  const groesse = { teile: [[null, "  "], ["fn", "size"], [null, "("], ["num", "400"], [null, ", "], ["num", "400"], [null, ");"]] };

  /* Zwei Schritte je Zyklus: ein Aufruf aus draw() und die Funktion dahinter.
     Markiert wird beides zusammen - die Aufrufzeile und der ganze Rumpf. */
  const VARIANTEN = {
    global: {
      zeilen: [
        { teile: [["type", "int"], [null, " "], ["var", "x"], [null, " = "], ["num", "50"], [null, ";"]] },
        leer,
        def("setup"), groesse, zu,
        leer,
        def("draw"), ruf("bewegeFigur"), ruf("zeichneFigur"), zu,
        leer,
        def("bewegeFigur"), plusDrei, zu,
        leer,
        def("zeichneFigur"), bg, kreis, zu
      ],
      anfang: () => ({ x: 50 }),
      wertVorher: "x = 50",
      hinweis: "Noch nichts gelaufen. x steht schon bei 50, weil es ganz oben deklariert ist.",
      schritte: [
        {
          zeilen: [7, 11, 12, 13],
          tun: (s) => { s.x += 3; },
          wert: (s) => `x = ${s.x}`,
          text: "bewegeFigur() erhöht x um 3. Es ist die eine globale Variable, sie behält ihren Wert."
        },
        {
          zeilen: [8, 15, 16, 17, 18],
          tun: (s) => { s.gezeichnet = s.x; },
          wert: (s) => `x = ${s.x}`,
          text: "zeichneFigur() malt den Kreis beim aktuellen x."
        }
      ],
      fazit: "Jeder Zyklus rückt die Figur um 3 weiter, weil dasselbe x erhalten bleibt."
    },

    lokal: {
      zeilen: [
        def("setup"), groesse, zu,
        leer,
        def("draw"), ruf("bewegeFigur"), ruf("zeichneFigur"), zu,
        leer,
        def("bewegeFigur"), lokalesX, plusDrei, zu,
        leer,
        def("zeichneFigur"), lokalesX, bg, kreis, zu
      ],
      anfang: () => ({ xBewege: null, xZeichne: null }),
      wertVorher: "x gibt es noch nicht",
      hinweis: "Noch nichts gelaufen. Beide Funktionen legen ihr x gleich selbst an.",
      schritte: [
        {
          zeilen: [5, 9, 10, 11, 12],
          tun: (s) => { s.xBewege = 50; s.xBewege += 3; },
          wert: (s) => `x in bewegeFigur() = ${s.xBewege}`,
          text: "bewegeFigur() legt ein eigenes x an und macht 53 daraus - beim Verlassen ist es wieder weg."
        },
        {
          zeilen: [6, 14, 15, 16, 17, 18],
          tun: (s) => { s.xZeichne = 50; s.gezeichnet = s.xZeichne; },
          wert: (s) => `x in zeichneFigur() = ${s.xZeichne}`,
          text: "zeichneFigur() legt wieder ein eigenes x an. Es startet bei 50, von der 53 weiß es nichts."
        }
      ],
      fazit: "Die Figur bleibt stehen: in jedem Zyklus wird x neu angelegt und startet wieder bei 50."
    }
  };

  /* Spielt den Ablauf bis zum gespeicherten Stand nach. */
  const standBei = (name, zyklus, schritt) => {
    const v = VARIANTEN[name];
    const s = { ...v.anfang(), gezeichnet: null };
    for (let z = 1; z < zyklus; z += 1) v.schritte.forEach((sch) => { if (sch.tun) sch.tun(s); });
    for (let i = 0; i < schritt; i += 1) { const sch = v.schritte[i]; if (sch.tun) sch.tun(s); }
    return s;
  };

  const zeichneRaster = () => {
    const ctx = $("figurRaster").getContext("2d");
    ctx.clearRect(0, 0, 400, 400);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(100, 116, 139, 0.25)";
    ctx.beginPath();
    for (let v = 10; v < 400; v += 10) {
      ctx.moveTo(v + 0.5, 0); ctx.lineTo(v + 0.5, 400);
      ctx.moveTo(0, v + 0.5); ctx.lineTo(400, v + 0.5);
    }
    ctx.stroke();

    // jede fünfte Linie kräftiger, damit man 50er-Schritte abzählen kann
    ctx.strokeStyle = "rgba(100, 116, 139, 0.5)";
    ctx.beginPath();
    for (let v = 50; v < 400; v += 50) {
      ctx.moveTo(v + 0.5, 0); ctx.lineTo(v + 0.5, 400);
      ctx.moveTo(0, v + 0.5); ctx.lineTo(400, v + 0.5);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(37, 99, 235, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 1); ctx.lineTo(400, 1);
    ctx.moveTo(1, 0); ctx.lineTo(1, 400);
    ctx.stroke();

    ctx.fillStyle = "#475569";
    ctx.font = "11px 'Segoe UI', sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("(0, 0)", 6, 6);
    ctx.textAlign = "right";
    ctx.fillText("(400, 0)", 394, 6);
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("(0, 400)", 6, 394);
    ctx.textBaseline = "alphabetic";
  };

  const zeichneFlaeche = (x) => {
    const ctx = $("figurCanvas").getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = "#dcdcdc";              // background(220)
    ctx.fillRect(0, 0, 400, 400);
    if (x === null || x === undefined) return;
    ctx.beginPath();
    ctx.arc(x, 200, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    ctx.stroke();
  };

  const variantenKnoepfe = [...document.querySelectorAll("[data-variante]")];

  const renderFigur = () => {
    const v = VARIANTEN[state.variante];
    drueckeGruppe(variantenKnoepfe, "variante", state.variante);

    const stand = standBei(state.variante, state.zyklus, state.schritt);
    const laufend = state.schritt > 0 ? v.schritte[state.schritt - 1] : null;

    // Nur eine Farbe auf dieser Karte: Gelb zeigt, was gerade laeuft.
    // Wo x gilt, sagt die Wertanzeige neben der Zeichenflaeche im Klartext.
    const zeilen = laufend ? markiere(v.zeilen, laufend.zeilen, "aktiv") : v.zeilen;
    renderCode($("figurCode"), zeilen);

    $("figurZyklus").textContent = `Zyklus: ${state.zyklus}`;
    $("figurSchritt").textContent = `Schritt: ${state.schritt} von ${v.schritte.length}`;

    zeichneFlaeche(stand.gezeichnet);
    $("figurWert").textContent = laufend ? laufend.wert(stand) : v.wertVorher;
    $("figurAufruf").textContent = stand.gezeichnet === null || stand.gezeichnet === undefined
      ? "noch nichts gezeichnet"
      : `circle(${stand.gezeichnet}, 200, 40)`;

    if (!laufend) {
      setzeText($("figurFazit"), v.hinweis, null);
      return;
    }
    const fertig = state.schritt === v.schritte.length && state.zyklus >= 2;
    setzeText($("figurFazit"), fertig ? laufend.text + " " + v.fazit : laufend.text,
      fertig ? (state.variante === "global" ? "gilt" : "gilt-nicht") : null);
  };

  $("figurSchrittBtn").addEventListener("click", () => {
    const v = VARIANTEN[state.variante];
    if (state.schritt < v.schritte.length) {
      state.schritt += 1;
    } else {
      state.zyklus += 1;
      state.schritt = 1;
    }
    persist();
    renderFigur();
  });

  $("figurReset").addEventListener("click", () => {
    state.zyklus = 1;
    state.schritt = 0;
    persist();
    renderFigur();
  });

  variantenKnoepfe.forEach((b) => b.addEventListener("click", () => {
    state.variante = b.dataset.variante;
    state.zyklus = 1;
    state.schritt = 0;
    persist();
    renderFigur();
  }));

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
  zeichneRaster();
  renderAufbau();
  renderZerlegt();
  renderFigur();
})();
