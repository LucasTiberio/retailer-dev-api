import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import server from './server'
import { MONGO_URI } from './common/envs'
import database from './database'

const app = express()

try {
  database({ databaseUri: MONGO_URI })
} catch (e) {
  console.log(e.message)
  process.exit(0)
}

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send('Hello B8ONE!')
})

server.applyMiddleware({ app, cors: true })

const port = process.env.PORT || 80

module.exports = app

if (process.env.NODE_ENV !== 'test') app.listen({ port }, () => console.log(`server running on port ${port}`))
