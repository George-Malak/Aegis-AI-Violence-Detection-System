const levels = ['error', 'warn', 'info', 'debug'];

function log(level, ...args) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}]`;
  // eslint-disable-next-line no-console
  console[level === 'debug' ? 'log' : level](prefix, ...args);
}

const logger = {};
levels.forEach((level) => {
  logger[level] = (...args) => log(level, ...args);
});

module.exports = logger;
