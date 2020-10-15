import mongoose from 'mongoose'
import { DBInput } from './types'

const logger = require('pino')()

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
        return logger.info(`Successfully connected to MongoDB`)
      })
      .catch((err: Error) => {
        logger.error(`Error connecting to database :`, err.message)

        return process.exit(1)
      })
  }

  connect()
}
