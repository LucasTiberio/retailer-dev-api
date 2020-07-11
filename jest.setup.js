const knexDatabase = require('./src/knex-database').default
const OrganizationRulesService = require('./src/services/organization-rules/service');
jest.mock('./src/services/organization-rules/service')

global.beforeAll(async () => {
  await knexDatabase.cleanMyTestDB();
  await knexDatabase.knexTest.seed.run();
  const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
  getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({affiliateRules:{
      maxAnalysts: 5,
      maxSales: 5,
      maxTeammates: 5,
      maxTransactionTax: 5
  }})))
  
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
