const {
  MONGO_DB_HOSTNAME,
  MONGO_DB_PORT,
  MONGO_INITDB_ROOT_USERNAME,
  MONGO_INITDB_ROOT_PASSWORD,
  MONGO_INITDB_DATABASE,
} = process.env

const user = MONGO_INITDB_ROOT_USERNAME;
const pass = MONGO_INITDB_ROOT_PASSWORD;
const uri = MONGO_DB_HOSTNAME;
const port = MONGO_DB_PORT;
const dbname = MONGO_INITDB_DATABASE;

// const mongoUrl = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGO_DB_HOSTNAME}/${MONGO_INITDB_DATABASE}?authSource=${MONGO_INITDB_DATABASE}&w=1`;
// const mongoUrl = `mongodb://${MONGO_DB_HOSTNAME}/${MONGO_INITDB_DATABASE}`;

const mongoUrl = `mongodb://${user}:${pass}@${uri}:${port}/${dbname}?authSource=admin`;
console.log("MONGO_URL:", mongoUrl)
const MONGO_URL = mongoUrl;

export { MONGO_URL }
