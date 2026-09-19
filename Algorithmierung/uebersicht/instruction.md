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

## Übungsseiten bauen

Gelernt beim Umbau von `Variablen/uebung/`. Die erste Fassung hatte vier Aufgaben, von
denen nur eine wirklich Variablen übte – die anderen drei übten Zeichnen und Koordinaten.
Aufgefallen ist das erst, als Übersicht und Übungen als zwei Spalten nebeneinander standen.

### Die Prüffrage, umgekehrt

Umgekehrt zur Übersicht: **hier muss man falsch liegen können.** Jede Aufgabe hat ein
ausgesprochenes Ziel, einen Prüfen-Knopf und eine Rückmeldung, die sagt, woran es lag.
Gibt es nichts zu bestehen, ist es keine Aufgabe, sondern ein Beispiel – und Beispiele
stehen auf der Übersicht.

### Eine Übung je Übersichts-Karte

Der schnellste Test, ob eine Übungsseite zum Thema passt: die Karten der Übersicht und die
Aufgaben der Übung in zwei Spalten nebeneinander schreiben. Bleibt links eine Karte ohne
Übung oder rechts eine Aufgabe ohne Karte, stimmt etwas nicht. Eine Aufgabe ohne Karte übt
meist ein anderes Thema mit – dann gehört sie auf dessen Seite, nicht hierher.

### Stufen statt einer einzigen Aufgabe

Drei Stufen je Aufgabe, mit steigendem Anspruch, jede mit eigenem Ziel und eigenem Stand.
Sie dürfen sich ausdrücklich **widersprechen** – das ist der Gewinn:

> In Aufgabe 3 muss die Variable in Stufe 1 global sein, damit sie ihren Wert behält,
> und in Stufe 3 lokal, damit sie ihn gerade nicht behält.

Wer nur eine Stufe sieht, lernt eine Regel. Wer beide sieht, lernt die Frage dahinter.

### Genau eine richtige Antwort je Stufe

Beim Bauen von Aufgabe 3, Stufe 2 waren zunächst zwei der drei Stellen richtig – „in draw()"
erfüllte das Ziel genauso wie die gemeinte Lösung. Nach jeder neuen Stufe einmal **alle**
Antwortmöglichkeiten gegen das Ziel halten. Ist mehr als eine richtig, muss entweder das
Ziel schärfer werden oder die Möglichkeit ausgetauscht.

### Der lehrreichste Fall läuft und ist trotzdem falsch

Eine Fehlermeldung ist schnell verstanden. Schwieriger – und wichtiger – ist der Fall, der
fehlerfrei durchläuft und das Falsche tut: die Deklaration in `draw()` gibt `1, 1, 1` statt
`1, 2, 3`. Jede Aufgabe sollte mindestens eine solche Möglichkeit anbieten, und die
Rückmeldung soll es benennen: „Kein Fehler, trotzdem falsch: …".

### Bedienelemente in den Code, wenn die Wahl Teil der Aufgabe ist

`print()` und `println()` standen erst als Knöpfe über dem Code. Als Auswahlfeld **im Code**,
eines je Anweisung, ist die Aufgabe klarer, ein Bedienelement fällt weg – und Stufe 3 wird
überhaupt erst möglich, weil sie zwei verschiedene Funktionen in einem Programm braucht.

### Zustand je Stufe getrennt halten

Alles, was der Lernende eingibt, wird pro Stufe gespeichert: `tipps[stufe]`, `wahl[stufe]`,
und bei Aufgabe 4 tragen die Feldnamen die Stufe im Schlüssel (`ausgabe_2_1_fn`). Sonst
löscht ein Stufenwechsel die Arbeit, und Zurückspringen wird zur Strafe statt zur Möglichkeit.

### Rückmeldung aus dem Zustand ableiten

Wer den Rückmeldungstext nur im Klick-Handler setzt, verliert ihn beim Stufenwechsel. Jede
Aufgabe braucht eine Funktion, die aus dem gespeicherten Stand die passende Rückmeldung neu
erzeugt – `verlaufRueckmeldung()`, `ortRueckmeldung()` – aufgerufen beim Stufenwechsel und
beim Seitenstart. Dieselbe Regel wie beim Code: nichts anzeigen, was sich nicht aus dem
Zustand herleiten lässt.

