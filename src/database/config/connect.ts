import mysql from "mysql2";
import { AppEnv } from "../../config/env";

const conn = mysql.createConnection({
  host: AppEnv.dbHost,
  user: AppEnv.dbUsername,
  password: AppEnv.dbPassword,
  database: AppEnv.dbName
})

conn.connect((err) => {
  if (err) {
    console.log("Erro ao conectar com o banco de dados");
  }
})

export { conn };