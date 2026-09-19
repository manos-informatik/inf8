# Aufbau der Seite „Imperative Programmierung"

Diese Datei beschreibt, wie der Seitenbaum aufgebaut ist und wie neue Kacheln
und Seiten dazukommen. Sie wird nicht ausgeliefert, sie ist die Anleitung dazu.

## Repository und Adressen

Repo: `manos-informatik/inf8` · Pages-Wurzel: `https://manos-informatik.github.io/inf8/`

| Seite | Ordner im Repo | Adresse online |
|---|---|---|
| Landingpage | `Algorithmierung/uebersicht/` | `…/inf8/Algorithmierung/uebersicht/` |
| Variablen (Kachelseite) | `Algorithmierung/uebersicht/variablen/` | `…/inf8/Algorithmierung/uebersicht/variablen/` |
| Variablen – Übersicht | `Algorithmierung/Variablen/uebersicht/` | `…/inf8/Algorithmierung/Variablen/uebersicht/` |
| Variablen – Übungen | `Algorithmierung/Variablen/uebung/` | `…/inf8/Algorithmierung/Variablen/uebung/` |

## Zwei Zweige: Navigation und Inhalt

```
inf8/Algorithmierung/
├── uebersicht/                 NAVIGATION - nur Kachelseiten, kein Lernstoff
│   ├── index.html              Landingpage: Imperative Programmierung
│   │                           Kacheln: Variablen
│   ├── style.css               gemeinsames Stylesheet der Kachelseiten
│   ├── instruction.md          diese Datei
│   └── variablen/
│       └── index.html          Kachelseite Variablen
│                               Kacheln: Übersicht · Übungen
│
└── Variablen/                  INHALT zum Thema Variablen
    ├── uebersicht/             Nachschlagewerk zum Thema
    │   ├── index.html          6 Karten, alle offen sichtbar
    │   ├── style.css
    │   └── script.js
    └── uebung/                 Übungsseite
        ├── index.html
        ├── style.css
        └── script.js
```

Ebenen: **Landingpage → Thema → Übersicht | Übungen**

Die Kachelseiten stehen alle unter `uebersicht/` und enthalten nur Navigation.
Der Lernstoff liegt pro Thema in einem eigenen Ordner daneben (`Variablen/`), dort
je ein Ordner pro Kachel (`uebersicht/`, `uebung/`). Die Kachelseite verweist mit
`../../<Thema>/<kachel>/index.html` hinüber, die Inhaltsseite mit
`../../uebersicht/<thema>/index.html` zurück.

## Regeln

- **Jede Seite bekommt eine eigene `index.html` in einem eigenen Ordner.** Dadurch
  endet jede Adresse auf einem Ordner (`…/uebung/`) und die Links bleiben kurz.
- **Ordner- und Dateinamen nur ASCII und klein** (`uebersicht`, nicht `Übersicht`).
  GitHub Pages läuft auf Linux, unterscheidet Groß- und Kleinschreibung und stolpert
  über Umlaute in Pfaden. Die Beschriftung der Kachel darf natürlich „Übersicht" heißen.
  (`Variablen/` mit großem V ist Altbestand aus der ersten Fassung.)
- **Alle Links relativ**, nie absolut. Das Repo liegt online unter `/inf8/…`, ein
  Link mit führendem `/` zielt daneben. Relative Links funktionieren lokal und online.
- **Links immer bis zur `index.html` ausschreiben**, nicht nur bis zum Ordner:
  `href="variablen/index.html"`, nicht `href="variablen/"`. Nur ein Webserver ergänzt
  die `index.html` von selbst. Öffnet man die Dateien direkt im Browser (`file://`,
  Doppelklick, VS-Code-Vorschau), tut das niemand und der Link bricht mit
  `ERR_UNEXPECTED`. Die ausgeschriebene Form funktioniert in beiden Fällen.
- **Kachelseiten teilen sich `uebersicht/style.css`** – nicht kopieren, sondern
  relativ einbinden (`../style.css` eine Ebene tiefer).
