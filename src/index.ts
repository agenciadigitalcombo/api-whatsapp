import express, { urlencoded } from "express";
import type { Request, Response } from "express";
import { initWASocket } from "./services/bot/bot";
import { logger } from "./utils/logger";
import multer from "multer";
import fs from 'fs';
import path from "path";
import { imageFileTypes } from "./utils/filestype";
import { AppEnv } from "./config/env";
import cors from "cors";
import { FilterNumber } from "./filter/uri/number";
import { GenereteId, GenereteTokenNoExpiry } from "./utils/genereteId";
import QR from "qrcode";
import migrations from "./database/migrations/migrations";
import Routes from "./router/Routes";
const upload = multer();
const app = express();
const port = AppEnv.port;

migrations.createTable().catch(console.error);

app.use(Routes)
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST'],
  origin: "*"
}))

const sessions = new Map<string, Awaited<ReturnType<typeof initWASocket>>>();

app.get("/whatsapi/start", FilterNumber, async (req: Request, res: Response) : Promise<any> => {
  try {
    const id = GenereteId();
    if (!sessions.has(id)) {
      const conn = await initWASocket(id);
      const connect = await conn.connect();

      if (!connect.connect) {
        const token = await GenereteTokenNoExpiry({id:id});
        if (connect.qrcode) {
          const qrCodeImage = QR.toDataURL(connect.qrcode);
        }
        return res.status(200).json(connect);
      }
      
      sessions.set(id, conn);
      return res.status(200).json(
        {
          success:true, 
          message:"Bot conectado com sucesso!", 
          botId:id,
          details:"Sua sessão foi iniciada, você ira usar o seu id: `` "+ id +" `` para para se conectar sempre que necessário."
        }
        );
    }

    return res.status(200).json({success:true, message:`Usuário com id ${id} Já tem uma sessão iniciada!`});
  } catch (error) {
    logger.error(error);
    res.status(500).json({success:false, message:"Erro ao conectar ao bot."});
  }
});

app.post("/bot/message", upload.single("file"), async (req: Request, res: Response) => {
  const file = req.file;
  const userId = req.body.userId;
  
  if (userId) {
    const { telefone, message } = req.body;
    const conn = await initWASocket(userId);
    const connect = await conn.connect();

    if (connect.connect !== false) {

      if (file) {
        const fileBuffer = file.buffer;  
        const fileName = file.originalname; 
        const fileType = file.mimetype;  

        const imageData = imageFileTypes.includes(fileType);
        const filePath = path.resolve(__dirname, 'media', file.originalname);
        fs.writeFileSync(filePath, fileBuffer);
      
        
        if (imageData === true) {
          if (fs.existsSync(filePath)) {
           const sendFilImage = await conn.sock.sendMessage(
            telefone+"@s.whatsapp.net",
            {
              image: {
                url: filePath
              },
              caption: message ? message : "",
              ptv: false
            }
          );
            if (sendFilImage.status === 1) {
              res.status(200).json({success:true, message:"Mensagem enviado com sucesso!", id:userId});
              return;
            }
          return;
          } 
          res.status(200).json({success:false, message:"Não conseguimos localizar o arquivo para o envio!"});
        }
      }
    
      const enviarMessage = await conn.sock.sendMessage(telefone + "@s.whatsapp.net", { text: message });
      if (enviarMessage.status === 1) {
        res.status(200).json({success:true, message:"Mensagem enviado com sucesso!", id:userId});
        return;
      }
      res.status(200).json({success:false, message:"Mensagem não enviada!", id:userId})
      return;
    }
    res.status(400).json({success:false, message:"Usuário não encontrado ou desconectado!", id:userId}); 
  } 
    res.status(400).json({success:false, message:"Usuário não encontrado!", id:userId});
});


app.listen(port, () => { console.log(`http://localhost:${port}`); });
