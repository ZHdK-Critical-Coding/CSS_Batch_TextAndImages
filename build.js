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

// Builds the HTML for one folder in source/: a section with text and images
function buildItem(item) {
  const folder = path.join(sourceDir, item);

  // text (optional): the first .txt file of the folder, whatever its name.
  // The whole file is body text, an empty line starts a new paragraph.
  const textFile = fs.readdirSync(folder).filter((name) => /\.txt$/i.test(name)).sort()[0];
  let body = '';
  if (textFile) {
    const text = fs.readFileSync(path.join(folder, textFile), 'utf8').trim();
    body = text.split(/\r?\n\s*\r?\n/).map((p) => `<p>${escapeHtml(p)}</p>`).join('\n    ');
  }

  // all jpg/png files, sorted by name
  const images = fs.readdirSync(folder)
    .filter((name) => /\.(jpe?g|png)$/i.test(name))
    .sort()
    .map((name) => `<div class="image-page"><img src="../source/${encodeURIComponent(item)}/${encodeURIComponent(name)}"></div>`)
    .join('\n    ');

  return `<section class="item">
    ${body}
    ${images}
  </section>`;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // every folder in source/, sorted by name
  const items = fs.readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  // The HTML is kept in output/ – open it in a browser to check the layout
  const htmlFile = path.join(outputDir, 'document.html');
  fs.writeFileSync(htmlFile, template.replace('{{items}}', items.map(buildItem).join('\n  ')));

  await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'load' });
  await page.pdf({
    path: path.join(outputDir, 'document.pdf'),
    preferCSSPageSize: true, // use @page from style.css
    printBackground: true,
  });
  console.log('source/ -> output/document.pdf');

  await browser.close();
}

main();
