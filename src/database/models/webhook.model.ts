import { IWebhook } from "../../types/types";
import { conn } from "../config/connect";

class WebhookModel {
  create(data: IWebhook) {
    return new Promise((resolve, reject) => {
      conn.query(
        `SELECT * FROM webhooks WHERE user_id = ?`,
        [data.user_id],
        (err, result: any) => {
          if (err) {
            return reject({
              success: false,
              message: "Erro ao verificar webhook existente.",
              error: err,
            });
          }

          if (result.length > 0) {
            return resolve({
              success: false,
              data: null,
              message: "Este usuário já está registrado no sistema!",
            });
          }

          conn.query(
            `INSERT INTO webhooks (user_id, url, is_active) VALUES (?, ?, ?)`,
            [data.user_id, data.url, data.is_active],
            (err, result: any) => {
              if (err) {
                return reject({
                  success: false,
                  message: "Erro ao inserir webhook.",
                  error: err,
                });
              }

              resolve({
                success: true,
                message: "Webhook configurado com sucesso!",
              });
            }
          );
        }
      );
    });
  }

  read(user_id: number) {
    return new Promise((resolve, reject) => {
      conn.query(
        `SELECT * FROM webhooks WHERE user_id = ?`,
        [user_id],
        (err, data: any[]) => {
          if (err) {
            return reject({
              success: false,
              message: "Erro ao buscar o webhook.",
              error: err,
            });
          }
          resolve({ success: true, data: data[0] });
        }
      );
    });
  }
  

  update(user_id: number, data: Partial<IWebhook>) {
    return new Promise((resolve, reject) => {
      conn.query(
        `UPDATE webhooks SET url = ?, is_active = ? WHERE user_id = ?`,
        [data.url, data.is_active, user_id],
        (err, result: any) => {
          if (err) {
            return reject({
              success: false,
              message: "Erro ao atualizar o webhook.",
              error: err,
            });
          }

          resolve({
            success: true,
            message: "Webhook atualizado com sucesso!",
          });
        }
      );
    });
  }

  delete(user_id: number) {
    return new Promise((resolve, reject) => {
      conn.query(
        `DELETE FROM webhooks WHERE user_id = ?`,
        [user_id],
        (err, result: any) => {
          if (err) {
            return reject({
              success: false,
              message: "Erro ao deletar o webhook.",
              error: err,
            });
          }

          resolve({
            success: true,
            message: "Webhook deletado com sucesso!",
          });
        }
      );
    });
  }
}

export default new WebhookModel();
