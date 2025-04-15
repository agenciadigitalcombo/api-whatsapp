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
app.listen(port, () => { console.log(`http://localhost:${port}`); });
