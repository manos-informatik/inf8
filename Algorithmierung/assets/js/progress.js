/* Gemeinsamer Lernstand. Seiten-, Aufgaben- und Stufenkennungen bleiben stabil.
   Das Legacy-Layout ist eingefroren: Es beschreibt die alten Array-Speicherstände. */
(() => {
  'use strict';
  const STORAGE_KEY = 'inf8-algorithmierung-progress-v2';
  const APP_ID = 'inf8-algorithmierung';
  const FLASH_KEY = STORAGE_KEY + '-message';
  const legacyLayouts = {
    'funktionen-uebung': {
      aufbau: ['kopf', 'aufruf', 'definition'], zerlegen: ['figur', 'position', 'reihenfolge'],
      position: ['global', 'lokal', 'verdeckt'], namen: ['rumpf', 'umbenennen', 'aufteilen'], ampel: ['modularisieren']
    },
    'verzweigungen-uebung': {
      vergleiche: ['kleiner', 'einschliesslich', 'ungleich'], logik: ['und', 'oder', 'nicht'],
      wenn: ['if', 'else', 'fuellfarbe'], kette: ['rechts-oben', 'viertel', 'mittellinien'],
      reihenfolge: ['absteigend', 'aufsteigend', 'eine-meldung']
    },
    'zaehlschleifen-uebung': {
      aufbau: ['start', 'update', 'kopf'], grenze: ['ab-null', 'ab-eins', 'letzter-index'],
      position: ['x', 'abstand', 'variablen'], farbe: ['rand', 'wechsel', 'gegenfall'],
      balken: ['hoehe', 'unterkante', 'variablen']
    }
  };
  const definitions = [
    ['variablen-uebersicht', 'inf8-variablen-uebersicht-v1'], ['variablen-uebung', 'inf8-variablen-v1'],
    ['funktionen-uebersicht', 'inf8-funktionen-uebersicht-v1'], ['funktionen-uebung', 'inf8-funktionen-uebung-v1'],
    ['verzweigungen-uebersicht', 'inf8-verzweigungen-uebersicht-v1'], ['verzweigungen-uebung', 'inf8-verzweigungen-uebung-v1'],
    ['zaehlschleifen-uebersicht', 'inf8-zaehlschleifen-uebersicht-v1'], ['zaehlschleifen-uebung', 'inf8-zaehlschleifen-uebung-v1']
  ].map(([id, key]) => ({id, key, layout: legacyLayouts[id]}));
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const safeKey = key => !['__proto__', 'constructor', 'prototype'].includes(key);
  function copy(value) {
    if (Array.isArray(value)) return value.map(copy);
    if (!isObject(value)) return value;
    const result = {};
    for (const [key, child] of Object.entries(value)) if (safeKey(key)) result[key] = copy(child);
    return result;
  }
  // Nur vorhandene Werte ersetzen. Fehlende und unbekannte Einträge bleiben erhalten.
  function merge(base, incoming) {
    const result = isObject(base) ? copy(base) : {};
    for (const [key, value] of Object.entries(incoming)) {
      if (!safeKey(key)) continue;
      // Die Antwortauswahl einer vorhandenen Stufe ist ein vollständiger Satz;
      // ein leerer Satz muss beim Laden zuvor gesetzte Antworten entfernen.
      result[key] = isObject(value) && key !== 'answers' ? merge(result[key], value) : copy(value);
    }
    return result;
  }
  function canonicalState(id, state, layout = legacyLayouts[id]) {
    const result = copy(state);
    if (!isObject(result.tasks)) return result;
    for (const [taskId, task] of Object.entries(result.tasks)) {
      if (!isObject(task) || !Array.isArray(task.stages)) continue;
      const ids = layout?.[taskId] || [];
      task.stages = Object.fromEntries(task.stages.map((stage, i) => [ids[i] || 'legacy-' + i, stage]));
      if (Number.isInteger(task.active)) task.activeStage = ids[task.active] || 'legacy-' + task.active;
      delete task.active;
    }
    return result;
  }
  function runtimeState(definition, state) {
    const result = copy(state);
    if (!definition.layout || !isObject(result.tasks)) return result;
    for (const [taskId, ids] of Object.entries(definition.layout)) {
      const task = result.tasks[taskId];
      if (!isObject(task) || !isObject(task.stages)) continue;
      task.stages = ids.map(id => task.stages[id] || {});
      task.active = Math.max(0, ids.indexOf(task.activeStage));
    }
    return result;
  }
  const blank = () => ({version: 2, app: APP_ID, savedAt: null, pages: {}});
  function normalize(raw) {
    if (!isObject(raw) || !isObject(raw.pages) || (raw.app !== undefined && raw.app !== APP_ID) ||
        !Number.isInteger(raw.version) || raw.version < 1) throw Error('Keine passende Algorithmierungs-Speicherdatei.');
    const result = merge(blank(), raw);
    result.app = APP_ID;
    result.version = Math.max(2, raw.version);
    for (const [id, page] of Object.entries(result.pages)) {
      if (!isObject(page) || (page.pageState !== undefined && !isObject(page.pageState))) {
        throw Error('Der gespeicherte Seitenstand ist ungültig.');
      }
      if (page.pageState) page.pageState = canonicalState(id, page.pageState);
    }
    return result;
  }
  let memory = blank();
  let storageUnavailable = false;
  const snapshots = new Map();
  function readStoredProgress() {
    if (storageUnavailable) return copy(memory);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) memory = normalize(JSON.parse(raw));
    } catch { /* Ohne Browserspeicher bleibt der Stand für diesen Seitenbesuch verfügbar. */ }
    return copy(memory);
  }
  function writeStoredProgress(progress, required = false) {
    const next = copy(progress);
    next.savedAt = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch {
      if (required) throw Error('Der Browser erlaubt das Speichern nicht. Der bisherige Stand bleibt erhalten.');
      storageUnavailable = true;
    }
    memory = next;
  }
  function migrateLegacy(definition) {
    const progress = readStoredProgress();
    if (progress.pages[definition.id]?.pageState) return;
    try {
      const raw = JSON.parse(localStorage.getItem(definition.key));
      if (!isObject(raw)) return;
      progress.pages[definition.id] = merge(progress.pages[definition.id], {
        pageState: canonicalState(definition.id, raw), migratedFrom: definition.key
      });
      writeStoredProgress(progress);
    } catch { /* Beschädigte einzelne Altstände blockieren andere Seiten nicht. */ }
  }
  function definitionFor(key) {
    let definition = definitions.find(item => item.key === key);
    if (!definition) {
      definition = {id: document.body.dataset.pageKey, key};
      if (!definition.id || !safeKey(definition.id)) throw Error('Die Seite braucht eine feste data-page-key-Kennung.');
      definitions.push(definition);
      migrateLegacy(definition);
    }
    return definition;
  }
  function getPageState(key) {
    const definition = definitionFor(key);
    const state = readStoredProgress().pages[definition.id]?.pageState;
    return state ? runtimeState(definition, state) : null;
  }
  function savePageState(key, state) {
    const definition = definitionFor(key);
    const progress = readStoredProgress();
    const current = canonicalState(definition.id, state, definition.layout);
    const page = progress.pages[definition.id];
    // Entfernte bekannte Eingaben (Zurücksetzen) löschen; unbekannte neue Daten behalten.
    function removeDeleted(target, previous, next) {
      if (!isObject(target) || !isObject(previous) || !isObject(next)) return;
      for (const key of Object.keys(previous)) {
        if (!safeKey(key)) continue;
        if (!Object.hasOwn(next, key)) delete target[key];
        else removeDeleted(target[key], previous[key], next[key]);
      }
    }
    removeDeleted(page?.pageState, snapshots.get(key), current);
    progress.pages[definition.id] = merge(page, {
      pageState: current, lastSavedState: new Date().toISOString()
    });
    writeStoredProgress(progress);
    snapshots.set(key, copy(current));
  }
  function trackPageState(key, state) {
    const definition = definitionFor(key);
    snapshots.set(key, canonicalState(definition.id, state, definition.layout));
    savePageState(key, state);
  }
  function setStageLayout(key, tasks) {
    const definition = definitionFor(key);
    if (new Set(tasks.map(task => task.id)).size !== tasks.length) throw Error('Aufgabenkennungen müssen eindeutig sein.');
    definition.layout = Object.fromEntries(tasks.map(task => [task.id, task.stages.map(stage => {
      if (!stage.id || !safeKey(stage.id)) throw Error('Jede Stufe braucht eine feste Kennung.');
      return stage.id;
    })]));
    for (const ids of Object.values(definition.layout)) {
      if (new Set(ids).size !== ids.length) throw Error('Stufenkennungen müssen je Aufgabe eindeutig sein.');
    }
  }
  function applyLoadedProgress(raw) {
    // Erst vollständig prüfen und speichern, dann die aktuelle Seite wiederherstellen.
    // Ein alter Save ergänzt den Stand: später hinzugekommene Seiten/Stufen bleiben erhalten.
    const incoming = normalize(raw);
    const previous = readStoredProgress();
    const next = merge(previous, incoming);
    next.version = Math.max(previous.version, incoming.version);
    writeStoredProgress(next, true);
  }
  window.AlgorithmProgress = {readStoredProgress, getPageState, savePageState, trackPageState, setStageLayout, applyLoadedProgress};
  definitions.forEach(migrateLegacy);
  const progress = readStoredProgress();
  const pageKey = document.body.dataset.pageKey;
  if (pageKey) {
    progress.pages[pageKey] = merge(progress.pages[pageKey], {visited: true, lastVisited: new Date().toISOString()});
    writeStoredProgress(progress);
  }
  const message = document.getElementById('progressMessage');
  function showMessage(text, error = false) {
    message.textContent = text;
    message.classList.toggle('is-error', error);
  }
  try {
    if (sessionStorage.getItem(FLASH_KEY)) {
      sessionStorage.removeItem(FLASH_KEY);
      showMessage('Fortschritt geladen.');
    }
  } catch { /* Statusmeldung ist optional. */ }
  document.getElementById('saveProgressBtn').addEventListener('click', () => {
    const data = readStoredProgress();
    data.savedAt = new Date().toISOString();
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + '\n'], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inf8-algorithmierung-fortschritt-' + data.savedAt.slice(0, 10) + '.json';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showMessage('Fortschritt gespeichert.');
  });
  const input = document.getElementById('loadProgressFile');
  document.getElementById('loadProgressBtn').addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      applyLoadedProgress(JSON.parse(await file.text()));
      try { sessionStorage.setItem(FLASH_KEY, 'loaded'); } catch { /* optional */ }
      window.location.reload();
    } catch (error) {
      showMessage(error instanceof SyntaxError ? 'Die Datei enthält kein gültiges JSON.' : error.message, true);
    } finally { input.value = ''; }
  });
})();
