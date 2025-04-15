import { IUser } from "../../types/types";
import { conn } from "../config/connect";
import { insertUserQuery, selectByEmail } from "../query/querys";

class usersModel {
  create(data: IUser) {
    return new Promise((resolve, reject) => {
      conn.query(selectByEmail(), [data.email], (err, queryResult: any) => {
        if (err) return reject(err);
        if (queryResult.length > 0) {
          return resolve({ success: false, message: "Esse registro já existe no banco de dados!" });
        }

        conn.query(insertUserQuery(), [data.name, data.email, data.password], (err, result:any) => {
          if (err) return reject(err);
          return resolve({ success: true, message: "Usuário criado com sucesso!", userId: result.insertId });
        });
      });
    });
  }

  getByEmail(email: string) {
    return new Promise((resolve, reject) => {
      conn.query(selectByEmail(), [email], (err, result: any) => {
        if (err) return reject(err);
        
        if (result.length === 0) {
          return resolve({ success: false, data: null })
        }
        return resolve({ success: true, data: result[0] });
      });
    })
  }
}

export default new usersModel();
