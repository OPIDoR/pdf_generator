import pino, { Logger } from "pino";
import puppeteer from 'puppeteer';

const logger:Logger = pino();


(async () => {

// Launch the browser and open a new blank page
const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();

// Navigate the page to a URL.
await page.goto('https://developer.chrome.com/', {
  waitUntil: 'networkidle2',
});

// Set screen size.
await page.pdf({
  path: '/pdf/test.pdf',
});


await browser.close();
})();
