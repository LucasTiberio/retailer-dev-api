import prometheusBundle from "express-prom-bundle";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import server from './server';
import { MONGO_URI } from './common/envs';
import database from './database';
import { connectDB } from './knex-database';

const logger = require('pino')();
const app = express();
const prometheusMiddleware = prometheusBundle({ 
  includeMethod: true, 
  includePath: true, 
  metricType: 'summary',
  promClient: {
    collectDefaultMetrics: { }
  }
});

try {
  database({ databaseUri: MONGO_URI });
  connectDB();
} catch (e) {
  logger.error(e.message)
  process.exit(0)
}

app.use(prometheusMiddleware);
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send('Hello B8ONE!')
})

// Health Check
app.get("/health", async (req, res) => {
  logger.info("Checking health Status");
  res.json({
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  });
});

server.applyMiddleware({ app, cors: true })

const port = process.env.PORT || 80

module.exports = app

if (process.env.NODE_ENV !== 'test') app.listen({ port }, () => logger.info(`Application running on port ${port}`))
