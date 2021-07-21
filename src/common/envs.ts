import 'dotenv/config'

export const ENV = process.env.NODE_ENV || 'development'
export const PORT = process.env.PORT || 80

export const DB_USER = process.env.DB_USER
export const DB_PASSWORD = process.env.DB_PASSWORD
export const DB_DATABASE = process.env.DB_DATABASE
export const DB_HOST = process.env.DB_HOST
export const DB_PORT = Number(process.env.DB_PORT) || 5432

export const DB_USER_TEST = process.env.DB_TEST_USER || 'postgres'
export const DB_PASSWORD_TEST = process.env.DB_TEST_PASSWORD || 'dev!123'
export const DB_DATABASE_TEST = process.env.DB_TEST_DATABASE || 'plugone-test'
export const DB_HOST_TEST = process.env.DB_TEST_HOST || 'localhost'
export const DB_PORT_TEST = Number(process.env.DB_TEST_PORT) || 5432

export const JWT_SECRET = process.env.JWT_SECRET ?? ''
export const CREATE_ORGANIZATION_WITHOUT_INTEGRATION_SECRET = process.env.CREATE_ORGANIZATION_WITHOUT_INTEGRATION_SECRET ?? ''
export const LOJA_INTEGRADA_APPLICATION_KEY = process.env.LOJA_INTEGRADA_APPLICATION_KEY ?? ''
export const MONGO_URI = process.env.MONGO_URI ?? ''
