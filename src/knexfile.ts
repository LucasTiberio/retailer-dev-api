import "dotenv/config";
import Knex from "knex";
import { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT,
         DB_HOST_TEST, DB_USER_TEST, DB_PASSWORD_TEST, DB_DATABASE_TEST, DB_PORT_TEST } from "./common/envs"

const logger = require('pino')();

export const config: Knex.Config = {
  client: "pg",
  connection: {
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: DB_DATABASE
  },  
  debug: true,
  migrations: {
    directory: __dirname + '/migrations',
  },
  seeds: {
    directory: __dirname + '/seeds/test',
  },
  pool: {
    max: 12,
    min: 1,
    afterCreate: (
      connection: any,
      callback: (err: any, connection: any) => void
    ) => {
      connection.query("SET TIME ZONE 'UTC'", (err: any) => {
        callback(err, connection);
      });
    },
  },
  log: {
    warn(message) {
      logger.warn(message);
    },
    error(message) {
      logger.error(message);
    },
    deprecate(message) {
    },
    debug(message) {
      logger.info(message);
    },
  }  
};

export const configTest: Knex.Config = {
  client: "pg",
  connection: {
    user: DB_USER_TEST,
    password: DB_PASSWORD_TEST,
    host: DB_HOST_TEST,
    port: DB_PORT_TEST,
    database: DB_DATABASE_TEST
  },  
  migrations: {
    directory: __dirname + '/migrations',
  },
  seeds: {
    directory: __dirname + '/seeds/test',
  },
  pool: {
    max: 12,
    min: 1,
    afterCreate: (
      connection: any,
      callback: (err: any, connection: any) => void
    ) => {
      connection.query("SET TIME ZONE 'UTC'", (err: any) => {
        callback(err, connection);
      });
    },
  },
};

export const onUpdateTrigger = (table: any) => `
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();
`