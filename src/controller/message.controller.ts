import { Request, Response } from "express";
import { imageFileTypes } from "../utils/filestype";
import { initWASocket } from "../services/bot/bot";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

class messageController {
  async send(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      const { authorization } = req.headers;
      const token: string | undefined = authorization?.replace("Bearer ", "");

      if (!token) {
        res.status(401).json({ success: false, message: "Token inválido" });
        return;
      }

      const getId_user: any = jwt.decode(token);
      const { userId, email } = getId_user || {};

      if (!userId || !email) {
        res.status(401).json({ success: false, message: "Token inválido ou mal formatado" });
        return;
      }

      const { telefone, mensagem, description } = req.body;

      const normalizarNumero = (numero: string): string => numero.replace(/\D/g, '');

      const validarNumeroWhatsappBR = (numero: string): boolean => {
        const numeroNormalizado = normalizarNumero(numero);
        return /^55\d{2}9\d{8}$/.test(numeroNormalizado);  
      };
      

      if (!validarNumeroWhatsappBR) {
        res.status(401).json({
          success: false,
          message: "Número inserido de forma incorreta, envie no formato 244XXXXXXXXX sem caracteres especiais"
        });
        return;
      }

      const conn = await initWASocket(userId);
      const connect = await conn.connect();

      if (!connect.connect) {
        res.status(400).json({ success: false, message: "Usuário desconectado!" });
        return;
      }

      const telefoneFormatado = normalizarNumero(telefone) + "@s.whatsapp.net";

      // Se for imagem
      if (file) {
        const fileBuffer = file.buffer;
        const fileType = file.mimetype;

        if (imageFileTypes.includes(fileType)) {
          const salt = Math.floor(Math.random() * 3000);
          const newNameFile = `${salt}_${file.originalname}`;
          const pasta = path.resolve(__dirname, "../media");

          if (!fs.existsSync(pasta)) {
            fs.mkdirSync(pasta, { recursive: true, })
          }

          const filePath = path.resolve(__dirname, "../media", newNameFile);
           
          fs.writeFileSync(filePath, fileBuffer);

          if (fs.existsSync(filePath)) {
            const sendFilImage = await conn.sock.sendMessage(telefoneFormatado, {
              image: { url: filePath },
              caption: description || "",
              ptv: false,
            });

            if (sendFilImage?.status === 1) {
              res.status(200).json({ success: true, message: "Imagem enviada com sucesso!" });
              fs.unlinkSync(filePath)
              setTimeout(async () => {
                await initWASocket(userId);
                conn.connect();
              }, 1000);
              return;
            }
          }

          res.status(500).json({ success: false, message: "Erro ao enviar imagem ou arquivo não localizado." });
          return;
        }
      }

      // Se for só mensagem de texto
      const enviarMessage = await conn.sock.sendMessage(telefoneFormatado, { text: mensagem });

      if (enviarMessage?.status === 1) {
        res.status(200).json({ success: true, message: "Mensagem enviada com sucesso!" });
      } else {
        res.status(500).json({ success: false, message: "Mensagem não enviada!" });
      }

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      res.status(500).json({ success: false, message: "Erro interno no envio de mensagem." });
    }
  }
}

export default new messageController();
