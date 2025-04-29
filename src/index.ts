
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
import { getUrlInfo  } from "baileys";

// cron.schedule("*/1 * * * *", async () => {
//   await reportWebhookError();
// });


setInterval( async () => {
  await reportWebhookError();
}, 5000);

app.listen(port, () => { console.log(`http://localhost:${port}`); });


