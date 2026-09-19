/* Variablen - Klasse 8, Algorithmierung
   Aufgabe 1 Datentyp-Blitz, 2 Wertverlauf, 3 Deklarationsort, 4 Ausgabe, 5 Mitte treffen.
   Zusatz 1-3 (Variablen zeichnen, Umriss treffen, wachsender Kreis) ueben das Zeichnen. */

(() => {
  "use strict";

  const STORAGE_KEY = "inf8-variablen-v1";
  const RUNDENZEIT_MS = 30000;
  const TOLERANZ = 4;
  const CANVAS_GROESSE = 400;

  /* ---------------------------------------------------------------- Zustand */

  /* Reihenfolge wie im Dokument: erst die fuenf Aufgaben, dann der Zusatz. */
  const AUFGABEN_IDS = ["task1", "taskVerlauf", "taskOrt", "taskAusgabe", "taskMitte",
    "task2", "task3", "task4"];

  const state = {
    offen: { task1: true, taskVerlauf: false, taskOrt: false, taskAusgabe: false,
      taskMitte: false, task2: false, task3: false, task4: false },
    verlauf: { stufe: "1", tipps: {}, geprueft: {} },
    /* geschafft: je Aufgabe die Liste der bestandenen Stufen bzw. ein Schalter.
       Wird mitgespeichert, damit der Fortschritt einen Seitenwechsel übersteht. */
    geschafft: { task1: false, taskVerlauf: [], taskOrt: [], taskAusgabe: [], taskMitte: false },
    ort: { stufe: "1", wahl: {}, gelaufen: {} },
    ausgabe: { stufe: "1", felder: {} },
    mitte: { x: "", y: "" },
    rekord: 0,
    funktion: "rect",
    werte2: {},
    schritt3: "3.1",
    werte3: {},
    geloest3: [],
    stufe: 1,
    sim: { zyklus: 0, durchmesser: 20, richtung: 1, gezeichnet: null, gestartet: false }
  };

  const persist = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* Speichern ist optional. */
    }
  };

  const restore = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return;

      if (data.offen && typeof data.offen === "object") {
        AUFGABEN_IDS.forEach((id) => {
          if (typeof data.offen[id] === "boolean") state.offen[id] = data.offen[id];
        });
      }
      if (data.verlauf && typeof data.verlauf === "object") {
        if (["1", "2", "3"].includes(data.verlauf.stufe)) state.verlauf.stufe = data.verlauf.stufe;
        if (data.verlauf.tipps && typeof data.verlauf.tipps === "object") {
          state.verlauf.tipps = { ...data.verlauf.tipps };
        }
        if (data.verlauf.geprueft && typeof data.verlauf.geprueft === "object") {
          state.verlauf.geprueft = { ...data.verlauf.geprueft };
        }
      }
      if (data.ort && typeof data.ort === "object") {
        if (["1", "2", "3"].includes(data.ort.stufe)) state.ort.stufe = data.ort.stufe;
        if (data.ort.wahl && typeof data.ort.wahl === "object") {
          // nur Stellen übernehmen, die es in der jeweiligen Stufe wirklich gibt
          Object.keys(ORT_STUFEN).forEach((stufe) => {
            const id = data.ort.wahl[stufe];
            if (ORT_STUFEN[stufe].stellen.some((st) => st.id === id)) state.ort.wahl[stufe] = id;
          });
        }
        if (data.ort.gelaufen && typeof data.ort.gelaufen === "object") {
          Object.keys(ORT_STUFEN).forEach((stufe) => {
            if (typeof data.ort.gelaufen[stufe] === "boolean") state.ort.gelaufen[stufe] = data.ort.gelaufen[stufe];
          });
        }
      }
      if (data.ausgabe && typeof data.ausgabe === "object") {
        if (["1", "2", "3"].includes(data.ausgabe.stufe)) state.ausgabe.stufe = data.ausgabe.stufe;
        if (data.ausgabe.felder && typeof data.ausgabe.felder === "object") {
          Object.entries(data.ausgabe.felder).forEach(([id, wert]) => {
            if (typeof wert === "string") state.ausgabe.felder[id] = wert.slice(0, 40);
          });
        }
      }
      if (data.mitte && typeof data.mitte === "object") {
        ["x", "y"].forEach((k) => {
          if (typeof data.mitte[k] === "string") state.mitte[k] = data.mitte[k].slice(0, 30);
        });
      }
      if (Number.isFinite(data.rekord)) state.rekord = Math.max(0, Math.trunc(data.rekord));
      if (data.geschafft && typeof data.geschafft === "object") {
        ["task1", "taskMitte"].forEach((k) => {
          if (typeof data.geschafft[k] === "boolean") state.geschafft[k] = data.geschafft[k];
        });
        ["taskVerlauf", "taskOrt", "taskAusgabe"].forEach((k) => {
          if (Array.isArray(data.geschafft[k])) {
            state.geschafft[k] = data.geschafft[k].filter((st) => ["1", "2", "3"].includes(st));
          }
        });
      }
      if (typeof data.funktion === "string" && data.funktion in FUNKTIONEN) state.funktion = data.funktion;
      if (data.werte2 && typeof data.werte2 === "object") state.werte2 = { ...data.werte2 };
      if (typeof data.schritt3 === "string" && AUFGABEN3.some((a) => a.id === data.schritt3)) state.schritt3 = data.schritt3;
      if (data.werte3 && typeof data.werte3 === "object") state.werte3 = { ...data.werte3 };
      if (Array.isArray(data.geloest3)) state.geloest3 = data.geloest3.filter((id) => typeof id === "string");
      if ([1, 2, 3].includes(data.stufe)) state.stufe = data.stufe;
      if (data.sim && typeof data.sim === "object") {
        const sim = data.sim;
        if (Number.isFinite(sim.zyklus)) state.sim.zyklus = Math.max(0, Math.trunc(sim.zyklus));
        if (Number.isFinite(sim.durchmesser)) state.sim.durchmesser = Math.trunc(sim.durchmesser);
        if (sim.richtung === 1 || sim.richtung === -1) state.sim.richtung = sim.richtung;
        if (sim.gezeichnet === null || Number.isFinite(sim.gezeichnet)) state.sim.gezeichnet = sim.gezeichnet;
        if (typeof sim.gestartet === "boolean") state.sim.gestartet = sim.gestartet;
      }
    } catch {
      /* ungültige Daten ignorieren, Seite startet leer */
    }
  };

  /* ------------------------------------------------------------- Werkzeuge */

  const setFeedback = (el, text, ok) => {
    if (el.textContent === text) return;
    el.textContent = text;
    el.classList.remove("success", "error");
    if (ok === true) el.classList.add("success");
    if (ok === false) el.classList.add("error");
  };

  const mische = (liste) => {
    const kopie = liste.slice();
    for (let i = kopie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
    }
    return kopie;
  };

  const span = (klasse, text) => {
    const el = document.createElement("span");
    if (klasse) el.className = klasse;
    if (text !== undefined) el.textContent = text;
    return el;
  };

  /* ----------------------------------------------- Aufgabe 1: Datentyp-Blitz */

  const WERTE = [
    ["42", "int"], ["-7", "int"], ["0", "int"], ["1000", "int"], ["2026", "int"],
    ["-256", "int"], ["13", "int"], ["365", "int"], ["512", "int"], ["-1", "int"],
    ["99", "int"], ["1024", "int"],
    ["3.14", "float"], ["-0.5", "float"], ["2.0", "float"], ["9.81", "float"],
    ["0.001", "float"], ["-12.75", "float"], ["100.5", "float"], ["1.5", "float"],
    ["0.75", "float"], ["19.99", "float"], ["-3.333", "float"], ["273.15", "float"],
    ["true", "boolean"], ["false", "boolean"],
    ["'A'", "char"], ["'z'", "char"], ["'7'", "char"], ["'?'", "char"], ["'@'", "char"],
    ["'k'", "char"], ["'!'", "char"], ["'0'", "char"], ["'e'", "char"], ["'#'", "char"],
    ['"Hallo"', "String"], ['"42"', "String"], ['"true"', "String"], ['"Dresden"', "String"],
    ['"A"', "String"], ['"3.14"', "String"], ['"Informatik"', "String"], ['"Klasse 8"', "String"],
    ['"x"', "String"], ['"!"', "String"]
  ];

  const quiz = {
    beutel: [],
    aktuell: null,
    richtig: 0,
    falsch: 0,
    laeuft: false,
    ende: 0,
    tickId: null
  };

  const quizEls = {
    zeit: document.querySelector("#quizTime"),
    score: document.querySelector("#quizScore"),
    rekord: document.querySelector("#quizRecord"),
    wert: document.querySelector("#quizValue"),
    notiz: document.querySelector("#quizNote"),
    start: document.querySelector("#quizStart"),
    feedback: document.querySelector("#quizFeedback"),
    knoepfe: Array.from(document.querySelectorAll(".type-btn"))
  };

  const naechsterWert = () => {
    if (quiz.beutel.length === 0) quiz.beutel = mische(WERTE);
    return quiz.beutel.pop();
  };

  const zeigeWert = () => {
    quiz.aktuell = naechsterWert();
    quizEls.wert.classList.remove("is-idle");
    quizEls.wert.textContent = quiz.aktuell[0];
  };

  const setzeQuizKnoepfe = (aktiv) => {
    quizEls.knoepfe.forEach((btn) => { btn.disabled = !aktiv; });
  };

  const aktualisiereScore = () => {
    quizEls.score.textContent = `${quiz.richtig} richtig`;
    quizEls.rekord.textContent = `Rekord: ${state.rekord}`;
  };

  const beendeRunde = () => {
    quiz.laeuft = false;
    window.clearInterval(quiz.tickId);
    quiz.tickId = null;
    setzeQuizKnoepfe(false);
    quizEls.zeit.textContent = "0 s";
    quizEls.zeit.classList.remove("is-warning");
    quizEls.wert.classList.add("is-idle");
    quizEls.wert.textContent = "Zeit um!";
    quizEls.notiz.textContent = "";
    quizEls.start.textContent = "Noch einmal";

    const neuerRekord = quiz.richtig > state.rekord;
    if (neuerRekord) state.rekord = quiz.richtig;
    if (quiz.falsch === 0 && quiz.richtig >= QUIZ_HUERDE) state.geschafft.task1 = true;
    if (neuerRekord || state.geschafft.task1) persist();
    aktualisiereScore();
    zeigeFortschritt();

    setFeedback(
      quizEls.feedback,
      neuerRekord
        ? `Neuer Rekord: ${quiz.richtig} richtig, ${quiz.falsch} daneben.`
        : `${quiz.richtig} richtig, ${quiz.falsch} daneben.`,
      quiz.richtig > quiz.falsch
    );
  };

  const tick = () => {
    const rest = Math.max(0, quiz.ende - Date.now());
    quizEls.zeit.textContent = `${Math.ceil(rest / 1000)} s`;
    quizEls.zeit.classList.toggle("is-warning", rest <= 10000);
    if (rest <= 0) beendeRunde();
  };

  const starteRunde = () => {
    quiz.beutel = mische(WERTE);
    quiz.richtig = 0;
    quiz.falsch = 0;
    quiz.laeuft = true;
    quiz.ende = Date.now() + RUNDENZEIT_MS;
    quizEls.start.textContent = "Neu starten";
    quizEls.notiz.textContent = "";
    setFeedback(quizEls.feedback, "Los geht's!", null);
    aktualisiereScore();
    setzeQuizKnoepfe(true);
    zeigeWert();
    tick();
    window.clearInterval(quiz.tickId);
    quiz.tickId = window.setInterval(tick, 100);
  };

  const blinke = (btn, klasse) => {
    btn.classList.add(klasse);
    window.setTimeout(() => btn.classList.remove(klasse), 220);
  };

  const antworte = (typ, btn) => {
    if (!quiz.laeuft || !quiz.aktuell) return;

    const [wert, richtigerTyp] = quiz.aktuell;
    if (typ === richtigerTyp) {
      quiz.richtig += 1;
      quizEls.notiz.textContent = "";
      blinke(btn, "is-right");
    } else {
      quiz.falsch += 1;
      quizEls.notiz.textContent = `${wert} ist ${richtigerTyp}`;
      blinke(btn, "is-wrong");
    }
    aktualisiereScore();
    zeigeWert();
  };

  quizEls.knoepfe.forEach((btn) => {
    btn.addEventListener("click", () => antworte(btn.dataset.typ, btn));
  });

  quizEls.start.addEventListener("click", starteRunde);

  document.addEventListener("keydown", (event) => {
    if (!quiz.laeuft) return;
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    const aktiv = document.activeElement;
    if (aktiv && ["INPUT", "TEXTAREA", "SELECT"].includes(aktiv.tagName)) return;

    const index = Number(event.key) - 1;
    if (Number.isInteger(index) && index >= 0 && index < quizEls.knoepfe.length) {
      event.preventDefault();
      const btn = quizEls.knoepfe[index];
      antworte(btn.dataset.typ, btn);
    }
  });

  /* -------------------------------------------- Zeichenfläche und Codeansicht */

  const FUNKTIONEN = {
    rect: {
      name: "rect",
      vars: [
        { name: "x", min: 0, max: 400 },
        { name: "y", min: 0, max: 400 },
        { name: "breite", min: 0, max: 400 },
        { name: "höhe", min: 0, max: 400 }
      ]
    },
    circle: {
      name: "circle",
      vars: [
        { name: "x", min: 0, max: 400 },
        { name: "y", min: 0, max: 400 },
        { name: "durchmesser", min: 0, max: 400 }
      ]
    },
    line: {
      name: "line",
      vars: [
        { name: "x1", min: 0, max: 400 },
        { name: "y1", min: 0, max: 400 },
        { name: "x2", min: 0, max: 400 },
        { name: "y2", min: 0, max: 400 }
      ]
    }
  };

  const zeichneLinie = (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const zeichneRaster = (ctx) => {
    const groesse = CANVAS_GROESSE;
    ctx.clearRect(0, 0, groesse, groesse);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(15, 23, 42, 0.16)";

    for (let x = 0; x < groesse; x += 10) zeichneLinie(ctx, x + 0.5, 0, x + 0.5, groesse);
    for (let y = 0; y < groesse; y += 10) zeichneLinie(ctx, 0, y + 0.5, groesse, y + 0.5);

    ctx.strokeStyle = "rgba(15, 23, 42, 0.34)";
    for (let x = 0; x <= groesse; x += 100) zeichneLinie(ctx, x + 0.5, 0, x + 0.5, groesse);
    for (let y = 0; y <= groesse; y += 100) zeichneLinie(ctx, 0, y + 0.5, groesse, y + 0.5);

    ctx.font = "11px Consolas, 'Courier New', monospace";
    ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
    ctx.fillText("(0,0)", 4, 14);
    const label = `(${groesse},${groesse})`;
    ctx.fillText(label, groesse - ctx.measureText(label).width - 4, groesse - 5);
  };

  const zeichneZiel = (ctx, fnKey, ziel) => {
    ctx.save();
    ctx.setLineDash([7, 5]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#0e7490";

    if (fnKey === "rect") {
      ctx.strokeRect(ziel.x, ziel.y, ziel.breite, ziel.höhe);
    } else if (fnKey === "circle") {
      ctx.beginPath();
      ctx.arc(ziel.x, ziel.y, ziel.durchmesser / 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      zeichneLinie(ctx, ziel.x1, ziel.y1, ziel.x2, ziel.y2);
    }

    ctx.restore();
  };

  /* Processing-Standard: weiße Füllung, schwarze Kontur, strokeWeight 1. */
  const zeichneForm = (ctx, fnKey, werte) => {
    ctx.clearRect(0, 0, CANVAS_GROESSE, CANVAS_GROESSE);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;

    if (fnKey === "rect") {
      ctx.fillRect(werte.x, werte.y, werte.breite, werte.höhe);
      ctx.strokeRect(werte.x + 0.5, werte.y + 0.5, Math.max(0, werte.breite - 1), Math.max(0, werte.höhe - 1));
    } else if (fnKey === "circle") {
      ctx.beginPath();
      ctx.arc(werte.x, werte.y, werte.durchmesser / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      zeichneLinie(ctx, werte.x1 + 0.5, werte.y1 + 0.5, werte.x2 + 0.5, werte.y2 + 0.5);
    }
  };

  const breiteAn = (input) => {
    const zeichen = Math.max(input.value.length, input.placeholder.length, 3);
    input.style.width = `${zeichen + 1}ch`;
  };

  /* Nur Ziffern zulassen und nach oben begrenzen. Leer bleibt leer -
     Number("") wäre still 0, deshalb wird unvollständig getrennt gemeldet. */
  const saeubere = (input) => {
    const max = Number(input.dataset.max);
    let roh = input.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    if (roh !== "" && Number(roh) > max) roh = String(max);
    if (roh !== input.value) input.value = roh;
    breiteAn(input);
  };

  /* Baut die Codeansicht neu auf; die Werte stecken in echten Eingabefeldern. */
  const baueCode = (codeEl, fnKey, werte, beiAenderung) => {
    const funktion = FUNKTIONEN[fnKey];
    codeEl.textContent = "";

    const zeile = (klassen) => {
      const el = document.createElement("span");
      el.className = klassen;
      codeEl.appendChild(el);
      return el;
    };

    let z = zeile("code-line");
    z.appendChild(span("keyword", "void"));
    z.appendChild(document.createTextNode(" "));
    z.appendChild(span("fn", "setup"));
    z.appendChild(document.createTextNode("(){"));

    z = zeile("code-line code-indent");
    z.appendChild(span("fn", "size"));
    z.appendChild(document.createTextNode("("));
    z.appendChild(span("num", "400"));
    z.appendChild(document.createTextNode(", "));
    z.appendChild(span("num", "400"));
    z.appendChild(document.createTextNode(");"));

    z = zeile("code-line code-indent");
    z.appendChild(span("fn", "background"));
    z.appendChild(document.createTextNode("("));
    z.appendChild(span("num", "255"));
    z.appendChild(document.createTextNode(");"));

    zeile("code-line").appendChild(document.createTextNode("}"));

    z = zeile("code-line is-spaced");
    z.appendChild(span("keyword", "void"));
    z.appendChild(document.createTextNode(" "));
    z.appendChild(span("fn", "draw"));
    z.appendChild(document.createTextNode("(){"));

    funktion.vars.forEach((variable) => {
      const linie = zeile("code-line code-indent");
      linie.appendChild(span("type", "int"));
      linie.appendChild(document.createTextNode(" "));
      linie.appendChild(span("var", variable.name));
      linie.appendChild(document.createTextNode(" = "));

      const input = document.createElement("input");
      input.className = "code-input";
      input.type = "text";
      input.inputMode = "numeric";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.dataset.name = variable.name;
      input.dataset.min = String(variable.min);
      input.dataset.max = String(variable.max);
      input.placeholder = `${variable.min}\u2013${variable.max}`;
      input.setAttribute("aria-label", `Wert der Variablen ${variable.name}`);
      input.value = typeof werte[variable.name] === "string" ? werte[variable.name] : "";
      breiteAn(input);

      input.addEventListener("input", () => {
        saeubere(input);
        beiAenderung();
      });
      input.addEventListener("blur", () => {
        saeubere(input);
        beiAenderung();
      });

      linie.appendChild(input);
      linie.appendChild(document.createTextNode(";"));
    });

    const aufruf = zeile("code-line code-indent");
    aufruf.appendChild(span("fn", funktion.name));
    aufruf.appendChild(document.createTextNode("("));
    funktion.vars.forEach((variable, index) => {
      if (index > 0) aufruf.appendChild(document.createTextNode(", "));
      aufruf.appendChild(span("var", variable.name));
    });
    aufruf.appendChild(document.createTextNode(");"));

    zeile("code-line").appendChild(document.createTextNode("}"));
  };

  /* Liest die Eingabefelder aus. fehlend zählt leere Pflichtfelder. */
  const leseCode = (codeEl, fnKey) => {
    const werte = {};
    const roh = {};
    let fehlend = 0;

    FUNKTIONEN[fnKey].vars.forEach((variable) => {
      const input = codeEl.querySelector(`.code-input[data-name="${variable.name}"]`);
      const text = input ? input.value : "";
      roh[variable.name] = text;
      if (text === "") {
        fehlend += 1;
        return;
      }
      werte[variable.name] = Math.min(variable.max, Math.max(variable.min, Number(text)));
    });

    return { werte, roh, fehlend };
  };

  /* ------------------------------------------ Aufgabe 2: Variablen zeichnen */

  const els2 = {
    code: document.querySelector("#code2"),
    canvas: document.querySelector("#canvas2"),
    grid: document.querySelector("#grid2"),
    feedback: document.querySelector("#feedback2"),
    reset: document.querySelector("#reset2"),
    knoepfe: Array.from(document.querySelectorAll("#task2 .fn-btn"))
  };

  const ctx2 = els2.canvas.getContext("2d");

  const schluessel2 = (fnKey, name) => `${fnKey}:${name}`;

  const zeichne2 = () => {
    const { werte, roh, fehlend } = leseCode(els2.code, state.funktion);

    FUNKTIONEN[state.funktion].vars.forEach((variable) => {
      state.werte2[schluessel2(state.funktion, variable.name)] = roh[variable.name];
    });
    persist();

    if (fehlend > 0) {
      ctx2.clearRect(0, 0, CANVAS_GROESSE, CANVAS_GROESSE);
      setFeedback(els2.feedback, "Trage alle Werte ein.", null);
      return;
    }

    zeichneForm(ctx2, state.funktion, werte);
    const namen = FUNKTIONEN[state.funktion].vars.map((v) => v.name).join(", ");
    setFeedback(els2.feedback, `${FUNKTIONEN[state.funktion].name}(${namen}) wird gezeichnet.`, null);
  };

  const setzeFunktion = (fnKey) => {
    state.funktion = fnKey;
    persist();

    els2.knoepfe.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.fn === fnKey));
    });

    const werte = {};
    FUNKTIONEN[fnKey].vars.forEach((variable) => {
      const gespeichert = state.werte2[schluessel2(fnKey, variable.name)];
      werte[variable.name] = typeof gespeichert === "string" ? gespeichert : "";
    });

    baueCode(els2.code, fnKey, werte, zeichne2);
    zeichne2();
  };

  els2.knoepfe.forEach((btn) => {
    btn.addEventListener("click", () => setzeFunktion(btn.dataset.fn));
  });

  els2.reset.addEventListener("click", () => {
    FUNKTIONEN[state.funktion].vars.forEach((variable) => {
      delete state.werte2[schluessel2(state.funktion, variable.name)];
    });
    persist();
    setzeFunktion(state.funktion);
  });

  /* ---------------------------------------- Aufgabe 3: Umriss treffen */

  const AUFGABEN3 = [
    { id: "3.1", fn: "rect", titel: "Quadrat", ziel: { x: 100, y: 100, breite: 200, höhe: 200 } },
    { id: "3.2", fn: "circle", titel: "Kreis in der Mitte", ziel: { x: 200, y: 200, durchmesser: 150 } },
    { id: "3.3", fn: "line", titel: "Diagonale", ziel: { x1: 0, y1: 0, x2: 400, y2: 400 } },
    { id: "3.4", fn: "rect", titel: "Hoher Turm", ziel: { x: 150, y: 60, breite: 100, höhe: 280 } }
  ];

  const els3 = {
    code: document.querySelector("#code3"),
    canvas: document.querySelector("#canvas3"),
    grid: document.querySelector("#grid3"),
    feedback: document.querySelector("#feedback3"),
    check: document.querySelector("#check3"),
    reihe: document.querySelector(".step-row")
  };

  const ctx3 = els3.canvas.getContext("2d");
  const gridCtx3 = els3.grid.getContext("2d");

  const aufgabe3 = () => AUFGABEN3.find((a) => a.id === state.schritt3) || AUFGABEN3[0];

  const zeichne3 = () => {
    const aufgabe = aufgabe3();
    const { werte, roh, fehlend } = leseCode(els3.code, aufgabe.fn);

    if (!state.werte3[aufgabe.id]) state.werte3[aufgabe.id] = {};
    FUNKTIONEN[aufgabe.fn].vars.forEach((variable) => {
      state.werte3[aufgabe.id][variable.name] = roh[variable.name];
    });
    persist();

    if (fehlend > 0) {
      ctx3.clearRect(0, 0, CANVAS_GROESSE, CANVAS_GROESSE);
      return;
    }

    zeichneForm(ctx3, aufgabe.fn, werte);
  };

  const zeichneSchritte = () => {
    els3.reihe.textContent = "";

    AUFGABEN3.forEach((aufgabe) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "step-btn";
      btn.textContent = aufgabe.id;
      btn.setAttribute("aria-pressed", String(aufgabe.id === state.schritt3));
      btn.setAttribute("aria-label", `Teilaufgabe ${aufgabe.id}: ${aufgabe.titel}`);
      btn.classList.toggle("is-solved", state.geloest3.includes(aufgabe.id));
      btn.addEventListener("click", () => setzeSchritt(aufgabe.id));
      els3.reihe.appendChild(btn);
    });
  };

  function setzeSchritt(id) {
    state.schritt3 = id;
    persist();

    const aufgabe = aufgabe3();
    zeichneSchritte();

    zeichneRaster(gridCtx3);
    zeichneZiel(gridCtx3, aufgabe.fn, aufgabe.ziel);

    const gespeichert = state.werte3[aufgabe.id] || {};
    const werte = {};
    FUNKTIONEN[aufgabe.fn].vars.forEach((variable) => {
      werte[variable.name] = typeof gespeichert[variable.name] === "string" ? gespeichert[variable.name] : "";
    });

    baueCode(els3.code, aufgabe.fn, werte, zeichne3);
    zeichne3();

    setFeedback(
      els3.feedback,
      state.geloest3.includes(aufgabe.id)
        ? `${aufgabe.id} ${aufgabe.titel} - schon geschafft.`
        : `${aufgabe.id} ${aufgabe.titel}: triff den gestrichelten Umriss.`,
      state.geloest3.includes(aufgabe.id) ? true : null
    );
  }

  els3.check.addEventListener("click", () => {
    const aufgabe = aufgabe3();
    const { werte, fehlend } = leseCode(els3.code, aufgabe.fn);

    if (fehlend > 0) {
      setFeedback(els3.feedback, "Es fehlen noch Werte.", false);
      return;
    }

    const passt = FUNKTIONEN[aufgabe.fn].vars.every(
      (variable) => Math.abs(werte[variable.name] - aufgabe.ziel[variable.name]) <= TOLERANZ
    );

    if (passt) {
      if (!state.geloest3.includes(aufgabe.id)) state.geloest3.push(aufgabe.id);
      zeigeFortschritt();
      persist();
      zeichneSchritte();
      const offen = AUFGABEN3.filter((a) => !state.geloest3.includes(a.id)).length;
      setFeedback(
        els3.feedback,
        offen === 0 ? "Alle Umrisse getroffen." : `Passt genau. Noch ${offen} zu tun.`,
        true
      );
    } else {
      setFeedback(els3.feedback, "Noch nicht - vergleiche deine Form mit dem Umriss.", false);
    }
  });

  /* ------------------------------------- Aufgabe 4: Der wachsende Kreis */

  /* Gemeinsamer Anfang aller drei Stufen: feste Position, veraenderlicher Durchmesser. */
  const stufenKopf = (mitRichtung) => {
    const zeilen = [
      { key: "declX", tokens: [["type", "int"], " ", ["var", "x"], " = ", ["num", "200"], ";"] },
      { key: "declY", tokens: [["type", "int"], " ", ["var", "y"], " = ", ["num", "200"], ";"] },
      { key: "declD", tokens: [["type", "int"], " ", ["var", "durchmesser"], " = ", ["num", "20"], ";"] }
    ];

    if (mitRichtung) {
      zeilen.push({ key: "declR", tokens: [["type", "int"], " ", ["var", "richtung"], " = ", ["num", "1"], ";"] });
    }

    zeilen.push(
      { abstand: true, key: "setup", tokens: [["keyword", "void"], " ", ["fn", "setup"], "(){"] },
      { tief: 1, key: "size", tokens: [["fn", "size"], "(", ["num", "400"], ", ", ["num", "400"], ");"] },
      // frameRate bremst die Zyklen in Processing auf zwei pro Sekunde
      { tief: 1, key: "framerate", tokens: [["fn", "frameRate"], "(", ["num", "2"], ");"] },
      { tokens: ["}"] },
      { abstand: true, tokens: [["keyword", "void"], " ", ["fn", "draw"], "(){"] },
      { tief: 1, key: "bg", tokens: [["fn", "background"], "(", ["num", "255"], ");"] },
      { tief: 1, key: "circle", tokens: [["fn", "circle"], "(", ["var", "x"], ", ", ["var", "y"], ", ", ["var", "durchmesser"], ");"] }
    );

    return zeilen;
  };

  const wachsen = { tokens: [["var", "durchmesser"], " = ", ["var", "durchmesser"], " + ", ["num", "20"], ";"] };

  /* Angezeigter Code und schritt() gehoeren zusammen - beides beschreibt denselben Zyklus. */
  const STUFEN = {
    1: {
      zeigtRichtung: false,
      zeilen: [
        ...stufenKopf(false),
        { tief: 1, key: "inc", tokens: wachsen.tokens },
        { tokens: ["}"] }
      ],
      schritt(v) {
        const gezeichnet = v.durchmesser;
        v.durchmesser += 20;
        return {
          aktiv: ["bg", "circle", "inc"],
          gezeichnet,
          hinweis: gezeichnet > 400 ? "Der Kreis passt nicht mehr auf die Zeichenfläche - durchmesser wächst trotzdem weiter." : null
        };
      }
    },

    2: {
      zeigtRichtung: false,
      zeilen: [
        ...stufenKopf(false),
        { tief: 1, key: "if", tokens: [["keyword", "if"], "(", ["var", "durchmesser"], " < ", ["num", "400"], "){"] },
        { tief: 2, key: "inc", tokens: wachsen.tokens },
        { tief: 1, tokens: ["}"] },
        { tokens: ["}"] }
      ],
      schritt(v) {
        const gezeichnet = v.durchmesser;
        const aktiv = ["bg", "circle", "if"];

        if (v.durchmesser < 400) {
          v.durchmesser += 20;
          aktiv.push("inc");
          return { aktiv, gezeichnet, hinweis: null };
        }

        return { aktiv, gezeichnet, hinweis: "Die Bedingung ist falsch - durchmesser bleibt bei 400." };
      }
    },

    3: {
      zeigtRichtung: true,
      zeilen: [
        ...stufenKopf(true),
        { tief: 1, key: "if1", tokens: [["keyword", "if"], "(", ["var", "durchmesser"], " >= ", ["num", "400"], "){"] },
        { tief: 2, key: "ab", tokens: [["var", "richtung"], " = ", ["num", "-1"], ";"] },
        { tief: 1, tokens: ["}"] },
        { tief: 1, key: "if2", tokens: [["keyword", "if"], "(", ["var", "durchmesser"], " <= ", ["num", "20"], "){"] },
        { tief: 2, key: "auf", tokens: [["var", "richtung"], " = ", ["num", "1"], ";"] },
        { tief: 1, tokens: ["}"] },
        { tief: 1, key: "inc", tokens: [["var", "durchmesser"], " = ", ["var", "durchmesser"], " + ", ["num", "20"], " * ", ["var", "richtung"], ";"] },
        { tokens: ["}"] }
      ],
      schritt(v) {
        const gezeichnet = v.durchmesser;
        const aktiv = ["bg", "circle", "if1"];
        let hinweis = null;

        if (v.durchmesser >= 400) {
          v.richtung = -1;
          aktiv.push("ab");
          hinweis = "Obere Grenze erreicht: richtung ist jetzt -1.";
        }

        aktiv.push("if2");

        if (v.durchmesser <= 20) {
          v.richtung = 1;
          aktiv.push("auf");
          hinweis = "Untere Grenze erreicht: richtung ist jetzt 1.";
        }

        v.durchmesser += 20 * v.richtung;
        aktiv.push("inc");

        return { aktiv, gezeichnet, hinweis };
      }
    }
  };

  const els4 = {
    code: document.querySelector("#code4"),
    canvas: document.querySelector("#canvas4"),
    grid: document.querySelector("#grid4"),
    feedback: document.querySelector("#feedback4"),
    start: document.querySelector("#stufeStart"),
    schritt: document.querySelector("#stufeSchritt"),
    reset: document.querySelector("#stufeReset"),
    zyklus: document.querySelector("#stufeZyklus"),
    wert: document.querySelector("#stufeWert"),
    richtung: document.querySelector("#stufeRichtung"),
    aufruf: document.querySelector("#stufeAufruf"),
    // auf die eigene Aufgabe eingegrenzt - Aufgabe 2 benutzt dieselbe Knopfform
    knoepfe: Array.from(document.querySelectorAll("#task4 .stufe-btn"))
  };

  const ctx4 = els4.canvas.getContext("2d");
  let zeilen4 = new Map();

  /* Baut die Codeansicht aus der Zeilenbeschreibung und merkt sich die markierbaren Zeilen. */
  const baueStufenCode = (zeilen) => {
    els4.code.textContent = "";
    const merker = new Map();

    zeilen.forEach((zeile) => {
      const el = document.createElement("span");
      const tiefe = zeile.tief === 2 ? " code-double-indent" : zeile.tief === 1 ? " code-indent" : "";
      el.className = `code-line${tiefe}${zeile.abstand ? " is-spaced" : ""}`;

      zeile.tokens.forEach((token) => {
        if (typeof token === "string") el.appendChild(document.createTextNode(token));
        else el.appendChild(span(token[0], token[1]));
      });

      els4.code.appendChild(el);
      if (zeile.key) merker.set(zeile.key, el);
    });

    return merker;
  };

  const markiereZeilen = (keys) => {
    zeilen4.forEach((el) => el.classList.remove("is-active"));
    (keys || []).forEach((key) => {
      const el = zeilen4.get(key);
      if (el) el.classList.add("is-active");
    });
  };

  const zeigeStufe = () => {
    els4.zyklus.textContent = `Zyklus: ${state.sim.zyklus}`;
    els4.wert.textContent = `durchmesser: ${state.sim.durchmesser}`;
    els4.richtung.textContent = `richtung: ${state.sim.richtung}`;
    els4.richtung.hidden = !STUFEN[state.stufe].zeigtRichtung;
    els4.aufruf.textContent = state.sim.gezeichnet === null
      ? "noch nichts gezeichnet"
      : `circle(200, 200, ${state.sim.gezeichnet})`;

    ctx4.clearRect(0, 0, CANVAS_GROESSE, CANVAS_GROESSE);
    if (state.sim.gezeichnet === null) return;

    ctx4.fillStyle = "#ffffff";
    ctx4.strokeStyle = "#000000";
    ctx4.lineWidth = 1;
    ctx4.beginPath();
    ctx4.arc(200, 200, state.sim.gezeichnet / 2, 0, Math.PI * 2);
    ctx4.fill();
    ctx4.stroke();
  };

  /* Die Zeilen, die einmalig beim Programmstart laufen: Deklarationen und setup(). */
  const setupZeilen = (stufe) => {
    const keys = ["declX", "declY", "declD"];
    if (STUFEN[stufe].zeigtRichtung) keys.push("declR");
    return keys.concat(["setup", "size", "framerate"]);
  };

  const aktualisiereLauf = () => {
    els4.start.disabled = state.sim.gestartet;
    els4.schritt.disabled = !state.sim.gestartet;
  };

  const setzeStufe = (stufe, neuStarten) => {
    state.stufe = stufe;
    if (neuStarten) state.sim = { zyklus: 0, durchmesser: 20, richtung: 1, gezeichnet: null, gestartet: false };
    persist();

    els4.knoepfe.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(Number(btn.dataset.stufe) === stufe));
    });

    zeilen4 = baueStufenCode(STUFEN[stufe].zeilen);
    markiereZeilen(state.sim.gestartet && state.sim.zyklus === 0 ? setupZeilen(stufe) : []);
    zeigeStufe();
    aktualisiereLauf();
    setFeedback(
      els4.feedback,
      state.sim.gestartet
        ? "Schalte die draw()-Zyklen einzeln weiter."
        : "Klicke auf Start, dann läuft setup() einmal.",
      null
    );
  };

  els4.knoepfe.forEach((btn) => {
    btn.addEventListener("click", () => setzeStufe(Number(btn.dataset.stufe), true));
  });

  els4.start.addEventListener("click", () => {
    state.sim.gestartet = true;
    persist();

    aktualisiereLauf();
    markiereZeilen(setupZeilen(state.stufe));
    setFeedback(els4.feedback, "setup() ist gelaufen - jetzt Zyklus für Zyklus weiterschalten.", null);
    els4.schritt.focus();
  });

  els4.schritt.addEventListener("click", () => {
    if (!state.sim.gestartet) return;

    const ergebnis = STUFEN[state.stufe].schritt(state.sim);
    state.sim.zyklus += 1;
    state.sim.gezeichnet = ergebnis.gezeichnet;
    persist();

    markiereZeilen(ergebnis.aktiv);
    zeigeStufe();
    setFeedback(
      els4.feedback,
      ergebnis.hinweis || `Zyklus ${state.sim.zyklus}: circle(200, 200, ${ergebnis.gezeichnet}) wurde gezeichnet.`,
      null
    );
  });

  els4.reset.addEventListener("click", () => setzeStufe(state.stufe, true));

  /* ================================================================
     Aufgaben 2 bis 5 - gemeinsame Werkzeuge
     ================================================================ */

  const SYSTEMVARIABLEN = ["mouseX", "mouseY", "width", "height"];

  /* Datentyp-Blitz gilt als geschafft nach einer Runde ohne Fehler mit
     mindestens sechs richtigen Antworten. */
  const QUIZ_HUERDE = 6;

  const STUFEN_KNOEPFE = [
    ["taskVerlauf", "data-verlauf"],
    ["taskOrt", "data-ortstufe"],
    ["taskAusgabe", "data-ausgabestufe"]
  ];

  const merkeStufe = (aufgabe, stufe) => {
    if (state.geschafft[aufgabe].includes(stufe)) return;
    state.geschafft[aufgabe].push(stufe);
    persist();
  };

  /* Färbt geschaffte Stufen und abgeschlossene Aufgaben. Wird nach jeder
     Prüfung und beim Seitenstart aufgerufen. */
  const zeigeFortschritt = () => {
    STUFEN_KNOEPFE.forEach(([aufgabe, attribut]) => {
      document.querySelectorAll(`[${attribut}]`).forEach((btn) => {
        btn.classList.toggle("ist-geschafft", state.geschafft[aufgabe].includes(btn.getAttribute(attribut)));
      });
    });

    const fertig = {
      task1: state.geschafft.task1,
      taskVerlauf: state.geschafft.taskVerlauf.length === 3,
      taskOrt: state.geschafft.taskOrt.length === 3,
      taskAusgabe: state.geschafft.taskAusgabe.length === 3,
      taskMitte: state.geschafft.taskMitte,
      task3: state.geloest3.length === AUFGABEN3.length
    };

    Object.entries(fertig).forEach(([id, ok]) => {
      const details = document.querySelector(`#${id}`);
      if (!details) return;
      details.classList.toggle("ist-geschafft", ok);
      const haken = details.querySelector(".task-haken");
      if (haken) haken.hidden = !ok;
    });
  };

  /* Eine Zeile besteht aus Teilen: "text", ["klasse", "text"] oder
     { feld: id } / { wahl: id } fuer Eingaben mitten im Code.
     Einzug und Abstand laufen ueber dieselben Klassen wie in Aufgabe 4,
     damit codeAlsText() den Text unveraendert herausgibt. */
  const zeichneCode = (ziel, zeilen) => {
    ziel.textContent = "";
    const merker = new Map();

    zeilen.forEach((zeile) => {
      const el = document.createElement("span");
      const tiefe = zeile.tief === 2 ? " code-double-indent" : zeile.tief === 1 ? " code-indent" : "";
      el.className = `code-line${tiefe}${zeile.abstand ? " is-spaced" : ""}`;
      if (zeile.aktiv) el.classList.add("is-active");
      if (zeile.fehler) el.classList.add("is-broken");

      (zeile.tokens || []).forEach((token) => {
        if (typeof token === "string") { el.appendChild(document.createTextNode(token)); return; }
        if (Array.isArray(token)) { el.appendChild(span(token[0], token[1])); return; }

        if (token.feld) {
          const input = document.createElement("input");
          input.type = "text";
          input.className = "code-input";
          input.id = token.feld;
          input.size = token.breite || 10;
          input.autocomplete = "off";
          input.spellcheck = false;
          if (token.platzhalter) input.placeholder = token.platzhalter;
          if (token.beschriftung) input.setAttribute("aria-label", token.beschriftung);
          el.appendChild(input);
          merker.set(token.feld, input);
          return;
        }

        if (token.wahl) {
          const select = document.createElement("select");
          select.className = "code-select";
          select.id = token.wahl;
          if (token.beschriftung) select.setAttribute("aria-label", token.beschriftung);
          (token.optionen || []).forEach((eintrag) => {
            const [wert, text] = Array.isArray(eintrag) ? eintrag : [eintrag, eintrag];
            const option = document.createElement("option");
            option.value = wert;
            option.textContent = text;
            select.appendChild(option);
          });
          el.appendChild(select);
          merker.set(token.wahl, select);
        }
      });

      ziel.appendChild(el);
      if (zeile.key) merker.set(zeile.key, el);
    });

    return merker;
  };

  const zeigeKonsole = (ziel, zeilen) => {
    ziel.textContent = "";
    zeilen.forEach((zeile) => {
      const el = span("console-line" + (zeile.klasse ? " " + zeile.klasse : ""), zeile.text);
      ziel.appendChild(el);
    });
  };

  /* ================================================================
     Aufgabe 2: Wertverlauf vorhersagen
     ================================================================ */

  const kopfZeilen = (deklarationen) => [
    ...deklarationen,
    { abstand: true, tokens: [["keyword", "void"], " ", ["fn", "setup"], "() {"] },
    { tief: 1, tokens: [["fn", "size"], "(", ["num", "400"], ", ", ["num", "400"], ");"] },
    { tokens: ["}"] },
    { abstand: true, tokens: [["keyword", "void"], " ", ["fn", "draw"], "() {"] }
  ];

  const deklZeile = (name, wert) =>
    ({ tokens: [["type", "int"], " ", ["var", name], " = ", ["num", String(wert)], ";"] });

  /* Angezeigter Code und schritt() beschreiben denselben Zyklus. */
  const VERLAUF_STUFEN = {
    "1": {
      anfang: { zaehler: 0 },
      schritt: (v) => ({ zaehler: v.zaehler + 2 }),
      zeilen: [
        ...kopfZeilen([deklZeile("zaehler", 0)]),
        { tief: 1, tokens: [["var", "zaehler"], " = ", ["var", "zaehler"], " + ", ["num", "2"], ";"] },
        { tief: 1, tokens: [["fn", "println"], "(", ["var", "zaehler"], ");"] },
        { tokens: ["}"] }
      ]
    },
    "2": {
      anfang: { zaehler: 1 },
      schritt: (v) => ({ zaehler: v.zaehler * 2 }),
      zeilen: [
        ...kopfZeilen([deklZeile("zaehler", 1)]),
        { tief: 1, tokens: [["var", "zaehler"], " = ", ["var", "zaehler"], " * ", ["num", "2"], ";"] },
        { tief: 1, tokens: [["fn", "println"], "(", ["var", "zaehler"], ");"] },
        { tokens: ["}"] }
      ]
    },
    "3": {
      anfang: { zaehler: 0, schritt: 1 },
      schritt: (v) => ({ zaehler: v.zaehler + v.schritt, schritt: v.schritt + 1 }),
      zeilen: [
        ...kopfZeilen([deklZeile("zaehler", 0), deklZeile("schritt", 1)]),
        { tief: 1, tokens: [["var", "zaehler"], " = ", ["var", "zaehler"], " + ", ["var", "schritt"], ";"] },
        { tief: 1, tokens: [["var", "schritt"], " = ", ["var", "schritt"], " + ", ["num", "1"], ";"] },
        { tief: 1, tokens: [["fn", "println"], "(", ["var", "zaehler"], ");"] },
        { tokens: ["}"] }
      ]
    }
  };

  const VERLAUF_ZEITPUNKTE = ["nach setup()", "nach dem 1. draw()", "nach dem 2. draw()", "nach dem 3. draw()"];

  const verlaufEls = {
    code: document.querySelector("#verlaufCode"),
    zeilen: document.querySelector("#verlaufZeilen"),
    feedback: document.querySelector("#verlaufFeedback"),
    pruefen: document.querySelector("#verlaufPruefen"),
    reset: document.querySelector("#verlaufReset")
  };

  /* Die echten Werte laufen durch dieselbe schritt()-Funktion wie der gezeigte Code. */
  const verlaufWerte = (stufe) => {
    const s = VERLAUF_STUFEN[stufe];
    let v = { ...s.anfang };
    const werte = [v.zaehler];
    for (let i = 0; i < 3; i += 1) { v = s.schritt(v); werte.push(v.zaehler); }
    return werte;
  };

  const verlaufTipps = () => {
    const stufe = state.verlauf.stufe;
    if (!Array.isArray(state.verlauf.tipps[stufe])) state.verlauf.tipps[stufe] = ["", "", "", ""];
    return state.verlauf.tipps[stufe];
  };

  const zeigeVerlauf = () => {
    const stufe = state.verlauf.stufe;
    document.querySelectorAll("[data-verlauf]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.verlauf === stufe));
    });

    zeichneCode(verlaufEls.code, VERLAUF_STUFEN[stufe].zeilen);

    const tipps = verlaufTipps();
    const geprueft = Boolean(state.verlauf.geprueft[stufe]);
    const echt = verlaufWerte(stufe);

    verlaufEls.zeilen.textContent = "";
    VERLAUF_ZEITPUNKTE.forEach((label, i) => {
      const tr = document.createElement("tr");

      const th = document.createElement("th");
      th.scope = "row";
      th.textContent = label;
      tr.appendChild(th);

      const tdEingabe = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.value = tipps[i];
      input.setAttribute("aria-label", "zaehler " + label);
      input.addEventListener("input", () => {
        verlaufTipps()[i] = input.value;
        persist();
      });
      tdEingabe.appendChild(input);
      tr.appendChild(tdEingabe);

      const tdEcht = document.createElement("td");
      tdEcht.className = "tipp-echt";
      tdEcht.textContent = geprueft ? String(echt[i]) : "–";
      tr.appendChild(tdEcht);

      if (geprueft) {
        tr.classList.add(Number(tipps[i]) === echt[i] ? "ist-richtig" : "ist-falsch");
      }
      verlaufEls.zeilen.appendChild(tr);
    });
  };

  /* Rückmeldung zur aktuellen Stufe - auch nach einem Stufenwechsel wieder herstellbar. */
  const verlaufRueckmeldung = () => {
    const stufe = state.verlauf.stufe;
    if (!state.verlauf.geprueft[stufe]) {
      setFeedback(verlaufEls.feedback, "Fülle alle vier Felder, dann prüfe.", null);
      return;
    }
    const echt = verlaufWerte(stufe);
    const treffer = verlaufTipps().filter((t, i) => Number(t) === echt[i]).length;
    if (treffer === 4) {
      setFeedback(verlaufEls.feedback, "Alle vier richtig - der Wert wird von Zyklus zu Zyklus mitgenommen.", true);
    } else {
      setFeedback(verlaufEls.feedback, `${treffer} von 4 richtig. Vergleiche Zeile für Zeile, was draw() mit zaehler macht.`, false);
    }
  };

  document.querySelectorAll("[data-verlauf]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.verlauf.stufe = btn.dataset.verlauf;
      persist();
      zeigeVerlauf();
      verlaufRueckmeldung();
    });
  });

  verlaufEls.pruefen.addEventListener("click", () => {
    const tipps = verlaufTipps();
    if (tipps.some((t) => t.trim() === "")) {
      setFeedback(verlaufEls.feedback, "Es fehlen noch Vermutungen - erst alle vier Felder füllen.", false);
      return;
    }

    const echt = verlaufWerte(state.verlauf.stufe);
    const treffer = tipps.filter((t, i) => Number(t) === echt[i]).length;
    state.verlauf.geprueft[state.verlauf.stufe] = true;
    if (treffer === 4) merkeStufe("taskVerlauf", state.verlauf.stufe);
    persist();
    zeigeVerlauf();
    zeigeFortschritt();
    verlaufRueckmeldung();
  });

  verlaufEls.reset.addEventListener("click", () => {
    state.verlauf.tipps[state.verlauf.stufe] = ["", "", "", ""];
    state.verlauf.geprueft[state.verlauf.stufe] = false;
    persist();
    zeigeVerlauf();
    setFeedback(verlaufEls.feedback, "Fülle alle vier Felder, dann prüfe.", null);
  });


  /* ================================================================
     Aufgabe 3: Wohin mit der Deklaration?
     Drei Stufen. Stufe 1 braucht global, Stufe 3 braucht lokal,
     Stufe 2 dreht sich darum, wann width einen Wert hat.
     ================================================================ */

  /* abstand nur, wenn oberhalb schon eine Deklaration steht */
  const setupKopf = (zeilen, abstand) => [
    { abstand: Boolean(abstand), tokens: [["keyword", "void"], " ", ["fn", "setup"], "() {"] },
    { tief: 1, tokens: [["fn", "size"], "(", ["num", "400"], ", ", ["num", "400"], ");"] },
    ...zeilen,
    { tokens: ["}"] }
  ];

  const drawBlock = (zeilen) => [
    { abstand: true, tokens: [["keyword", "void"], " ", ["fn", "draw"], "() {"] },
    ...zeilen,
    { tokens: ["}"] }
  ];

  const printlnVar = (name) => ({ tief: 1, tokens: [["fn", "println"], "(", ["var", name], ");"] });
  const zuweisung = (name, rechts) => ({ tief: 1, tokens: [["var", name], " = ", ...rechts, ";"] });
  const laeuftWeiter = { text: "… draw() läuft weiter", klasse: "is-hint" };

  const ORT_STUFEN = {
    "1": {
      ziel: "zaehler soll bei jedem draw() um 1 hochzählen und den alten Wert behalten.",
      stellen: [
        {
          id: "global", label: "vor setup()", geloest: true,
          zeilen: () => [
            { ...deklZeile("zaehler", 0), aktiv: true },
            ...setupKopf([], true),
            ...drawBlock([
              zuweisung("zaehler", [["var", "zaehler"], " + ", ["num", "1"]]),
              printlnVar("zaehler")
            ])
          ],
          konsole: [{ text: "1" }, { text: "2" }, { text: "3" }, laeuftWeiter],
          feedback: "Richtig - vor setup() deklariert gilt zaehler im ganzen Programm und behält seinen Wert."
        },
        {
          id: "setup", label: "in setup()", geloest: false,
          zeilen: () => [
            ...setupKopf([{ tief: 1, ...deklZeile("zaehler", 0), aktiv: true }]),
            ...drawBlock([
              { ...zuweisung("zaehler", [["var", "zaehler"], " + ", ["num", "1"]]), fehler: true },
              printlnVar("zaehler")
            ])
          ],
          konsole: [
            { text: 'The variable "zaehler" does not exist', klasse: "is-error" },
            { text: "Das Programm startet gar nicht erst.", klasse: "is-hint" }
          ],
          feedback: "In setup() deklariert endet zaehler mit setup() - draw() kennt den Namen nicht."
        },
        {
          id: "draw", label: "in draw()", geloest: false,
          zeilen: () => [
            ...setupKopf([]),
            ...drawBlock([
              { tief: 1, ...deklZeile("zaehler", 0), aktiv: true },
              zuweisung("zaehler", [["var", "zaehler"], " + ", ["num", "1"]]),
              printlnVar("zaehler")
            ])
          ],
          konsole: [{ text: "1" }, { text: "1" }, { text: "1" }, { text: "… und immer weiter 1", klasse: "is-hint" }],
          feedback: "Kein Fehler, trotzdem falsch: zaehler entsteht in jedem Zyklus neu und startet wieder bei 0."
        }
      ]
    },

    "2": {
      ziel: "mitte soll die halbe Leinwandbreite enthalten, also 200.",
      stellen: [
        {
          id: "mitWert", label: "vor setup() mit Wert", geloest: false,
          zeilen: () => [
            {
              tokens: [["type", "int"], " ", ["var", "mitte"], " = ", ["var", "width"], " / ", ["num", "2"], ";"],
              aktiv: true
            },
            ...setupKopf([], true),
            ...drawBlock([printlnVar("mitte")])
          ],
          konsole: [
            { text: "0" }, { text: "0" }, { text: "0" },
            { text: "width ist vor dem Aufruf von size() noch 0.", klasse: "is-hint" }
          ],
          feedback: "Die Zeile läuft, bevor size() da war - width ist zu diesem Zeitpunkt noch 0."
        },
        {
          id: "inSetup", label: "Wert erst in setup()", geloest: true,
          zeilen: () => [
            { tokens: [["type", "int"], " ", ["var", "mitte"], ";"], aktiv: true },
            ...setupKopf([
              { ...zuweisung("mitte", [["var", "width"], " / ", ["num", "2"]]), aktiv: true }
            ], true),
            ...drawBlock([printlnVar("mitte")])
          ],
          konsole: [{ text: "200" }, { text: "200" }, { text: "200" }, laeuftWeiter],
          feedback: "Richtig - deklariert wird global, der Wert kommt nach size() dazu."
        },
        {
          id: "ganzSetup", label: "ganz in setup()", geloest: false,
          zeilen: () => [
            ...setupKopf([
              {
                tief: 1, aktiv: true,
                tokens: [["type", "int"], " ", ["var", "mitte"], " = ", ["var", "width"], " / ", ["num", "2"], ";"]
              }
            ]),
            ...drawBlock([{ ...printlnVar("mitte"), fehler: true }])
          ],
          konsole: [
            { text: 'The variable "mitte" does not exist', klasse: "is-error" },
            { text: "Der Wert stimmt, nur kommt draw() nicht daran.", klasse: "is-hint" }
          ],
          feedback: "Der Zeitpunkt passt jetzt, der Ort nicht: mitte endet mit setup()."
        }
      ]
    },

    "3": {
      ziel: "summe soll in jedem Zyklus bei 0 anfangen, also immer 3 ergeben.",
      stellen: [
        {
          id: "global", label: "vor setup()", geloest: false,
          zeilen: () => [
            { ...deklZeile("summe", 0), aktiv: true },
            ...setupKopf([], true),
            ...drawBlock([
              zuweisung("summe", [["var", "summe"], " + ", ["num", "1"]]),
              zuweisung("summe", [["var", "summe"], " + ", ["num", "2"]]),
              printlnVar("summe")
            ])
          ],
          konsole: [{ text: "3" }, { text: "6" }, { text: "9" }, { text: "… und immer weiter", klasse: "is-hint" }],
          feedback: "Hier ist global zu viel des Guten: summe nimmt den alten Wert mit und wächst immer weiter."
        },
        {
          id: "setup", label: "in setup()", geloest: false,
          zeilen: () => [
            ...setupKopf([{ tief: 1, ...deklZeile("summe", 0), aktiv: true }]),
            ...drawBlock([
              { ...zuweisung("summe", [["var", "summe"], " + ", ["num", "1"]]), fehler: true },
              zuweisung("summe", [["var", "summe"], " + ", ["num", "2"]]),
              printlnVar("summe")
            ])
          ],
          konsole: [
            { text: 'The variable "summe" does not exist', klasse: "is-error" },
            { text: "Das Programm startet gar nicht erst.", klasse: "is-hint" }
          ],
          feedback: "In setup() deklariert endet summe mit setup() - draw() kennt den Namen nicht."
        },
        {
          id: "draw", label: "in draw()", geloest: true,
          zeilen: () => [
            ...setupKopf([]),
            ...drawBlock([
              { tief: 1, ...deklZeile("summe", 0), aktiv: true },
              zuweisung("summe", [["var", "summe"], " + ", ["num", "1"]]),
              zuweisung("summe", [["var", "summe"], " + ", ["num", "2"]]),
              printlnVar("summe")
            ])
          ],
          konsole: [{ text: "3" }, { text: "3" }, { text: "3" }, laeuftWeiter],
          feedback: "Richtig - genau hier ist lokal das Passende: summe startet in jedem Zyklus neu bei 0."
        }
      ]
    }
  };

  const ortEls = {
    ziel: document.querySelector("#ortZiel"),
    wahl: document.querySelector("#ortWahl"),
    code: document.querySelector("#ortCode"),
    konsole: document.querySelector("#ortKonsole"),
    feedback: document.querySelector("#ortFeedback"),
    start: document.querySelector("#ortStart"),
    reset: document.querySelector("#ortReset")
  };

  const ortStelle = () => {
    const stufe = ORT_STUFEN[state.ort.stufe];
    return stufe.stellen.find((s) => s.id === state.ort.wahl[state.ort.stufe]) || null;
  };

  const zeigeOrt = () => {
    const stufe = ORT_STUFEN[state.ort.stufe];
    document.querySelectorAll("[data-ortstufe]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.ortstufe === state.ort.stufe));
    });
    ortEls.ziel.textContent = "Ziel: " + stufe.ziel;

    // Die Stellen heißen je Stufe anders, deshalb baut sie das Skript
    const gewaehlt = state.ort.wahl[state.ort.stufe] || "";
    ortEls.wahl.textContent = "";
    stufe.stellen.forEach((stelle) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fn-btn";
      btn.textContent = stelle.label;
      btn.setAttribute("aria-pressed", String(stelle.id === gewaehlt));
      btn.addEventListener("click", () => {
        state.ort.wahl[state.ort.stufe] = stelle.id;
        state.ort.gelaufen[state.ort.stufe] = false;
        persist();
        zeigeOrt();
        setFeedback(ortEls.feedback, "Jetzt ausführen und die Konsole lesen.", null);
      });
      ortEls.wahl.appendChild(btn);
    });

    const stelle = ortStelle();
    if (!stelle) {
      zeichneCode(ortEls.code, [{ tokens: [["comment", "// wähle oben eine der drei Stellen"]] }]);
      zeigeKonsole(ortEls.konsole, [{ text: "Noch nichts ausgeführt.", klasse: "is-hint" }]);
      ortEls.start.disabled = true;
      return;
    }

    zeichneCode(ortEls.code, stelle.zeilen());
    ortEls.start.disabled = false;
    if (state.ort.gelaufen[state.ort.stufe]) zeigeKonsole(ortEls.konsole, stelle.konsole);
    else zeigeKonsole(ortEls.konsole, [{ text: "Noch nicht ausgeführt.", klasse: "is-hint" }]);
  };

  /* Rückmeldung zur aktuellen Stufe - bleibt nach einem Stufenwechsel erhalten. */
  const ortRueckmeldung = () => {
    const stelle = ortStelle();
    if (stelle && state.ort.gelaufen[state.ort.stufe]) {
      setFeedback(ortEls.feedback, stelle.feedback, stelle.geloest);
      return;
    }
    setFeedback(ortEls.feedback, stelle ? "Jetzt ausführen und die Konsole lesen."
      : "Wähle eine Stelle für die Deklaration.", null);
  };

  document.querySelectorAll("[data-ortstufe]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.ort.stufe = btn.dataset.ortstufe;
      persist();
      zeigeOrt();
      ortRueckmeldung();
    });
  });

  ortEls.start.addEventListener("click", () => {
    const stelle = ortStelle();
    if (!stelle) {
      setFeedback(ortEls.feedback, "Wähle zuerst eine der drei Stellen.", false);
      return;
    }
    state.ort.gelaufen[state.ort.stufe] = true;
    if (stelle.geloest) merkeStufe("taskOrt", state.ort.stufe);
    persist();
    zeigeOrt();
    zeigeFortschritt();
    setFeedback(ortEls.feedback, stelle.feedback, stelle.geloest);
  });

  ortEls.reset.addEventListener("click", () => {
    state.ort.wahl[state.ort.stufe] = "";
    state.ort.gelaufen[state.ort.stufe] = false;
    persist();
    zeigeOrt();
    setFeedback(ortEls.feedback, "Wähle eine Stelle für die Deklaration.", null);
  });

  /* ================================================================
     Aufgabe 4: Ausgabe nach Vorgabe
     Drei Stufen: eine Anweisung, zwei Anweisungen, und eine, die
     print() und println() zusammen braucht.
     ================================================================ */

  /* Zwei Zyklen; die Maus wandert dazwischen ein Pixel nach rechts. */
  const AUSGABE_ZYKLEN = [
    { mouseX: 120, mouseY: 80, width: 400, height: 400 },
    { mouseX: 121, mouseY: 80, width: 400, height: 400 }
  ];

  const FN_WAHL = [["", "?"], "println", "print"];
  const VAR_WAHL = [["", "?"], ...SYSTEMVARIABLEN];

  /* anweisungen: je Anweisung die Folge ihrer Teile - "text" wird getippt,
     "var" ausgewählt. Die Vorgabe entsteht aus derselben Beschreibung. */
  const AUSGABE_STUFEN = {
    "1": {
      ziel: ["x-Position: 120 y-Position: 80", "x-Position: 121 y-Position: 80"],
      anweisungen: [["text", "var", "text", "var"]]
    },
    "2": {
      ziel: ["x: 120", "y: 80", "x: 121", "y: 80"],
      anweisungen: [["text", "var"], ["text", "var"]]
    },
    "3": {
      ziel: ["x: 120 | y: 80", "x: 121 | y: 80"],
      anweisungen: [["text", "var", "text"], ["text", "var"]]
    }
  };

  const ausgabeEls = {
    code: document.querySelector("#ausgabeCode"),
    konsole: document.querySelector("#ausgabeKonsole"),
    ziel: document.querySelector("#ausgabeZiel"),
    feedback: document.querySelector("#ausgabeFeedback"),
    pruefen: document.querySelector("#ausgabePruefen"),
    reset: document.querySelector("#ausgabeReset")
  };

  const ausgabeId = (i, j) => `ausgabe_${state.ausgabe.stufe}_${i}_${j}`;
  const ausgabeWert = (id) => state.ausgabe.felder[id] || "";

  const ausgabeZeilen = () => {
    const stufe = AUSGABE_STUFEN[state.ausgabe.stufe];
    const zeilen = [{ tokens: [["keyword", "void"], " ", ["fn", "draw"], "() {"] }];

    stufe.anweisungen.forEach((teile, i) => {
      const tokens = [
        { wahl: ausgabeId(i, "fn"), optionen: FN_WAHL, beschriftung: `Ausgabefunktion der ${i + 1}. Anweisung` },
        "("
      ];
      teile.forEach((art, j) => {
        if (j > 0) tokens.push(" + ");
        if (art === "text") {
          tokens.push(
            ["str", '"'],
            { feld: ausgabeId(i, j), breite: 12, platzhalter: "Text", beschriftung: `Textstück ${j + 1} der ${i + 1}. Anweisung` },
            ["str", '"']
          );
        } else {
          tokens.push({ wahl: ausgabeId(i, j), optionen: VAR_WAHL, beschriftung: `Variable ${j + 1} der ${i + 1}. Anweisung` });
        }
      });
      tokens.push(");");
      zeilen.push({ tief: 1, tokens });
    });

    zeilen.push({ tokens: ["}"] });
    return zeilen;
  };

  const ausgabeFehlt = () => {
    const stufe = AUSGABE_STUFEN[state.ausgabe.stufe];
    let ohneFn = false;
    let ohneWert = false;
    stufe.anweisungen.forEach((teile, i) => {
      if (!ausgabeWert(ausgabeId(i, "fn"))) ohneFn = true;
      teile.forEach((art, j) => { if (!ausgabeWert(ausgabeId(i, j))) ohneWert = true; });
    });
    if (ohneFn && ohneWert) return "Wähle die Ausgabefunktionen und fülle alle Felder.";
    if (ohneFn) return "Bei jeder Anweisung fehlt noch print() oder println().";
    if (ohneWert) return "Es sind noch Felder leer.";
    return null;
  };

  /* Erzeugt genau das, was der angezeigte Code in die Konsole schreiben würde:
     print() lässt die Zeile offen, println() schließt sie ab. */
  const ausgabeKonsolentext = () => {
    const stufe = AUSGABE_STUFEN[state.ausgabe.stufe];
    const zeilen = [];
    let offen = false;

    AUSGABE_ZYKLEN.forEach((zyklus) => {
      stufe.anweisungen.forEach((teile, i) => {
        let text = "";
        teile.forEach((art, j) => {
          const wert = ausgabeWert(ausgabeId(i, j));
          text += art === "text" ? wert : String(zyklus[wert]);
        });
        if (offen) zeilen[zeilen.length - 1] += text;
        else zeilen.push(text);
        offen = ausgabeWert(ausgabeId(i, "fn")) === "print";
      });
    });

    return zeilen;
  };

  const baueAusgabe = () => {
    const felder = zeichneCode(ausgabeEls.code, ausgabeZeilen());

    felder.forEach((el, id) => {
      el.value = ausgabeWert(id);
      el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => {
        state.ausgabe.felder[id] = el.value;
        persist();
        zeigeAusgabe();
      });
    });
  };

  function zeigeAusgabe() {
    const stufe = AUSGABE_STUFEN[state.ausgabe.stufe];
    document.querySelectorAll("[data-ausgabestufe]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.ausgabestufe === state.ausgabe.stufe));
    });

    zeigeKonsole(ausgabeEls.ziel, stufe.ziel.map((text) => ({ text })));

    const fehlt = ausgabeFehlt();
    if (fehlt) {
      zeigeKonsole(ausgabeEls.konsole, [{ text: fehlt, klasse: "is-hint" }]);
      return;
    }
    zeigeKonsole(ausgabeEls.konsole, ausgabeKonsolentext().map((text) => ({ text })));
  }

  document.querySelectorAll("[data-ausgabestufe]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.ausgabe.stufe = btn.dataset.ausgabestufe;
      persist();
      baueAusgabe();
      zeigeAusgabe();
      // eine bereits bestandene Stufe zeigt ihre Rückmeldung wieder an
      if (state.geschafft.taskAusgabe.includes(state.ausgabe.stufe)
          && ausgabeKonsolentext().join("\n") === AUSGABE_STUFEN[state.ausgabe.stufe].ziel.join("\n")) {
        setFeedback(ausgabeEls.feedback, "Genau so - Text und Werte stehen an der richtigen Stelle.", true);
      } else {
        setFeedback(ausgabeEls.feedback, "Baue die Ausgabe nach der Vorgabe.", null);
      }
    });
  });

  ausgabeEls.pruefen.addEventListener("click", () => {
    const fehlt = ausgabeFehlt();
    if (fehlt) { setFeedback(ausgabeEls.feedback, fehlt, false); return; }

    const ziel = AUSGABE_STUFEN[state.ausgabe.stufe].ziel;
    const ist = ausgabeKonsolentext();

    if (ist.join("\n") === ziel.join("\n")) {
      merkeStufe("taskAusgabe", state.ausgabe.stufe);
      zeigeFortschritt();
      setFeedback(ausgabeEls.feedback, "Genau so - Text und Werte stehen an der richtigen Stelle.", true);
      return;
    }
    if (ist.length !== ziel.length) {
      setFeedback(ausgabeEls.feedback, "Die Zeilenzahl stimmt nicht. Welche Funktion beginnt eine neue Zeile?", false);
      return;
    }
    const ohneLeer = (liste) => liste.map((z) => z.replace(/\s+/g, ""));
    if (ohneLeer(ist).join("\n") === ohneLeer(ziel).join("\n")) {
      setFeedback(ausgabeEls.feedback, "Fast - die Leerzeichen stimmen noch nicht. Sie gehören in den Text.", false);
      return;
    }
    setFeedback(ausgabeEls.feedback, "Noch nicht - vergleiche deine Konsole Zeichen für Zeichen mit der Vorgabe.", false);
  });

  ausgabeEls.reset.addEventListener("click", () => {
    const stufe = AUSGABE_STUFEN[state.ausgabe.stufe];
    stufe.anweisungen.forEach((teile, i) => {
      delete state.ausgabe.felder[ausgabeId(i, "fn")];
      teile.forEach((art, j) => { delete state.ausgabe.felder[ausgabeId(i, j)]; });
    });
    persist();
    baueAusgabe();
    zeigeAusgabe();
    setFeedback(ausgabeEls.feedback, "Baue die Ausgabe nach der Vorgabe.", null);
  });

  /* ================================================================
     Aufgabe 5: Die Mitte treffen
     ================================================================ */

  const MITTE_GROESSEN = [[400, 400], [500, 300], [300, 600]];

  /* Winziger Rechner für width, height, Zahlen und + - * / mit Klammern.
     Kein eval: alles andere gilt als Fehler. Gerechnet wird ganzzahlig,
     so wie Processing zwei int-Werte teilt. */
  const rechne = (text, w, h) => {
    const quelle = String(text).trim();
    if (!quelle) return { ok: false, grund: "leer" };

    const tokens = [];
    let i = 0;
    while (i < quelle.length) {
      const c = quelle[i];
      if (/\s/.test(c)) { i += 1; continue; }
      if (/[0-9]/.test(c)) {
        let j = i;
        while (j < quelle.length && /[0-9]/.test(quelle[j])) j += 1;
        tokens.push({ art: "zahl", wert: Number(quelle.slice(i, j)) });
        i = j;
        continue;
      }
      if (/[a-zA-Z_]/.test(c)) {
        let j = i;
        while (j < quelle.length && /[a-zA-Z_]/.test(quelle[j])) j += 1;
        const name = quelle.slice(i, j);
        if (name !== "width" && name !== "height") return { ok: false, grund: "name", name };
        tokens.push({ art: "zahl", wert: name === "width" ? w : h });
        i = j;
        continue;
      }
      if ("()+-*/".includes(c)) { tokens.push({ art: c }); i += 1; continue; }
      return { ok: false, grund: "zeichen", name: c };
    }

    let pos = 0;
    const schau = () => tokens[pos];

    const faktor = () => {
      const tok = schau();
      if (!tok) throw new Error("form");
      if (tok.art === "-") { pos += 1; return -faktor(); }
      if (tok.art === "+") { pos += 1; return faktor(); }
      if (tok.art === "zahl") { pos += 1; return tok.wert; }
      if (tok.art === "(") {
        pos += 1;
        const wert = ausdruck();
        if (!schau() || schau().art !== ")") throw new Error("form");
        pos += 1;
        return wert;
      }
      throw new Error("form");
    };

    const term = () => {
      let wert = faktor();
      while (schau() && (schau().art === "*" || schau().art === "/")) {
        const op = tokens[pos].art;
        pos += 1;
        const rechts = faktor();
        if (op === "/") {
          if (rechts === 0) throw new Error("null");
          wert = Math.trunc(wert / rechts);
        } else {
          wert *= rechts;
        }
      }
      return wert;
    };

    function ausdruck() {
      let wert = term();
      while (schau() && (schau().art === "+" || schau().art === "-")) {
        const op = tokens[pos].art;
        pos += 1;
        const rechts = term();
        wert = op === "+" ? wert + rechts : wert - rechts;
      }
      return wert;
    }

    try {
      const wert = ausdruck();
      if (pos !== tokens.length) throw new Error("form");
      return { ok: true, wert };
    } catch (fehler) {
      return { ok: false, grund: fehler.message };
    }
  };

  const mitteEls = {
    code: document.querySelector("#mitteCode"),
    boards: document.querySelector("#mitteBoards"),
    feedback: document.querySelector("#mitteFeedback"),
    pruefen: document.querySelector("#mittePruefen"),
    reset: document.querySelector("#mitteReset")
  };

  const mitteFelder = zeichneCode(mitteEls.code, [
    { tokens: [["keyword", "void"], " ", ["fn", "draw"], "() {"] },
    { tief: 1, tokens: [["fn", "background"], "(", ["num", "220"], ");"] },
    {
      tief: 1,
      tokens: [
        ["fn", "circle"], "(",
        { feld: "mitteX", breite: 10, platzhalter: "x", beschriftung: "x-Position des Kreises" },
        ", ",
        { feld: "mitteY", breite: 10, platzhalter: "y", beschriftung: "y-Position des Kreises" },
        ", ", ["num", "50"], ");"
      ]
    },
    { tokens: ["}"] }
  ]);

  /* Drei Vorschauen, eine je Leinwandgröße. */
  const mitteBoards = MITTE_GROESSEN.map(([w, h]) => {
    const board = document.createElement("div");
    board.className = "mini-board";

    const titel = span("mini-titel", `size(${w}, ${h})`);
    board.appendChild(titel);

    const stack = document.createElement("div");
    stack.className = "mini-stack";
    stack.style.setProperty("--cw", String(w));
    stack.style.setProperty("--ch", String(h));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.setAttribute("aria-label", `Vorschau bei size(${w}, ${h})`);
    stack.appendChild(canvas);
    board.appendChild(stack);
    mitteEls.boards.appendChild(board);
    return { board, canvas, w, h };
  });

  const zeichneMitteVorschau = ({ canvas, w, h }, punkt) => {
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#dcdcdc";              // background(220)
    ctx.fillRect(0, 0, w, h);

    // gestricheltes Kreuz auf der echten Mitte als Ziel
    ctx.save();
    ctx.setLineDash([7, 5]);
    ctx.strokeStyle = "rgba(15, 23, 42, 0.75)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2 - 34); ctx.lineTo(w / 2, h / 2 + 34);
    ctx.moveTo(w / 2 - 34, h / 2); ctx.lineTo(w / 2 + 34, h / 2);
    ctx.stroke();
    ctx.restore();

    if (!punkt) return;
    ctx.beginPath();
    ctx.arc(punkt.x, punkt.y, 25, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.stroke();
  };

  const mitteErgebnisse = () => mitteBoards.map((board) => {
    const x = rechne(state.mitte.x, board.w, board.h);
    const y = rechne(state.mitte.y, board.w, board.h);
    if (!x.ok || !y.ok) return { board, fehler: x.ok ? y : x };
    return {
      board,
      punkt: { x: x.wert, y: y.wert },
      passt: x.wert === board.w / 2 && y.wert === board.h / 2
    };
  });

  const zeigeMitte = (mitBewertung) => {
    mitteErgebnisse().forEach((e) => {
      zeichneMitteVorschau(e.board, e.punkt || null);
      e.board.board.classList.remove("ist-richtig", "ist-falsch");
      if (mitBewertung && e.punkt) e.board.board.classList.add(e.passt ? "ist-richtig" : "ist-falsch");
    });
  };

  ["x", "y"].forEach((schluessel) => {
    const input = mitteFelder.get(schluessel === "x" ? "mitteX" : "mitteY");
    input.addEventListener("input", () => {
      state.mitte[schluessel] = input.value;
      persist();
      zeigeMitte(false);
    });
  });

  mitteEls.pruefen.addEventListener("click", () => {
    const ergebnisse = mitteErgebnisse();
    const kaputt = ergebnisse.find((e) => e.fehler);

    if (kaputt) {
      const f = kaputt.fehler;
      const text = f.grund === "leer"
        ? "Trage beide Werte ein."
        : f.grund === "name"
          ? `"${f.name}" kenne ich nicht. Erlaubt sind width, height und Zahlen.`
          : f.grund === "null"
            ? "Durch 0 lässt sich nicht teilen."
            : "Der Ausdruck lässt sich nicht ausrechnen - prüfe Klammern und Rechenzeichen.";
      setFeedback(mitteEls.feedback, text, false);
      zeigeMitte(false);
      return;
    }

    zeigeMitte(true);
    const treffer = ergebnisse.filter((e) => e.passt).length;

    if (treffer === 3) {
      state.geschafft.taskMitte = true;
      persist();
      zeigeFortschritt();
      setFeedback(mitteEls.feedback, "Passt bei allen drei Größen - genau dafür gibt es width und height.", true);
    } else if (treffer === 0) {
      setFeedback(mitteEls.feedback, "Bei keiner der drei Größen trifft der Kreis die Mitte.", false);
    } else {
      const daneben = ergebnisse.filter((e) => !e.passt).map((e) => `size(${e.board.w}, ${e.board.h})`);
      setFeedback(mitteEls.feedback, `Nur ${treffer} von 3. Daneben bei ${daneben.join(" und ")} - feste Zahlen passen immer nur zu einer Größe.`, false);
    }
  });

  mitteEls.reset.addEventListener("click", () => {
    state.mitte = { x: "", y: "" };
    mitteFelder.get("mitteX").value = "";
    mitteFelder.get("mitteY").value = "";
    persist();
    zeigeMitte(false);
    setFeedback(mitteEls.feedback, "Trage beide Werte ein.", null);
  });

  /* ------------------------------------------------ Code kopieren */

  /* Erzeugt den Text aus der angezeigten Codeansicht - Eingabefelder mit ihrem
     aktuellen Wert, damit Anzeige und Zwischenablage nicht auseinanderlaufen. */
  const codeAlsText = (codeEl) =>
    Array.from(codeEl.querySelectorAll(".code-line"))
      .map((zeile) => {
        const einzug = zeile.classList.contains("code-double-indent")
          ? "    "
          : zeile.classList.contains("code-indent")
            ? "  "
            : "";

        let text = "";
        zeile.childNodes.forEach((knoten) => {
          if (knoten.nodeType === Node.TEXT_NODE) text += knoten.textContent;
          else if (knoten.tagName === "INPUT" || knoten.tagName === "SELECT") text += knoten.value;
          else text += knoten.textContent;
        });

        return (zeile.classList.contains("is-spaced") ? "\n" : "") + einzug + text;
      })
      .join("\n");

  const inZwischenablage = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* faellt unten auf die Ersatzloesung zurueck */
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

  const kopierMerker = new Map();

  const meldeKopie = (btn, text) => {
    if (!kopierMerker.has(btn)) kopierMerker.set(btn, { beschriftung: btn.textContent, id: null });
    const eintrag = kopierMerker.get(btn);

    window.clearTimeout(eintrag.id);
    btn.textContent = text;
    eintrag.id = window.setTimeout(() => { btn.textContent = eintrag.beschriftung; }, 1600);
  };

  document.querySelectorAll("[data-kopieren]").forEach((btn) => {
    const codeEl = document.querySelector(`#${btn.dataset.kopieren}`);
    const feedback = document.querySelector(`#${btn.dataset.feedback}`);
    if (!codeEl) return;

    btn.addEventListener("click", async () => {
      const luecke = Array.from(codeEl.querySelectorAll(".code-input")).some((input) => input.value === "");

      if (luecke) {
        meldeKopie(btn, "Werte fehlen");
        if (feedback) setFeedback(feedback, "Trage erst alle Werte ein, dann kannst du den Code kopieren.", false);
        return;
      }

      const geklappt = await inZwischenablage(codeAlsText(codeEl));
      meldeKopie(btn, geklappt ? "Kopiert!" : "Klappt nicht");
      if (feedback) {
        setFeedback(
          feedback,
          geklappt ? "Code kopiert - füge ihn in Processing ein." : "Kopieren hat nicht geklappt, markiere den Code von Hand.",
          geklappt ? true : false
        );
      }
    });
  });

  /* --------------------------------------------------------------- Modale */

  let letzterAusloeser = null;

  const schliesseOverlay = (overlay) => {
    overlay.classList.remove("is-visible");
    overlay.setAttribute("aria-hidden", "true");
    if (letzterAusloeser) {
      letzterAusloeser.focus();
      letzterAusloeser = null;
    }
  };

  document.querySelectorAll("[data-overlay]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const overlay = document.querySelector(`#${btn.dataset.overlay}`);
      if (!overlay) return;
      letzterAusloeser = btn;
      overlay.classList.add("is-visible");
      overlay.setAttribute("aria-hidden", "false");
      const schliessen = overlay.querySelector("[data-close]");
      if (schliessen) schliessen.focus();
    });
  });

  document.querySelectorAll(".overlay").forEach((overlay) => {
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) schliesseOverlay(overlay);
    });
    const schliessen = overlay.querySelector("[data-close]");
    if (schliessen) schliessen.addEventListener("click", () => schliesseOverlay(overlay));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".overlay.is-visible").forEach((overlay) => schliesseOverlay(overlay));
  });

  /* ------------------------------------------------------ Aufklappzustand */

  AUFGABEN_IDS.forEach((id) => {
    const details = document.querySelector(`#${id}`);
    if (!details) return;
    details.addEventListener("toggle", () => {
      state.offen[id] = details.open;
      persist();
    });
  });

  /* ----------------------------------------------------------- Seitenstart */

  restore();

  AUFGABEN_IDS.forEach((id) => {
    const details = document.querySelector(`#${id}`);
    if (!details) return;
    details.open = state.offen[id];
  });

  aktualisiereScore();
  quizEls.wert.classList.add("is-idle");
  quiz.beutel = mische(WERTE);

  baueAusgabe();
  mitteFelder.get("mitteX").value = state.mitte.x;
  mitteFelder.get("mitteY").value = state.mitte.y;

  zeigeVerlauf();
  verlaufRueckmeldung();
  zeigeOrt();
  ortRueckmeldung();
  zeigeAusgabe();
  zeigeMitte(false);

  zeichneRaster(els2.grid.getContext("2d"));
  zeichneRaster(els4.grid.getContext("2d"));
  setzeFunktion(state.funktion);
  setzeSchritt(state.schritt3);
  setzeStufe(state.stufe, false);
  zeigeFortschritt();
})();
