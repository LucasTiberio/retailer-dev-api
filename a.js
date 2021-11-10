require('dotenv').config({ path: __dirname + '/.env' })
const redis = require('./dist/lib/Redis')

redis.default.delAsync('WHITE_LABEL_96da5eff-617a-4fac-8e87-6e14aeb55a5f').then(console.log)