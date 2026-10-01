const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer');

const sourceDir = path.join(__dirname, 'source');
const outputDir = path.join(__dirname, 'output');
const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

// & < > would be read as HTML, so they are replaced by entities
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Builds the HTML for one folder in source/
function buildHtml(item) {
  const folder = path.join(sourceDir, item);

  // text.txt: the first line is the title, an empty line starts a new paragraph
  const lines = fs.readFileSync(path.join(folder, 'text.txt'), 'utf8').trim().split(/\r?\n/);
  const title = lines[0];
  const paragraphs = lines.slice(1).join('\n').trim().split(/\n\s*\n/);
  const body = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n    ');

  // all jpg/png files, sorted by name
  const images = fs.readdirSync(folder)
    .filter((name) => /\.(jpe?g|png)$/i.test(name))
    .sort()
    .map((name) => `<div class="image-page"><img src="../source/${encodeURIComponent(item)}/${encodeURIComponent(name)}"></div>`)
    .join('\n  ');

  return template
    .replaceAll('{{title}}', escapeHtml(title))
    .replace('{{body}}', body)
    .replace('{{images}}', images);
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const items = fs.readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const item of items) {
    // The HTML is kept in output/ – open it in a browser to check the layout
    const htmlFile = path.join(outputDir, `${item}.html`);
    fs.writeFileSync(htmlFile, buildHtml(item));

    await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'load' });
    await page.pdf({
      path: path.join(outputDir, `${item}.pdf`),
      preferCSSPageSize: true, // use @page from style.css
      printBackground: true,
    });
    console.log(`source/${item} -> output/${item}.pdf`);
  }

  await browser.close();
}

main();