- **Inhaltsseiten haben ein eigenes `style.css`** mit den Haus-Stil-Tokens, weil sie
  Karten, Buttons und Rückmeldungen brauchen, die das Kachel-Stylesheet nicht hat.
- **Kacheln tragen nur einen Namen**, keinen Erklärtext.
- **Jede Seite außer der Landingpage hat oben einen `.back-link`** auf die Ebene
  darüber. Über der Landingpage gibt es im Repo keine Indexseite, dort entfällt er.
- **Footer steht auf jeder Seite** und lautet wörtlich:
  `© 2026 Martin-Andersen-Nexö-Gymnasium Dresden`.

## Kachelraster

Höchstens zwei Spalten, neue Kacheln füllen von links nach rechts auf. Das erledigt
`.tile-grid` in `uebersicht/style.css` von selbst – es genügt, ein `<li>` hinten
anzuhängen:

```html
<ul class="tile-grid">
  <li><a class="tile" href="variablen/index.html">Variablen</a></li>
  <li><a class="tile" href="schleifen/index.html">Schleifen</a></li>   <!-- neu, rechts daneben -->
  <li><a class="tile" href="verzweigungen/index.html">Verzweigungen</a></li>  <!-- Zeile 2 links -->
</ul>
```

Eine einzelne Kachel steht bewusst in der linken Spalte und nimmt die halbe Breite ein.
Unter 820 px Breite wird das Raster einspaltig.

## Neues Thema anlegen

1. **Kachelseite:** `uebersicht/<thema>/index.html` anlegen –
   `uebersicht/variablen/index.html` kopieren, Titel, `h1` und die Kachel-Links anpassen.
2. **Inhaltsordner:** `<Thema>/uebersicht/` und `<Thema>/uebung/` anlegen, je mit
   eigener `index.html` und `style.css`. `Variablen/uebersicht/` dient als Vorlage –
   worauf es dabei ankommt, steht im nächsten Abschnitt.
3. **Landingpage:** in `uebersicht/index.html` ein `<li>` ans Ende von `.tile-grid`
   hängen.

## Übersichtsseiten bauen

Gelernt beim Bau von `Variablen/uebersicht/`: Der erste Versuch war unbemerkt eine
zweite Übungsseite geworden und musste komplett neu gemacht werden. Damit das nicht
wieder passiert, hier die Punkte, an denen es hing.

### Die Prüffrage

**Kann man auf der Seite etwas falsch machen? Dann ist es keine Übersicht.**
Eine Übersicht ist zum Nachschlagen da: Sie prüft nichts, bewertet nichts und
verlangt nichts. Sichere Zeichen, dass die Seite abgerutscht ist:

- ein Prüfen-Knopf oder eine `.feedback-box` mit richtig/falsch
- Eingabefelder, in die man selbst etwas tippt
- ein Zähler, Punktestand oder eine Fortschrittsanzeige
- „Aufgabe 1", „Aufgabe 2" als Überschriften
- Start/Schritt-Knöpfe, die man in einer bestimmten Reihenfolge drücken muss

Das alles gehört auf die Übungsseite daneben.

### Aufbau

- **Karten (`section.card`), keine `<details>`.** Nachschlagen heißt sehen, nicht erst
  aufklappen. Alles steht sofort da, man scrollt.
- **Erste Karte „Darum geht es"**: vier bis sechs Sätze, die den Stoff zusammenfassen.
  Das ist der Kern der Seite, alles Weitere sind Beispiele dazu.
