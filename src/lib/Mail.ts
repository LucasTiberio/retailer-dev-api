import nodemailer from 'nodemailer'
require('dotenv').config({ path: __dirname + '/.env' })

declare var process: {
  env: {
    MAIL_HOST: string
    MAIL_PORT: number
    MAIL_TEST_HOST: string
    MAIL_TEST_PORT: number
    NODE_ENV: 'test' | 'development' | 'production'
    MAIL_USER: string
    SEND_GRID_API_KEY: string
    MAIL_PASS: string
  }
}

const mailConfig: any = {
  host: process.env.NODE_ENV === 'test' ? process.env.MAIL_TEST_HOST : process.env.MAIL_HOST,
  port: process.env.NODE_ENV === 'test' ? Number(process.env.MAIL_TEST_PORT) || 0 : Number(process.env.MAIL_PORT) || 0,
  pool: true,
  rateLimit: true,
  maxConnections: 1,
  maxMessages: 3,
}

// if (process.env.NODE_ENV !== 'test') {
//   mailConfig.auth = {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   }
// }

export default nodemailer.createTransport(mailConfig)
