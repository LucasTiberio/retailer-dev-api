import { Stream } from "stream";
import { Transaction } from 'knex';
import knexDatabase from "../../knex-database";
import { IImageFromDB } from "./types";
const AWS = require('aws-sdk');

const imageAdapter = (record : IImageFromDB) => ({
  id: record.id,
  url: record.url,
  mimetype: record.mimetype,
  createdAt: record.created_at,
  updatedAt: record.updated_at
})

const spacesEndpoint = new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_END_POINT);

const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DIGITAL_OCEAN_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.DIGITAL_OCEAN_AWS_SECRET_ACCESS_KEY,
    region: "nyc3",
    params: {
      timeout: 10000
    }
});

const getImageById = async (id: string, trx: Transaction) => {
  let query = (trx || knexDatabase)('image').where('id', id);
  if(trx){ query = query.transacting(trx);}

  const [image] = await query
    .select();

  return image
}

const getImageByUrl = async (url: string, trx: Transaction) => {
  let query = (trx || knexDatabase)('image').where('url', url);
  if(trx){ query = query.transacting(trx);}

  const [image] = await query.select();

  return image
}

const getFileByName = (filename: string) => {
  var getParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: filename
  }

  return s3.getObject(getParams).promise()
    .then((res: any) => res.Body.toString('utf-8'))
    .catch((err : Error) => { throw new Error(err.message) })
}

const uploadImage = async (path : string, stream: Stream, mimetype: string, trx: Transaction) => {

  var params = {
    Key:    path,
    Bucket: process.env.BUCKET_NAME,
    Body:   stream,
    ACL: 'public-read',
    ContentType: mimetype
  };

  try {

    const image = await s3.upload(params)
      .promise()
      .then((res: any) => res.Location)
      .catch((err: Error) => { throw new Error(err.message)});

    let imageFound = await getImageByUrl(image, trx);

    if(!imageFound){

      let query = (trx || knexDatabase.knex)('image');
      if(trx){ query = query.transacting(trx);}
  
      const [imageInserted] = await query
        .insert({ url: image, mimetype })
        .returning('*');

      imageFound = imageInserted;
    }


    return imageAdapter(imageFound);

  } catch (error) {
    throw new Error(error.message)
  }
  
};


export default {
  uploadImage,
  getImageById
};
