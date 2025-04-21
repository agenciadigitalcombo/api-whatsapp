import { Request, Response } from "express";
import { audioFileTypes, documentFileTypes, imageFileTypes, videoFileTypes } from "../utils/filestype";
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

      const { telefone, mensagem } = req.body;

      if (!telefone || !mensagem) {
        res.status(401).json({ success: false, message: "Os Campos são requeridos!" });
        return;
      }

      const normalizarNumero = (numero: string): string => numero.replace(/\D/g, '');

      const validarNumeroWhatsappBR = (numero: string): boolean => {
        const numeroNormalizado = normalizarNumero(numero);
        return /^55\d{2}9\d{8}$/.test(numeroNormalizado);
      };


      if (!validarNumeroWhatsappBR) {
        res.status(401).json({
          success: false,
          message: "Número inserido de forma incorreta, envie no formato 255XXXXXXXXX sem caracteres especiais"
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

      // Se for só mensagem de texto
      const enviarMessage = await conn.sock.sendMessage(telefoneFormatado, { text: mensagem });

      if (enviarMessage?.status === 1) {
        res.status(200).json({ success: true, message: "Mensagem enviada com sucesso!" });
      } else {
        res.status(500).json({ success: false, message: "Mensagem não enviada!" });
      }

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      res.status(500).json({ success: false, message: "Erro interno no envio de mensagem.", details: error });
    }
  }

  /////------------enviar documentos 
  async sendFiles(req: Request, res: Response): Promise<void> {
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

    const { telefone, description } = req.body;

    const parsedCaption = (description || "").replace(/\\n/g, '\n');

    const normalizarNumero = (numero: string): string => numero.replace(/\D/g, '');
    const validarNumeroWhatsappBR = (numero: string): boolean => {
      const numeroNormalizado = normalizarNumero(numero);
      return /^55\d{2}9\d{8}$/.test(numeroNormalizado);
    };
    const telefoneFormatado = normalizarNumero(telefone) + "@s.whatsapp.net";
    if (!validarNumeroWhatsappBR) {
      res.status(401).json({
        success: false,
        message: "Número inserido de forma incorreta, envie no formato 255XXXXXXXXX sem caracteres especiais"
      });
      return;
    }

    if (!file) {
      res.status(400).json({
        success: false,
        message: "Arquivo não encontrado!"
      })
      return;
    }

    try {
      const fileBuffer = file.buffer;
      const fileType = file.mimetype;
      const salt = Math.floor(Math.random() * 3000);
      const newNameFile = `${salt}_${file.originalname}`;
      const pasta = path.resolve(__dirname, "../media");

      if (!fs.existsSync(pasta)) {
        fs.mkdirSync(pasta, { recursive: true, })
      }

      const filePath = path.resolve(__dirname, "../media", newNameFile);
      fs.writeFileSync(filePath, fileBuffer);

      const conn = await initWASocket(userId);
      const connection = await conn.connect();
      if (connection.connect === false) {
        res.status(401).json({
          success: false,
          connected: false,
          message: "Falha na conexão com a API, verifique a sua conexão e tente novamente!",
        })
        return;
      }

      if (!fs.existsSync(filePath)) {
        res.status(401).json({
          success: false,
          connected: false,
          message: "Arquivo nao encontrado, tente novamente!",
        })
        return;
      }

      if (imageFileTypes.includes(fileType)) {
        const send = await conn.sock.sendMessage(telefoneFormatado, {
          image: { url: filePath },
          caption: parsedCaption ? parsedCaption : "",
          ptv: false,
        })

        if (send.status !== 1) {
          fs.unlinkSync(filePath);
          res.status(401).json({
            success: false,
            message: "Erro no envio da imagem"
          })
          return;
        }
        res.status(200).json({
          success: true,
          message: "Imagem enviada com sucesso"
        })
        fs.unlinkSync(filePath);
        return;
      }

      if (videoFileTypes.includes(fileType)) {
        const sendVideo = await conn.sock.sendMessage(
          telefoneFormatado,
          {
            video: {
              url: filePath,
            },
            caption: parsedCaption ? parsedCaption : "",
            ptv: false
          }
        )
        if (sendVideo.status !== 1) {
          fs.unlinkSync(filePath);
          res.status(200).json({
            success: false,
            message: "Erro no envio do  vídeo"
          })
          return;
        }
       
        res.status(200).json({
          success: true,
          message: "Vídeo enviado com sucesso"
        })
        setTimeout(()=>{
          fs.unlinkSync(filePath);
        },3000)
        return;
      }

      if (documentFileTypes.includes(fileType)) {
        const sendVideo = await conn.sock.sendMessage(
          telefoneFormatado,
          {
            document: {
              url: filePath,
            },
            fileName: file.originalname,
            caption: parsedCaption ? parsedCaption : "",
            ptv: false
          }
        )

        if (sendVideo.status !== 1) {
          fs.unlinkSync(filePath);
          res.status(200).json({
            success: false,
            message: "Erro no envio do documento.."
          })
          return;
        }
        
        res.status(200).json({
          success: true,
          message: "Documento enviado com sucesso!"
        })
        setTimeout(()=>{
          fs.unlinkSync(filePath);
        },3000)
        return;
      }

      if (audioFileTypes.includes(fileType)) {
        const sendAudio = await conn.sock.sendMessage(telefoneFormatado, {
          audio: { url: filePath },
          mimetype: fileType,
          fileName: file.originalname,
          ptt: false, 
        });
      
        if (sendAudio.status !== 1) {
          res.status(401).json({
            success: false,
            message: "Erro no envio do áudio"
          });
          fs.unlinkSync(filePath);
          return;
        }
        
      
        res.status(200).json({
          success: true,
          message: "Áudio enviado com sucesso!"
        });
        setTimeout(()=>{
          fs.unlinkSync(filePath);
        },3000)
        return;
      }
      

      fs.unlinkSync(filePath);
      res.status(401).json({
        success: false,
        message: "Erro no envio do arquivo ou arquivo invalido!"
      })

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      res.status(500).json({ success: false, message: "Erro interno no envio do ficheiro.", details: error });
    }
  }
}

export default new messageController();

// 941196