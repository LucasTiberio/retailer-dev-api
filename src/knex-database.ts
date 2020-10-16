// @ts-nocheck
import { config, configTest } from './knexfile';
import knex from "knex";
import knexCleaner from 'knex-cleaner';

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

export default {
	knexConfig, 
	knexConfigTest,
	cleanMyTestDB
};