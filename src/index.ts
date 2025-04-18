
import { AppEnv } from "./config/env";
import express from "express";
import migrations from "./database/migrations/migrations";
import Routes from "./router/Routes";
const app = express();
const port = AppEnv.port;
migrations.createTable().catch(console.error);
app.use(Routes);
app.listen(port, () => { console.log(`http://localhost:${port}`); });

