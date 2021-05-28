var dotenv = require("dotenv");
const path = 'src/.env';
dotenv.config({ path })

module.exports = {
  "type": "postgres",
  "host": process.env.TYPEORM_HOST,
  "port": process.env.TYPEORM_PORT,
  "username": process.env.TYPEORM_USER,
  "password": process.env.TYPEORM_PASSWORD,
  "database": process.env.TYPEORM_DATABASE,
  "ssl": process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  "entities": [
    process.env.NODE_ENV === 'production' ? "./dist/models/*.js" : "./src/models/*.ts"
  ],
  "migrations": [
    process.env.NODE_ENV === 'production' ? "./dist/database/migrations/*.js" : "./src/database/migrations/*.ts"
  ],
  "cli": {
    "migrationsDir": process.env.NODE_ENV === 'production' ? "./dist/database/migrations" : "./src/database/migrations"
  }
}