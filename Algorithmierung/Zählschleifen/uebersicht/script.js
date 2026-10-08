"use strict";
(() => {
  const KEY = "inf8-zaehlschleifen-uebersicht-v1";
  const state = { part: "start", grenze: 4, anzahl: 5, breite: 50, luecke: 4, schritt: 30, position: 0, farbe: 0, balken: 0 };
  const $ = id => document.getElementById(id);
  const setText = (el, text) => { if (el.textContent !== String(text)) el.textContent = text; };
  const persist = () => { try { window.AlgorithmProgress ? window.AlgorithmProgress.savePageState(KEY, state) : localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* optional */ } };
  function restore() {
    try {
      const saved = (window.AlgorithmProgress ? window.AlgorithmProgress.getPageState(KEY) : JSON.parse(localStorage.getItem(KEY)));
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) return;
      if (["start","test","update","body"].includes(saved.part)) state.part = saved.part;
      for (const [key,min,max] of [["grenze",0,6],["anzahl",0,8],["breite",20,50],["luecke",4,12],["schritt",10,35],["position",0,7],["farbe",0,5],["balken",0,4]]) {
        if (Number.isInteger(saved[key]) && saved[key] >= min && saved[key] <= max) state[key] = saved[key];
      }
    } catch { /* Beschädigte Daten ignorieren. */ }
  }

  // Dieselben Ausdrucks- und Anweisungsbäume erzeugen Code, Tabellen und Bilder.
  const n = x => ({ text: JSON.stringify(x), priority: 99, run: () => x });
  const v = name => ({ text: name, priority: 99, run: env => env[name] });
  const operators = {
    "||": [1,(a,b) => a || b], "==": [3,(a,b) => a === b],
    "<": [4,(a,b) => a < b], "<=": [4,(a,b) => a <= b],
    "+": [5,(a,b) => a+b], "-": [5,(a,b) => a-b], "*": [6,(a,b) => a*b]
  };
  const b = (left, op, right) => {
    const [priority, fn] = operators[op];
    const text = (expr, isRight) => expr.priority < priority || (isRight && expr.priority === priority) ? `(${expr.text})` : expr.text;
    return { text: `${text(left,false)} ${op} ${text(right,true)}`, priority, run: env => fn(left.run(env), right.run(env)) };
  };
  const decl = (type,name,expression) => ({ kind: "declare", type, name, expression });
  const call = (name,...args) => ({ kind: "call", name, args });
  const fn = (name,body) => ({ kind: "function", name, body });
  const loop = (limit, inclusive, body) => ({ kind: "for", start: n(0), test: b(v("i"),inclusive ? "<=" : "<",limit), update: b(v("i"),"+",n(1)), body });
  const setup = () => fn("setup",[call("size",n(400),n(200)),call("noStroke")]);
  const rect = (...args) => call("rect",...args);
  const rowPosition = () => b(v("i"),"*",v("zellenBreite"));
  const greyCondition = () => b(b(b(v("i"),"==",n(0)),"||",b(v("i"),"==",n(2))),"||",b(v("i"),"==",n(4)));
  const drawing = body => [setup(),fn("draw",[call("background",n(200)),...body])];
  const programs = {
    aufbau: () => [fn("setup",[loop(n(5),false,[call("println",v("i"))])])],
    kleiner: () => drawing([loop(n(state.grenze),false,[rect(b(n(20),"+",b(v("i"),"*",n(50))),n(80),n(40),n(40))])]),
    gleich: () => drawing([loop(n(state.grenze),true,[rect(b(n(20),"+",b(v("i"),"*",n(50))),n(80),n(40),n(40))])]),
    position: () => drawing([
      decl("int","anzahl",n(state.anzahl)),decl("int","zellenBreite",n(state.breite)),decl("int","luecke",n(state.luecke)),
      loop(v("anzahl"),false,[rect(rowPosition(),n(80),b(v("zellenBreite"),"-",v("luecke")),b(v("zellenBreite"),"-",v("luecke")))])
    ]),
    farbe: () => drawing([
      loop(n(6),false,[
        { kind: "if", test: greyCondition(), yes: [call("fill",n(150))], no: [call("fill",n(255))] },
        rect(b(v("i"),"*",n(60)),n(80),n(56),n(56))
      ])
    ]),
    balken: () => drawing([
      decl("int","breite",n(60)),decl("int","zunahme",n(state.schritt)),call("fill",n(34),n(211),n(238)),
      loop(n(5),false,[decl("int","hoehe",b(b(v("i"),"+",n(1)),"*",v("zunahme"))),
        rect(b(v("i"),"*",v("breite")),b(v("height"),"-",v("hoehe")),b(v("breite"),"-",n(4)),v("hoehe"))])
    ])
  };
  function serialize(nodes) {
    const lines = [];
    const emit = (text,depth,parts) => {
      const line = lines.length;
      text.split("\n").forEach(text=>lines.push({text:"  ".repeat(depth)+text,parts,depth}));
      return line;
    };
    const walk = (list,depth=0) => list.forEach(node => {
      if (node.kind === "function") { emit(`void ${node.name}() {`,depth); walk(node.body,depth+1); emit("}",depth); }
      else if (node.kind === "for") {
        const parts = ["for (",{key:"start",text:`int i = ${node.start.text}`},"; ",{key:"test",text:node.test.text},"; ",{key:"update",text:"i++"},") {"];
        node.line = emit(parts.map(p=>typeof p === "string" ? p : p.text).join(""),depth,parts);
        walk(node.body,depth+1); node.end = emit("}",depth);
      } else if (node.kind === "if") {
        node.line = emit(`if (${node.test.text.replace(/ \|\| /g,"\n    || ")}) {`,depth); node.endLine = lines.length-1; walk(node.yes,depth+1);
        node.elseLine = emit("} else {",depth); walk(node.no,depth+1); emit("}",depth);
      } else {
        const args = node.kind === "call" ? node.args.map(a=>a.text).join(", ") : "";
        const callText = args.length > 55 ? `${node.name}(\n    ${node.args.map(a=>a.text).join(",\n    ")}\n);` : `${node.name}(${args});`;
        node.line = emit(node.kind === "declare" ? `${node.type} ${node.name} = ${node.expression.text};` : callText,depth);
        node.endLine = lines.length-1;
      }
    });
    walk(nodes); return lines;
  }
  function execute(nodes, selected) {
    const ctx = { env:{width:400,height:200}, fill:[255,255,255], bg:[200,200,200], shapes:[], output:[], frames:[], marks:new Set(), bodyLines:new Set() };
    const functions = Object.fromEntries(nodes.filter(node=>node.kind === "function").map(node=>[node.name,node.body]));
    const run = (list,active=false,inside=false) => list.forEach(node => {
      if (node.kind === "function") return;
      if (node.kind === "for") {
        const outer = ctx.env; const scope = {...outer}; ctx.env = scope; scope.i = node.start.run(scope);
        ctx.loopNode = node;
        while (node.test.run(scope)) {
          const startShape = ctx.shapes.length;
          const isSelected = scope.i === selected;
          if (isSelected) ctx.marks.add(node.line);
          run(node.body,isSelected,true);
          ctx.frames.push({i:scope.i,env:{...scope},shapes:ctx.shapes.slice(startShape)});
          scope.i = node.update.run(scope);
        }
        ctx.stop = {i:scope.i,condition:node.test.run(scope)}; ctx.env = outer;
        return;
      }
      for (let line=node.line;line<=(node.endLine ?? node.line);line++) {
        if (inside) ctx.bodyLines.add(line);
        if (active) ctx.marks.add(line);
      }
      if (node.kind === "if") {
        if (node.test.run(ctx.env)) run(node.yes,active,inside);
        else { if (active) ctx.marks.add(node.elseLine); run(node.no,active,inside); }
      } else if (node.kind === "declare") ctx.env[node.name] = node.expression.run(ctx.env);
      else {
        const args = node.args.map(arg=>arg.run(ctx.env));
        switch(node.name) {
          case "size": [ctx.env.width,ctx.env.height] = args; break;
          case "background": ctx.bg = args.length === 1 ? [args[0],args[0],args[0]] : args; break;
          case "fill": ctx.fill = args.length === 1 ? [args[0],args[0],args[0]] : args; break;
          case "rect": ctx.shapes.push({args,color:[...ctx.fill],i:ctx.env.i}); break;
          case "println": ctx.output.push(String(args[0])); break;
          case "noStroke": break;
          default: throw Error(`Unbekannter Aufruf: ${node.name}`);
        }
      }
    });
    run(nodes); run(functions.setup); if (functions.draw) run(functions.draw);
    return ctx;
  }

  const panels = {}, contexts = {};
  document.querySelectorAll("[data-example]").forEach(panel => {
    const key = panel.dataset.example;
    const heading = document.createElement("div"); heading.className = "code-heading";
    const label = document.createElement("span"); label.textContent = "Processing";
    const button = document.createElement("button"); button.type = "button"; button.className = "btn ghost"; button.textContent = "Kopieren"; button.dataset.copy = key; button.setAttribute("aria-label",`${panel.querySelector("h3").textContent}: Code kopieren`);
    heading.append(label,button);
    const pre = document.createElement("pre"); pre.className = "code-block"; pre.tabIndex = 0;
    const code = document.createElement("code"); code.id = `code-${key}`; pre.append(code);
    const wrapper = document.createElement("div"); wrapper.className = "example-code";
    wrapper.append(heading,pre); panel.querySelector("h3").after(wrapper);
    let consoleEl;
    if (key === "aufbau") { consoleEl = document.createElement("pre"); consoleEl.className = "console"; consoleEl.setAttribute("aria-label","Konsolenausgabe"); panel.append(consoleEl); }
    panels[key] = {code,consoleEl};
  });
  function syntax(el,text) {
    const regex = /\b(?:void|int|for|if|else)\b|\b\d+\b|\b[a-zA-Z]\w*(?=\()/g;
    let offset = 0;
    for (const match of text.matchAll(regex)) {
      el.append(document.createTextNode(text.slice(offset,match.index)));
      const span = document.createElement("span"); span.textContent = match[0];
      span.className = /^\d/.test(match[0]) ? "tok-number" : /^(void|int|for|if|else)$/.test(match[0]) ? "tok-keyword" : "tok-function";
      el.append(span); offset = match.index+match[0].length;
    }
    el.append(document.createTextNode(text.slice(offset)));
  }
  function renderExample(key,selected) {
    const nodes = programs[key](), lines = serialize(nodes), ctx = execute(nodes,selected);
    contexts[key] = ctx;
    const fragment = document.createDocumentFragment();
    lines.forEach((line,index) => {
      const span = document.createElement("span"); span.className = "code-line";
      if (key === "aufbau") {
        if (state.part === "body" && ctx.bodyLines.has(index)) span.classList.add("is-scope");
        if (line.parts) {
          span.append(document.createTextNode("  ".repeat(line.depth)));
          line.parts.forEach(part => {
            if (typeof part === "string") syntax(span,part);
            else { const piece = document.createElement("span"); piece.className = "code-part"; piece.dataset.part = part.key; if (part.key === state.part) piece.classList.add("is-scope"); syntax(piece,part.text); span.append(piece); }
          });
        } else syntax(span,line.text);
      } else { if (ctx.marks.has(index)) span.classList.add("is-active"); syntax(span,line.text); }
      fragment.append(span);
    });
    panels[key].code.replaceChildren(fragment);
    if (panels[key].consoleEl) setText(panels[key].consoleEl,ctx.output.join("\n"));
    if ($(`${key}-canvas`)) draw(key,ctx,selected);
    return ctx;
  }
  function grid(canvas) {
    const c = canvas.getContext("2d"); c.clearRect(0,0,400,200); c.lineWidth = 1;
    for (let x=10;x<400;x+=10) { c.strokeStyle = x===200 ? "rgba(15,23,42,.4)" : "rgba(15,23,42,.08)"; c.beginPath(); c.moveTo(x,0); c.lineTo(x,200); c.stroke(); }
    for (let y=10;y<200;y+=10) { c.strokeStyle = "rgba(15,23,42,.08)"; c.beginPath(); c.moveTo(0,y); c.lineTo(400,y); c.stroke(); }
    c.fillStyle = "#334155"; c.font = "11px Consolas,monospace"; c.fillText("0",4,12); c.fillText("200",202,12); c.fillText("400",372,12); c.fillText("200",4,197);
  }
  function draw(key,ctx,selected) {
    const canvas = $(`${key}-canvas`), c = canvas.getContext("2d");
    c.fillStyle = `rgb(${ctx.bg.join(",")})`; c.fillRect(0,0,400,200);
    ctx.shapes.forEach(shape => { c.fillStyle = `rgb(${shape.color.join(",")})`; c.fillRect(...shape.args); });
    const overlay = canvas.parentElement.querySelector(".grid-layer"); grid(overlay);
    const picked = ctx.shapes.find(shape=>shape.i === selected);
    if (picked) { const g = overlay.getContext("2d"); g.strokeStyle = "#fbbf24"; g.lineWidth = 3; g.strokeRect(picked.args[0]+1.5,picked.args[1]+1.5,picked.args[2]-3,picked.args[3]-3); }
    canvas.setAttribute("aria-label",`${ctx.shapes.length} ${key === "balken" ? "Balken" : "Felder"}`);
  }
  function selectionButtons(key,count) {
    const group = document.querySelector(`[data-select="${key}"]`);
    const existing = group.children;
    if (existing.length !== count) {
      group.replaceChildren(...Array.from({length:count},(_,i) => {
        const button = document.createElement("button"); button.type = "button"; button.className = "btn ghost"; button.dataset.index = i; button.textContent = `i = ${i}`; return button;
      }));
    }
    Array.from(group.children).forEach(button=>button.setAttribute("aria-pressed",String(Number(button.dataset.index) === state[key])));
    group.hidden = count === 0;
  }
  function table(key,ctx) {
    const columns = key === "position" ? ["i","x"] : ["i","hoehe","y"];
    $(`${key}-tabelle`).replaceChildren(...ctx.frames.map(frame=> {
      const row = document.createElement("tr"); const rect = frame.shapes[0];
      const vals = {i:frame.i,x:rect.args[0],hoehe:rect.args[3],y:rect.args[1]};
      if (frame.i === state[key]) row.className = "selected-row";
      columns.forEach((column,j) => {
        const cell = document.createElement(j === 0 ? "th" : "td");
        if (j === 0) { cell.scope = "row"; cell.className = "operator-cell"; const button = document.createElement("button"); button.type = "button"; button.className = "operator-btn"; button.textContent = vals[column]; button.dataset.select = key; button.dataset.index = frame.i; button.setAttribute("aria-label",`i = ${frame.i} betrachten`); button.setAttribute("aria-pressed",String(frame.i === state[key])); cell.append(button); }
        else cell.textContent = vals[column];
        row.append(cell);
      }); return row;
    }));
  }
  function renderBuild() {
    renderExample("aufbau");
    document.querySelectorAll("[data-part]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.part === state.part)));
    document.querySelectorAll("[data-flow]").forEach(el=>el.classList.toggle("is-scope",el.dataset.flow === state.part));
    const hints = {start:"i wird einmal deklariert und auf 0 gesetzt. Es gilt nur in dieser Schleife.",test:"Vor jedem Durchlauf wird geprüft. Bei i = 5 ist i < 5 false.",update:"i++ bedeutet i = i + 1. Das Update folgt auf den Rumpf.",body:"println(i) läuft für i = 0, 1, 2, 3, 4."};
    setText($("aufbau-hinweis"),hints[state.part]);
  }
  function renderBoundary() {
    for (const key of ["kleiner","gleich"]) {
      const ctx = renderExample(key);
      setText($(`${key}-wert`),`i im Rumpf: ${ctx.frames.length ? ctx.frames.map(f=>f.i).join(", ") : "kein Durchlauf"}\nLetzte Prüfung: i = ${ctx.stop.i}\nBedingung = false`);
    }
  }
  function renderPosition() {
    if (state.anzahl > 0) state.position = Math.min(state.position,state.anzahl-1);
    const ctx = renderExample("position",state.anzahl ? state.position : undefined);
    table("position",ctx);
    const frame = ctx.frames.find(f=>f.i === state.position);
    setText($("position-wert"),frame ? `i = ${frame.i}\nx = ${frame.shapes[0].args[0]}\nQuadratbreite = ${frame.shapes[0].args[2]}` : "anzahl = 0\nDie Laufbedingung ist sofort false.\nEs wird kein Feld gezeichnet.");
  }
  function renderColor() {
    const ctx = renderExample("farbe",state.farbe), frame = ctx.frames[state.farbe]; selectionButtons("farbe",6);
    setText($("farbe-wert"),`i = ${frame.i}\n${greyCondition().text}\nBedingung = ${greyCondition().run(frame.env)}\nFarbe = ${frame.shapes[0].color[0] === 150 ? "grau" : "weiß"}`);
  }
  function renderBars() {
    const ctx = renderExample("balken",state.balken), frame = ctx.frames[state.balken]; selectionButtons("balken",5); table("balken",ctx);
    setText($("balken-wert"),`i = ${frame.i}\nHöhe = ${frame.shapes[0].args[3]}\ny = ${frame.shapes[0].args[1]}\ny + Höhe = 200`);
  }
  const renders = {position:renderPosition,farbe:renderColor,balken:renderBars};
  function select(key,index) { state[key] = index; renders[key](); persist(); }
  document.querySelectorAll("[data-part]").forEach(button=>button.addEventListener("click",()=>{state.part = button.dataset.part; renderBuild(); persist();}));
  document.querySelectorAll("[data-select]").forEach(group=>group.addEventListener("click",event=> {
    const button = event.target.closest("[data-index]"); if (button) select(group.dataset.select,Number(button.dataset.index));
  }));
  for (const key of ["position","balken"]) $(`${key}-tabelle`).addEventListener("click",event=> {
    const button = event.target.closest("[data-index]"); if (!button) return;
    const index = Number(button.dataset.index); select(key,index);
    $(`${key}-tabelle`).querySelector(`[data-index="${index}"]`).focus({preventScroll:true});
  });
  document.querySelectorAll("[data-canvas-select]").forEach(surface=>surface.addEventListener("click",event=> {
    const box = surface.getBoundingClientRect(), x = (event.clientX-box.left)/box.width*400, y = (event.clientY-box.top)/box.height*200;
    const key = surface.dataset.canvasSelect;
    const shape = contexts[key].shapes.find(s=>x>=s.args[0] && x<=s.args[0]+s.args[2] && y>=s.args[1] && y<=s.args[1]+s.args[3]);
    if (shape) select(key,shape.i);
  }));
  const controls = [["grenzwert","grenze",renderBoundary],["anzahl","anzahl",renderPosition],["breite","breite",renderPosition],["luecke","luecke",renderPosition],["schritt","schritt",renderBars]];
  controls.forEach(([id,key,render])=>$(id).addEventListener("input",event=>{state[key] = Number(event.target.value); setText($(`${id}-wert`),state[key]); render(); persist();}));
  document.addEventListener("click",async event=> {
    const button = event.target.closest("[data-copy]"); if (!button) return;
    const text = Array.from(panels[button.dataset.copy].code.children).map(line=>line.textContent).join("\n");
    let copied = false;
    try { await navigator.clipboard.writeText(text); copied = true; } catch {
      const field = document.createElement("textarea"); field.value = text; field.className = "sr-only"; document.body.append(field); field.select();
      try { copied = document.execCommand("copy"); } catch { /* manuell kopierbar */ }
      field.remove(); button.focus({preventScroll:true});
    }
    setText($("kopier-status"),copied ? "Code kopiert." : "Markiere den Code und kopiere ihn mit Strg+C.");
    button.textContent = copied ? "Kopiert ✓" : "Strg+C"; setTimeout(()=>{button.textContent = "Kopieren";},1400);
  });
  restore();
  controls.forEach(([id,key])=>{$(id).value = state[key]; setText($(`${id}-wert`),state[key]);});
  renderBuild(); renderBoundary(); renderPosition(); renderColor(); renderBars();
  window.AlgorithmProgress?.trackPageState(KEY, state);
})();
