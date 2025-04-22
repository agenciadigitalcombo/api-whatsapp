import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import usersModel from "../database/models/users.model";
import sessionsModel from "../database/models/sessions.model";
import webhookModel from "../database/models/webhook.model";
import { IUser } from "../types/types";


class WebhookController {
  async index(req: Request, res: Response): Promise<void> {
    const { url } = req.body;

    try {
      const header = req.headers.authorization?.replace("Bearer ", "");
      if (!header) {
        res.status(401).json({ success: false, message: "Token não fornecido ou inválido!" });
        return;
      }


      const token = jwt.decode(header) as jwt.JwtPayload | null;
      if (!token || !token.email) {
        res.status(401).json({ success: false, message: "Token inválido ou expirado!" });
        return;
      }

      const { email } = token;
      const userData = await usersModel.getByEmail(email) as { success: boolean; data: IUser };
      if (!userData.success || !userData.data?.id) {
        res.status(404).json({ success: false, message: "Usuário não encontrado!" });
        return;
      }

      const user_id = userData.data.id;
      const sessionData = await sessionsModel.selectByUserID(Number(user_id)) as { success: boolean, data: any };

      if (!sessionData.success || !sessionData.data?.phone_number) {
        res.status(404).json({
          success: false,
          message: "Nenhuma sessão do WhatsApp foi encontrada. Por favor, inicie a sessão!",
        });
        return;
      }

      const registerData = {
        user_id,
        url,
        is_active: true,
      };

      const create = await webhookModel.create(registerData);
      res.status(200).json(create);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro interno no servidor.",
        details: error,
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const { url, is_active } = req.body;

    try {
      const header = req.headers.authorization?.replace("Bearer ", "");
      if (!header) {
        res.status(401).json({ success: false, message: "Token não fornecido ou inválido!" });
        return;
      }

      const token = jwt.decode(header) as jwt.JwtPayload | null;
      if (!token || !token.email) {
        res.status(401).json({ success: false, message: "Token inválido ou expirado!" });
        return;
      }

      const { email } = token;
      const userData = await usersModel.getByEmail(email) as { success: boolean; data: IUser };
      if (!userData.success || !userData.data?.id) {
        res.status(404).json({ success: false, message: "Usuário não encontrado!" });
        return;
      }

      const user_id = userData.data.id;

      const updateResult = await webhookModel.update(user_id, { url, is_active });
      res.status(200).json(updateResult);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro ao atualizar webhook.",
        details: error,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const header = req.headers.authorization?.replace("Bearer ", "");
      if (!header) {
        res.status(401).json({ success: false, message: "Token não fornecido ou inválido!" });
        return;
      }

      const token = jwt.decode(header) as jwt.JwtPayload | null;
      if (!token || !token.email) {
        res.status(401).json({ success: false, message: "Token inválido ou expirado!" });
        return;
      }

      const { email } = token;
      const userData = await usersModel.getByEmail(email) as { success: boolean; data: IUser };
      if (!userData.success || !userData.data?.id) {
        res.status(404).json({ success: false, message: "Usuário não encontrado!" });
        return;
      }

      const user_id = userData.data.id;
      const deleteResult = await webhookModel.delete(user_id);
      res.status(200).json(deleteResult);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro ao deletar webhook.",
        details: error,
      });
    }
  }
}

export default new WebhookController();
