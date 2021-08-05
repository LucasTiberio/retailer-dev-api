import Axios from 'axios'
import { NextFunction, Request, Response } from 'express'
import knexDatabase from '../knex-database'
import StorageService from '../services/storage/service'

export default async (req: Request, res: Response, next: NextFunction) => {
  await knexDatabase.knexConfig.transaction(async (trx) => {
    const { url, filename } = req.query

    const token = req.headers['x-plugone-api-token']

    // if (!token) {
    //   res.status(400).send({ error: 'Bad request: Token must be provided' })
    //   return
    // }

    if (!url) {
      res.status(400).send({ error: 'invalid url' })
    }

    const file = await StorageService.getImageByUrl(String(url), trx);
    const adaptedFile = StorageService.imageAdapter(file)

    if (!file) {
      res.status(404).send({ error: 'url not found' })
    }

    const [,ext] = adaptedFile.mimetype.split('/')

    const { data } = await Axios.get(String(url), {
      responseType: 'arraybuffer'
    })

    res.setHeader("Content-Type", adaptedFile.mimetype)
    res.setHeader("Content-Disposition", `attachment; filename=${filename}.${ext}`)

    res.send(Buffer.from(data, 'binary'))
  })

  next()
}