# CSS: Text and Images

[Deutsch](README_DE.md)

Turns all folders in `source/` into one PDF: every folder starts on a new
page with the text from its `.txt` file (optional, any name), followed by
every image in the folder on a page of its own. A Node.js script fills an HTML template, and a headless Chrome
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

The source material lies in `source/`, one folder per section:

```
source/
  glacier/
    text.txt     optional, any name ending in .txt (the first one is used);
                 an empty line starts a new paragraph
    01.jpg       images (jpg, png), placed in alphabetical order
    02.jpg
  harbour/
    ...
```

In the repository folder, run

```sh
npm run build
```

The script creates `output/document.pdf` (A5, 12 mm margins, full-bleed images) with the
folders in alphabetical order. Replace the folders in `source/` with your own material and run
it again. An existing PDF is overwritten.

Next to the PDF lies the generated HTML file (`output/document.html`).
Open it in Chrome to work on `style.css`: reload after each change and use
*Print* (Cmd/Ctrl+P) to see the pages – no need to run the script every
time.

## Coding Help

- **`template.html`**: the document around the content, with the
  placeholder `{{items}}`. The stylesheet is linked as
  `../style.css`, because the generated HTML is saved in `output/`.
- **`style.css`**: the layout. `@page` sets paper size and margins (try
  `size: A4` or `size: 200mm 200mm`). The text area is moved down by
  3.75 pt, so the first baseline lies 16 pt below the 12 mm border, as in
  the Typst and LaTeX versions. `body` sets Helvetica 14/16 pt, `p` sets
  justified, hyphenated paragraphs with one empty line (16 pt) between
  them; `lang="de"` in `template.html` selects German hyphenation.
  `.item + .item` starts every folder after the first on a new page.
  `.image-page` starts every image on a new page with
  `break-before: page`; `page: image` gives it the named page
  `@page image` without margins. It is exactly as big as the page
  (148 × 210 mm for A5), and `object-fit: cover` scales the image to cover
  it, cutting off what sticks out. Use `object-fit: contain` to show the
  whole image. If you change the paper size, change the size of
  `.image-page` with it.
- **`build.js` → `buildItem()`**: builds one `<section class="item">`
  per folder. It reads the first `.txt` file of the folder
  (if there is none, the folder gets no text) and splits it at empty lines
  into `<p>` paragraphs.
  `escapeHtml()` replaces `& < >`, so the text is printed as it is. The
  images (`jpg`, `jpeg`, `png`, sorted by name) become one
  `<div class="image-page">` each. Extend the regular expression
  `/\.(jpe?g|png)$/i` for other formats (e.g. `webp`, `gif`, `svg`).
- **`build.js` → `main()`**: starts the browser once with
  `puppeteer.launch()`, lists the folders in `source/` (sorted by name), joins
  their sections into `template.html`, writes the HTML, opens it with
  `page.goto()` and saves it with `page.pdf()`.
  `preferCSSPageSize: true` uses the size from `@page`;
  `printBackground: true` keeps background colours and images, which
  browsers otherwise leave out when printing.
