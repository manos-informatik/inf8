"use strict";
(() => {
  const KEY = "inf8-verzweigungen-uebersicht-v1";
  const state = {
    vergleichX: 200, operator: "<", a: true, b: false, logik: "&&",
    bereich: { x: 100, y: 300 }, wenn: { x: 300, y: 200 },
    kette: { x: 100, y: 100 },
    nurifFarbe: "weiß", punkte: 9
  };
  const $ = id => document.getElementById(id);
  const setText = (el, text) => { if (el.textContent !== String(text)) el.textContent = text; };
  const persist = () => { try { window.AlgorithmProgress ? window.AlgorithmProgress.savePageState(KEY, state) : localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* optional */ } };

  // Ausdrucksbäume liefern sowohl den Processing-Text als auch die Berechnung.
  // Kein eval und kein zweiter, separat gepflegter Beispielquelltext.
  const value = v => ({ text: JSON.stringify(v), priority: 99, run: () => v });
  const variable = name => ({ text: name, priority: 99, run: env => env[name] });
  const operators = {
    "||": [1, (a, b) => a || b], "&&": [2, (a, b) => a && b],
    "==": [3, (a, b) => a === b], "!=": [3, (a, b) => a !== b],
    "<": [4, (a, b) => a < b], ">": [4, (a, b) => a > b],
    "<=": [4, (a, b) => a <= b], ">=": [4, (a, b) => a >= b],
    "+": [5, (a, b) => a + b], "-": [5, (a, b) => a - b],
    "*": [6, (a, b) => a * b], "/": [6, (a, b) => Math.trunc(a / b)]
  };
  const binary = (a, op, b) => {
    const [priority, fn] = operators[op];
    const textOf = (e, right) => e.priority < priority || (right && e.priority === priority)
      ? `(${e.text})` : e.text;
    return {
      text: `${textOf(a, false)} ${op} ${textOf(b, true)}`, priority,
      run: env => {
        const left = a.run(env);
        if (op === "&&" && !left) return false;
        if (op === "||" && left) return true;
        return fn(left, b.run(env));
      }
    };
  };
  const not = a => ({ text: `!${a.priority < 99 ? `(${a.text})` : a.text}`, priority: 8, run: env => !a.run(env) });
  const v = variable, n = value, b = binary;
  const decl = (type, name, expression) => ({ kind: "declare", type, name, expression });
  const call = (name, ...args) => ({ kind: "call", name, args });
  const fn = (name, body) => ({ kind: "function", name, body });
  const choose = clauses => ({ kind: "if", clauses });
  const clause = (test, body) => ({ test, body });
  const fill = (...rgb) => call("fill", ...rgb.map(n));
  const half = axis => b(v(axis), "/", n(2));
  const left = () => b(v("mouseX"), "<", half("width"));
  const top = () => b(v("mouseY"), "<", half("height"));
  const setup = () => fn("setup", [call("size", n(400), n(400)), call("noStroke")]);
  const circle = () => call("circle", v("mouseX"), v("mouseY"), n(40));
  const colors = { "weiß": [255,255,255], rot: [255,0,0], blau: [0,0,255], gelb: [255,255,0], cyan: [0,255,255], grau: [120,120,120] };
  const colorName = rgb => Object.keys(colors).find(name => colors[name].every((c, i) => c === rgb[i])) || rgb.join(", ");
  const quarterChoice = () => choose([
    clause(b(left(), "&&", top()), [fill(255,0,0)]),
    clause(b(b(v("mouseX"), ">=", half("width")), "&&", top()), [fill(255,255,0)]),
    clause(b(left(), "&&", b(v("mouseY"), ">=", half("height"))), [fill(0,255,255)]),
    clause(null, [fill(0,0,255)])
  ]);
  const compareInfo = [
    ["==", "gleich"], ["!=", "ungleich"], ["<", "kleiner"],
    [">", "größer"], ["<=", "kleiner oder gleich"], [">=", "größer oder gleich"]
  ];
  function restore() {
    try {
      const saved = (window.AlgorithmProgress ? window.AlgorithmProgress.getPageState(KEY) : JSON.parse(localStorage.getItem(KEY)));
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) return;
      for (const [key, min, max] of [["vergleichX",0,400],["punkte",0,15]]) {
        if (Number.isInteger(saved[key]) && saved[key] >= min && saved[key] <= max) state[key] = saved[key];
      }
      for (const key of ["a", "b"]) if (typeof saved[key] === "boolean") state[key] = saved[key];
      if (compareInfo.some(([op]) => op === saved.operator)) state.operator = saved.operator;
      if (["&&", "||", "!"].includes(saved.logik)) state.logik = saved.logik;
      if (["weiß", "rot"].includes(saved.nurifFarbe)) state.nurifFarbe = saved.nurifFarbe;
      for (const key of ["bereich", "wenn", "kette"]) {
        const p = saved[key];
        if (p && Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.x <= 400 && p.y >= 0 && p.y <= 400) state[key] = { x: p.x, y: p.y };
      }
    } catch { /* Beschädigte Speicherstände ignorieren. */ }
  }

  const programs = {
    vergleich: () => ({ entry: "setup", nodes: [
      decl("int", "x", n(state.vergleichX)),
      fn("setup", [decl("boolean", "ergebnis", b(v("x"), state.operator, n(200))), call("println", v("ergebnis"))])
    ] }),
    logik: () => ({ entry: "setup", nodes: [
      decl("boolean", "a", n(state.a)), decl("boolean", "b", n(state.b)),
      fn("setup", [call("println", b(v("a"), "&&", v("b"))), call("println", b(v("a"), "||", v("b"))), call("println", not(v("a")))])
    ] }),
    nurif: () => ({ entry: "draw", nodes: [setup(), fn("draw", [
      call("background", n(200)), choose([clause(left(), [fill(255,0,0)])]), circle()
    ])] }),
    ifelse: () => ({ entry: "draw", nodes: [setup(), fn("draw", [
      call("background", n(200)), choose([clause(left(), [fill(255,0,0)]), clause(null, [fill(0,0,255)])]), circle()
    ])] }),
    viertel: () => ({ entry: "draw", nodes: [setup(), fn("draw", [call("background", n(200)), quarterChoice(), circle()])] }),
    aufsteigend: () => gradeProgram(false), absteigend: () => gradeProgram(true)
  };
  function gradeProgram(reverse) {
    const thresholds = reverse ? [[">",12,"sehr gut"],[">",9,"gut"],[">",6,"bestanden"]]
      : [["<=",6,"nicht bestanden"],["<=",9,"bestanden"],["<=",12,"gut"]];
    return { entry: "setup", nodes: [decl("int", "punkte", n(state.punkte)), fn("setup", [choose([
      ...thresholds.map(([op, score, label]) => clause(b(v("punkte"), op, n(score)), [call("println", n(label))])),
      clause(null, [call("println", n(reverse ? "nicht bestanden" : "sehr gut"))])
    ])])] };
  }

  // Ein kleiner Interpreter für genau die gezeigten Sprachbausteine.
  // Rendering und Ausgabe verwenden dieselben Knoten und Ausdrucksbäume.
  function serialize(program) {
    const lines = [];
    const emit = (text, depth) => {
      const start = lines.length;
      text.split("\n").forEach(line => lines.push("  ".repeat(depth) + line));
      return Array.from({ length: lines.length - start }, (_, i) => start + i);
    };
    const expressionText = e => e.text.length > 100 ? e.text.replace(/ \|\| /g, "\n    || ") : e.text;
    const walk = (nodes, depth) => nodes.forEach(node => {
      if (node.kind === "function") {
        emit(`void ${node.name}() {`, depth); walk(node.body, depth + 1); emit("}", depth);
      } else if (node.kind === "if") {
        node.clauses.forEach((c, i) => {
          const testText = c.test?.text.length > 48 ? c.test.text.replace(/ && /g, "\n    && ") : c.test?.text;
          const head = i === 0 ? `if (${testText}) {` : c.test ? `} else if (${testText}) {` : "} else {";
          c.lines = emit(head, depth); walk(c.body, depth + 1);
        });
        emit("}", depth);
      } else {
        const args = node.kind === "call" ? node.args.map(arg => arg.text).join(", ") : "";
        const callText = args.length > 60 ? `${node.name}(\n    ${node.args.map(arg => arg.text).join(",\n    ")}\n);`
          : `${node.name}(${args});`;
        const text = node.kind === "declare" ? `${node.type} ${node.name} = ${expressionText(node.expression)};`
          : node.kind === "assign" ? `${node.name} = ${expressionText(node.expression)};`
          : callText;
        node.lines = emit(text, depth);
      }
    });
    walk(program.nodes, 0);
    return lines;
  }
  function execute(program, position, initialColor = colors["weiß"]) {
    const ctx = { env: { width: 400, height: 400, mouseX: position?.x ?? 0, mouseY: position?.y ?? 0 }, color: [...initialColor], bg: [200,200,200], shapes: [], output: [], active: new Set() };
    const functions = Object.fromEntries(program.nodes.filter(node => node.kind === "function").map(node => [node.name, node.body]));
    const mark = lines => lines?.forEach(line => ctx.active.add(line));
    const run = (nodes, inBranch = false) => nodes.forEach(node => {
      if (node.kind === "function") return;
      if (node.kind === "if") {
        for (const c of node.clauses) {
          mark(c.lines);
          if (!c.test || c.test.run(ctx.env)) { run(c.body, true); break; }
        }
        return;
      }
      if (inBranch || node.focus) mark(node.lines);
      if (node.kind === "declare" || node.kind === "assign") {
        ctx.env[node.name] = node.expression.run(ctx.env); return;
      }
      const args = node.args.map(arg => arg.run(ctx.env));
      if (functions[node.name]) { run(functions[node.name], inBranch); return; }
      switch (node.name) {
        case "size": [ctx.env.width, ctx.env.height] = args; break;
        case "background": ctx.bg = args.length === 1 ? [args[0],args[0],args[0]] : args; ctx.shapes = []; break;
        case "fill": ctx.color = args.length === 1 ? [args[0],args[0],args[0]] : args; break;
        case "circle": case "rect": ctx.shapes.push({ name: node.name, args, color: [...ctx.color] }); break;
        case "println": ctx.output.push(String(args[0])); break;
        case "noStroke": break;
        default: throw new Error(`Unbekannter Beispielaufruf: ${node.name}`);
      }
    });
    run(program.nodes);
    if (program.entry === "draw") run(functions.setup);
    run(functions[program.entry]);
    return ctx;
  }

  const panels = {};
  document.querySelectorAll("[data-example]").forEach(panel => {
    const key = panel.dataset.example;
    const heading = document.createElement("div"); heading.className = "code-heading";
    const label = document.createElement("span"); label.textContent = "Processing";
    const button = document.createElement("button"); button.type = "button"; button.className = "btn ghost"; button.textContent = "Kopieren"; button.dataset.copy = key; button.setAttribute("aria-label", `${panel.querySelector("h3").textContent}: Code kopieren`);
    heading.append(label, button);
    const pre = document.createElement("pre"); pre.className = "code-block"; pre.tabIndex = 0;
    const code = document.createElement("code"); code.id = `code-${key}`; pre.append(code);
    panel.append(heading, pre);
    let consoleEl;
    if (["vergleich", "logik", "aufsteigend", "absteigend"].includes(key)) {
      consoleEl = document.createElement("pre"); consoleEl.className = "console"; consoleEl.setAttribute("aria-label", "Konsolenausgabe"); consoleEl.setAttribute("aria-live", "polite"); panel.append(consoleEl);
    }
    panels[key] = { code, consoleEl };
  });
  function syntax(el, text) {
    const regex = /("[^"\n]*"|\b(?:void|int|boolean|if|else|true|false)\b|\b\d+(?:\.\d+)?\b|\b[a-zA-Z]\w*(?=\())/g;
    let offset = 0;
    for (const match of text.matchAll(regex)) {
      el.append(document.createTextNode(text.slice(offset, match.index)));
      const token = document.createElement("span"); token.textContent = match[0];
      token.className = match[0].startsWith('"') ? "tok-string" : /^\d/.test(match[0]) ? "tok-number" : /^(void|int|boolean|if|else|true|false)$/.test(match[0]) ? "tok-keyword" : "tok-function";
      el.append(token); offset = match.index + match[0].length;
    }
    el.append(document.createTextNode(text.slice(offset)));
  }
  function renderExample(key, position, color) {
    const program = programs[key]();
    const lines = serialize(program);
    const ctx = execute(program, position, color);
    const { code, consoleEl } = panels[key];
    const fragment = document.createDocumentFragment();
    lines.forEach((line, i) => {
      const span = document.createElement("span"); span.className = "code-line";
      if (ctx.active.has(i)) span.classList.add("is-active");
      syntax(span, line); fragment.append(span);
    });
    code.replaceChildren(fragment);
    if (consoleEl) setText(consoleEl, ctx.output.join("\n"));
    if ($(`${key}-canvas`)) draw($(`${key}-canvas`), ctx);
    return { ctx, program };
  }
  function draw(canvas, ctx) {
    const c = canvas.getContext("2d");
    c.fillStyle = `rgb(${ctx.bg.join(",")})`; c.fillRect(0,0,400,400);
    for (const shape of ctx.shapes) {
      c.fillStyle = `rgb(${shape.color.join(",")})`;
      if (shape.name === "circle") { c.beginPath(); c.arc(shape.args[0],shape.args[1],shape.args[2]/2,0,Math.PI*2); c.fill(); }
      else c.fillRect(...shape.args);
    }
    canvas.dataset.color = colorName(ctx.color);
  }
  function grid(canvas) {
    const c = canvas.getContext("2d"); c.clearRect(0,0,400,400);
    c.lineWidth = 1;
    for (let p = 10; p < 400; p += 10) {
      c.strokeStyle = p === 200 ? "rgba(15,23,42,.5)" : "rgba(15,23,42,.08)";
      c.beginPath(); c.moveTo(p,0); c.lineTo(p,400); c.moveTo(0,p); c.lineTo(400,p); c.stroke();
    }
    c.fillStyle = "#334155"; c.font = "12px Consolas, monospace";
    c.fillText("0",4,14); c.fillText("200",204,14); c.fillText("400",372,14); c.fillText("400",4,394);
  }
  function truthCell(value) {
    const cell = document.createElement("td"); cell.className = "truth"; cell.dataset.value = String(value); cell.textContent = String(value); return cell;
  }
  function compareRender() {
    $("vergleich-x").value = state.vergleichX; setText($("vergleich-wert"), state.vergleichX);
    const rows = compareInfo.map(([op, label]) => {
      const row = document.createElement("tr"); const head = document.createElement("th"); head.scope = "row"; head.className = "operator-cell";
      const button = document.createElement("button"); button.type = "button"; button.className = "operator-btn"; button.textContent = op; button.dataset.operator = op; button.setAttribute("aria-pressed", String(op === state.operator)); button.setAttribute("aria-label", `${label}: Beispiel anzeigen`); head.append(button);
      const meaning = document.createElement("td"); meaning.textContent = label;
      row.append(head, meaning, truthCell(b(n(state.vergleichX),op,n(200)).run({}))); return row;
    });
    $("vergleich-tabelle").replaceChildren(...rows); renderExample("vergleich");
  }
  function logicRender() {
    for (const key of ["a", "b"]) { setText($(`logik-${key}`), `${key} = ${state[key]}`); $(`logik-${key}`).setAttribute("aria-pressed", String(state[key])); }
    const rows = [[false,false],[false,true],[true,false],[true,true]].map(([a,c]) => {
      const row = document.createElement("tr");
      if (a === state.a && c === state.b) row.className = "selected-row";
      row.append(truthCell(a), truthCell(c), truthCell(a && c), truthCell(a || c), truthCell(!a)); return row;
    });
    $("logik-tabelle").replaceChildren(...rows); renderExample("logik");
  }
  const areaImages = new Map();
  function areaRender() {
    document.querySelectorAll("[data-logik]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.logik === state.logik)));
    const a = left(), c = b(v("mouseY"), ">", half("height"));
    const expression = state.logik === "!" ? not(a) : b(a,state.logik,c);
    setText($("bereich-ausdruck"), expression.text);
    const p = state.bereich; const env = { mouseX: p.x, mouseY: p.y, width: 400, height: 400 };
    setText($("bereich-wert"), `mouseX = ${p.x}\nmouseY = ${p.y}\na = ${a.run(env)}\nb = ${c.run(env)}\nErgebnis = ${expression.run(env)}`);
    const ctx = $("bereich-canvas").getContext("2d");
    let img = areaImages.get(state.logik);
    if (!img) {
      img = ctx.createImageData(400,400);
      for (let y=0; y<400; y++) for (let x=0; x<400; x++) {
        const on = expression.run({ mouseX:x,mouseY:y,width:400,height:400 });
        const i = (y*400+x)*4; img.data.set(on ? [166,226,204,255] : [230,234,240,255], i);
      }
      areaImages.set(state.logik,img);
    }
    ctx.putImageData(img,0,0); ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(p.x-8,p.y); ctx.lineTo(p.x+8,p.y); ctx.moveTo(p.x,p.y-8); ctx.lineTo(p.x,p.y+8); ctx.stroke();
  }
  function ifRender() {
    const p = state.wenn;
    const one = renderExample("nurif",p,colors[state.nurifFarbe]).ctx;
    state.nurifFarbe = colorName(one.color);
    const two = renderExample("ifelse",p).ctx;
    setText($("nurif-wert"), `mouseX = ${p.x}\nmouseY = ${p.y}\n${left().text}: ${left().run(one.env)}\nFarbe: ${colorName(one.color)}`);
    setText($("ifelse-wert"), `mouseX = ${p.x}\nmouseY = ${p.y}\n${left().text}: ${left().run(two.env)}\nFarbe: ${colorName(two.color)}`);
  }
  function quarterRender() {
    const p = state.kette, ctx = renderExample("viertel",p).ctx;
    setText($("viertel-wert"), `mouseX = ${p.x}\nmouseY = ${p.y}\nFarbe: ${colorName(ctx.color)}`);
  }
  function gradeRender() {
    $("punkte").value = state.punkte; setText($("punkte-wert"),state.punkte);
    renderExample("aufsteigend"); renderExample("absteigend");
  }
  const renders = { bereich: areaRender, wenn: ifRender, kette: quarterRender };
  const presets = {
    wenn: [["links",100,200],["Mitte",200,200],["rechts",300,200]],
    kette: [["links oben",100,100],["rechts oben",300,100],["links unten",100,300],["rechts unten",300,300],["Mitte",200,200]]
  };
  document.querySelectorAll("[data-position]").forEach(group => {
    const key = group.dataset.position; group.setAttribute("role","group"); group.setAttribute("aria-label","Beispielposition wählen");
    presets[key].forEach(([label,x,y]) => {
      const button = document.createElement("button"); button.type = "button"; button.className = "btn ghost"; button.textContent = label;
      button.addEventListener("click",() => { state[key] = {x,y}; renders[key](); persist(); }); group.append(button);
    });
  });
  document.querySelectorAll("[data-pointer]").forEach(surface => {
    const key = surface.dataset.pointer;
    const update = (x,y) => { state[key] = { x: Math.max(0,Math.min(400,Math.round(x))), y: Math.max(0,Math.min(400,Math.round(y))) }; renders[key](); persist(); };
    surface.addEventListener("pointermove",event => {
      if (event.pointerType === "touch" && event.buttons === 0) return;
      const box = surface.getBoundingClientRect(); update((event.clientX-box.left)/box.width*400,(event.clientY-box.top)/box.height*400);
    });
    surface.addEventListener("pointerdown",event => {
      const box = surface.getBoundingClientRect(); update((event.clientX-box.left)/box.width*400,(event.clientY-box.top)/box.height*400);
    });
    surface.addEventListener("keydown",event => {
      const delta = { ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1] }[event.key];
      if (!delta) return; event.preventDefault();
      const step = event.shiftKey ? 10 : 1; update(state[key].x+delta[0]*step,state[key].y+delta[1]*step);
    });
  });
  $("vergleich-tabelle").addEventListener("click",event => {
    const button = event.target.closest("[data-operator]"); if (!button) return;
    state.operator = button.dataset.operator; compareRender();
    // Die Tabellenknöpfe werden neu erzeugt; Fokus auf dieselbe Wahl zurückgeben.
    Array.from($("vergleich-tabelle").querySelectorAll("button")).find(el => el.dataset.operator === state.operator).focus({preventScroll:true}); persist();
  });
  for (const key of ["a","b"]) $(`logik-${key}`).addEventListener("click",() => { state[key] = !state[key]; logicRender(); persist(); });
  document.querySelectorAll("[data-logik]").forEach(button => button.addEventListener("click",() => { state.logik = button.dataset.logik; areaRender(); persist(); }));
  for (const [id,key,render] of [["vergleich-x","vergleichX",compareRender],["punkte","punkte",gradeRender]]) {
    $(id).addEventListener("input",event => { state[key] = Number(event.target.value); render(); persist(); });
  }
  document.addEventListener("click",async event => {
    const button = event.target.closest("[data-copy]"); if (!button) return;
    const text = Array.from(panels[button.dataset.copy].code.children).map(line => line.textContent).join("\n");
    let copied = false;
    try { await navigator.clipboard.writeText(text); copied = true; } catch {
      const field = document.createElement("textarea"); field.value = text; field.className = "sr-only"; document.body.append(field); field.select();
      try { copied = document.execCommand("copy"); } catch { /* manuell kopierbar */ }
      field.remove(); button.focus({preventScroll:true});
    }
    setText($("kopier-status"),copied ? "Code kopiert." : "Markiere den Code und kopiere ihn mit Strg+C.");
    button.textContent = copied ? "Kopiert ✓" : "Strg+C";
    window.setTimeout(() => { button.textContent = "Kopieren"; },1400);
  });
  restore();
  document.querySelectorAll(".grid-layer").forEach(grid);
  compareRender(); logicRender(); areaRender(); ifRender(); quarterRender(); gradeRender();
  window.AlgorithmProgress?.trackPageState(KEY, state);
})();
