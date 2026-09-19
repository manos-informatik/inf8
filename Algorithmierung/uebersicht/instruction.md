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
   eigener `index.html` und `style.css`. `Variablen/uebersicht/` ist die leere Vorlage.
3. **Landingpage:** in `uebersicht/index.html` ein `<li>` ans Ende von `.tile-grid`
   hängen.

## Aufteilung der Inhalte zum Thema Variablen

Die beiden Inhaltsseiten haben verschiedene Aufgaben und überschneiden sich nicht:

**Übersicht = Nachschlagen.** Sechs Karten, alle sofort sichtbar, kein Aufklappen:
Darum geht es · Datentypen · Deklarieren, initialisieren, zuweisen ·
Global oder lokal · In die Konsole schreiben · Systemvariablen.
Interaktiv heißt hier **umschalten und vergleichen**, nicht lösen: einen Datentyp
anklicken zeigt sein Beispiel samt Gegenbeispiel, ein Blickwinkel-Umschalter stellt
globale und lokale Variable nebeneinander, ein Regler zeigt `print()` und `println()`
an denselben Zyklen, und die Zeichenfläche liefert `mouseX`/`mouseY`/`width`/`height` live.

**Keine Aufgaben auf der Übersicht.** Kein Prüfen-Knopf, keine Eingabefelder, keine
Rückmeldung richtig/falsch, kein Punktestand. Das gehört alles auf die Übungsseite.

**Übungen = anwenden.** Vier aufklappbare Aufgaben mit Prüfen und Rückmeldung:
Datentyp-Blitz · Variablen zeichnen · Triff den Umriss · Der wachsende Kreis.

Grundlage ist der LogSeq-Knoten „01 Datentypen, Variablen und Systemvariablen".

## Farbcode in den Codebeispielen

| Markierung | Bedeutung |
|---|---|
| grüner Balken links (`.is-scope`) | hier gilt die Variable |
| gelber Balken (`.is-active`) | die gerade betrachtete Zeile |
| roter Balken (`.is-broken`) | so geht es nicht |

Jede Seite speichert ihren Zustand unter einem eigenen Schlüssel:
`inf8-variablen-uebersicht-v1` bzw. `inf8-variablen-v1`.
