import puppeteer, { Browser, GoToOptions, Page, PDFOptions, PuppeteerLaunchOptions } from 'puppeteer';
import logger from './logger';

export default class Puppeteer {
  private browser!: Browser;
  private page!: Page;

  public async init(options?: PuppeteerLaunchOptions): Promise<void> {
    this.browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome-stable',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ...options,
    });
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