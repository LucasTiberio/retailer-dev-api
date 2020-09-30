import 'dotenv/config'
export const JWT_SECRET = process.env.JWT_SECRET ?? ''
export const CREATE_ORGANIZATION_WITHOUT_INTEGRATION_SECRET = process.env.CREATE_ORGANIZATION_WITHOUT_INTEGRATION_SECRET ?? ''
export const MONGO_URI = process.env.MONGO_URI ?? ''
