(() => {
  'use strict';

  const STORAGE_KEY = 'inf8-funktionen-uebung-v1';
  const CYCLES = 4;
  const setup = 'void setup() {\n  size(400, 400);\n  frameRate(2);\n}\n';
  const figure = 'void zeichneSpielfigur() {\n  noStroke();\n  fill(34, 211, 238);\n  circle(x, 200, 40);\n}\n';
  const background = 'void zeichneHintergrund() {\n  background(200);\n}\n';
  const movement = 'void bewegeFigur() {\n  x = x + 3;\n}\n';
  const field = (id, label, options, correct) => ({ id, label, options, correct });
  const placeholder = id => '{{' + id + '}}';
  const fn = (name, lines) => 'void ' + name + '() {\n' +
    (lines.length ? lines.map(line => '  ' + line).join('\n') : '  // noch keine Anweisungen') + '\n}\n';
  const grouped = (answers, entries, destination) => entries
    .filter(entry => answers[entry.id] === destination).map(entry => entry.code);
  const groupFields = (entries, destinations) => entries.map(entry =>
    field(entry.id, entry.code, destinations, entry.correct));

  const drawingEntries = [
    { id: 'hintergrund', code: 'background(200);', correct: 'zeichneHintergrund' },
    { id: 'fuellung', code: 'fill(34, 211, 238);', correct: 'zeichneSpielfigur' },
    { id: 'kreis', code: 'circle(x, 200, 40);', correct: 'zeichneSpielfigur' }
  ];
  const positionEntries = [
    { id: 'x', code: 'x = mouseX;', correct: 'aktualisierePosition' },
    { id: 'y', code: 'y = mouseY;', correct: 'aktualisierePosition' },
    { id: 'fuellung', code: 'fill(34, 211, 238);', correct: 'zeichneSpielfigur' },
    { id: 'kreis', code: 'circle(x, y, 40);', correct: 'zeichneSpielfigur' }
  ];
  const infoEntries = [
    { id: 'hintergrund', code: 'background(200);', correct: 'Funktion A' },
    { id: 'ausgabe', code: 'println("x = " + x);', correct: 'Funktion B' }
  ];
  const trafficEntries = [
    { id: 'gehaeuse', code: 'fill(40);\nrect(200, 200, 80, 260);', correct: 'zeichneAmpelGehaeuse' },
    { id: 'rot', code: 'fill(255, 0, 0);\ncircle(200, 120, 60);', correct: 'zeichneLampen' },
    { id: 'gelb', code: 'fill(255, 255, 0);\ncircle(200, 200, 60);', correct: 'zeichneLampen' },
    { id: 'gruen', code: 'fill(0, 255, 0);\ncircle(200, 280, 60);', correct: 'zeichneLampen' }
  ];

  const movingSketch = (globalLine, drawLine, moveLine, figureLine) =>
    (globalLine ? globalLine + '\n\n' : '') + setup +
    'void draw() {\n' + (drawLine ? '  ' + drawLine + '\n' : '') +
    '  background(200);\n  bewegeFigur();\n  zeichneSpielfigur();\n}\n\n' +
    fn('bewegeFigur', (moveLine ? [moveLine] : []).concat('x = x + 3;')) + '\n' +
    fn('zeichneSpielfigur', (figureLine ? [figureLine] : []).concat(
      'noStroke();', 'fill(34, 211, 238);', 'circle(x, 200, 40);'));

  const TASKS = [
    {
      id: 'aufbau', title: 'Funktion definieren und aufrufen',
      stages: [
        {
          id: 'kopf', title: '1 · Der Funktionskopf',
          goal: 'Ergänze die parameterlose void-Funktion, die in draw() aufgerufen wird.',
          hint: 'Vergleiche Funktionskopf und Aufruf. Eine parameterlose Funktion hat trotzdem ein leeres Klammerpaar.',
          fields: [
            field('typ', 'Rückgabetyp', ['int', 'void', 'boolean'], 'void'),
            field('name', 'Funktionsname', ['bewegeFigur', 'zeichneSpielfigur', 'zeichneHintergrund'], 'zeichneSpielfigur'),
            field('klammern', 'Parameterklammern', ['(int x)', '()', '(x)'], '()')
          ],
          source: () => 'int x = 50;\n\n' + setup +
            'void draw() {\n  background(200);\n  zeichneSpielfigur();\n}\n\n' +
            '{{typ}} {{name}}{{klammern}} {\n  noStroke();\n  fill(34, 211, 238);\n  circle(x, 200, 40);\n}\n',
          success: 'Der Kopf passt zum Aufruf. Die Figur wird gezeichnet.',
          wrong: () => 'Der Funktionskopf passt noch nicht zum parameterlosen void-Aufruf.'
        },
        {
          id: 'aufruf', title: '2 · Die Funktion ausführen',
          goal: 'Ergänze genau einen Aufruf: Nach dem Hintergrund soll die Figur erscheinen.',
          hint: 'Eine Definition führt sich nicht selbst aus. Der Aufruf in draw() entscheidet, welche Funktion läuft.',
          fields: [field('aufruf', 'Aufruf in draw()', ['bewegeFigur()', 'zeichneHintergrund()', 'zeichneSpielfigur()'], 'zeichneSpielfigur()')],
          source: () => 'int x = 50;\n\n' + setup +
            'void draw() {\n  background(200);\n  {{aufruf}};\n}\n\n' + figure + '\n' + background + '\n' + movement,
          success: 'Der Aufruf zeichnet die Figur.',
          wrong: a => a.aufruf === 'bewegeFigur()'
            ? 'Der Code läuft: x wächst, aber die Zeichenfunktion wird nicht aufgerufen.'
            : 'Der Code läuft, zeichnet aber nur den Hintergrund. Die Figur fehlt.'
        },
        {
          id: 'definition', title: '3 · Die Definition platzieren',
          goal: 'Platziere die Definition von zeichneSpielfigur(), damit der Sketch gestartet werden kann.',
          hint: 'In setup() und draw() stehen Anweisungen und Aufrufe. Eine neue Funktionsdefinition steht außerhalb dieser Funktionen.',
          fields: [field('ort', 'Definition steht', ['in draw()', 'außerhalb von setup() und draw()', 'in setup()'], 'außerhalb von setup() und draw()')],
          external: ['ort'],
          source: a => {
            const definition = figure.trimEnd();
            const nested = definition.split('\n').map(line => '  ' + line).join('\n');
            return 'int x = 50;\n\nvoid setup() {\n  size(400, 400);\n  frameRate(2);\n' +
              (a.ort === 'in setup()' ? nested + '\n' : '') +
              '}\n\nvoid draw() {\n  background(200);\n  zeichneSpielfigur();\n' +
              (a.ort === 'in draw()' ? nested + '\n' : '') + '}\n\n' +
              (a.ort === 'außerhalb von setup() und draw()' ? definition + '\n' : '');
          },
          success: 'Die Definition steht außerhalb; der Aufruf bleibt in draw().',
          wrong: () => 'Die Definition darf nicht innerhalb einer anderen Funktion stehen.'
        }
      ]
    },
    {
      id: 'zerlegen', title: 'Ein Programm zerlegen',
      stages: [
        {
          id: 'figur', title: '1 · Hintergrund und Figur',
          goal: 'Ordne die Anweisungen zu: Der Hintergrund bekommt eine Funktion, Füllfarbe und Kreis gehören zur Figur.',
          hint: 'Ordne nach der Aufgabe der Anweisung. Eine Füllfarbe gehört zu dem Objekt, für das sie gesetzt wird.',
          fields: groupFields(drawingEntries, ['zeichneSpielfigur', 'zeichneHintergrund']),
          routing: drawingEntries,
          source: a => 'int x = 50;\n\n' + setup +
            'void draw() {\n  zeichneHintergrund();\n  zeichneSpielfigur();\n}\n\n' +
            fn('zeichneHintergrund', grouped(a, drawingEntries, 'zeichneHintergrund')) + '\n' +
            fn('zeichneSpielfigur', grouped(a, drawingEntries, 'zeichneSpielfigur')),
          success: 'Hintergrund und Figur sind in passende Funktionen aufgeteilt.',
          wrong: () => 'Das Bild kann stimmen, aber die Aufteilung noch nicht: background gehört zum Hintergrund, fill und circle zur Figur.'
        },
        {
          id: 'position', title: '2 · Die Position aktualisieren',
          goal: 'Ordne die Anweisungen zu. aktualisierePosition() übernimmt die Mausposition; zeichneSpielfigur() zeichnet die Figur.',
          hint: 'Eine Funktion berechnet die Position, die andere benutzt sie zum Zeichnen. x und y bleiben global.',
          fields: groupFields(positionEntries, ['zeichneSpielfigur', 'aktualisierePosition']),
          routing: positionEntries, mouse: true,
          source: a => 'int x = 50;\nint y = 200;\n\n' + setup +
            'void draw() {\n  background(200);\n  aktualisierePosition();\n  zeichneSpielfigur();\n}\n\n' +
            fn('aktualisierePosition', grouped(a, positionEntries, 'aktualisierePosition')) + '\n' +
            fn('zeichneSpielfigur', grouped(a, positionEntries, 'zeichneSpielfigur')),
          success: 'Die Position wird zuerst übernommen, dann wird die Figur gezeichnet.',
          wrong: () => 'Der Sketch läuft, aber die Aufgaben sind vermischt. Mausposition und Zeichnen brauchen jeweils ihre eigene Funktion.'
        },
        {
          id: 'reihenfolge', title: '3 · Aufrufe in der richtigen Reihenfolge',
          goal: 'Rufe jede Funktion genau einmal auf. Der Hintergrund kommt zuerst; die Figur soll sichtbar sein und der Rahmen zuletzt entstehen.',
          hint: 'background() übermalt alles Vorherige. Die Reihenfolge der Aufrufe bestimmt, was am Ende sichtbar bleibt.',
          fields: ['eins', 'zwei', 'drei'].map((id, i) => field(id, 'Aufruf ' + (i + 1),
            ['zeichneRahmen()', 'zeichneSpielfigur()', 'zeichneHintergrund()'],
            ['zeichneHintergrund()', 'zeichneSpielfigur()', 'zeichneRahmen()'][i])),
          source: () => 'int x = 50;\n\n' + setup +
            'void draw() {\n  {{eins}};\n  {{zwei}};\n  {{drei}};\n}\n\n' + background + '\n' + figure + '\n' +
            fn('zeichneRahmen', ['stroke(0);', 'strokeWeight(5);', 'noFill();', 'rect(5, 5, 390, 390);']),
          success: 'Alle drei Aufrufe stehen richtig. Figur und Rahmen bleiben sichtbar.',
          wrong: a => new Set([a.eins, a.zwei, a.drei]).size !== 3
            ? 'Eine Funktion wird mehrfach aufgerufen, eine andere fehlt. Verwende jede genau einmal.'
            : 'Der Sketch läuft, aber die Reihenfolge verfehlt das Ziel. Hintergrund zuerst, Rahmen zuletzt.'
        }
      ]
    },
    {
      id: 'position', title: 'Gemeinsame Positionsvariablen',
      stages: [
        {
          id: 'global', title: '1 · Eine gemeinsame Variable',
          goal: 'Platziere int x = 50; so, dass beide Funktionen dieselbe Position nutzen. Erwartete Kreispositionen: 53, 56, 59, 62.',
          hint: 'Eine lokale Variable gehört zu einer Funktion. Beide Funktionen sollen hier auf dasselbe x zugreifen.',
          fields: [field('ort', 'int x = 50; steht', ['in draw()', 'global vor setup()', 'in bewegeFigur()'], 'global vor setup()')],
          external: ['ort'],
          source: a => movingSketch(a.ort === 'global vor setup()' ? 'int x = 50;' : '',
            a.ort === 'in draw()' ? 'int x = 50;' : '',
            a.ort === 'in bewegeFigur()' ? 'int x = 50;' : '', ''),
          success: 'Beide Funktionen verwenden das globale x. Der Kreis wandert pro Zyklus um 3.',
          wrong: () => 'Das lokale x ist in zeichneSpielfigur() nicht bekannt.'
        },
        {
          id: 'lokal', title: '2 · Zwei lokale x reparieren',
          goal: 'Ändere die Deklarationen so, dass der Kreis in vier Zyklen bei 53, 56, 59 und 62 gezeichnet wird.',
          hint: 'Zwei Variablen mit demselben Namen sind nicht automatisch dieselbe Variable. Schau auf ihre Gültigkeitsbereiche.',
          fields: [field('variante', 'Deklarationen', ['beide Funktionen: eigenes lokales x',
            'nur ein globales x', 'globales x und zusätzlich lokales x in bewegeFigur()'], 'nur ein globales x')],
          external: ['variante'],
          source: a => {
            const both = a.variante === 'beide Funktionen: eigenes lokales x';
            const shadow = a.variante === 'globales x und zusätzlich lokales x in bewegeFigur()';
            return movingSketch(both ? '' : 'int x = 50;', '', both || shadow ? 'int x = 50;' : '', both ? 'int x = 50;' : '');
          },
          success: 'Eine gemeinsame Variable verbindet Bewegung und Zeichnen.',
          wrong: a => a.variante === 'beide Funktionen: eigenes lokales x'
            ? 'Der Code läuft, aber die Figur bleibt bei x = 50. Beide Funktionen verwenden ein eigenes lokales x.'
            : 'Der Code läuft, aber nur das lokale x wird erhöht. Das globale x und die Figur bleiben bei 50.'
        },
        {
          id: 'verdeckt', title: '3 · Das globale x wird verdeckt',
          goal: 'Repariere die markierte Auswahl in zeichneSpielfigur(). Der Kreis soll die wachsende globale Position verwenden.',
          hint: 'Eine lokale Deklaration kann ein globales x verdecken. Eine Zuweisung an das globale x würde dessen Wert dagegen verändern.',
          fields: [field('zeile', 'Zeile in zeichneSpielfigur()', ['int x = 50;', 'x = 50;', '// lokale Deklaration entfernen'], '// lokale Deklaration entfernen')],
          source: () => movingSketch('int x = 50;', '', '', '{{zeile}}'),
          success: 'Die Zeichenfunktion liest das globale x; die Bewegung wird sichtbar.',
          wrong: a => a.zeile === 'int x = 50;'
            ? 'Der Code läuft: global wächst x, aber die Zeichenfunktion liest ihr lokales x = 50.'
            : 'Der Code läuft, setzt das globale x beim Zeichnen jedoch jedes Mal auf 50 zurück.'
        }
      ]
    },
    {
      id: 'namen', title: 'Passende Namen und Aufgaben',
      stages: [
        {
          id: 'rumpf', title: '1 · Was tut die Funktion?',
          goal: 'Wähle einen Namen, der die einzige Anweisung im Funktionsrumpf beschreibt.',
          hint: 'Lies den Rumpf, bevor du den Namen wählst. Ein Verb beschreibt die Aufgabe der Funktion.',
          fields: [field('name', 'Name für background(200)', ['zeichneSpielfigur', 'bewegeFigur', 'zeichneHintergrund'], 'zeichneHintergrund')],
          source: () => setup + 'void draw() {\n  {{name}}();\n}\n\nvoid {{name}}() {\n  background(200);\n}\n',
          success: 'zeichneHintergrund beschreibt die Aufgabe der Funktion.',
          wrong: () => 'Der Code läuft, aber der Name verspricht etwas anderes als background(200).'
        },
        {
          id: 'umbenennen', title: '2 · Definition und Aufruf umbenennen',
          goal: 'f1() heißt jetzt zeichneSpielfigur(). Passe den Aufruf in draw() an.',
          hint: 'Ein neuer Name an der Definition muss auch bei jedem zugehörigen Aufruf verwendet werden.',
          fields: [field('aufruf', 'Aufruf nach dem Umbenennen', ['f1()', 'zeichneHintergrund()', 'zeichneSpielfigur()'], 'zeichneSpielfigur()')],
          source: () => 'int x = 50;\n\n' + setup +
            'void draw() {\n  background(200);\n  {{aufruf}};\n}\n\n' + figure,
          success: 'Definition und Aufruf verwenden denselben neuen Namen.',
          wrong: () => 'Der Aufruf passt nicht zu einer vorhandenen Funktionsdefinition.'
        },
        {
          id: 'aufteilen', title: '3 · zeigeInfo() aufteilen',
          goal: 'Teile zeigeInfo() auf: Funktion A zeichnet den Hintergrund, Funktion B gibt x aus. Wähle passende Namen und ordne beide Anweisungen zu.',
          hint: 'Hintergrund zeichnen und einen Wert ausgeben sind zwei Aufgaben. Name und Rumpf müssen zusammenpassen.',
          fields: [
            field('a', 'Name von Funktion A', ['zeigeXPosition', 'zeichneHintergrund', 'zeigeInfo'], 'zeichneHintergrund'),
            field('b', 'Name von Funktion B', ['zeichneHintergrund', 'zeigeInfo', 'zeigeXPosition'], 'zeigeXPosition'),
            ...groupFields(infoEntries, ['Funktion B', 'Funktion A'])
          ],
          routing: infoEntries,
          source: a => 'int x = 50;\n\n' + setup +
            'void draw() {\n  {{a}}();\n  {{b}}();\n}\n\n' +
            fn('{{a}}', grouped(a, infoEntries, 'Funktion A')) + '\n' +
            fn('{{b}}', grouped(a, infoEntries, 'Funktion B')),
          success: 'Beide Aufgaben haben eine eigene Funktion mit einem passenden Namen.',
          wrong: () => 'Vergleiche Namen und Rümpfe: A soll nur den Hintergrund zeichnen, B nur die x-Position ausgeben.'
        }
      ]
    },
    {
      id: 'ampel', title: 'Ampel modularisieren', transfer: true,
      stages: [
        {
          id: 'modularisieren', title: 'Transfer · Gehäuse und Lampen',
          goal: 'Ordne die Zeichenblöcke zu und ergänze die zwei Aufrufe. Das Gehäuse soll hinter den drei Lampen liegen.',
          hint: 'Halte fill() und die zugehörige Form zusammen. Ein später gezeichnetes Gehäuse würde die Lampen überdecken.',
          fields: [
            ...groupFields(trafficEntries, ['zeichneLampen', 'zeichneAmpelGehaeuse']),
            field('eins', 'Erster Ampel-Aufruf', ['zeichneLampen()', 'zeichneAmpelGehaeuse()'], 'zeichneAmpelGehaeuse()'),
            field('zwei', 'Zweiter Ampel-Aufruf', ['zeichneAmpelGehaeuse()', 'zeichneLampen()'], 'zeichneLampen()')
          ],
          routing: trafficEntries,
          source: a => 'void setup() {\n  size(400, 400);\n  frameRate(2);\n  rectMode(CENTER);\n  noStroke();\n}\n\n' +
            'void draw() {\n  background(200);\n  {{eins}};\n  {{zwei}};\n}\n\n' +
            fn('zeichneAmpelGehaeuse', grouped(a, trafficEntries, 'zeichneAmpelGehaeuse').flatMap(code => code.split('\n'))) + '\n' +
            fn('zeichneLampen', grouped(a, trafficEntries, 'zeichneLampen').flatMap(code => code.split('\n'))),
          success: 'Gehäuse und Lampen sind getrennt; die drei Lampen bleiben sichtbar.',
          wrong: () => 'Prüfe die Aufgaben der beiden Funktionen und ihre Reihenfolge: zuerst das Gehäuse, dann die Lampen.'
        }
      ]
    }
  ];

  // Only the Processing subset used by the selectable examples is interpreted.
  // No eval, Function constructor, or independently hard-coded preview outcomes.
  function parse(source) {
    const tokens = [];
    const pattern = /\s+|\/\/[^\n]*|"(?:[^"\\]|\\.)*"|\d+|[A-Za-z_][A-Za-z_0-9]*|[(){};,=+\-]/gy;
    let offset = 0;
    while (offset < source.length) {
      pattern.lastIndex = offset;
      const match = pattern.exec(source);
      if (!match) throw new Error('Unbekanntes Zeichen im Code.');
      offset = pattern.lastIndex;
      if (!/^\s|^\/\//.test(match[0])) tokens.push(match[0]);
    }
    let pos = 0;
    const peek = () => tokens[pos];
    const take = value => {
      const token = tokens[pos++];
      if (value !== undefined && token !== value) {
        if (value === ')' && token) throw new Error('Die Funktion muss parameterlos sein: Verwende ().');
        throw new Error('Hier wird ' + value + ' erwartet' + (token ? ', gefunden wurde ' + token : '') + '.');
      }
      return token;
    };
    const identifier = () => {
      const name = take();
      if (!/^[A-Za-z_][A-Za-z_0-9]*$/.test(name || '')) throw new Error('Hier fehlt ein Funktions- oder Variablenname.');
      return name;
    };
    const atom = () => {
      const token = peek();
      if (token === '(') { take('('); const value = expression(); take(')'); return value; }
      if (/^\d+$/.test(token || '')) return { type: 'literal', value: Number(take()) };
      if ((token || '').startsWith('"')) return { type: 'literal', value: JSON.parse(take()) };
      return { type: 'variable', name: identifier() };
    };
    const expression = () => {
      let left = atom();
      while (peek() === '+' || peek() === '-') left = { type: 'binary', op: take(), left, right: atom() };
      return left;
    };
    const declaration = () => {
      take('int');
      const name = identifier();
      if (peek() === '(') throw new Error('Für diese parameterlose Funktion brauchst du den Rückgabetyp void.');
      let value = { type: 'literal', value: 0 };
      if (peek() === '=') { take('='); value = expression(); }
      take(';');
      return { type: 'declaration', name, value };
    };
    const statement = () => {
      if (peek() === 'void') throw new Error('Eine Funktionsdefinition darf nicht in setup(), draw() oder einer anderen Funktion stehen.');
      if (peek() === 'int') return declaration();
      const name = identifier();
      if (peek() === '=') {
        take('='); const value = expression(); take(';');
        return { type: 'assignment', name, value };
      }
      take('(');
      const args = [];
      if (peek() !== ')') {
        args.push(expression());
        while (peek() === ',') { take(','); args.push(expression()); }
      }
      take(')'); take(';');
      return { type: 'call', name, args };
    };
    const program = { globals: [], functions: Object.create(null) };
    while (pos < tokens.length) {
      if (peek() === 'int') { program.globals.push(declaration()); continue; }
      if (peek() !== 'void') throw new Error('Verwende void für die Funktion ohne Rückgabewert.');
      take('void'); const name = identifier(); take('('); take(')'); take('{');
      const body = [];
      while (peek() !== '}') {
        if (peek() === undefined) throw new Error('Eine schließende geschweifte Klammer fehlt.');
        body.push(statement());
      }
      take('}');
      if (Object.hasOwn(program.functions, name)) throw new Error('Die Funktion ' + name + '() ist doppelt definiert.');
      program.functions[name] = body;
    }
    return program;
  }

  function simulate(program, canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = 400; canvas.height = 400;
    ctx.fillStyle = 'rgb(204,204,204)'; ctx.fillRect(0, 0, 400, 400);
    const globals = Object.create(null);
    const constants = { CENTER: 'CENTER', mouseX: 300, mouseY: 100 };
    const output = [], frames = [];
    let fill = 'rgb(255,255,255)', stroke = 'rgb(0,0,0)', weight = 1, centered = false;
    let operations = 0, cycle = 0, circles = [], drawnThisFrame = [];
    const color = args => args.length === 1 ? 'rgb(' + [args[0], args[0], args[0]].join(',') + ')' : 'rgb(' + args.join(',') + ')';
    const lookup = (name, local) => {
      if (Object.hasOwn(local, name)) return local[name];
      if (Object.hasOwn(globals, name)) return globals[name];
      if (Object.hasOwn(constants, name)) return constants[name];
      throw new Error('Die Variable ' + name + ' ist in dieser Funktion nicht bekannt. Lokale Variablen anderer Funktionen gelten hier nicht.');
    };
    const value = (node, local) => {
      if (node.type === 'literal') return node.value;
      if (node.type === 'variable') return lookup(node.name, local);
      const left = value(node.left, local), right = value(node.right, local);
      return node.op === '+' ? left + right : left - right;
    };
    const paint = () => {
      if (fill !== null) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke !== null) { ctx.strokeStyle = stroke; ctx.lineWidth = weight; ctx.stroke(); }
    };
    const builtins = {
      size: () => {}, frameRate: () => {},
      rectMode: args => { centered = args[0] === 'CENTER'; },
      noStroke: () => { stroke = null; }, stroke: args => { stroke = color(args); },
      strokeWeight: args => { weight = args[0]; },
      noFill: () => { fill = null; }, fill: args => { fill = color(args); },
      background: args => {
        ctx.fillStyle = color(args); ctx.fillRect(0, 0, 400, 400);
        circles = [];
      },
      circle: args => {
        ctx.beginPath(); ctx.arc(args[0], args[1], args[2] / 2, 0, Math.PI * 2); paint();
        circles.push({ x: args[0], y: args[1] });
        drawnThisFrame.push(args[0]);
      },
      rect: args => {
        const [x, y, w, h] = args;
        ctx.beginPath(); ctx.rect(centered ? x - w / 2 : x, centered ? y - h / 2 : y, w, h); paint();
      },
      println: args => { output.push(args.map(String).join('')); }
    };
    const execute = (statements, local) => {
      for (const node of statements) {
        if (++operations > 1500) throw new Error('Zu viele verschachtelte Aufrufe.');
        if (node.type === 'declaration') {
          if (Object.hasOwn(local, node.name)) throw new Error('Die Variable ' + node.name + ' ist hier doppelt deklariert.');
          local[node.name] = value(node.value, local);
        } else if (node.type === 'assignment') {
          const result = value(node.value, local);
          if (Object.hasOwn(local, node.name)) local[node.name] = result;
          else if (Object.hasOwn(globals, node.name)) globals[node.name] = result;
          else throw new Error('Die Variable ' + node.name + ' ist hier nicht bekannt.');
        } else {
          const args = node.args.map(arg => value(arg, local));
          if (Object.hasOwn(builtins, node.name)) builtins[node.name](args);
          else {
            if (!Object.hasOwn(program.functions, node.name)) throw new Error('Die Funktion ' + node.name + '() ist nicht definiert. Prüfe den Namen beim Aufruf.');
            if (args.length) throw new Error('Die Funktion ' + node.name + '() ist parameterlos.');
            execute(program.functions[node.name], Object.create(null));
          }
        }
      }
    };
    // Validate every function before any execution, including unused definitions.
    const knownNames = new Set(program.globals.map(node => node.name));
    for (const body of Object.values(program.functions)) {
      const locals = new Set();
      const checkValue = node => {
        if (node.type === 'variable' && !locals.has(node.name) && !knownNames.has(node.name) && !Object.hasOwn(constants, node.name))
          throw new Error('Die Variable ' + node.name + ' ist in dieser Funktion nicht bekannt. Lokale Variablen anderer Funktionen gelten hier nicht.');
        if (node.type === 'binary') { checkValue(node.left); checkValue(node.right); }
      };
      for (const node of body) {
        if (node.type === 'declaration') {
          checkValue(node.value);
          if (locals.has(node.name)) throw new Error('Die Variable ' + node.name + ' ist hier doppelt deklariert.');
          locals.add(node.name);
        } else if (node.type === 'assignment') {
          checkValue(node.value);
          if (!locals.has(node.name) && !knownNames.has(node.name)) throw new Error('Die Variable ' + node.name + ' ist hier nicht bekannt.');
        } else {
          node.args.forEach(checkValue);
          if (!Object.hasOwn(builtins, node.name) && !Object.hasOwn(program.functions, node.name))
            throw new Error('Die Funktion ' + node.name + '() ist nicht definiert. Prüfe den Namen beim Aufruf.');
        }
      }
    }
    execute(program.globals, globals);
    if (!Object.hasOwn(program.functions, 'setup') || !Object.hasOwn(program.functions, 'draw'))
      throw new Error('setup() oder draw() fehlt.');
    execute(program.functions.setup, Object.create(null));
    for (cycle = 1; cycle <= CYCLES; cycle++) {
      drawnThisFrame = [];
      execute(program.functions.draw, Object.create(null));
      frames.push({ cycle, drawn: drawnThisFrame.slice(), globals: { ...globals } });
    }
    return { frames, globals, output, circles };
  }

  function initialState() {
    const tasks = {};
    TASKS.forEach((task, i) => {
      tasks[task.id] = {
        active: 0, open: i === 0,
        stages: task.stages.map(() => ({ answers: {}, checked: false, passed: false }))
      };
    });
    return { tasks };
  }

  window.AlgorithmProgress?.setStageLayout(STORAGE_KEY, TASKS);
  function restore() {
    const clean = initialState();
    try {
      const raw = (window.AlgorithmProgress ? window.AlgorithmProgress.getPageState(STORAGE_KEY) : JSON.parse(localStorage.getItem(STORAGE_KEY)));
      if (!raw || typeof raw.tasks !== 'object' || raw.tasks === null) return clean;
      for (const task of TASKS) {
        const saved = raw.tasks[task.id], current = clean.tasks[task.id];
        if (!saved || typeof saved !== 'object') continue;
        if (Number.isInteger(saved.active) && saved.active >= 0 && saved.active < task.stages.length) current.active = saved.active;
        if (typeof saved.open === 'boolean') current.open = saved.open;
        task.stages.forEach((stage, i) => {
          const record = Array.isArray(saved.stages) ? saved.stages[i] : null;
          if (!record || typeof record !== 'object') return;
          if (record.answers && typeof record.answers === 'object') {
            for (const entry of stage.fields) {
              const answer = record.answers[entry.id];
              if (typeof answer === 'string' && entry.options.includes(answer)) current.stages[i].answers[entry.id] = answer;
            }
          }
          current.stages[i].checked = record.checked === true;
          current.stages[i].passed = record.passed === true;
        });
      }
    } catch (_) { /* Storage unavailable or damaged: start with blank answers. */ }
    return clean;
  }
  const state = restore();
  const save = () => { try { window.AlgorithmProgress ? window.AlgorithmProgress.savePageState(STORAGE_KEY, state) : localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* Exercises also work without storage. */ } };
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const button = (text, className, action) => {
    const node = el('button', className, text); node.type = 'button'; node.addEventListener('click', action); return node;
  };
  const currentStage = task => task.stages[state.tasks[task.id].active];
  const currentRecord = task => state.tasks[task.id].stages[state.tasks[task.id].active];
  const missing = (stage, record) => stage.fields.some(entry => !entry.options.includes(record.answers[entry.id]));
  const correct = (stage, record) => stage.fields.every(entry => record.answers[entry.id] === entry.correct);
  const sourceTemplate = (stage, record) => stage.source(record.answers);
  const expand = (template, record) => template.replace(/\{\{([a-z]+)\}\}/g, (_, id) => record.answers[id] || '?');
  const views = new Map();

  function choice(task, definition) {
    const select = el('select', 'code-choice');
    select.dataset.field = definition.id;
    select.setAttribute('aria-label', definition.label);
    select.append(new Option('?', ''));
    definition.options.forEach(option => select.append(new Option(option, option)));
    select.value = currentRecord(task).answers[definition.id] || '';
    select.addEventListener('change', () => {
      const record = currentRecord(task);
      record.answers[definition.id] = select.value;
      record.checked = false;
      const index = [...views.get(task.id).body.querySelectorAll('[data-field="' + definition.id + '"]')].indexOf(select);
      save(); renderTask(task);
      const replacement = views.get(task.id).body.querySelectorAll('[data-field="' + definition.id + '"]')[index];
      if (replacement) replacement.focus({ preventScroll: true });
    });
    return select;
  }

  function syntax(parent, text) {
    const pattern = /\/\/[^\n]*|"(?:[^"\\]|\\.)*"|\b(?:void|int)\b|\b\d+\b|\b[A-Za-z_]\w*(?=\s*\()/g;
    let last = 0;
    for (const match of text.matchAll(pattern)) {
      parent.append(document.createTextNode(text.slice(last, match.index)));
      const token = match[0];
      const cls = token.startsWith('//') ? 'comment' : token.startsWith('"') ? 'string' :
        /^(void|int)$/.test(token) ? 'keyword' : /^\d+$/.test(token) ? 'number' : 'function';
      parent.append(el('span', cls, token)); last = match.index + token.length;
    }
    parent.append(document.createTextNode(text.slice(last)));
  }

  function renderCode(task, target, template) {
    const stage = currentStage(task);
    const lines = template.trimEnd().split('\n');
    lines.forEach((text, i) => {
      const line = el('span', 'code-line'); line.dataset.line = i + 1;
      const parts = text.split(/(\{\{[a-z]+\}\})/);
      for (const part of parts) {
        const match = /^\{\{([a-z]+)\}\}$/.exec(part);
        if (match) line.append(choice(task, stage.fields.find(entry => entry.id === match[1])));
        else syntax(line, part);
      }
      target.append(line);
    });
  }

  function drawGrid(canvas, visible) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 400, 400);
    if (!visible) return;
    ctx.lineWidth = 1;
    for (let i = 10; i < 400; i += 10) {
      ctx.strokeStyle = i % 100 === 0 ? 'rgba(70,90,110,.3)' : 'rgba(70,90,110,.1)';
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 400); ctx.moveTo(0, i); ctx.lineTo(400, i); ctx.stroke();
    }
    ctx.fillStyle = '#435467'; ctx.font = '12px Consolas';
    ctx.fillText('0', 4, 13); ctx.fillText('x → 400', 339, 13); ctx.fillText('y ↓ 400', 4, 394);
  }

  function evaluation(task, canvas) {
    const stage = currentStage(task), record = currentRecord(task);
    if (!record.checked) return { status: '', text: 'Wähle deine Antworten und klicke auf Prüfen.' };
    if (missing(stage, record)) return { status: 'error', text: 'Fülle zuerst alle Auswahlen mit ? aus.' };
    try {
      const result = simulate(parse(expand(sourceTemplate(stage, record), record)), canvas);
      const solved = correct(stage, record);
      return { status: solved ? 'success' : 'error', text: solved ? stage.success : stage.wrong(record.answers, result), result };
    } catch (error) {
      return { status: 'error', text: 'Der Sketch kann so nicht starten: ' + error.message };
    }
  }

  function updateProgress() {
    let count = 0;
    TASKS.forEach(task => {
      const records = state.tasks[task.id].stages;
      if (!task.transfer) count += records.filter(record => record.passed).length;
      const view = views.get(task.id), done = records.every(record => record.passed);
      view.details.classList.toggle('is-done', done); view.badge.hidden = !done;
      view.stageButtons.forEach((node, i) => {
        node.classList.toggle('is-done', records[i].passed);
        node.textContent = 'Stufe ' + (i + 1) + (records[i].passed ? ' ✓' : '');
        node.setAttribute('aria-pressed', String(state.tasks[task.id].active === i));
      });
    });
    const progress = document.getElementById('progress');
    const text = count + ' von ' + TASKS.filter(task => !task.transfer).reduce((sum, task) => sum + task.stages.length, 0) + ' Stufen geschafft';
    if (progress.textContent !== text) progress.textContent = text;
  }

  function codeFromDOM(code) {
    const text = node => node.nodeName === 'SELECT' ? node.value || '?' :
      node.nodeType === Node.TEXT_NODE ? node.textContent : [...node.childNodes].map(text).join('');
    return [...code.querySelectorAll('.code-line')].map(text).join('\n');
  }
  async function copyCode(task, code, status) {
    const stage = currentStage(task), record = currentRecord(task);
    if (missing(stage, record)) { status.textContent = 'Ergänze erst alle Auswahlen.'; return; }
    const source = codeFromDOM(code);
    // A syntax or scope error should not be offered as a runnable sketch.
    try { simulate(parse(source), document.createElement('canvas')); }
    catch (_) { status.textContent = 'Der Sketch enthält noch einen Fehler. Prüfe zuerst.'; return; }
    try {
      try { await navigator.clipboard.writeText(source); }
      catch (_) {
        const textarea = el('textarea');
        textarea.value = source; textarea.style.position = 'fixed'; textarea.style.top = '-10000px';
        const focused = document.activeElement;
        document.body.append(textarea); textarea.select();
        let copied = false;
        try { copied = document.execCommand('copy'); }
        finally { textarea.remove(); if (focused && focused.isConnected) focused.focus({ preventScroll: true }); }
        if (!copied) throw new Error('copy');
      }
      status.textContent = 'Code kopiert.';
    } catch (_) { status.textContent = 'Kopieren ist hier nicht verfügbar. Markiere den Code manuell.'; }
  }

  function renderTask(task) {
    const view = views.get(task.id), stage = currentStage(task), record = currentRecord(task);
    view.body.replaceChildren();
    const title = el('h2', 'stage-title', stage.title);
    const goal = el('p', 'goal', stage.goal);
    view.body.append(title, goal);
    if (stage.external) {
      stage.external.forEach(id => {
        const definition = stage.fields.find(entry => entry.id === id);
        const label = el('label', 'choice-line'); label.append(el('span', '', definition.label + ':'), choice(task, definition));
        view.body.append(label);
      });
    }
    if (stage.routing) {
      const routing = el('div', 'routing');
      stage.routing.forEach(entry => {
        const label = el('label');
        label.append(el('span', 'routing-code', entry.code), el('span', '', '→'),
          choice(task, stage.fields.find(definition => definition.id === entry.id)));
        routing.append(label);
      });
      view.body.append(routing);
    }
    const split = el('div', 'split');
    const codePanel = el('section', 'subpanel');
    codePanel.setAttribute('aria-label', 'Dein Processing-Code');
    const heading = el('div', 'subpanel-heading');
    const codeTitle = el('h3', '', 'Dein Code');
    const copyStatus = el('p', 'copy-status'); copyStatus.setAttribute('aria-live', 'polite');
    const pre = el('pre', 'code-block'); pre.tabIndex = 0;
    const code = el('code'); pre.append(code);
    renderCode(task, code, sourceTemplate(stage, record));
    heading.append(codeTitle, button('Kopieren', 'btn ghost small', () => copyCode(task, code, copyStatus)));
    codePanel.append(heading, el('div', 'ide-tabs', 'Sketch · Processing / Java'), pre, copyStatus);
    const previewPanel = el('section', 'subpanel');
    previewPanel.setAttribute('aria-label', 'Ergebnis deines Codes');
    const previewHeading = el('div', 'subpanel-heading'); previewHeading.append(el('h3', '', 'Dein Ergebnis'));
    const canvasArea = el('div', 'canvas-area'), stack = el('div', 'canvas-stack');
    const canvas = el('canvas', 'drawing-layer'), grid = el('canvas', 'grid-layer');
    canvas.width = grid.width = canvas.height = grid.height = 400;
    canvas.setAttribute('aria-label', 'Zeichenfläche deines Sketches'); grid.setAttribute('aria-hidden', 'true');
    stack.append(canvas, grid);
    const caption = el('p', 'canvas-caption');
    const readout = el('pre', 'readout');
    const outcome = evaluation(task, canvas);
    if (outcome.result) {
      drawGrid(grid, true); caption.textContent = 'Nach 4 draw()-Zyklen';
      const result = outcome.result, lines = [];
      if (stage.mouse) lines.push('mouseX = 300', 'mouseY = 100');
      if (task.id === 'position') {
        lines.push(Object.hasOwn(result.globals, 'x') ? 'x global = ' + result.globals.x : 'Kein globales x');
        result.frames.forEach(frame => lines.push('Zyklus ' + frame.cycle + ': Kreis bei x = ' + frame.drawn.join(', ')));
      }
      else {
        Object.entries(result.globals).forEach(([name, value]) => lines.push(name + ' = ' + value));
        if (result.circles.length) lines.push('Gezeichnete Kreise: ' + result.circles.length);
      }
      if (result.output.length) lines.push('Konsole:', ...result.output);
      readout.textContent = lines.length ? lines.join('\n') : 'Keine Konsolenausgabe.';
    } else {
      canvas.getContext('2d').clearRect(0, 0, 400, 400); drawGrid(grid, false);
      caption.textContent = record.checked ? 'Noch kein ausführbarer Sketch' : 'Vorschau erscheint nach Prüfen';
      readout.textContent = 'Noch kein Ergebnis.';
    }
    canvasArea.append(stack, caption, readout); previewPanel.append(previewHeading, canvasArea);
    split.append(codePanel, previewPanel); view.body.append(split);
    const actions = el('div', 'action-row');
    actions.append(button('Prüfen', 'btn', () => {
      currentRecord(task).checked = true;
      const result = evaluation(task, document.createElement('canvas'));
      if (result.status === 'success') currentRecord(task).passed = true;
      save(); renderTask(task);
      views.get(task.id).body.querySelector('.check-btn').focus({ preventScroll: true });
    }));
    actions.firstChild.classList.add('check-btn');
    const hintButton = button('💡', 'btn ghost', () => {
      document.getElementById('hint-text').textContent = currentStage(task).hint;
      hintOpener = hintButton; document.getElementById('hint-dialog').showModal();
    });
    hintButton.setAttribute('aria-label', 'Hinweis zu ' + stage.title); actions.append(hintButton);
    view.body.append(actions);
    view.feedback.className = 'feedback-box task-feedback ' + outcome.status;
    if (view.feedback.textContent !== outcome.text) view.feedback.textContent = outcome.text;
    updateProgress();
  }

  let hintOpener = null;
  const dialog = document.getElementById('hint-dialog');
  dialog.addEventListener('close', () => { if (hintOpener && hintOpener.isConnected) hintOpener.focus(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  const root = document.getElementById('tasks');
  // Create all task shells before rendering, so progress always has every target.
  TASKS.forEach((task, i) => {
    const details = el('details', 'task'); details.id = task.id; details.open = state.tasks[task.id].open;
    const summary = el('summary');
    const badge = el('span', 'badge', 'geschafft ✓'); badge.hidden = true;
    summary.append(el('span', 'station-label', task.transfer ? 'Transfer' : 'Aufgabe ' + (i + 1)),
      el('span', 'task-title', task.title), badge);
    const body = el('div', 'task-body');
    const feedback = el('div', 'feedback-box task-feedback'); feedback.setAttribute('aria-live', 'polite');
    const stageButtons = [];
    if (!task.transfer) {
      const row = el('div', 'stage-row'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', 'Stufen für ' + task.title);
      task.stages.forEach((stage, index) => {
        const node = button('Stufe ' + (index + 1), 'stage-btn', () => {
          state.tasks[task.id].active = index; save(); renderTask(task);
        });
        stageButtons.push(node); row.append(node);
      });
      details.append(summary, row, body, feedback);
    } else details.append(summary, body, feedback);
    views.set(task.id, { details, body, feedback, badge, stageButtons });
    details.addEventListener('toggle', () => {
      state.tasks[task.id].open = details.open; save();
    });
    root.append(details);
  });
  TASKS.forEach(renderTask);
  window.AlgorithmProgress?.trackPageState(STORAGE_KEY, state);
})();
