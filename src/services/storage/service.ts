require('dotenv')
import { Stream } from 'stream'
import { Transaction } from 'knex'
import knexDatabase from '../../knex-database'
import { IImageFromDB } from './types'
const AWS = require('aws-sdk');
const logger = require('pino')();

const imageAdapter = (record: IImageFromDB) => ({
  id: record.id,
  url: record.url,
  mimetype: record.mimetype,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
})

const spacesEndpoint = new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_END_POINT)

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DIGITAL_OCEAN_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.DIGITAL_OCEAN_AWS_SECRET_ACCESS_KEY,
  region: 'nyc3',
  params: {
    timeout: 10000,
  },
})

const getImageById = async (id: string, trx: Transaction) => {
  let query = (trx || knexDatabase)('image').where('id', id)
  if (trx) {
    query = query.transacting(trx)
  }

  const [image] = await query.select()

  return image
}

const getImageByUrl = async (url: string, trx: Transaction) => {
  let query = (trx || knexDatabase)('image').where('url', url)
  if (trx) {
    query = query.transacting(trx)
  }

  const [image] = await query.select()

  return image
}

const getFileByName = (filename: string) => {
  var getParams = {
    Bucket: process.env.DIGITAL_OCEAN_BUCKET_NAME,
    Key: filename,
  }

  return s3
    .getObject(getParams)
    .promise()
    .then((res: any) => res.Body.toString('utf-8'))
    .catch((err: Error) => {
      throw new Error(err.message)
    })
}

logger.info({ DIGITAL_OCEAN_BUCKET_NAME: process.env.DIGITAL_OCEAN_BUCKET_NAME });

const uploadImage = async (path: string, stream: Stream, mimetype: string, trx: Transaction) => {
  var params = {
    Key: path,
    Bucket: process.env.DIGITAL_OCEAN_BUCKET_NAME,
    Body: stream,
    ACL: 'public-read',
    ContentType: mimetype,
  }

  logger.info({ params });

  try {
    const image = await s3
      .upload(params)
      .promise()
      .then((res: any) => res.Location)
      .catch((err: Error) => {
        throw new Error(err.message)
      })

      logger.info({ image });

    let imageFound = await getImageByUrl(image, trx)

    logger.info({ imageFound });

    if (!imageFound) {
      let query = (trx || knexDatabase.knexConfig)('image')
      if (trx) {
        query = query.transacting(trx)
      }

      const [imageInserted] = await query.insert({ url: image, mimetype }).returning('*')

      imageFound = imageInserted
    }

    logger.info('depois', { imageFound });

    return imageAdapter(imageFound)
  } catch (error) {
    logger.error(error.message);
    throw new Error(error.message)
  }
}

const deleteImage = async (key: string) => {
  const params = { Bucket: process.env.DIGITAL_OCEAN_BUCKET_NAME, Key: key }

  try {
    await s3
      .deleteObject(params)
      .promise()
      .then((res: any) => res.Location)
      .catch((err: Error) => {
        logger.error(err.message);
        throw new Error(err.message)
      })

    return true
  } catch (error) {
    logger.error(error.message);
    throw new Error(error.message)
  }
}

export default {
  uploadImage,
  getImageById,
  deleteImage,
}