### Fortschritt

Eine bestandene Stufe wird grün und bleibt es, auch wenn man die Stufe verlässt oder
eine andere falsch beantwortet. Sind **alle** Stufen einer Aufgabe bestanden, färbt sich
die Aufgabenkarte grün und bekommt die Plakette „geschafft ✓" in der Kopfzeile.
Zurückspringen ist jederzeit möglich; Eingaben und Rückmeldung einer Stufe kommen beim
Wechseln zurück.

Was als geschafft gilt, entscheidet jede Aufgabe für sich. Auf der Variablen-Seite:

| Aufgabe | Bedingung |
|---|---|
| 1 · Datentyp-Blitz | eine Runde ohne Fehler mit mindestens 6 richtigen (`QUIZ_HUERDE`) |
| 2 · Wertverlauf | alle vier Vermutungen richtig, je Stufe |
| 3 · Deklarationsort | die richtige Stelle gewählt und ausgeführt, je Stufe |
| 4 · Ausgabe | Konsole trifft die Vorgabe genau, je Stufe |
| 5 · Die Mitte treffen | alle drei Leinwandgrößen bestanden |
| Zusatz 2 · Triff den Umriss | alle vier Teilaufgaben gelöst |
| Zusatz 1 und 3 | zum Ausprobieren, es gibt nichts zu bestehen |

Gespeichert wird das unter `state.geschafft` im **`localStorage`**, nicht in einem Cookie:
Ein Cookie würde bei jedem Seitenaufruf mitgeschickt werden, obwohl ihn niemand liest, und
ist auf rund 4 KB begrenzt. `localStorage` bleibt im Browser, hat mehr Platz und übersteht
das Schließen des Fensters genauso. Gelöscht wird der Stand nur, wenn die Schülerin oder
der Schüler die Browserdaten löscht.

Beim Ergänzen einer Aufgabe: `merkeStufe("<taskId>", stufe)` beim Bestehen aufrufen und
danach `zeigeFortschritt()`. Die Bedingung für die ganze Aufgabe steht in `zeigeFortschritt`
in der Tabelle `fertig`.

### Beim Bauen aufgefallen

- **Selektoren in die eigene Aufgabe einsperren.** Zusatz 3 griff mit
  `querySelectorAll(".stufe-btn")` alle Stufenknöpfe der Seite ab und hat damit die
  neuen Knöpfe von Aufgabe 2 mitgesteuert. Jetzt `#task4 .stufe-btn`, wie es bei
  `#task2 .fn-btn` von Anfang an stand. Auf einer Seite mit vielen Aufgaben gilt das
  für jede Klasse, die mehr als einmal vorkommt.
