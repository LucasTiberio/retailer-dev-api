require('dotenv')

const user = process.env.DB_USER
const password = process.env.DB_PASSWORD
const database = process.env.DB_DATABASE
const host = process.env.DB_HOST
const port = process.env.DB_PORT

const testUser = process.env.DB_TEST_USER
const testPassword = process.env.DB_TEST_PASSWORD
const testDatabase = process.env.DB_TEST_DATABASE
const testHost = process.env.DB_TEST_HOST
const testPort = process.env.DB_TEST_PORT

const config = {
  client: 'pg',
  connection: {
    user,
    password,
    host,
    port,
    database,
    ssl: true,
  },
  requestTimeout: 10000,
  connectionTimeout: 10000,
  migrations: {
    directory: __dirname + '/migrations',
  },
  seeds: {
    directory: __dirname + '/seeds',
  },
  pool: {
    max: 47,
    min: 1,
    afterCreate: function (connection, callback) {
      connection.query("SET TIME ZONE 'UTC'", function (err) {
        callback(err, connection)
      })
    },
  },
}

const testConfig = {
  client: 'pg',
  connection: {
    user: testUser,
    password: testPassword,
    database: testDatabase,
    host: testHost,
    port: testPort,
    ssl: false,
  },
  seeds: {
    directory: __dirname + '/seeds/test',
  },
  debug: false,
  requestTimeout: 5000,
  connectionTimeout: 5000,
  acquireTimeout: 5000,
  pool: {
    max: 22,
    min: 1,
    afterCreate: function (connection, callback) {
      connection.query("SET TIME ZONE 'UTC'", function (err) {
        callback(err, connection)
      })
    },
  },
}

const onUpdateTrigger = (table) => `
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();
`

module.exports.test = testConfig
module.exports.development = config
module.exports.production = config
module.exports.onUpdateTrigger = onUpdateTrigger
