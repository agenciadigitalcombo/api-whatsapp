import type { Request, Response } from "express";
import { initWASocket } from "../services/bot/bot";
import { logger } from "../utils/logger";
import QR from "qrcode";
import migrations from "../database/migrations/migrations";
import jwt from "jsonwebtoken";
import usersModel from "../database/models/users.model";
import sessionsWatsapp from "../database/models/sessions.model";
import sessionVerify from "../middleware/sessionVerify";
import { StartConnection } from "../services/bot/connect";
const sessions = new Map<string, Awaited<ReturnType<typeof StartConnection>>>();
class BotController {
  async connect(req: Request, res: Response): Promise<void> {
    try {
      const { authorization } = req.headers;
      const token: string | undefined = authorization?.replace("Bearer ", "");
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Token invalido"
        })
        return;
      }
      const getId_user: any = jwt.decode(token);
      const { userId } = getId_user;
      const conn = await StartConnection(userId);
      const connect = await conn.connect();

      if (!connect.connect) {
        if (connect.qrcode) {
          const qrCodeImage = await QR.toDataURL(connect.qrcode);
          res.status(200).json({
            success: true,
            connected: false,
            message: "Scanneie o QR code",
            qr: connect.qrcode,
            qrcodeImage: qrCodeImage
          })
          return;
        }
        res.status(200).json({
          message: "Conexão fechada tente reconectar novamente",
          success: true,
          connected: false
        }
        );
        return;
      }
      res.status(200).json({ message: "Whatsapp conectado com sucesso!", success: true, connected: true });
    } catch (error) {
      logger.error("Error in connect method:", error);
      res.status(500).json({ success: false, message: "Falha na conexao" });
    }
  }

  async getConnection(req: Request, res: Response): Promise<void> {
    try {
      const { authorization } = req.headers;
      const token: string | undefined = authorization?.replace("Bearer ", "");

      if (!token) {
        res.status(401).json({
          success: false,
          message: "Token inválido"
        });
        return;
      }

      const getId_user: any = jwt.decode(token);
      const { userId, email } = getId_user || {};

      if (!userId || !email) {
        res.status(401).json({
          success: false,
          message: "Token inválido ou mal formatado"
        });
        return;
      }

      const conn = await initWASocket(userId);
      const connect = await conn.connect();
      if (!connect?.connect) {
        res.status(200).json({
          success: true,
          connected: false,
          message: "Usuário desconectado!",
        });
        return;
      }

      const dataUser: any = await usersModel.getByEmail(email);

      if (!dataUser.data.id) {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado no sistema"
        });
        return;
      }

      const sessionData = {
        user_id: dataUser.data.id,
        session_name: userId,
        phone_number: conn?.sock?.user?.id || null,
        status: "conectado"
      };

      const sessionVerufy = await sessionVerify(sessionData.phone_number.toString());

      if (!sessionVerufy) {
        res.status(200).json({
          success: true,
          connected: true,
          message: "Houve um erro na api... encontramos registros com o mesmo contacto registrado na api!"
        });
        return;
      }
      
      const sessionUser: any = await sessionsWatsapp.getSessions(userId);

      if (!sessionUser.success && sessionData.phone_number !== null) {
        await sessionsWatsapp.setSession(sessionData);
      }

      res.status(200).json({
        success: true,
        connected: true,
        message: "Whatsapp conectado!"
      });
    } catch (error) {
      logger.error("Error in connect method:", error);
      res.status(500).json({
        success: false,
        message: "Falha na conexão",
        details: error,
      });
    }
  }
}
export default new BotController();
