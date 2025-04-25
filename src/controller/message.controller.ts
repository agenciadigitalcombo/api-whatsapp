import { Request, Response } from "express";
import { audioFileTypes, documentFileTypes, imageFileTypes, videoFileTypes } from "../utils/filestype";
import { initWASocket } from "../services/bot/bot";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { getLinkPreview } from "link-preview-js";
import { CustomLinkPreview } from "../types/types";
import getImageBuffer from "../utils/getImageURL";




class messageController {
  async send(req: Request, res: Response): Promise<void> {
    try {

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

      const links = mensagem.match(/(https?:\/\/[^\s]+)/g);

      const linkPreview: CustomLinkPreview | null = links
      ? await getLinkPreview(links[0]) as CustomLinkPreview
      : null;

      const thumbnailBuffer = linkPreview && linkPreview.images && linkPreview.images[0]
      ? await getImageBuffer(linkPreview.images[0])
      : null;
        
      //--Dados para a preview 
      const previewLinkData = links ?  {
        externalAdReply: {
          title: linkPreview && linkPreview.title ? linkPreview.title ?? "Url sem titulo" : "Sem título" ,
          body: 'Clique e veja o site',
          thumbnailUrl: linkPreview && linkPreview.images ? linkPreview.images[0] ?? linkPreview?.images : null,
          thumbnail: thumbnailBuffer,
          mediaType: 1,
          previewType: 'VIDEO',
          renderLargerThumbnail: true,
          sourceUrl: linkPreview ? linkPreview.url ?? null : null,
          url: linkPreview && linkPreview.url ?  linkPreview.url ?? null : null,
        }
      } : null;


      const telefoneFormatado = normalizarNumero(telefone) + "@s.whatsapp.net";
      // Se for só mensagem de texto
      const enviarMessage = await conn.sock.sendMessage(telefoneFormatado, {
        text: mensagem.toString(),
        contextInfo: previewLinkData
      });
      
      if (enviarMessage?.status === 1) {
        res.status(200).json({ success: true, message: "Mensagem enviada com sucesso!", links:links});
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

    try {

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

      const { telefone, description } = req.body;
      const file = req.file;
      const telefoneFormatado = normalizarNumero(telefone) + "@s.whatsapp.net";
      const parsedCaption = (description || "").replace(/\\n/g, '\n');


      const conn = await initWASocket(userId);
      const connect = await conn.connect();

      if (connect.connect === false) {
        res.status(401).json({
          success: false,
          connected: false,
          message: ""
        })
        return;
      }


      if (!file) {
        res.status(400).json({
          success: false,
          message: "Arquivo não encontrado!"
        })
        return;
      }


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


      if (!fs.existsSync(filePath)) {
        res.status(401).json({
          success: false,
          connected: false,
          message: "Arquivo nao encontrado, tente novamente!",
        })
        return;
      }
      //ENVIO DE IMAGENS 
      if (imageFileTypes.includes(fileType)) {

        let send = await conn.sock.sendMessage(telefoneFormatado,
          {
            image: { url: filePath },
            caption: parsedCaption ? parsedCaption : "",
            ptv: false,
            linkPreview: true
          }
        );

        if (send.status !== 1) {
          res.status(401).json({
            success: false,
            message: "Erro no envio do arquivo, por favor verifique a sua conexão e tente novamente!",
          })
          return;
        }

        res.status(200).json({
          success: false,
          message: "Imagem enviada com sucesso!",
        })

        setTimeout(() => {
          fs.unlinkSync(filePath);
        }, 5000);

        return;
      }
      ///ENVIO DE VÍDEOS 
      if (videoFileTypes.includes(fileType)) {

        let send = await conn.sock.sendMessage(telefoneFormatado,
          {
            video: { url: filePath },
            caption: parsedCaption ? parsedCaption : "",
            ptv: false,
          }
        );

        if (send.status !== 1) {
          res.status(401).json({
            success: false,
            message: "Erro no envio do arquivo, por favor verifique a sua conexão e tente novamente!",
          })
          return;
        }

        res.status(200).json({
          success: false,
          message: "Vídeo enviado com sucesso!",
        })

        setTimeout(() => {
          fs.unlinkSync(filePath);
        }, 5000);

        return;
      }

      // ENVIO DE ÁUDIOS
      if (audioFileTypes.includes(fileType)) {

        let send = await conn.sock.sendMessage(telefoneFormatado,
          {
            audio: { url: filePath },
            caption: parsedCaption ? parsedCaption : "",
            ptv: false,
            fileName: file.originalname
          }
        );

        if (send.status !== 1) {
          res.status(401).json({
            success: false,
            message: "Erro no envio do arquivo, por favor verifique a sua conexão e tente novamente!",
          })
          return;
        }

        res.status(200).json({
          success: false,
          message: "Áudio enviado com sucesso!",
        })

        setTimeout(() => {
          fs.unlinkSync(filePath);
        }, 5000);

        return;
      }

      // ENVIO DE DOCUMENTO 
      if (documentFileTypes.includes(fileType)) {

        let send = await conn.sock.sendMessage(telefoneFormatado,
          {
            document: { url: filePath },
            caption: parsedCaption ? parsedCaption : "",
            ptv: false,
            fileName: file.originalname,
          }
        );

        if (send.status !== 1) {
          res.status(401).json({
            success: false,
            message: "Erro no envio do arquivo, por favor verifique a sua conexão e tente novamente!",
          })
          return;
        }

        res.status(200).json({
          success: false,
          message: "Documento enviado com sucesso!",
        })

        setTimeout(() => {
          fs.unlinkSync(filePath);
        }, 5000);

        return;
      }

      fs.unlinkSync(filePath);
      res.status(401).json({
        success: false,
        message: "Mensagem ou aruivo não enviado pode ter um formato não autorizado!"
      })

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      res.status(500).json({ success: false, message: "Erro interno no envio do ficheiro.", details: error });
    }
  }
}

export default new messageController();

// 941196