# CSS: Text and Images

[English](README.md)

Macht aus jedem Ordner in `source/` ein eigenes PDF: der Text aus
`text.txt` auf der ersten Seite, danach jedes Bild aus dem Ordner auf einer
eigenen Seite. Ein Node.js-Script füllt eine HTML-Vorlage, und ein
unsichtbares Chrome (gesteuert mit [Puppeteer](https://pptr.dev)) druckt sie
als PDF. Das Layout ist reines CSS mit Druckregeln (`@page`,
`break-before`); was man vom Webdesign kennt, funktioniert also auch auf
Papier.

## Installation

Voraussetzungen: [Node.js](https://nodejs.org) 18 oder neuer (die
LTS-Version), ein Terminal.

1. Node.js installieren: den LTS-Installer von
   [nodejs.org](https://nodejs.org) herunterladen, oder auf macOS mit
   [Homebrew](https://brew.sh): `brew install node`. Mit `node --version`
   prüfen.
2. Ein Terminal im Ordner des Repositorys öffnen und die Abhängigkeiten
   installieren:
   ```sh
   npm install
   ```
   Das installiert Puppeteer (in `node_modules/`) und lädt ein passendes
   Chrome for Testing herunter (etwa 170 MB, nach `~/.cache/puppeteer`).
   Das eigene Chrome wird weder verwendet noch verändert.

Bibliotheken: puppeteer 24 (über npm).

Lizenz: MIT

## Ausführen

Das Ausgangsmaterial liegt in `source/`, ein Ordner pro Dokument:

```
source/
  glacier/
    text.txt     erste Zeile: Titel; eine Leerzeile beginnt einen neuen Absatz
    01.jpg       Bilder (jpg, png), in alphabetischer Reihenfolge gesetzt
    02.jpg
  harbour/
    ...
```

Im Ordner des Repositorys ausführen:

```sh
npm run build
```

Das Script erzeugt `output/glacier.pdf`, `output/harbour.pdf` … (A4, 20 mm
Rand). Die Ordner in `source/` durch eigenes Material ersetzen und das
Script nochmals ausführen. Bestehende PDFs werden überschrieben.

Neben jedem PDF liegt die erzeugte HTML-Datei (`output/glacier.html`).
Um an `style.css` zu arbeiten, diese in Chrome öffnen: nach jeder Änderung
neu laden und mit *Drucken* (Cmd/Ctrl+P) die Seiten ansehen – ohne jedes
Mal das Script auszuführen.

## Coding-Hilfe

- **`template.html`**: der Seitenaufbau mit drei Platzhaltern:
  `{{title}}`, `{{body}}` und `{{images}}`. Das Stylesheet ist als
  `../style.css` verlinkt, weil das erzeugte HTML in `output/` gespeichert
  wird.
- **`style.css`**: das Layout. `@page` legt Papierformat und Ränder fest
  (z. B. `size: A5` oder `size: 200mm 200mm` ausprobieren).
  `.image-page` beginnt jedes Bild mit `break-before: page` auf einer neuen
  Seite; die Höhe von 257 mm ist A4 minus beide Ränder. Das Bild behält
  mit `max-width` / `max-height` seine Proportionen und wird mit Flexbox
  zentriert. Wer den Rand in `@page` ändert, passt die Höhe von
  `.image-page` mit an.
- **`build.js` → `buildHtml()`**: liest `text.txt`; die erste Zeile ist
  der Titel, der Rest wird bei Leerzeilen in `<p>`-Absätze aufgeteilt.
  `escapeHtml()` ersetzt `& < >`, damit der Text unverändert erscheint.
  Die Bilder (`jpg`, `jpeg`, `png`, nach Namen sortiert) werden zu je
  einem `<div class="image-page">`. Für andere Formate den regulären
  Ausdruck `/\.(jpe?g|png)$/i` erweitern (z. B. `webp`, `gif`, `svg`).
- **`build.js` → `main()`**: startet den Browser einmal mit
  `puppeteer.launch()`, schreibt dann für jeden Ordner das HTML, öffnet es
  mit `page.goto()` und speichert es mit `page.pdf()`.
  `preferCSSPageSize: true` verwendet das Format aus `@page`;
  `printBackground: true` behält Hintergrundfarben und -bilder, die
  Browser beim Drucken sonst weglassen.
