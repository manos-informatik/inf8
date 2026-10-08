(() => {
  'use strict';
  const KEY = 'inf8-zaehlschleifen-uebung-v1';
  const field = (id,label,options) => ({id,label,options});
  const colors = {grau:[120,120,120], weiß:[255,255,255], cyan:[34,211,238], schwarz:[0,0,0]};
  const test = (values,expected,extra = {}) => ({values,expected,...extra});
  const iValues = n => Array.from({length:n},(_,i) => i).join(', ') || 'keine';
  const setup = 'void setup() {\n  size(400, 200);\n  noStroke();\n  frameRate(2);\n}\n\n';
  const consoleLoop = (declarations,start,condition,update) => (declarations ? declarations + '\n\n' : '') +
    'void setup() {\n  for (int i = ' + start + '; ' + condition + '; ' + update + ') {\n    println(i);\n  }\n}\n';
  const drawingLoop = (declarations,body,head = 'int i = 0; i < anzahl; i++',before = '') => setup +
    'void draw() {\n  background(200);\n  fill(34, 211, 238);\n' +
    declarations.map(line => '  ' + line).join('\n') + '\n' + (before ? '  ' + before + '\n' : '') +
    '  for (' + head + ') {\n' + body.split('\n').map(line => '    ' + line).join('\n') + '\n  }\n}\n';
  const rowTarget = (anzahl,zellenBreite,luecke) => Array.from({length:anzahl},(_,i) => [20 + i * zellenBreite,80,zellenBreite - luecke,zellenBreite - luecke]);
  const barTarget = (anzahl,schritt,breite = 50) => Array.from({length:anzahl},(_,i) => [20 + i * breite,200 - (i + 1) * schritt,breite - 4,(i + 1) * schritt]);
  const geometryCase = (values,target) => test(values,target.length + ' Felder\npassende Maße',{target});
  const rowDeclaration = c => ['int anzahl = ' + c.values.anzahl + ';','int zellenBreite = ' + (c.values.zellenBreite || 50) + ';'];
  const colorCases = expected => [test({anzahl:6},expected)];
  const colorLoop = body => drawingLoop(['int anzahl = 6;','int zellenBreite = 50;'],body + '\nrect(20 + i * zellenBreite, 80, 46, 46);','int i = 0; i < anzahl; i++','fill(255);');
  const alternating = 'i == 0 || i == 2 || i == 4';
  const bars = (c,heightExpression,yExpression,head = 'int i = 0; i < anzahl; i++') => drawingLoop([
    'int anzahl = ' + c.values.anzahl + ';','int schritt = ' + c.values.schritt + ';','int breite = 50;'
  ],'int hoehe = ' + heightExpression + ';\nrect(20 + i * breite, ' + yExpression + ', breite - 4, hoehe);',head);

  const TASKS = [
    {id:'aufbau',title:'Aufbau einer for-Schleife',stages:[
      {title:'1 · Mit dem richtigen Wert starten',goal:'Ergänze den Startwert. Die Konsole soll 0, 1, 2, 3 und 4 ausgeben.',
        hint:'Die Initialisierung legt den ersten i-Wert fest. Sie läuft nur einmal vor der Schleife.',kind:'indices',
        fields:[field('start','Startwert von i',['1','0','5'])],cases:[test({},'0, 1, 2, 3, 4')],
        source:() => consoleLoop('','{{start}}','i < 5','i++')},
      {title:'2 · Nach jedem Durchlauf weiterzählen',goal:'Ergänze das Update. i soll nacheinander die Werte 0, 1, 2, 3 und 4 annehmen.',
        hint:'Das Update läuft nach dem Rumpf. Prüfe, ob i dadurch auf die Grenze zuläuft oder sich von ihr entfernt.',kind:'indices',
        fields:[field('update','Update von i',['i--','i = i + 2','i++'])],cases:[test({},'0, 1, 2, 3, 4')],
        source:() => consoleLoop('','0','i < 5','{{update}}')},
      {title:'3 · Den ganzen Schleifenkopf ergänzen',goal:'Ergänze den Kopf: von 0 bis anzahl - 1, jeden Wert genau einmal. Bei anzahl = 0 soll nichts ausgegeben werden.',
        hint:'Start, Laufbedingung und Update müssen zusammenpassen. Prüfe auch den Fall ohne Durchlauf.',kind:'indices',
        fields:[field('start','Startwert',['1','0']),field('op','Laufbedingung',['<=','<']),field('update','Update',['i = i + 2','i++'])],
        cases:[0,1,5].map(anzahl => test({anzahl},iValues(anzahl))),
        source:(_,c) => consoleLoop('int anzahl = ' + c.values.anzahl + ';','{{start}}','i {{op}} anzahl','{{update}}')}
    ]},
    {id:'grenze',title:'Laufbedingung: < oder <=',stages:[
      {title:'1 · Genau anzahl Felder',goal:'Die Schleife beginnt bei i = 0. Ergänze den Vergleich für genau anzahl Felder.',
        hint:'Bei Startwert 0 ist der letzte gewünschte Index anzahl - 1.',kind:'count',visual:true,
        fields:[field('op','Vergleich mit anzahl',['<=','>','<'])],cases:[0,1,4].map(anzahl => test({anzahl},String(anzahl))),
        source:(_,c) => drawingLoop(rowDeclaration(c),'rect(20 + i * 50, 80, 40, 40);','int i = 0; i {{op}} anzahl; i++')},
      {title:'2 · Ab 1 zählen',goal:'Diesmal beginnt i bei 1. Ergänze den Vergleich für genau anzahl Felder.',
        hint:'Jetzt sollen die Werte 1 bis einschließlich anzahl durchlaufen werden.',kind:'count',visual:true,
        fields:[field('op','Vergleich ab Startwert 1',['<','<=','>'])],cases:[0,1,4].map(anzahl => test({anzahl},String(anzahl))),
        source:(_,c) => drawingLoop(rowDeclaration(c),'rect(20 + (i - 1) * 50, 80, 40, 40);','int i = 1; i {{op}} anzahl; i++')},
      {title:'3 · Der letzte Index gehört dazu',goal:'Ergänze die Bedingung. Zeichne die Felder mit den Indizes 0 bis einschließlich grenze.',
        hint:'Die Grenze ist hier ein Index, keine Anzahl. Auch bei grenze = 0 soll ein Feld entstehen.',kind:'count',visual:true,
        fields:[field('bedingung','Laufbedingung',['i < grenze','i < grenze - 1','i <= grenze'])],cases:[0,2,4].map(grenze => test({grenze},String(grenze + 1))),
        source:(_,c) => drawingLoop(['int grenze = ' + c.values.grenze + ';'],'rect(20 + i * 50, 80, 40, 40);','int i = 0; {{bedingung}}; i++')}
    ]},
    {id:'position',title:'Positionen mit i berechnen',stages:[
      {title:'1 · Vier verschiedene Positionen',goal:'Ergänze x. Die vier Felder sollen bei 20, 70, 120 und 170 beginnen.',
        hint:'i verändert sich in jedem Durchlauf. Der erste Wert ist 0; der Abstand zwischen zwei Feldern beträgt 50.',kind:'positions',visual:true,
        fields:[field('x','x-Position',['i * 50','20 + i','20 + i * 50'])],cases:[test({anzahl:4},'20, 70, 120, 170')],
        source:(_,c) => drawingLoop(rowDeclaration(c),'rect({{x}}, 80, 40, 40);')},
      {title:'2 · Vier Pixel Abstand lassen',goal:'Ergänze die Quadratgröße. In jeder Zelle sollen rechts vier Pixel frei bleiben.',
        hint:'Die x-Position wächst um zellenBreite. Das Quadrat muss um die gewünschte Lücke kleiner sein.',kind:'sizes',visual:true,
        fields:[field('groesse','Breite und Höhe',['zellenBreite','zellenBreite + 4','zellenBreite - 4'])],
        cases:[30,50].map(zellenBreite => test({anzahl:4,zellenBreite},(zellenBreite - 4) + ' × ' + (zellenBreite - 4))),
        source:(_,c) => drawingLoop(rowDeclaration(c),'rect(20 + i * zellenBreite, 80, {{groesse}}, {{groesse}});')},
      {title:'3 · Die Reihe über Variablen steuern',goal:'Ergänze Position und Größe: Start bei x = 20, eine Zelle pro Durchlauf und die vorgegebene Lücke zwischen den Quadraten.',
        hint:'Für die Position zählt die ganze Zellenbreite; von der Größe des Quadrats wird die Lücke abgezogen.',kind:'geometry',visual:true,
        fields:[field('x','x-Position',['20 + i','i * zellenBreite','20 + i * zellenBreite']),field('groesse','Quadratgröße',['zellenBreite + luecke','zellenBreite - luecke','luecke'])],
        cases:[[3,80,10],[5,60,4],[0,40,6]].map(([anzahl,zellenBreite,luecke]) => geometryCase({anzahl,zellenBreite,luecke},rowTarget(anzahl,zellenBreite,luecke))),
        source:(_,c) => drawingLoop([...rowDeclaration(c),'int luecke = ' + c.values.luecke + ';'],'rect({{x}}, 80, {{groesse}}, {{groesse}});')}
    ]},
    {id:'farbe',title:'Farbwechsel in der Reihe',stages:[
      {title:'1 · Erstes und letztes Feld markieren',goal:'Nur das erste und das sechste Feld sollen grau sein; die vier dazwischen weiß.',
        hint:'Erstes und sechstes Feld haben die Indizes 0 und 5. Ein Durchlauf kann nicht beide Indizes gleichzeitig haben.',kind:'colors',visual:true,
        fields:[field('op','Verknüpfung der Indizes',['&&','||'])],cases:colorCases('grau, weiß, weiß, weiß, weiß, grau'),
        source:() => colorLoop('if (i == 0 {{op}} i == 5) {\n  fill(120);\n} else {\n  fill(255);\n}')},
      {title:'2 · Grau und weiß im Wechsel',goal:'Das erste, dritte und fünfte Feld sollen grau sein; die anderen weiß.',
        hint:'Die Feldnummer beginnt bei 1, der Schleifenindex bei 0.',kind:'colors',visual:true,
        fields:[field('bedingung','Bedingung für grau',['i == 1 || i == 3 || i == 5','i == 0 || i == 2 || i == 4','i == 2 || i == 4 || i == 6'])],
        cases:colorCases('grau, weiß, grau, weiß, grau, weiß'),
        source:() => colorLoop('if ({{bedingung}}) {\n  fill(120);\n} else {\n  fill(255);\n}')},
      {title:'3 · Die Farbe in jedem Durchlauf setzen',goal:'Repariere die Farbregel für den Wechsel grau, weiß, grau, weiß, grau, weiß.',
        hint:'fill() behält seine Farbe. Ohne Gegenfall bleibt nach dem ersten grauen Feld auch das nächste grau.',kind:'colors',visual:true,external:['regel'],
        fields:[field('regel','Farbregel',['nur if','if mit else','weiß nach dem if'])],cases:colorCases('grau, weiß, grau, weiß, grau, weiß'),
        source:a => colorLoop('if (' + alternating + ') {\n  fill(120);\n}' +
          (a.regel === 'if mit else' ? ' else {\n  fill(255);\n}' : a.regel === 'weiß nach dem if' ? '\nfill(255);' : ''))}
    ]},
    {id:'balken',title:'Balkendiagramm',stages:[
      {title:'1 · Die Höhe wächst mit i',goal:'Ergänze die Höhenberechnung. Die fünf Balken sollen 30, 60, 90, 120 und 150 Pixel hoch sein.',
        hint:'i beginnt bei 0. Trotzdem soll schon der erste Balken eine Höhe von 30 haben.',kind:'heights',visual:true,
        fields:[field('hoehe','Balkenhöhe',['i * 30','30','(i + 1) * 30'])],cases:[test({anzahl:5,schritt:30},'30, 60, 90, 120, 150')],
        source:(_,c) => bars(c,'{{hoehe}}','height - hoehe')},
      {title:'2 · Alle Balken stehen unten',goal:'Ergänze die y-Position. Die Unterkante jedes Balkens soll genau am unteren Leinwandrand liegen.',
        hint:'Die y-Position bezeichnet die obere Kante. Obere Kante plus Balkenhöhe soll height ergeben.',kind:'geometry',visual:true,
        fields:[field('y','y-Position',['hoehe','height - 30','height - hoehe'])],cases:[geometryCase({anzahl:5,schritt:30},barTarget(5,30))],
        source:(_,c) => bars(c,'(i + 1) * schritt','{{y}}')},
      {title:'3 · Anzahl und Höhenzunahme ändern',goal:'Ergänze Kopf und Höhe: genau anzahl Balken, jeder um schritt höher als der vorige. Alle Balken stehen unten.',
        hint:'Prüfe alle Vorgaben. Ein fester Faktor kann für einen Fall passen und beim nächsten falsch sein.',kind:'geometry',visual:true,
        fields:[field('op','Laufbedingung',['<=','<','>']),field('hoehe','Höhenberechnung',['i * schritt','(i + 1) * 30','(i + 1) * schritt'])],
        cases:[[3,40],[5,20],[0,30]].map(([anzahl,schritt]) => geometryCase({anzahl,schritt},barTarget(anzahl,schritt))),
        source:(_,c) => bars(c,'{{hoehe}}','height - hoehe','int i = 0; i {{op}} anzahl; i++')}
    ]}
  ];
  // Parse exactly the Processing syntax used by these sketches. The displayed
  // source itself is executed; no eval and no separate canned preview results.
  function parse(source) {
    const tokens = [];
    const lexer = /\s+|\/\/[^\n]*|"(?:[^"\\]|\\.)*"|&&|\|\||==|!=|<=|>=|\+\+|--|\d+|[A-Za-z_][A-Za-z_0-9]*|[(){};,=+\-*\/<>!]/gy;
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
      if (peek() === '-') { take('-'); return {type:'binary',op:'-',left:{type:'literal',value:0},right:atom()}; }
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
    const update = () => {
      const id = name();
      if (peek() === '++' || peek() === '--') {
        const op = take() === '++' ? '+' : '-';
        return {type:'assignment',name:id,value:{type:'binary',op,left:{type:'variable',name:id},right:{type:'literal',value:1}}};
      }
      take('='); return {type:'assignment',name:id,value:expression()};
    };
    const statement = () => {
      if (peek() === 'int' || peek() === 'boolean') return declaration();
      if (peek() === 'for') {
        take('for'); take('(');
        const initial = declaration(), condition = expression(); take(';');
        const change = update(); take(')');
        return {type:'for',initial,condition,change,body:block()};
      }
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

  function execute(program) {
    const env = {width:400, height:200};
    const ctx = {env, bg:[204,204,204], color:[255,255,255], shapes:[], output:[], locals:{}, loops:[],error:null};
    const scopeFor = (name, local) => {
      let scope = local;
      while (scope && scope !== Object.prototype) {
        if (Object.hasOwn(scope,name)) return scope;
        scope = Object.getPrototypeOf(scope);
      }
      if (Object.hasOwn(env,name)) return env;
      throw Error('Unbekannte Variable: ' + name);
    };
    const lookup = (name,local) => scopeFor(name,local)[name];
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
        if (node.type === 'for') {
          const loopScope = Object.create(local);
          run([node.initial],loopScope);
          const trace = {indices:[],finalI:null,lastTest:null,stopped:false}; ctx.loops.push(trace);
          while (value(node.condition,loopScope)) {
            trace.finalI = loopScope[node.initial.name]; trace.lastTest = true;
            if (trace.indices.length >= 40) {
              trace.stopped = true;
              const error = Error('Nach 40 Durchläufen ist die Laufbedingung noch true (i = ' + trace.finalI + '). Prüfe die Zählrichtung und die Grenze.');
              error.simulationStop = true; throw error;
            }
            trace.indices.push(loopScope[node.initial.name]);
            run(node.body,Object.create(loopScope));
            run([node.change],loopScope);
          }
          trace.finalI = loopScope[node.initial.name]; trace.lastTest = false; continue;
        }
        if (node.type === 'declaration') { local[node.name] = value(node.value,local); continue; }
        if (node.type === 'assignment') {
          const destination = scopeFor(node.name,local);
          destination[node.name] = value(node.value,local); continue;
        }
        const args = node.args.map(arg => value(arg,local));
        switch (node.name) {
          case 'size': [env.width,env.height] = args; break;
          case 'frameRate': case 'noStroke': break;
          case 'background': ctx.bg = args.length === 1 ? [args[0],args[0],args[0]] : args; ctx.shapes = []; break;
          case 'fill': ctx.color = args.length === 1 ? [args[0],args[0],args[0]] : args; break;
          case 'rect': ctx.shapes.push({args,color:ctx.color.slice(),i:lookup('i',local)}); break;
          case 'println': ctx.output.push(args.map(String).join('')); break;
          default:
            if (!Object.hasOwn(program.functions,node.name)) throw Error('Unbekannte Funktion: ' + node.name);
            run(program.functions[node.name],{});
        }
      }
    };
    try {
      run(program.globals,env);
      run(program.functions.setup,{});
      if (program.functions.draw) { ctx.locals = {}; run(program.functions.draw,ctx.locals); }
    } catch (error) {
      if (!error.simulationStop) throw error;
      ctx.error = error.message;
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
  const shortList = values => values.length ? values.slice(0,8).join(', ') + (values.length > 8 ? ', …' : '') : 'keine';
  function geometryDifference(result,c) {
    if (result.shapes.length !== c.target.length) return result.shapes.length + ' Felder\nstatt ' + c.target.length;
    const names = ['x','y','Breite','Höhe'];
    for (let i = 0; i < c.target.length; i++) for (let j = 0; j < 4; j++) {
      if (result.shapes[i].args[j] !== c.target[i][j])
        return 'i = ' + i + '\n' + names[j] + ' = ' + result.shapes[i].args[j] + '\nstatt ' + c.target[i][j];
    }
    return null;
  }
  function actual(stage,result,c) {
    if (result.error) return 'abgebrochen';
    switch (stage.kind) {
      case 'indices': return shortList(result.output);
      case 'count': return String(result.shapes.length);
      case 'positions': return shortList(result.shapes.map(s => s.args[0]));
      case 'sizes': return [...new Set(result.shapes.map(s => s.args[2] + ' × ' + s.args[3]))].join(', ') || 'keine';
      case 'colors': return result.shapes.map(s => colorName(s.color)).join(', ') || 'keine';
      case 'heights': return shortList(result.shapes.map(s => s.args[3]));
      case 'geometry': return geometryDifference(result,c) || c.expected;
      default: throw Error('Unbekanntes Aufgabenziel.');
    }
  }
  function wrongFeedback(stage,result,c) {
    const fields = n => n + (n === 1 ? ' Feld' : ' Felder');
    if (stage.kind === 'count')
      return 'Der Code zeichnet ' + fields(result.shapes.length) + '; erwartet ' + (Number(c.expected) === 1 ? 'ist ' : 'sind ') + fields(Number(c.expected)) + '.';
    if (stage.kind === 'geometry') {
      if (result.shapes.length !== c.target.length)
        return 'Der Code zeichnet ' + fields(result.shapes.length) + ' statt ' + fields(c.target.length) + '.';
      const names = ['x','y','Breite','Höhe'];
      for (let i = 0; i < c.target.length; i++) for (let j = 0; j < 4; j++) {
        if (result.shapes[i].args[j] !== c.target[i][j])
          return 'Der Code läuft. Bei i = ' + i + ' ist ' + names[j] + ' = ' + result.shapes[i].args[j] + '; erwartet ist ' + c.target[i][j] + '.';
      }
    }
    if (stage.kind === 'colors') {
      const wanted = c.expected.split(', ');
      const i = result.shapes.findIndex((shape,index) => colorName(shape.color) !== wanted[index]);
      return 'Der Code läuft. Das Feld mit i = ' + i + ' ist ' + colorName(result.shapes[i].color) + '; erwartet ist ' + wanted[i] + '.';
    }
    if (stage.kind === 'positions' || stage.kind === 'heights') {
      const wanted = c.expected.split(', ').map(Number), dimension = stage.kind === 'positions' ? 0 : 3;
      const i = result.shapes.findIndex((shape,index) => shape.args[dimension] !== wanted[index]);
      return 'Der Code läuft. Bei i = ' + i + ' ist ' + (dimension === 0 ? 'x' : 'die Höhe') + ' = ' +
        result.shapes[i].args[dimension] + '; erwartet ist ' + wanted[i] + '.';
    }
    if (stage.kind === 'indices') return 'Die i-Werte sind ' + actual(stage,result,c) + '; erwartet sind ' + c.expected + '.';
    return 'Die Quadrate sind ' + actual(stage,result,c) + ' Pixel groß; erwartet ist ' + c.expected + '.';
  }
  function evaluate(task) {
    const stage = stageFor(task), record = recordFor(task);
    if (!record.checked) return {status:'',text:'Ergänze den Code und klicke auf Prüfen.'};
    if (missing(stage,record)) return {status:'error',text:'Fülle zuerst alle Auswahlen mit ? aus.'};
    try {
      const results = stage.cases.map((c,index) => {
        return execute(parse(expand(template(stage,record,index),record)));
      });
      const stoppedIndex = results.findIndex(result => result.error);
      if (stoppedIndex >= 0) return {status:'error',text:'Vorschau abgebrochen: ' + results[stoppedIndex].error,results,firstWrong:stoppedIndex};
      const firstWrong = results.findIndex((result,i) => actual(stage,result,stage.cases[i]) !== stage.cases[i].expected);
      if (firstWrong < 0) return {status:'success',text:results.length === 1 ? 'Der Prüffall stimmt.' : 'Alle ' + results.length + ' Prüffälle stimmen.',results};
      const c = stage.cases[firstWrong];
      return {status:'error',text:wrongFeedback(stage,results[firstWrong],c),results,firstWrong};
    } catch (error) { return {status:'error',text:'Der Sketch kann so nicht starten: ' + error.message}; }
  }
  function caseLabel(c,stage,index) {
    const lines = Object.entries(c.values).map(([name,v]) => name + ' = ' + v);
    return lines.join('\n') || 'Vorgabe';
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
    const pattern = /\/\/[^\n]*|"(?:[^"\\]|\\.)*"|\b(?:void|int|boolean|for|if|else|true|false)\b|\b\d+\b|\b[A-Za-z_]\w*(?=\s*\()/g;
    let last = 0;
    for (const match of text.matchAll(pattern)) {
      parent.append(document.createTextNode(text.slice(last,match.index)));
      const token = match[0], cls = token.startsWith('//') ? 'comment' : token.startsWith('"') ? 'string' :
        /^(void|int|boolean|for|if|else|true|false)$/.test(token) ? 'keyword' : /^\d/.test(token) ? 'number' : 'function';
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
    try {
      const result = execute(parse(text));
      if (result.error) { status.textContent = 'Die Schleife läuft noch nicht bis zum Ende. Prüfe den Kopf.'; return; }
    } catch (_) { status.textContent = 'Der Sketch enthält noch einen Fehler.'; return; }
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
    ctx.clearRect(0,0,400,200); g.clearRect(0,0,400,200);
    if (!result) return;
    ctx.fillStyle = 'rgb(' + result.bg.join(',') + ')'; ctx.fillRect(0,0,400,200);
    result.shapes.forEach(shape => {
      ctx.fillStyle = 'rgb(' + shape.color.join(',') + ')'; ctx.fillRect(...shape.args);
    });
    for (let i = 10; i < 400; i += 10) {
      g.strokeStyle = i % 100 === 0 ? 'rgba(70,90,110,.3)' : 'rgba(70,90,110,.1)';
      g.beginPath(); g.moveTo(i,0); g.lineTo(i,200);
      if (i < 200) { g.moveTo(0,i); g.lineTo(400,i); } g.stroke();
    }
    g.fillStyle = '#435467'; g.font = '12px Consolas'; g.fillText('0',4,13); g.fillText('x → 400',339,13); g.fillText('y ↓ 200',4,194);
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
      canvas.width = grid.width = 400; canvas.height = grid.height = 200; grid.setAttribute('aria-hidden','true');
      canvas.setAttribute('aria-label','Rechtecke beim ausgewählten Prüffall'); stack.append(canvas,grid); draw(canvas,grid,result);
      preview.append(stack);
    }
    const readout = el('pre','readout');
    const values = Object.entries(stage.cases[record.sample].values).map(([name,v]) => name + ' = ' + v);
    if (result) {
      const loop = result.loops[0];
      if (loop) {
        values.push('Durchläufe = ' + loop.indices.length,'i-Werte: ' + shortList(loop.indices));
        values.push('Letzte Prüfung: i = ' + loop.finalI,'Laufbedingung = ' + loop.lastTest);
      }
      if (result.error) values.push('Vorschau abgebrochen');
    } else values.push('Ergebnis nach Prüfen');
    readout.textContent = values.join('\n'); preview.append(readout);
    if (stage.visual) {
      const dataTable = el('table','iteration-table'), head = el('thead'), headRow = el('tr');
      const columns = task.id === 'balken' ? ['i','x','y','Höhe'] : task.id === 'farbe' ? ['i','x','Farbe'] : ['i','x','Breite','Höhe'];
      for (const title of columns) { const th = el('th','',title); th.scope = 'col'; headRow.append(th); }
      head.append(headRow); dataTable.append(head);
      const rows = el('tbody');
      if (result) result.shapes.slice(0,9).forEach(shape => {
        const row = el('tr');
        const numbers = task.id === 'balken' ? [shape.i,shape.args[0],shape.args[1],shape.args[3]] :
          task.id === 'farbe' ? [shape.i,shape.args[0],colorName(shape.color)] : [shape.i,shape.args[0],shape.args[2],shape.args[3]];
        numbers.forEach((v,i) => { const cell = el(i ? 'td' : 'th','',String(v)); if (!i) cell.scope = 'row'; row.append(cell); }); rows.append(row);
      });
      if (!rows.childNodes.length) {
        const row = el('tr'), cell = el('td','',result ? 'Keine Felder gezeichnet.' : 'Werte nach Prüfen');
        cell.colSpan = columns.length; row.append(cell); rows.append(row);
      }
      dataTable.append(rows);
      const space = el('div','iteration-space'); space.append(dataTable); preview.append(space);
    }
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
        const text = actual(stage,outcome.results[i],c); got.textContent = text;
        got.className = text === c.expected ? 'case-good' : 'case-bad';
        got.append(el('span','case-mark',text === c.expected ? ' ✓' : ' ✗'));
      } else got.textContent = '—';
      row.append(first,expected,got); tbody.append(row);
    });
    table.append(tbody); preview.append(table); split.append(codePanel,preview); view.body.append(split);
    const actions = el('div','action-row');
    actions.append(button('Prüfen','btn check-btn',() => {
      record.checked = true;
      const checked = evaluate(task);
      if (checked.status === 'success') record.passed = true;
      else if (Number.isInteger(checked.firstWrong)) record.sample = checked.firstWrong;
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
