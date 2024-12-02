import fs from 'fs';
import path from 'path';
import puppeteer, { Browser, Page, PDFOptions, PuppeteerLaunchOptions } from 'puppeteer';
import logger from './logger';

const pdfDir = path.resolve(__dirname, '..', '..', 'pdf');

export default class Puppeteer {
  private browser!: Browser;
  private page!: Page;

  public async init(options?: PuppeteerLaunchOptions): Promise<void> {
    this.browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome-stable',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ...options,
    });
    
  try {
    await fs.statSync(pdfDir);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdirSync(pdfDir);
    } else {
      throw new Error(err);
    }
  }
  }

  public async newPage(): Promise<Page> {
    this.page = await this.browser.newPage();
    return this.page;
  }

  public async generatePdfFromHtml(htmlContent: string, fileName?: string, options?: PDFOptions): Promise<Uint8Array> {
    let pdf: Uint8Array;
    try {
      await this.page.setContent(htmlContent, {
        waitUntil: 'domcontentloaded',
      });

      const opts: PDFOptions = {
        ...options,
        format: 'A4',
      }

      if (fileName) {
        opts['path'] = `/app/pdf/${fileName}.pdf`;
      }

      pdf = await this.page.pdf(opts);
    } catch (error) {
      logger.error(`PDF [${fileName}].pdf generation failed !`);
      throw new Error(error);
    }

    logger.info(`PDF [${fileName}].pdf generated successfully`);
    return pdf;
  }

  public async close(): Promise<void> {
    return this.browser.close();
  }
}
