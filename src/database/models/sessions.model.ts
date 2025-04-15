import { conn } from "../config/connect";
import { insertSession, selectWhatsappSession } from "../query/querys";

class sessionsWatsapp {
  getSessions(data: any) {
    return new Promise((resolve, reject) => {
      conn.query(selectWhatsappSession(), [data], (err, result: any) => {
        if (err) {
          return reject(err);
        }
        if (result.length === 0) {
          return resolve({ success: false, data: null });
        }
        resolve({ success: true, data: result[0] });
      });
    });
  }

  setSession(data: any) {
    return new Promise((resolve, reject) => {
      conn.query(
        insertSession(),
        [data.user_id, data.session_name, data.phone_number, data.status],
        (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  }
}

export default new sessionsWatsapp();