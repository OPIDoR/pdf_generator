import fs from 'fs';
import path from 'path';
import pino, { Logger } from 'pino';

const logDir = path.resolve(__dirname, '..', '..', 'log');

(async () => {
  try {
    await fs.statSync(logDir);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdirSync(logDir);
    } else {
      throw new Error(err);
    }
  }
})();

const logger: Logger = pino({}, pino.multistream([
  { stream: fs.createWriteStream(path.resolve(logDir, 'access.log'), { flags: 'a' }) },
  { stream: process.stdout },
  { level: 'error', stream: fs.createWriteStream(path.resolve(logDir, 'error.log'), { flags: 'a' }) },
]));

export default logger;
