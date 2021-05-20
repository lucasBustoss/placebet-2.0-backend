var dotenv = require("dotenv");
const path = 'src/.env';
dotenv.config({ path })

module.exports = {
  "type": "postgres",
  "host": 'localhost',
  "port": 5432,
  "username": 'postgres',
  "password": 'docker',
  "database": 'placebet',
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