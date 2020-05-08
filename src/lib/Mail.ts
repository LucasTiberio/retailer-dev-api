import nodemailer from 'nodemailer';
require('dotenv').config();

declare var process : {
	env: {
	  MAIL_HOST: string
	  MAIL_PORT: number
	  MAIL_USER: string
	  MAIL_PASS: string
	}
}

const mailConfig = {
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 0,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    },
    pool: true,
    rateLimit: true,
    maxConnections: 1,
    maxMessages: 3
};

export default nodemailer.createTransport(mailConfig);