- **Eine Karte pro Begriff**, benannt wie der Begriff („Global oder lokal"), nicht wie
  eine Tätigkeit.
- Pro Karte ein bis zwei Sätze Anleitung, dann sofort das Beispiel.

### Was „interaktiv" hier heißt

Nicht lösen, sondern **umschalten und vergleichen**. Vier Muster haben sich bewährt:

| Muster | Beispiel auf der Variablen-Seite |
|---|---|
| Auswahl → Beispiel | Datentyp in der Tabelle anklicken, Beispiel erscheint darunter |
| Blickwinkel-Umschalter | „aus setup() gesehen" / „aus draw() gesehen" – **beide** Seiten der Gegenüberstellung antworten gleichzeitig |
| Parameter-Regler | Zahl der `draw()`-Zyklen; der Unterschied zwischen `print()` und `println()` wächst sichtbar mit |
| lebende Werte | Zeiger über die Zeichenfläche, `mouseX`/`mouseY` stehen direkt in der Tabelle |

### Gegenüberstellung heißt nebeneinander, nicht nacheinander

Beide Fälle sind **gleichzeitig** sichtbar (`.split` mit zwei `.subpanel`). Der Schalter
wechselt nicht, welchen Fall man sieht, sondern von wo aus man ihn betrachtet. Sonst
muss man hin- und herklicken und vergleicht aus dem Gedächtnis.

### Beispiele: vollständig und ehrlich

- **Ganze Programme zeigen, keine Fragmente.** `println("x = " + x);` allein erklärt
  nicht, woher `x` kommt und warum es wächst. Erst mit `int x = 0;` und `x = x + 2;`
  darüber ergibt die Konsolenausgabe daneben einen Sinn.
- **Die Ausgabe aus dem gezeigten Programm ableiten**, nicht danebenschreiben. Im
  Skript läuft dieselbe Rechnung wie im angezeigten Code. So können Beispiel und
  Ergebnis nicht auseinanderlaufen – und ein Test kann beides gegeneinander prüfen.
- **Gegenbeispiel dazustellen.** Neben „Beispiel" steht „Geht nicht" mit dem typischen
  Fehler (`int punkte = 0.5;`). Genau deswegen schlägt man nach.
- **Eine Markierung darf nichts Falsches suggerieren.** Der lokale Sketch lässt sich in
  *keinem* Blickwinkel starten, also bleibt der rote Balken in Zeile 2 immer stehen –
  auch bei „aus draw() gesehen". Eine Markierung, die je nach Schalter verschwindet,
  würde behaupten, das Programm liefe.
- **Der Einleitungssatz sagt, was das Bedienelement tut**, z. B. „Der Regler bestimmt,
  wie viele `draw()`-Zyklen die Konsole zeigt." Ohne das rät man herum.

### Farbcode der Markierungen im Code

| Markierung | Bedeutung |
|---|---|
| grüner Balken links (`.is-scope`) | hier gilt die Variable |
| gelber Balken (`.is-active`) | die gerade betrachtete Zeile |
| roter Balken (`.is-broken`) | so geht es nicht |

### Zustand

Auch die Übersicht sichert automatisch, aber nur die **Auswahl** – welcher Datentyp,
welcher Blickwinkel, Reglerstellung, Mausposition. Keinen Fortschritt, denn es gibt
keinen. Eigener `localStorage`-Schlüssel pro Seite.

### Zwei Layoutfallen von dieser Seite

- **Eine Karte darf beim Bedienen nicht springen.** Wächst ein Bereich mit dem Regler
  (hier die Konsole), bekommt er eine `min-height` für den größten Fall. Sonst hüpft
  die halbe Seite, während man schiebt.
- **`.subpanel .code-block` hat `flex: 1`**, damit zwei Panels nebeneinander gleich hoch
  werden. Steht eine Konsole darunter, braucht der Codeblock `flex: none` (Klasse
  `kompakt`) – sonst streiten sich beide um denselben Platz.

## Thema Variablen im Einzelnen

Grundlage ist der LogSeq-Knoten „01 Datentypen, Variablen und Systemvariablen".
Die beiden Inhaltsseiten überschneiden sich nicht:

| Übersicht (Nachschlagen) | Übungen (Anwenden) |
|---|---|
| Darum geht es | Aufgabe 1 · Datentyp-Blitz |
| Datentypen | Aufgabe 2 · Variablen zeichnen |
| Deklarieren, initialisieren, zuweisen | Aufgabe 3 · Triff den Umriss |
| Global oder lokal | Aufgabe 4 · Der wachsende Kreis |
| In die Konsole schreiben | |
| Systemvariablen | |

Links sechs Karten, alle offen; rechts vier aufklappbare Aufgaben mit Prüfen und
Rückmeldung. `localStorage`-Schlüssel: `inf8-variablen-uebersicht-v1` bzw.
`inf8-variablen-v1`.
