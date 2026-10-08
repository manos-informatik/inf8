const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const {runInNewContext} = require('node:vm');

const source = readFileSync(join(__dirname, '../assets/js/progress.js'), 'utf8');
const STORE = 'inf8-algorithmierung-progress-v2';
const KEY = 'inf8-zaehlschleifen-uebung-v1';
const PAGE = 'zaehlschleifen-uebung';
const plain = value => JSON.parse(JSON.stringify(value));
const envelope = (pages, version = 2) => ({version, app: 'inf8-algorithmierung', pages});
const layout = ids => [{id: 'aufbau', stages: ids.map(id => ({id}))}];

function environment(seeds = {}) {
  const stored = new Map(Object.entries(seeds).map(([key, value]) => [key, JSON.stringify(value)]));
  let blocked = false;
  const localStorage = {
    getItem: key => stored.get(key) ?? null,
    setItem(key, value) { if (blocked) throw Error('blocked'); stored.set(key, value); }
  };
  const nodes = new Map();
  const document = {
    body: {dataset: {pageKey: PAGE}},
    getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, {addEventListener() {}, classList: {toggle() {}}});
      return nodes.get(id);
    }
  };
  const window = {};
  runInNewContext(source, {window, document, localStorage, sessionStorage: {
    getItem: () => null, removeItem() {}
  }, setTimeout});
  return {api: window.AlgorithmProgress, stored, block: () => {blocked = true;}};
}

test('Alte Array-Stufen werden auch vor einem Besuch der Inhaltsseite übernommen', () => {
  const {api} = environment({[KEY]: {tasks: {aufbau: {
    active: 1, open: true,
    stages: [{answers: {start: '0'}, passed: true}, {answers: {update: 'i++'}, passed: true}]
  }}}});
  const saved = plain(api.readStoredProgress());
  assert.equal(saved.pages[PAGE].pageState.tasks.aufbau.activeStage, 'update');
  assert.equal(saved.pages[PAGE].pageState.tasks.aufbau.stages.start.passed, true);
  api.setStageLayout(KEY, layout(['neu', 'update', 'start', 'kopf']));
  const restored = plain(api.getPageState(KEY)).tasks.aufbau;
  assert.equal(restored.active, 1);
  assert.equal(restored.stages[2].answers.start, '0');
  assert.deepEqual(restored.stages[0], {});
});

test('Neue Seiten, Aufgaben und Stufen überstehen Laden und Speichern mit einer älteren Seite', () => {
  const future = envelope({
    [PAGE]: {pageState: {tasks: {
      aufbau: {activeStage: 'start', stages: {start: {answers: {start: '0'}}, neu: {passed: true}}},
      zusatz: {stages: {neu: {passed: true}}}
    }}},
    spaeter: {pageState: {wert: 42}}
  }, 3);
  const {api} = environment({[STORE]: future});
  api.setStageLayout(KEY, layout(['start', 'update', 'kopf']));
  const state = {tasks: {aufbau: {active: 0, stages: [{answers: {start: '1'}}, {}, {}]}}};
  api.trackPageState(KEY, state);
  api.applyLoadedProgress(envelope({[PAGE]: {pageState: {tasks: {aufbau: {
    active: 1, stages: [{answers: {}}, {answers: {update: 'i++'}}]
  }}}}}, 1));
  const saved = plain(api.readStoredProgress());
  assert.equal(saved.version, 3);
  assert.equal(saved.pages.spaeter.pageState.wert, 42);
  const tasks = saved.pages[PAGE].pageState.tasks;
  assert.equal(tasks.zusatz.stages.neu.passed, true);
  assert.equal(tasks.aufbau.stages.neu.passed, true);
  assert.deepEqual(tasks.aufbau.stages.start.answers, {});
  assert.equal(plain(api.getPageState(KEY)).tasks.aufbau.active, 1);
});

test('Zurücksetzen löscht bekannte Eingaben und bewahrt unbekannte Ergänzungen', () => {
  const key = 'inf8-variablen-v1';
  const {api} = environment({[STORE]: envelope({'variablen-uebung': {pageState: {
    werte2: {x: '123', spaeter: '42'}, neueAufgabe: {passed: true}
  }}})});
  const state = {werte2: {x: '123'}};
  api.trackPageState(key, state);
  delete state.werte2.x;
  api.savePageState(key, state);
  const saved = plain(api.readStoredProgress()).pages['variablen-uebung'].pageState;
  assert.deepEqual(saved.werte2, {spaeter: '42'});
  assert.equal(saved.neueAufgabe.passed, true);
});

test('Fremde oder beschädigte Dateien ändern den vorhandenen Stand nicht', () => {
  const {api, stored} = environment();
  const before = stored.get(STORE);
  for (const raw of [null, [], {}, {version: 2, app: 'tc6-lernhilfe', pages: {}},
    envelope({kaputt: []}), envelope({kaputt: {pageState: null}})]) {
    assert.throws(() => api.applyLoadedProgress(raw));
    assert.equal(stored.get(STORE), before);
  }
});

test('Ein gesperrter Speicher erlaubt Export aus dem Arbeitsspeicher, aber keinen verlustreichen Import', () => {
  const {api, block} = environment();
  block();
  api.setStageLayout(KEY, layout(['start']));
  api.trackPageState(KEY, {tasks: {aufbau: {active: 0, stages: [{answers: {start: '0'}}]}}});
  const before = plain(api.readStoredProgress());
  assert.equal(before.pages[PAGE].pageState.tasks.aufbau.stages.start.answers.start, '0');
  assert.throws(() => api.applyLoadedProgress(envelope({})), /Browser/);
  assert.deepEqual(plain(api.readStoredProgress()), before);
});

test('Doppelte Stufenkennungen werden erkannt', () => {
  const {api} = environment();
  assert.throws(() => api.setStageLayout(KEY, layout(['start', 'start'])), /eindeutig/);
});
