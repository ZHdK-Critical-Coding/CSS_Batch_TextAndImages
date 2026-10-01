# CSS: Text and Images

[Deutsch](README_DE.md)

Turns every folder in `source/` into its own PDF: the text from `text.txt`
on the first page, followed by every image in the folder on a page of its
own. A Node.js script fills an HTML template, and a headless Chrome
(controlled with [Puppeteer](https://pptr.dev)) prints it to PDF. The
layout is plain CSS with print rules (`@page`, `break-before`), so
anything you know from web design works on paper too.

## Installation

Requirements: [Node.js](https://nodejs.org) 18 or newer (the LTS version),
a terminal.

1. Install Node.js: download the LTS installer from
   [nodejs.org](https://nodejs.org), or on macOS with
   [Homebrew](https://brew.sh): `brew install node`. Check with
   `node --version`.
2. Open a terminal in the repository folder and install the dependencies:
   ```sh
   npm install
   ```
   This installs Puppeteer (in `node_modules/`) and downloads a matching
   Chrome for Testing (about 170 MB, into `~/.cache/puppeteer`). Your own
   Chrome is not used or changed.

Libraries: puppeteer 24 (via npm).

License: MIT

## How to Run

The source material lies in `source/`, one folder per document:

```
source/
  glacier/
    text.txt     first line: title; an empty line starts a new paragraph
    01.jpg       images (jpg, png), placed in alphabetical order
    02.jpg
  harbour/
    ...
```

In the repository folder, run

```sh
npm run build
```

The script creates `output/glacier.pdf`, `output/harbour.pdf` … (A4, 20 mm
margins). Replace the folders in `source/` with your own material and run
it again. Existing PDFs are overwritten.

Next to every PDF lies the generated HTML file (`output/glacier.html`).
Open it in Chrome to work on `style.css`: reload after each change and use
*Print* (Cmd/Ctrl+P) to see the pages – no need to run the script every
time.

## Coding Help

- **`template.html`**: the page structure with three placeholders:
  `{{title}}`, `{{body}}` and `{{images}}`. The stylesheet is linked as
  `../style.css`, because the generated HTML is saved in `output/`.
- **`style.css`**: the layout. `@page` sets paper size and margins (try
  `size: A5` or `size: 200mm 200mm`). `.image-page` starts every image on
  a new page with `break-before: page`; its height of 257 mm is A4 minus
  both margins. The image keeps its proportions with `max-width` /
  `max-height` and is centred with flexbox. Change the margin in `@page`
  and adjust the height of `.image-page` with it.
- **`build.js` → `buildHtml()`**: reads `text.txt`; the first line is the
  title, the rest is split at empty lines into `<p>` paragraphs.
  `escapeHtml()` replaces `& < >`, so the text is printed as it is. The
  images (`jpg`, `jpeg`, `png`, sorted by name) become one
  `<div class="image-page">` each. Extend the regular expression
  `/\.(jpe?g|png)$/i` for other formats (e.g. `webp`, `gif`, `svg`).
- **`build.js` → `main()`**: starts the browser once with
  `puppeteer.launch()`, then for every folder writes the HTML, opens it
  with `page.goto()` and saves it with `page.pdf()`.
  `preferCSSPageSize: true` uses the size from `@page`;
  `printBackground: true` keeps background colours and images, which
  browsers otherwise leave out when printing.
