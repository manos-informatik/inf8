/* Variablen - Klasse 8, Algorithmierung
   Aufgabe 1: Datentyp-Blitz, Aufgabe 2: Variablen zeichnen, Aufgabe 3: Umriss treffen. */

(() => {
  "use strict";

  const STORAGE_KEY = "inf8-variablen-v1";
  const RUNDENZEIT_MS = 30000;
  const TOLERANZ = 4;
  const CANVAS_GROESSE = 400;

  /* ---------------------------------------------------------------- Zustand */

  const state = {
    offen: { task1: true, task2: false, task3: false, task4: false },
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
        ["task1", "task2", "task3", "task4"].forEach((id) => {
          if (typeof data.offen[id] === "boolean") state.offen[id] = data.offen[id];
        });
      }
      if (Number.isFinite(data.rekord)) state.rekord = Math.max(0, Math.trunc(data.rekord));
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
    if (neuerRekord) {
      state.rekord = quiz.richtig;
      persist();
    }
    aktualisiereScore();

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
    knoepfe: Array.from(document.querySelectorAll(".stufe-btn"))
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
          else if (knoten.tagName === "INPUT") text += knoten.value;
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

  ["task1", "task2", "task3", "task4"].forEach((id) => {
    const details = document.querySelector(`#${id}`);
    if (!details) return;
    details.addEventListener("toggle", () => {
      state.offen[id] = details.open;
      persist();
    });
  });

  /* ----------------------------------------------------------- Seitenstart */

  restore();

  ["task1", "task2", "task3", "task4"].forEach((id) => {
    const details = document.querySelector(`#${id}`);
    if (!details) return;
    details.open = state.offen[id];
  });

  aktualisiereScore();
  quizEls.wert.classList.add("is-idle");
  quiz.beutel = mische(WERTE);

  zeichneRaster(els2.grid.getContext("2d"));
  zeichneRaster(els4.grid.getContext("2d"));
  setzeFunktion(state.funktion);
  setzeSchritt(state.schritt3);
  setzeStufe(state.stufe, false);
})();
