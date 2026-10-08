(() => {
  'use strict';
  const KEY = 'inf8-verzweigungen-uebung-v1';
  const field = (id, label, options) => ({ id, label, options });
  const comparisons = ['==', '!=', '<', '>', '<=', '>='];
  const colors = { rot: [255,0,0], blau: [0,0,255], gelb: [255,255,0], cyan: [0,255,255], grün: [0,180,100], weiß: [255,255,255] };
  const fill = name => 'fill(' + colors[name].join(', ') + ');';
  const point = (x, y, expected) => ({ values: { mouseX: x, mouseY: y }, expected });
  const comparisonCases = test => [0,199,200,201,400].map(x => ({ values: { x }, expected: String(test(x)) }));
  const regionPoints = [[100,100],[300,100],[100,300],[300,300],[200,100],[100,200],[200,200]];
  const regionCases = test => regionPoints.map(([x,y]) => point(x, y, String(test(x,y))));
  const quarterPoints = [[100,100],[300,100],[100,300],[300,300],[200,100],[100,200],[200,200],[201,201]];
  const quarter = (x, y) => x < 200 ? y < 200 ? 'rot' : 'cyan' : y < 200 ? 'gelb' : 'blau';
  const quarterCases = quarterPoints.map(([x,y]) => point(x,y,quarter(x,y)));
  const pointsCases = [0,6,7,9,10,12,13,15].map(punkte => ({
    values: { punkte }, expected: punkte <= 6 ? 'nicht bestanden' : punkte <= 9 ? 'bestanden' : punkte <= 12 ? 'gut' : 'sehr gut'
  }));
  const consoleSketch = (declarations, expression) => declarations + '\n\nvoid setup() {\n  boolean ergebnis = ' +
    expression + ';\n  println(ergebnis);\n}\n';
  const visualSketch = body => 'void setup() {\n  size(400, 400);\n  frameRate(2);\n  noStroke();\n}\n\nvoid draw() {\n' +
    '  background(200);\n' + body.split('\n').map(line => '  ' + line).join('\n') +
    '\n  circle(mouseX, mouseY, 40);\n}\n';
  const booleanArea = expression => visualSketch(
    'boolean a = mouseX < width / 2;\nboolean b = mouseY >= height / 2;\nboolean ergebnis = ' + expression + ';\n' +
    'if (ergebnis) {\n  ' + fill('grün') + '\n} else {\n  ' + fill('weiß') + '\n}\nprintln(ergebnis);');
  const halfBranch = expression => 'if (' + expression + ') {\n  ' + fill('rot') + '\n} else {\n  ' + fill('blau') + '\n}';
  const quarters = (join, xop, yop) =>
    'if (mouseX < width / 2 && mouseY < height / 2) {\n  ' + fill('rot') +
    '\n} ' + join + ' (mouseX ' + xop + ' width / 2 && mouseY < height / 2) {\n  ' + fill('gelb') +
    '\n} ' + join + ' (mouseX < width / 2 && mouseY ' + yop + ' height / 2) {\n  ' + fill('cyan') +
    '\n} else {\n  ' + fill('blau') + '\n}';
  const gradeSketch = (punkte, rows, join = 'else if', fallback = rows[0][1] === 'sehr gut' ? 'nicht bestanden' : 'sehr gut') => 'int punkte = ' + punkte + ';\n\nvoid setup() {\n' +
    rows.map(([condition, message], i) => '  ' + (i ? '} ' + join : 'if') +
      ' (' + condition + ') {\n    println("' + message + '");').join('\n') +
    '\n  } else {\n    println("' + fallback + '");\n  }\n}\n';

  const TASKS = [
    { id: 'vergleiche', title: 'Boolesche Ausdrücke und Vergleiche', stages: [
      { title: '1 · Kleiner als die Grenze', goal: 'Ergänze den Vergleich: true genau dann, wenn x kleiner als 200 ist.',
        hint: 'Teste auch x = 200. „Kleiner“ schließt den Grenzwert aus.',
        fields: [field('op', 'Vergleichsoperator', comparisons)], cases: comparisonCases(x => x < 200),
        source: (_, c) => consoleSketch('int x = ' + c.values.x + ';', 'x {{op}} 200') },
      { title: '2 · Die Grenze gehört dazu', goal: 'Ergänze den Vergleich: true für alle x bis einschließlich 200.',
        hint: '„Bis einschließlich“ bedeutet: Der Grenzwert selbst gehört noch dazu.',
        fields: [field('op', 'Vergleichsoperator', comparisons)], cases: comparisonCases(x => x <= 200),
        source: (_, c) => consoleSketch('int x = ' + c.values.x + ';', 'x {{op}} 200') },
      { title: '3 · Überall außer in der Mitte', goal: 'Ergänze den Vergleich: Nur bei x = 200 soll false ausgegeben werden.',
        hint: 'Gesucht ist der Vergleich, der Gleichheit ausschließt.',
        fields: [field('op', 'Vergleichsoperator', comparisons)], cases: comparisonCases(x => x !== 200),
        source: (_, c) => consoleSketch('int x = ' + c.values.x + ';', 'x {{op}} 200') }
    ] },
    { id: 'logik', title: 'UND, ODER, NICHT', stages: [
      { title: '1 · Beide müssen wahr sein', goal: 'Verknüpfe a und b: Das Ergebnis soll nur true sein, wenn beide wahr sind.',
        hint: 'Entscheidend ist auch der Fall, in dem nur eine der beiden Bedingungen wahr ist.',
        fields: [field('op', 'Logischer Operator', ['||','&&','=='])],
        cases: [[false,false],[false,true],[true,false],[true,true]].map(([a,b]) => ({ values:{a,b}, expected:String(a && b) })),
        source: (_, c) => consoleSketch('boolean a = ' + c.values.a + ';\nboolean b = ' + c.values.b + ';', 'a {{op}} b') },
      { title: '2 · Links oder unten', goal: 'Die Bedingung soll links von der Mitte oder in der unteren Hälfte wahr sein. Die waagerechte Mitte gehört zu unten.',
        hint: 'Bei ODER genügt eine wahre Teilbedingung. Auch der Bereich, in dem beide wahr sind, gehört dazu.',
        visual: true, fields: [field('op', 'Operator zwischen a und b', ['&&','||','=='])],
        cases: regionCases((x,y) => x < 200 || y >= 200),
        source: () => booleanArea('a {{op}} b') },
      { title: '3 · Außerhalb von links unten', goal: 'Die Bedingung soll überall wahr sein, außer im linken unteren Viertel.',
        hint: 'Negiere die gesamte Bedingung für links unten, nicht nur eine ihrer Teilbedingungen.',
        visual: true, fields: [field('ausdruck', 'Verneinter Ausdruck', ['!a && b','!(a || b)','!(a && b)'])],
        cases: regionCases((x,y) => !(x < 200 && y >= 200)),
        source: () => booleanArea('{{ausdruck}}') }
    ] },
    { id: 'wenn', title: 'if und if … else', stages: [
      { title: '1 · Oben rot, unten blau', goal: 'Wähle die Bedingung für die obere Hälfte. Auf der waagerechten Mitte soll der Kreis blau sein.',
        hint: 'Für oben und unten ist die y-Position entscheidend.',
        visual: true, kind: 'color', fields: [field('bedingung', 'Bedingung für rot',
          ['mouseX < width / 2','mouseY > height / 2','mouseY < height / 2'])],
        cases: regionPoints.map(([x,y]) => point(x,y,y < 200 ? 'rot' : 'blau')),
        source: () => visualSketch(halfBranch('{{bedingung}}')) },
      { title: '2 · Den Gegenfall ergänzen', goal: 'Ergänze den zweiten Zweig: Links soll der Kreis rot, rechts und auf der Mitte blau sein.',
        hint: 'Der Gegenfall soll genau dann laufen, wenn die erste Bedingung falsch ist.',
        visual: true, kind: 'color',
        fields: [field('zweig', 'Zweiter Zweig', ['if (mouseX < width / 2)','else','if (mouseY >= height / 2)'])],
        cases: regionPoints.map(([x,y]) => point(x,y,x < 200 ? 'rot' : 'blau')),
        source: () => visualSketch('if (mouseX < width / 2) {\n  ' + fill('rot') + '\n} {{zweig}} {\n  ' + fill('blau') + '\n}') },
      { title: '3 · Eine alte Farbe bleibt erhalten', goal: 'Repariere die Farbregel für die Mausfolge rechts → links → rechts. Der Kreis soll blau → rot → blau werden.',
        hint: 'fill() behält seine Farbe über draw()-Zyklen hinweg. background() setzt die Füllfarbe nicht zurück.',
        visual: true, kind: 'color', history: true, external: ['regel'],
        fields: [field('regel', 'Farbregel', ['nur if','if mit else','immer rot'])],
        cases: [point(300,100,'blau'),point(100,100,'rot'),point(300,300,'blau')],
        source: a => visualSketch(a.regel === 'if mit else' ? halfBranch('mouseX < width / 2') :
          a.regel === 'immer rot' ? fill('rot') : 'if (mouseX < width / 2) {\n  ' + fill('rot') + '\n}') }
    ] },
    { id: 'kette', title: 'else if: genau ein Zweig', stages: [
      { title: '1 · Rechts oben ergänzen', goal: 'Ergänze den gelben Zweig: links oben rot, rechts oben gelb, die gesamte untere Hälfte blau.',
        hint: 'Für rechts oben müssen die horizontale und die vertikale Bedingung gemeinsam erfüllt sein.',
        visual: true, kind: 'color', fields: [field('bedingung', 'Bedingung für gelb', [
          'mouseX >= width / 2 && mouseY >= height / 2',
          'mouseX < width / 2 && mouseY >= height / 2',
          'mouseX >= width / 2 && mouseY < height / 2'])],
        cases: quarterPoints.map(([x,y]) => point(x,y,y >= 200 ? 'blau' : x < 200 ? 'rot' : 'gelb')),
        source: () => visualSketch('if (mouseX < width / 2 && mouseY < height / 2) {\n  ' + fill('rot') +
          '\n} else if ({{bedingung}}) {\n  ' + fill('gelb') + '\n} else {\n  ' + fill('blau') + '\n}') },
      { title: '2 · Vier Viertel, eine Farbwahl', goal: 'Verbinde die Zweige: links oben rot, rechts oben gelb, links unten cyan, rechts unten blau. Pro Zyklus soll ein Farbzweig laufen.',
        hint: 'Mehrere getrennte if-Anweisungen können nacheinander Farben setzen. In einer Kette gewinnt der erste passende Zweig.',
        visual: true, kind: 'color', fields: [field('zweig', 'Verbindung der Farbzweige', ['if','else if'])],
        cases: quarterCases,
        source: () => visualSketch(quarters('{{zweig}}','>=','>=')) },
      { title: '3 · Die Mittellinien', goal: 'Ergänze die Vergleiche. Die senkrechte Mitte gehört zu rechts; die waagerechte Mitte gehört zu unten.',
        hint: 'Prüfe die Werte genau auf den Mittellinien, nicht nur die vier Ecken.',
        visual: true, kind: 'color',
        fields: [field('xop', 'Vergleich für rechts', ['>','==','>=']),field('yop', 'Vergleich für unten', ['==','>=','>'])],
        cases: quarterCases,
        source: () => visualSketch(quarters('else if','{{xop}}','{{yop}}')) }
    ] },
    { id: 'reihenfolge', title: 'Reihenfolge der Bedingungen', stages: [
      { title: '1 · Den höchsten Bereich zuerst prüfen', goal: 'Ordne die Prüfungen mit >= so, dass jede Punktzahl die passende Rückmeldung erhält.',
        hint: '14 Punkte erfüllen >= 7, >= 10 und >= 13. In einer else-if-Kette zählt nur der erste passende Zweig.',
        external: ['folge'], fields: [field('folge', 'Reihenfolge der Grenzen', ['7 → 10 → 13','13 → 10 → 7','10 → 13 → 7'])],
        cases: pointsCases,
        source: (a,c) => {
          const orders = {'7 → 10 → 13':[7,10,13],'13 → 10 → 7':[13,10,7],'10 → 13 → 7':[10,13,7]};
          const names = {7:'bestanden',10:'gut',13:'sehr gut'};
          const rows = (orders[a.folge] || [7,10,13]).map(n => ['punkte >= ' + n,names[n]]);
          return gradeSketch(c.values.punkte, rows, 'else if', 'nicht bestanden');
        } },
      { title: '2 · Aufsteigend mit Grenzwerten', goal: 'Prüfe von niedrig nach hoch: 0–6 nicht bestanden, 7–9 bestanden, 10–12 gut, 13–15 sehr gut.',
        hint: 'Die Werte 6, 9 und 12 gehören jeweils noch zum niedrigeren Bereich.',
        fields: [field('op','Vergleich an den oberen Grenzen',['<','>=','<='])], cases: pointsCases,
        source: (_,c) => gradeSketch(c.values.punkte,[['punkte {{op}} 6','nicht bestanden'],['punkte {{op}} 9','bestanden'],['punkte {{op}} 12','gut']]) },
      { title: '3 · Genau eine Rückmeldung', goal: 'Repariere die Verbindung der Zweige. Für jede Punktzahl soll genau eine passende Konsolenzeile erscheinen.',
        hint: 'Mehrere unabhängige if-Anweisungen können mehrere Meldungen ausgeben. else if prüft nur weiter, wenn vorher kein Zweig gepasst hat.',
        fields: [field('zweig','Verbindung der Notenprüfungen',['if','else if'])], cases: pointsCases,
        source: (_,c) => gradeSketch(c.values.punkte,[['punkte >= 13','sehr gut'],['punkte >= 10','gut'],['punkte >= 7','bestanden']],'{{zweig}}') }
    ] }
  ];

  // Parse exactly the Processing syntax used by these sketches. The displayed
  // source itself is executed; no eval and no separate canned preview results.
  function parse(source) {
    const tokens = [];
    const lexer = /\s+|\/\/[^\n]*|"(?:[^"\\]|\\.)*"|&&|\|\||==|!=|<=|>=|\d+|[A-Za-z_][A-Za-z_0-9]*|[(){};,=+\-*\/<>!]/gy;
    let offset = 0;
    while (offset < source.length) {
      lexer.lastIndex = offset;
      const match = lexer.exec(source);
      if (!match) throw Error('Unbekanntes Zeichen im Code.');
      offset = lexer.lastIndex;
      if (!/^\s|^\/\//.test(match[0])) tokens.push(match[0]);
    }
    let pos = 0;
    const peek = () => tokens[pos];
    const take = expected => {
      const token = tokens[pos++];
      if (expected !== undefined && expected !== token) throw Error('Hier wird ' + expected + ' erwartet.');
      return token;
    };
    const name = () => {
      const token = take();
      if (!/^[A-Za-z_]\w*$/.test(token || '')) throw Error('Ein Name fehlt.');
      return token;
    };
    const priorities = {'||':1,'&&':2,'==':3,'!=':3,'<':4,'>':4,'<=':4,'>=':4,'+':5,'-':5,'*':6,'/':6};
    const atom = () => {
      if (peek() === '!') { take('!'); return {type:'not', value:atom()}; }
      if (peek() === '(') { take('('); const node = expression(); take(')'); return node; }
      if (/^\d+$/.test(peek() || '')) return {type:'literal', value:Number(take())};
      if (peek() === 'true' || peek() === 'false') return {type:'literal', value:take() === 'true'};
      if ((peek() || '').startsWith('"')) return {type:'literal', value:JSON.parse(take())};
      return {type:'variable', name:name()};
    };
    const expression = (minimum = 1) => {
      let left = atom();
      while (priorities[peek()] >= minimum) {
        const op = take();
        left = {type:'binary', op, left, right:expression(priorities[op] + 1)};
      }
      return left;
    };
    const declaration = () => {
      const declaredType = take(), id = name(); take('=');
      const value = expression(); take(';');
      return {type:'declaration', declaredType, name:id, value};
    };
    const block = () => {
      take('{'); const body = [];
      while (peek() !== '}') {
        if (peek() === undefined) throw Error('Eine schließende Klammer fehlt.');
        body.push(statement());
      }
      take('}'); return body;
    };
    const statement = () => {
      if (peek() === 'int' || peek() === 'boolean') return declaration();
      if (peek() === 'if') {
        take('if'); take('('); const condition = expression(); take(')');
        const yes = block(); let no = [];
        if (peek() === 'else') { take('else'); no = peek() === 'if' ? [statement()] : block(); }
        return {type:'if', condition, yes, no};
      }
      const id = name();
      if (peek() === '=') { take('='); const value = expression(); take(';'); return {type:'assignment', name:id, value}; }
      take('('); const args = [];
      if (peek() !== ')') {
        args.push(expression());
        while (peek() === ',') { take(','); args.push(expression()); }
      }
      take(')'); take(';'); return {type:'call', name:id, args};
    };
    const program = {globals:[], functions:Object.create(null)};
    while (pos < tokens.length) {
      if (peek() === 'int' || peek() === 'boolean') { program.globals.push(declaration()); continue; }
      take('void'); const id = name(); take('('); take(')');
      if (Object.hasOwn(program.functions,id)) throw Error('Doppelte Funktion.');
      program.functions[id] = block();
    }
    return program;
  }

  function execute(program, sequence) {
    const env = {width:400, height:400, mouseX:0, mouseY:0};
    const ctx = {env, bg:[204,204,204], color:[255,255,255], shapes:[], output:[], locals:{}};
    const lookup = (name, local) => {
      if (Object.hasOwn(local,name)) return local[name];
      if (Object.hasOwn(env,name)) return env[name];
      throw Error('Unbekannte Variable: ' + name);
    };
    const value = (node, local) => {
      if (node.type === 'literal') return node.value;
      if (node.type === 'variable') return lookup(node.name,local);
      if (node.type === 'not') return !value(node.value,local);
      const a = value(node.left,local);
      if (node.op === '&&') return a && value(node.right,local);
      if (node.op === '||') return a || value(node.right,local);
      const b = value(node.right,local);
      switch (node.op) {
        case '==': return a === b; case '!=': return a !== b;
        case '<': return a < b; case '>': return a > b; case '<=': return a <= b; case '>=': return a >= b;
        case '+': return a + b; case '-': return a - b; case '*': return a * b; case '/': return Math.trunc(a / b);
        default: throw Error('Unbekannter Operator.');
      }
    };
    let operations = 0;
    const run = (nodes, local) => {
      for (const node of nodes) {
        if (++operations > 1500) throw Error('Zu viele Aufrufe.');
        if (node.type === 'if') { run(value(node.condition,local) ? node.yes : node.no,local); continue; }
        if (node.type === 'declaration') { local[node.name] = value(node.value,local); continue; }
        if (node.type === 'assignment') {
          const destination = Object.hasOwn(local,node.name) ? local : env;
          if (!Object.hasOwn(destination,node.name)) throw Error('Unbekannte Variable: ' + node.name);
          destination[node.name] = value(node.value,local); continue;
        }
        const args = node.args.map(arg => value(arg,local));
        switch (node.name) {
          case 'size': [env.width,env.height] = args; break;
          case 'frameRate': case 'noStroke': break;
          case 'background': ctx.bg = args.length === 1 ? [args[0],args[0],args[0]] : args; ctx.shapes = []; break;
          case 'fill': ctx.color = args.length === 1 ? [args[0],args[0],args[0]] : args; break;
          case 'circle': ctx.shapes.push({args,color:ctx.color.slice()}); break;
          case 'println': ctx.output.push(args.map(String).join('')); break;
          default:
            if (!Object.hasOwn(program.functions,node.name)) throw Error('Unbekannte Funktion: ' + node.name);
            run(program.functions[node.name],{});
        }
      }
    };
    run(program.globals,env);
    Object.assign(env,sequence[0].values);
    run(program.functions.setup,{});
    if (program.functions.draw) {
      sequence.forEach(c => {
        Object.assign(env,c.values); ctx.output = []; ctx.locals = {};
        run(program.functions.draw,ctx.locals);
      });
    }
    return ctx;
  }

  const initialState = () => ({ tasks:Object.fromEntries(TASKS.map((task,i) => [task.id,{
    active:0, open:i === 0, stages:task.stages.map(() => ({answers:{},sample:0,checked:false,passed:false}))
  }])) });
  function restore() {
    const clean = initialState();
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      for (const task of TASKS) {
        const saved = raw?.tasks?.[task.id], current = clean.tasks[task.id];
        if (!saved || typeof saved !== 'object') continue;
        if (Number.isInteger(saved.active) && saved.active >= 0 && saved.active < 3) current.active = saved.active;
        if (typeof saved.open === 'boolean') current.open = saved.open;
        task.stages.forEach((stage,i) => {
          const record = Array.isArray(saved.stages) ? saved.stages[i] : null, target = current.stages[i];
          if (!record || typeof record !== 'object') return;
          for (const entry of stage.fields) if (entry.options.includes(record.answers?.[entry.id])) target.answers[entry.id] = record.answers[entry.id];
          if (Number.isInteger(record.sample) && record.sample >= 0 && record.sample < stage.cases.length) target.sample = record.sample;
          target.checked = record.checked === true; target.passed = record.passed === true;
        });
      }
    } catch (_) { /* Blank answers if storage is unavailable or damaged. */ }
    return clean;
  }
  const state = restore();
  const save = () => { try { localStorage.setItem(KEY,JSON.stringify(state)); } catch (_) {} };
  const stageFor = task => task.stages[state.tasks[task.id].active];
  const recordFor = task => state.tasks[task.id].stages[state.tasks[task.id].active];
  const missing = (stage,record) => stage.fields.some(entry => !entry.options.includes(record.answers[entry.id]));
  const template = (stage,record,index = record.sample) => stage.source(record.answers,stage.cases[index]);
  const expand = (source,record) => source.replace(/\{\{([a-z]+)\}\}/g,(_,id) => record.answers[id] || '?');
  const colorName = rgb => Object.keys(colors).find(name => colors[name].every((v,i) => rgb[i] === v)) || rgb.join(', ');
  const actual = (stage,result) => stage.kind === 'color' ? colorName(result.color) : result.output.join('\n');
  function evaluate(task) {
    const stage = stageFor(task), record = recordFor(task);
    if (!record.checked) return {status:'',text:'Ergänze den Code und klicke auf Prüfen.'};
    if (missing(stage,record)) return {status:'error',text:'Fülle zuerst alle Auswahlen mit ? aus.'};
    try {
      const results = stage.cases.map((c,index) => {
        const sequence = stage.history ? stage.cases.slice(0,index + 1) : [c];
        return execute(parse(expand(template(stage,record,index),record)),sequence);
      });
      const firstWrong = results.findIndex((result,i) => actual(stage,result) !== stage.cases[i].expected);
      if (firstWrong < 0) return {status:'success',text:'Alle ' + results.length + ' Prüffälle stimmen.',results};
      const c = stage.cases[firstWrong], got = actual(stage,results[firstWrong]);
      return {status:'error',text:'Der Code läuft. Bei ' + caseLabel(c,stage,firstWrong).replace(/\n/g,', ') +
        ' ergibt er ' + got.replace(/\n/g,' / ') + '; erwartet ist ' + c.expected + '.',results};
    } catch (error) { return {status:'error',text:'Der Sketch kann so nicht starten: ' + error.message}; }
  }
  function caseLabel(c,stage,index) {
    const lines = Object.entries(c.values).map(([name,v]) => name + ' = ' + v);
    if (stage.history) lines.unshift('Schritt ' + (index + 1));
    return lines.join('\n');
  }
  const el = (tag,cls,text) => {
    const node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node;
  };
  const button = (text,cls,action) => {
    const node = el('button',cls,text); node.type = 'button'; node.addEventListener('click',action); return node;
  };
  const views = new Map();
  function choice(task,definition) {
    const select = el('select','code-choice'); select.dataset.field = definition.id;
    select.setAttribute('aria-label',definition.label); select.append(new Option('?',''));
    definition.options.forEach(option => select.append(new Option(option,option)));
    select.value = recordFor(task).answers[definition.id] || '';
    select.addEventListener('change',() => {
      const peers = [...views.get(task.id).body.querySelectorAll('[data-field="' + definition.id + '"]')], index = peers.indexOf(select);
      recordFor(task).answers[definition.id] = select.value; recordFor(task).checked = false; save(); renderTask(task);
      views.get(task.id).body.querySelectorAll('[data-field="' + definition.id + '"]')[index]?.focus({preventScroll:true});
    });
    return select;
  }
  function syntax(parent,text) {
    const pattern = /\/\/[^\n]*|"(?:[^"\\]|\\.)*"|\b(?:void|int|boolean|if|else|true|false)\b|\b\d+\b|\b[A-Za-z_]\w*(?=\s*\()/g;
    let last = 0;
    for (const match of text.matchAll(pattern)) {
      parent.append(document.createTextNode(text.slice(last,match.index)));
      const token = match[0], cls = token.startsWith('//') ? 'comment' : token.startsWith('"') ? 'string' :
        /^(void|int|boolean|if|else|true|false)$/.test(token) ? 'keyword' : /^\d/.test(token) ? 'number' : 'function';
      parent.append(el('span',cls,token)); last = match.index + token.length;
    }
    parent.append(document.createTextNode(text.slice(last)));
  }
  function renderCode(task,code) {
    const stage = stageFor(task);
    template(stage,recordFor(task)).trimEnd().split('\n').forEach((text,i) => {
      const line = el('span','code-line'); line.dataset.line = i + 1;
      for (const part of text.split(/(\{\{[a-z]+\}\})/)) {
        const match = /^\{\{([a-z]+)\}\}$/.exec(part);
        if (match) line.append(choice(task,stage.fields.find(entry => entry.id === match[1]))); else syntax(line,part);
      }
      code.append(line);
    });
  }
  const codeText = code => {
    const read = node => node.nodeName === 'SELECT' ? node.value || '?' : node.nodeType === Node.TEXT_NODE ? node.textContent : [...node.childNodes].map(read).join('');
    return [...code.querySelectorAll('.code-line')].map(read).join('\n');
  };
  async function copyCode(task,code,status) {
    const stage = stageFor(task), record = recordFor(task);
    if (missing(stage,record)) { status.textContent = 'Ergänze erst alle Auswahlen.'; return; }
    const text = codeText(code);
    try { parse(text); } catch (_) { status.textContent = 'Der Sketch enthält noch einen Fehler.'; return; }
    try {
      try { await navigator.clipboard.writeText(text); }
      catch (_) {
        const input = el('textarea'); input.value = text; input.style.position = 'fixed'; input.style.top = '-10000px';
        const focused = document.activeElement; document.body.append(input); input.select();
        let copied = false;
        try { copied = document.execCommand('copy'); }
        finally { input.remove(); focused?.focus({preventScroll:true}); }
        if (!copied) throw Error('copy');
      }
      status.textContent = 'Code kopiert.';
    } catch (_) { status.textContent = 'Markiere den Code zum manuellen Kopieren.'; }
  }
  function draw(canvas,grid,result) {
    const ctx = canvas.getContext('2d'), g = grid.getContext('2d');
    ctx.clearRect(0,0,400,400); g.clearRect(0,0,400,400);
    if (!result) return;
    ctx.fillStyle = 'rgb(' + result.bg.join(',') + ')'; ctx.fillRect(0,0,400,400);
    result.shapes.forEach(shape => {
      ctx.fillStyle = 'rgb(' + shape.color.join(',') + ')'; ctx.beginPath();
      ctx.arc(shape.args[0],shape.args[1],shape.args[2] / 2,0,Math.PI * 2); ctx.fill();
    });
    for (let i = 10; i < 400; i += 10) {
      g.strokeStyle = i % 100 === 0 ? 'rgba(70,90,110,.3)' : 'rgba(70,90,110,.1)';
      g.beginPath(); g.moveTo(i,0); g.lineTo(i,400); g.moveTo(0,i); g.lineTo(400,i); g.stroke();
    }
    g.fillStyle = '#435467'; g.font = '12px Consolas'; g.fillText('0',4,13); g.fillText('x → 400',339,13); g.fillText('y ↓ 400',4,394);
  }
  function progress() {
    let count = 0;
    for (const task of TASKS) {
      const current = state.tasks[task.id], view = views.get(task.id);
      count += current.stages.filter(record => record.passed).length;
      const done = current.stages.every(record => record.passed);
      view.details.classList.toggle('is-done',done); view.badge.hidden = !done;
      view.buttons.forEach((node,i) => {
        node.classList.toggle('is-done',current.stages[i].passed); node.textContent = 'Stufe ' + (i + 1) + (current.stages[i].passed ? ' ✓' : '');
        node.setAttribute('aria-pressed',String(current.active === i));
      });
    }
    const node = document.getElementById('progress'), text = count + ' von 15 Stufen geschafft';
    if (node.textContent !== text) node.textContent = text;
  }
  function renderTask(task) {
    const view = views.get(task.id), stage = stageFor(task), record = recordFor(task), outcome = evaluate(task);
    view.body.replaceChildren();
    view.body.append(el('h2','stage-title',stage.title),el('p','goal',stage.goal));
    (stage.external || []).forEach(id => {
      const definition = stage.fields.find(entry => entry.id === id), label = el('label','choice-line');
      label.append(el('span','',definition.label + ':'),choice(task,definition)); view.body.append(label);
    });
    const split = el('div','split'), codePanel = el('section','subpanel'), heading = el('div','subpanel-heading');
    const pre = el('pre','code-block'); pre.tabIndex = 0; const code = el('code'); pre.append(code); renderCode(task,code);
    const copyStatus = el('p','copy-status'); copyStatus.setAttribute('aria-live','polite');
    heading.append(el('h3','','Dein Code'),button('Kopieren','btn ghost small',() => copyCode(task,code,copyStatus)));
    const codeArea = el('div','code-area'); codeArea.append(el('div','ide-tabs','Sketch · Processing / Java'),pre);
    codePanel.append(heading,codeArea,copyStatus);
    const preview = el('section','subpanel'), previewHeading = el('div','subpanel-heading');
    previewHeading.append(el('h3','','Prüffälle')); preview.append(previewHeading);
    const result = outcome.results?.[record.sample];
    if (stage.visual) {
      const stack = el('div','canvas-stack'), canvas = el('canvas','drawing-layer'), grid = el('canvas','grid-layer');
      canvas.width = canvas.height = grid.width = grid.height = 400; grid.setAttribute('aria-hidden','true');
      canvas.setAttribute('aria-label','Kreis beim ausgewählten Prüffall'); stack.append(canvas,grid); draw(canvas,grid,result);
      preview.append(stack);
    }
    const readout = el('pre','readout');
    const values = Object.entries(stage.cases[record.sample].values).map(([name,v]) => name + ' = ' + v);
    if (stage.history) values.unshift('Schritt ' + (record.sample + 1) + ' der Mausfolge');
    if (result) {
      for (const name of ['a','b']) if (Object.hasOwn(result.locals,name)) values.push(name + ' = ' + result.locals[name]);
      values.push(stage.kind === 'color' ? 'Farbe = ' + actual(stage,result) : 'Konsole:\n' + actual(stage,result));
    } else values.push('Ergebnis nach Prüfen');
    readout.textContent = values.join('\n'); preview.append(readout);
    const table = el('table','case-table'), thead = el('thead'), tr = el('tr');
    ['Prüffall','Soll','Dein Ergebnis'].forEach(label => { const th = el('th','',label); th.scope = 'col'; tr.append(th); }); thead.append(tr); table.append(thead);
    const tbody = el('tbody');
    stage.cases.forEach((c,i) => {
      const row = el('tr',i === record.sample ? 'is-selected' : '');
      const first = el('th'); first.scope = 'row';
      const select = button(caseLabel(c,stage,i),'case-btn',() => {
        record.sample = i; save(); renderTask(task);
        views.get(task.id).body.querySelectorAll('.case-btn')[i]?.focus({preventScroll:true});
      });
      select.setAttribute('aria-pressed',String(i === record.sample)); first.append(select);
      const expected = el('td','expected',c.expected), got = el('td');
      if (outcome.results) {
        const text = actual(stage,outcome.results[i]); got.textContent = text;
        got.className = text === c.expected ? 'case-good' : 'case-bad';
        got.append(el('span','case-mark',text === c.expected ? ' ✓' : ' ✗'));
      } else got.textContent = '—';
      row.append(first,expected,got); tbody.append(row);
    });
    table.append(tbody); preview.append(table); split.append(codePanel,preview); view.body.append(split);
    const actions = el('div','action-row');
    actions.append(button('Prüfen','btn check-btn',() => {
      record.checked = true;
      if (evaluate(task).status === 'success') record.passed = true;
      save(); renderTask(task); views.get(task.id).body.querySelector('.check-btn').focus({preventScroll:true});
    }));
    const hint = button('💡','btn ghost',() => {
      document.getElementById('hint-text').textContent = stage.hint; hintOpener = hint; document.getElementById('hint-dialog').showModal();
    });
    hint.setAttribute('aria-label','Hinweis zu ' + stage.title); actions.append(hint); view.body.append(actions);
    view.feedback.className = 'feedback-box task-feedback ' + outcome.status;
    if (view.feedback.textContent !== outcome.text) view.feedback.textContent = outcome.text;
    progress();
  }
  let hintOpener = null;
  const dialog = document.getElementById('hint-dialog');
  dialog.addEventListener('close',() => { if (hintOpener?.isConnected) hintOpener.focus(); });
  dialog.addEventListener('click',event => {
    if (event.target !== dialog) return; const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  const root = document.getElementById('tasks');
  TASKS.forEach((task,i) => {
    const details = el('details','task'); details.id = task.id; details.open = state.tasks[task.id].open;
    const summary = el('summary'), badge = el('span','badge','geschafft ✓'); badge.hidden = true;
    summary.append(el('span','station-label','Aufgabe ' + (i + 1)),el('span','task-title',task.title),badge);
    const body = el('div','task-body'), row = el('div','stage-row'), feedback = el('div','feedback-box task-feedback');
    feedback.setAttribute('aria-live','polite'); row.setAttribute('role','group'); row.setAttribute('aria-label','Stufen für ' + task.title);
    const buttons = task.stages.map((_,index) => button('Stufe ' + (index + 1),'stage-btn',() => {
      state.tasks[task.id].active = index; save(); renderTask(task);
    }));
    row.append(...buttons); details.append(summary,row,body,feedback);
    views.set(task.id,{details,body,buttons,badge,feedback});
    details.addEventListener('toggle',() => { state.tasks[task.id].open = details.open; save(); }); root.append(details);
  });
  TASKS.forEach(renderTask);
})();
