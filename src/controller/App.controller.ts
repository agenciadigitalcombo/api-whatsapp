import { Request, Response } from "express";
import { loginSchema, userSchema } from "../middleware/Validations";
import bcrypt from "bcrypt";
import { IUser } from "../types/types";
import usersModel from "../database/models/users.model";
import { GenereteId, GenereteTokenNoExpiry } from "../utils/genereteId";


class AppController {
  async register(req: Request, res: Response) {
    const validation = userSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Erro de validação",
        details: validation.error.flatten(),
      });
    }

    try {
      const salt = await bcrypt.genSalt(10); 
      const { name, email, password } = req.body;
      const password_hash = await bcrypt.hash(password, salt); 
      const newData: IUser = { name, email, password: password_hash };
      const createUser = await usersModel.create(newData);
      return res.status(201).json(createUser);
    } catch (error) {
      return res.status(500).json({ success: false, message: error }); 
    }
  }

  async login(req:Request, res:Response){
    const validateLogin = loginSchema.safeParse(req.body);

    if (!validateLogin.success) {
      return res.status(400).json({
        success: false,
        message: "Erro de validação",
        details: validateLogin.error.flatten(),
      });
    }

    const { email, password } = req.body;
    const getData : any = await usersModel.getByEmail(email); 

    if (getData.success !== true) {
      res.status(200).json({
        success:false, 
        message:"Email ou senha incorrectos!",
      });
    }

    const { data } = getData;
   
    const compare = bcrypt.compareSync(password, data.password);
    
    if (!compare) {
      res.status(200).json({
        success:false, 
        message:"Email ou senha incorrectos!",
      });
    }

    const user_id = GenereteId();
    const payload = { userId: user_id, nome:data.name, email:data.email }
    const token = await GenereteTokenNoExpiry(payload);

    res.status(200).json({
      success:true,
      message:"Login realizado  com sucesso!",
      token:token,
    })
  }
}

export default new AppController();