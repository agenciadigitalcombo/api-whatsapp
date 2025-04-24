
import { AppEnv } from "./config/env";
import express from "express";
import migrations from "./database/migrations/migrations";
import Routes from "./router/Routes";
import { reportWebhookError } from "./utils/reporteError";
import cron from "node-cron";
const app = express();
const port = AppEnv.port;
migrations.createTable().catch(console.error);
app.use(Routes);

cron.schedule("*/30 * * * *", async () => {
  await reportWebhookError();
});

app.listen(port, () => { console.log(`http://localhost:${port}`); });

