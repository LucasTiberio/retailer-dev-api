import mongoose from 'mongoose'
import { DBInput } from './types'

const logger = require('pino')(); 
const promClient = require('prom-client');
const dbMongoUp = new promClient.Gauge({name: 'mongo_connect_up', help: 'Mongo Connected help'});

export default ({ databaseUri }: DBInput) => {
  const connect = () => {
    mongoose
      .connect(databaseUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      })
      .then(() => {
        dbMongoUp.set(1);
        return logger.info(`Successfully connected to MongoDB`);
      })
      .catch((err: Error) => {
        dbMongoUp.set(0);
        logger.error(`Error connecting to database : ${err.message}`)
        logger.error(`Unsuccessfully connecting to MongoDB`);

        return process.exit(1);
      })
  }

  connect();
}
