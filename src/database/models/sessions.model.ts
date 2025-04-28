import { conn } from "../config/connect";
import { deleteSessionsQuery, insertSession, selectAllWhatsappSession, selectWhatsappSession, selectWhatsappSessionPhoneNumber } from "../query/querys";

class sessionsWatsapp {
  getAllSessions(){
    return new Promise((resolve, reject) => {
      conn.query(selectAllWhatsappSession(), (err, result: any) => {
        if (err) {
          return reject(err);
        }
        if (result.length === 0) {
          return resolve({ success: false, data: null });
        }
        resolve({ success: true, data: result });
      });
    });
  }
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

  selectByUserID(user_id: number | string) {
    return new Promise((resolve, reject) => {
      conn.query(`SELECT * FROM whatsapp_sessions WHERE whatsapp_sessions.user_id = ?`, [user_id], (err, data:any)=>{
        if (err) {
          return reject(err)
        }
        if (data.length === 0) {
          return resolve({ success: false, data: null });
        }
        resolve({ success: true, data: data[0] });
      })
    })
  }

  deleteSession(id:number){
    return new Promise((resolve, reject) => {
      conn.query(
        deleteSessionsQuery(),
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

  updateSession({user_id, status} : { user_id: number; status: string }) {
    return new Promise((resolve, reject) => {
      conn.query(
        `UPDATE whatsapp_sessions SET status = ? WHERE whatsapp_sessions.user_id = ?`,
        [status, user_id], 
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