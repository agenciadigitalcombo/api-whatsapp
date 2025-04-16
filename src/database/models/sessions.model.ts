import { conn } from "../config/connect";
import { insertSession, selectWhatsappSession, selectWhatsappSessionPhoneNumber } from "../query/querys";

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

  getSessionNumber(phone_number: string) {
    return new Promise((resolve, reject) => {
      conn.query(selectWhatsappSessionPhoneNumber(), [phone_number], (err, result: any) => {
        if (err) {
          return reject(err);
        }
        if (result.length === 0) {
          return resolve({ success: false, data: null });
        }
        resolve({ success: true, data: result });
      });
    })
  }

  deleteSession(id:number){
    return new Promise((resolve, reject) => {
      conn.query(
          `DELETE FROM whatsapp_sessions WHERE whatsapp_sessions.id = ?`,
        [id],
        (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(true);
        }
      );
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