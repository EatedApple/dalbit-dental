import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { slides } from './data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.join(__dirname, 'template.html');
const outputDir = path.join(__dirname, 'out');

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 2693, height: 505 },
  deviceScaleFactor: 1
});

for (let index = 0; index < slides.length; index += 1) {
  const slide = slides[index];
  const templateUrl = new URL(`?slide=${slide.id}`, pathToFileURL(templatePath));
  await page.goto(templateUrl.href, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__DALBIT_READY__ === true);
  await page.screenshot({
    path: path.join(outputDir, `${String(index + 1).padStart(2, '0')}-${slide.id}.png`),
    type: 'png'
  });
}

await browser.close();
console.log(`Rendered ${slides.length} slides to ${outputDir}`);
