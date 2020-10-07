import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import server from './server';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
    res.send('Hello B8ONE!');
});

app.get("/health", async (req, res) => {
  console.log("Checking health Status");
  res.json({ status: "UP" });
});

server.applyMiddleware({app, cors: true});

const port = process.env.PORT || 80;

module.exports = app

if(process.env.NODE_ENV !== 'test')
  app.listen({port}, () => console.log(`server running on port ${port}`));



