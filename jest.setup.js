jest.setTimeout(30000);
global.console = {
  warn: jest.fn(),
  error: console.error,
  log: console.log,
  info: console.info,
  debug: console.debug,
};
