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

const apiTimeout = 100 * 10000
app.use((req, res, next) => {
  // Set the timeout for all HTTP requests
  req.setTimeout(apiTimeout, () => {
    let err = new Error('Request Timeout')
    next(err)
  })
  // Set the server response timeout for all HTTP requests
  res.setTimeout(apiTimeout, () => {
    let err = new Error('Service Unavailable')
    next(err)
  })
  next()
})

app.get('/', (req, res) => {
  res.send('Hello B8ONE!')
})

server.applyMiddleware({ app, cors: true })

const port = process.env.PORT || 80

module.exports = app

if (process.env.NODE_ENV !== 'test') app.listen({ port }, () => console.log(`server running on port ${port}`))
