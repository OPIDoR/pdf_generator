import fastify from "fastify";
import fastifyIO from "fastify-socket.io";

import Puppeteer from './lib/puppeteer';
import logger from './lib/logger';

import { name, version } from '../package.json';

const server = fastify();
server.register(fastifyIO);

const puppeteer = new Puppeteer();

server.get('/', (req, reply) => {
  reply.send({
    statusCode: 200,
    message: 'Ping result',
    data: { name, version },
  })
});

server.get('/test', async (req, reply) => {
  await puppeteer.newPage();

  const pdf = await puppeteer.generatePdfFromHtml('<h1>Hello World !</h1>', null, { format: 'A4' });

  await puppeteer.close();

  reply
    .type('application/pdf')
    .header('Content-Disposition', 'inline; filename="generated.pdf"')
    .send(pdf);
});

server.ready().then(() => {
  server.io.on('connection', (socket) => {
    // TODO: add logic take example on /test
  });
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
