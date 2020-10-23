// @ts-nocheck
import { config, configTest } from './knexfile';
import knex from "knex";
import knexCleaner from 'knex-cleaner';

const logger = require('pino')();

const promClient = require('prom-client');
const dbPgUp = new promClient.Gauge({name: 'pg_connect_up', help: 'PostgreSQL Connected help'});

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

export async function connectPostgres(retries = 5) {
	while (retries) {
		try {
			await knexConfig.raw("select 1 as result")
			.then((resp) => {
				dbPgUp.set(1);
				logger.info(`Successfully connected to PostgreSQL`);
			});
			break;
		} catch (error) {
			logger.error(`Couldn't connect to DB: ${error}`);

			retries -= 1
			logger.info(`retries left: ${retries}`);

			if( retries == 0 ) {
				dbPgUp.set(0);
				logger.error(`Unsuccessfully connecting to PostgreSQL`);
				return process.exit(1);
			}
			// wait 5 seconds
			await new Promise(res => setTimeout(res, 5000));
		}
	}
}

export default {
	knexConfig, 
	knexConfigTest,
	cleanMyTestDB,
	connectPostgres
};