- **Aufgabe 5 rechnet ohne `eval`.** Ein kleiner Auswerter kennt `width`, `height`,
  Zahlen, Klammern und `+ - * /` und teilt ganzzahlig wie Java. Alles andere wird
  abgelehnt und benannt („`breite` kenne ich nicht").
- **Auswahlfelder ohne Vorbelegung.** Ein `<select>` hat immer einen Wert, also steht
  als erste Option ein leeres `?`. Sonst beantwortet die Seite einen Teil der Aufgabe
  selbst – dasselbe Prinzip wie bei leeren Eingabefeldern.
- **Eine Zeile mit Eingabefeldern braucht die volle Breite.** Die `println()`-Zeile in
  Aufgabe 4 passt nicht in eine halbe Spalte. Der Codeblock steht deshalb über beiden
  Spalten (`.subpanel.breit`), darunter Vorgabe und eigene Konsole nebeneinander –
  das ist zum Vergleichen ohnehin besser.
- **`codeAlsText()` muss Auswahlfelder kennen.** Für ein `<select>` liefert
  `textContent` alle Optionen hintereinander; ohne Sonderfall landet
  `mouseXmouseYwidthheight` in der Zwischenablage.

### Was sich an diesen Seiten zu testen lohnt

- **Erwartete Werte im Test unabhängig nachrechnen**, nicht aus derselben Tabelle nehmen,
  die die Seite benutzt. Bei Aufgabe 2 simuliert der Test die Zyklen selbst.
- **Bei Zeichenflächen die Pixel prüfen**, nicht die Färbung des Rahmens – bei Aufgabe 5
  wird in jeder der drei Vorschauen der Bildpunkt in der Mitte ausgelesen.
- **Fortschritt über ein Neuladen hinweg prüfen**: iframe entfernen, neu laden, und
  nachsehen, ob Stufen, Karten und Plaketten wieder grün sind.
- **Einen absichtlich kaputten Speicherstand einspielen** (`taskVerlauf: "kaputt"`) und
  prüfen, dass die Seite trotzdem normal startet.
- **Jede Stufe einmal vollständig lösen und einmal absichtlich daneben** – die zweite
  Hälfte findet die Rückmeldungen, die sonst nie erscheinen.

## Thema Variablen im Einzelnen

Grundlage ist der LogSeq-Knoten „01 Datentypen, Variablen und Systemvariablen".
Die beiden Inhaltsseiten überschneiden sich nicht:

**Jede Übersichts-Karte hat ihre eigene Übung.** Das ist die Regel, nach der die
Übungsseite gebaut ist – man kann von links nach rechts lesen:

| Übersicht (Nachschlagen) | Übungen (Anwenden) |
|---|---|
| Darum geht es | – |
| Datentypen | Aufgabe 1 · Datentyp-Blitz |
| Deklarieren, initialisieren, zuweisen | Aufgabe 2 · Wertverlauf vorhersagen |
| Global oder lokal | Aufgabe 3 · Wohin mit der Deklaration? |
| In die Konsole schreiben | Aufgabe 4 · Ausgabe nach Vorgabe |
| Systemvariablen | Aufgabe 5 · Die Mitte treffen |

Darunter stehen unter der Überschrift **Zusatz** drei ältere Aufgaben (Variablen
zeichnen, Triff den Umriss, Der wachsende Kreis). Sie üben vor allem Koordinaten und
gehören thematisch zu „00 Grundlagen Processing" – sobald es dafür eine Kachel gibt,
können sie dorthin umziehen.

Links sechs Karten, alle offen; rechts fünf aufklappbare Aufgaben mit Prüfen und
Rückmeldung. `localStorage`-Schlüssel: `inf8-variablen-uebersicht-v1` bzw.
`inf8-variablen-v1`.

### Woher die Aufgaben kommen

| Aufgabe | Vorlage im LogSeq-Knoten |
|---|---|
| 2 · Wertverlauf vorhersagen | „Vermutungen aufstellen und überprüfen" – erst alle Tipps, dann ausführen |
| 3 · Wohin mit der Deklaration? | „Was würde passieren, wenn die Deklaration verschoben würde?" |
| 4 · Ausgabe nach Vorgabe | A1, Zielformat `x-Position: … y-Position: …` |
| 5 · Die Mitte treffen | T0, Ziffernblatt mittig über `width`/`height` |

### Stufen in den Aufgaben 2 bis 4

| | Stufe 1 | Stufe 2 | Stufe 3 |
|---|---|---|---|
| **2 · Wertverlauf** | `zaehler + 2` | `zaehler * 2` | zwei Variablen, die Schrittweite wächst mit |
| **3 · Deklarationsort** | global ist richtig | wann hat `width` einen Wert? | lokal ist richtig |
| **4 · Ausgabe** | eine Anweisung | zwei Anweisungen, zwei Zeilen | `print()` und `println()` zusammen |

Stufe 2 von Aufgabe 3 zielt auf den Zeitpunkt: `int mitte = width / 2;` vor `setup()` ergibt
0, weil `size()` noch nicht gelaufen ist. Das ist die ==ACHTUNG==-Stelle aus dem LogSeq-Knoten.
