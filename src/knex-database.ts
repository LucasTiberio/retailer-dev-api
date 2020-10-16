// @ts-nocheck
import { config, configTest } from './knexfile';
import knex from "knex";
import knexCleaner from 'knex-cleaner';

const logger = require('pino')();

let knexConfig = knex(config);
let knexConfigTest = knex(configTest);

const options = {
	mode: 'truncate',
	restartIdentity: true, 
	ignoreTables : [ 'knex_migrations' , 'knex_migrations_lock' ]
}
  
const cleanMyTestDB = () => {
	return knexCleaner.clean(knexConfigTest, options);
};

export async function connectDB(retries = 5) {
	while (retries) {
		try {
			await knexConfig.raw("select 1 as result")
			.then((resp) => {
				logger.info(`Successfully connected to PostgreSQL`);
			});
			break;
		} catch (error) {
			logger.error("Couldn't connect to DB: ", error);

			retries -= 1
			logger.info(`retries left: ${retries}`)

			// wait 5 seconds
			await new Promise(res => setTimeout(res, 5000))
		}
	}
}

export default {
	knexConfig, 
	knexConfigTest,
	cleanMyTestDB,
	connectDB
};