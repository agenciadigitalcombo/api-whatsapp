import express, { urlencoded } from "express";
import AppController from "../controller/App.controller";
import { AppEnv } from "../config/env";
import cors from "cors";
import BotController from "../controller/Bot.controller";
import { TokenValidate } from "../middleware/TokenValidate";
import multer from "multer";
import messageController from "../controller/message.controller";
import WebhookController from "../controller/Webhook.controller";

const Routes = express.Router();
const upload = multer();
Routes.use(express.json());
Routes.use(urlencoded({ extended: true }));
Routes.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  origin: "*"
}));
const URI = AppEnv.baseUri;
//Connections and Login----
Routes.post(`${URI}/register`, (req, res, next) => { AppController.register(req, res).catch(next); });
Routes.post(`${URI}/login`, (req, res, next) => { AppController.login(req, res).catch(next); });
Routes.get(`${URI}/connect`, TokenValidate, BotController.connect);
Routes.get(`${URI}/session/status`, TokenValidate, BotController.getConnection);
//ServicesApp-----
Routes.post(`${URI}/messages/send`, TokenValidate, messageController.send);
Routes.post(`${URI}/messages/files/send`, upload.single("file"), TokenValidate, messageController.sendFiles);
Routes.get(`${URI}`, (req, res)=>{ res.send("olla seja bem vindo");});
//Webhook---
Routes.post(`${URI}/settings/webhook/register`, TokenValidate, WebhookController.index);
Routes.put(`${URI}/settings/webhook/update`, TokenValidate, WebhookController.update);
Routes.delete(`${URI}/settings/webhook/delete`, TokenValidate, WebhookController.delete);

export default Routes;