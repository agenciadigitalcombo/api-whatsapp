Para rodar o projeto em sua máquina / produção é bem simples.

Instale os pacotes:
```
npm i
```
Rode em desenvolvimento:
```
npm run dev
```
Ou rode em produção:
```
npm start
```

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


     const dataUser : any = await usersModel.getByEmail(getId_user?.email);
      const { data: { id } } = dataUser;

