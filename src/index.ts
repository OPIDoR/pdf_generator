import fastify from "fastify";

import Puppeteer from './lib/puppeteer';
import logger from './lib/logger';

import { name, version } from '../package.json';

const server = fastify();

const puppeteer = new Puppeteer();

server.get('/', (req, reply) => {
  reply.send({
    statusCode: 200,
    message: 'Ping result',
    data: { name, version },
  })
});

server.post('/pdf', async (req, reply) => {
  await puppeteer.newPage();

  const htmlBody = req.body['html'];

  const pdf = await puppeteer.generatePdfFromHtml(htmlBody, 'test', { format: 'A4' });

  await puppeteer.close();

  reply
    .type('application/pdf')
    .header('Content-Disposition', 'inline; filename="generated.pdf"')
    .send(pdf);
});


server.listen({ port: 3000, host: '0.0.0.0' }, async (err, address) => {
  if (err) {
    await puppeteer.close();
    logger.error(err);
    process.exit(1);
  }
  logger.info('Server listening on http://localhost:3000');

  await puppeteer.init();
});
