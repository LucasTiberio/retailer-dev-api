import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import server from './server';
import knexDatabase from './knex-database';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
    res.send('Hello B8ONE!');
});

app.get('/:shortenCode', async (req, res, next) => {

  const shortenCode = req.params.shortenCode;

  const [shortIdFoundOnDb] = await knexDatabase.knex('url_shorten')
  .where('url_code', shortenCode)
  .select('original_url', 'id');

  if(!shortIdFoundOnDb) throw new Error("Shortener url doesnt exists");

  await knexDatabase.knex('url_shorten')
  .where('id', shortIdFoundOnDb.id)
  .increment('count', 1)

  let hasPrefix = shortIdFoundOnDb.original_url.match(/https?:\/\//ig);

  res.redirect(301, hasPrefix.length ? shortIdFoundOnDb.original_url : `https://${shortIdFoundOnDb.original_url}`);

  res.end();
});

server.applyMiddleware({app, cors: true});

const port = process.env.PORT || 80;

module.exports = app

if(process.env.NODE_ENV !== 'test')
  app.listen({port}, () => console.log(`server running on port ${port}`));



