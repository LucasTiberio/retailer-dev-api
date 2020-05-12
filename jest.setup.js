const knexDatabase = require('./src/knex-database').default
global.beforeAll(async () => {
  await knexDatabase.cleanMyTestDB();
  await knexDatabase.knexTest.seed.run();
})
global.afterAll(async () => {
  await knexDatabase.cleanMyTestDB();
})
jest.setTimeout(30000);
global.console = {
  warn: jest.fn(),
  error: console.error,
  log: console.log,
  info: console.info,
  debug: console.debug,
};
