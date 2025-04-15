import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppEnv } from "../config/env";
export const TokenValidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { authorization } = req.headers;

  if (!authorization) {
     res.status(400).json({
      success: false,
      message: "Erro de autenticação!",
      details: {
        headers: "Não foi definido um cabeçalho de autenticação válido!",
        token: "Problemas com a validação do token de usuário!"
      }
    });
    return;
  }

  const token  = authorization.replace("Bearer ", "");
  if (!token) {
    res.status(400).json({
      success: false,
      message: "Erro de autenticação!",
      details: {
        headers: "Não foi definido um cabeçalho de autenticação válido!",
        token: "Problemas com a validação do token de usuário!"
      }
    });
    return;
  }
  const secretKey: any = AppEnv.secretKey;
  try {
    const decode = jwt.verify(token, secretKey, {complete:false});

    if (!decode) {
      res.status(401).json({
        success:false,
        message:"Token invalido"
      })
      return;
    }

  } catch (error) {
    res.status(401).json({
      success:false,
      message:"Token invalido" +  error
    })
    return;
  }

  next();
};