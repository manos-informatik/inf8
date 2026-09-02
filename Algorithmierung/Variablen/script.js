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
    offen: { task1: true, task2: false, task3: false },
    rekord: 0,
    funktion: "rect",
    werte2: {},
    schritt3: "3.1",
    werte3: {},
    geloest3: []
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
        ["task1", "task2", "task3"].forEach((id) => {
          if (typeof data.offen[id] === "boolean") state.offen[id] = data.offen[id];
        });
      }
      if (Number.isFinite(data.rekord)) state.rekord = Math.max(0, Math.trunc(data.rekord));
      if (typeof data.funktion === "string" && data.funktion in FUNKTIONEN) state.funktion = data.funktion;
      if (data.werte2 && typeof data.werte2 === "object") state.werte2 = { ...data.werte2 };
      if (typeof data.schritt3 === "string" && AUFGABEN3.some((a) => a.id === data.schritt3)) state.schritt3 = data.schritt3;
      if (data.werte3 && typeof data.werte3 === "object") state.werte3 = { ...data.werte3 };
      if (Array.isArray(data.geloest3)) state.geloest3 = data.geloest3.filter((id) => typeof id === "string");
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
    knoepfe: Array.from(document.querySelectorAll(".fn-btn"))
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

  const setzePfeil = (details) => {
    const summary = details.querySelector(".task-summary");
    if (summary) summary.classList.toggle("is-open", details.open);
  };

  ["task1", "task2", "task3"].forEach((id) => {
    const details = document.querySelector(`#${id}`);
    if (!details) return;
    details.addEventListener("toggle", () => {
      state.offen[id] = details.open;
      setzePfeil(details);
      persist();
    });
  });

  /* ----------------------------------------------------------- Seitenstart */

  restore();

  ["task1", "task2", "task3"].forEach((id) => {
    const details = document.querySelector(`#${id}`);
    if (!details) return;
    details.open = state.offen[id];
    setzePfeil(details);
  });

  aktualisiereScore();
  quizEls.wert.classList.add("is-idle");
  quiz.beutel = mische(WERTE);

  zeichneRaster(els2.grid.getContext("2d"));
  setzeFunktion(state.funktion);
  setzeSchritt(state.schritt3);
})();
