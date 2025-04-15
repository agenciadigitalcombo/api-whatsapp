import { z } from "zod";

export const userSchema = z.object({
  name: z.string({ required_error: "Nome é obrigatório" }).min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string({ required_error: "Email é obrigatório" }).email("Email inválido"),
  password: z.string({ required_error: "Senha é obrigatória" }).min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string({ required_error: "Email é obrigatório" }).email("Email inválido"),
  password: z.string({ required_error: "Senha é obrigatória" }).min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const messageSchema = z.object({
  user_id: z.number().int().min(1),
  message: z.string().min(1, "Mensagem não pode estar vazia"),
  status: z.enum(["sent", "pending", "failed"]).optional(),
});


export const logSchema = z.object({
  user_id: z.number().int().min(1),
  action: z.string().min(1),
  details: z.string().optional(),
});

export const sessionSchema = z.object({
  user_id: z.number().int().min(1),
  token: z.string().min(10),
  expires_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data inválida",
  }),
});

export const webhookSchema = z.object({
  user_id: z.number().int().min(1),
  url: z.string().url("URL inválida"),
  event: z.string().min(1),
});


