// @ts-nocheck
require('dotenv');
import config from '../knexfile';
import knexCleaner from 'knex-cleaner';

declare var process : {
	env: {
	  NODE_ENV: "production" | "development" | "test"
	}
}

let knex = require('knex')(config[process.env.NODE_ENV || 'test']);
let knexTest = require('knex')(config.test);

const options = {
	mode: 'truncate',
	restartIdentity: true, 
	ignoreTables : [ 'knex_migrations' , 'knex_migrations_lock' ]
}
  
const cleanMyTestDB = () => {
	return knexCleaner.clean(knexTest, options);
};

export default {
	knex, 
	cleanMyTestDB,
	knexTest
};