import env from "dotenv";
env.config();
const AppEnv = {
  port: process.env.PORT,
  secretKey: process.env.SECRET_KEY,
  dbPort: process.env.DB_PORT,
  dbUsername: process.env.DB_USERNAME,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbPassword: process.env.DB_PASSWORD,
  baseUri:process.env.BASE_URI,
}
export { AppEnv }