import sessionsModel from "../database/models/sessions.model";
import usersModel from "../database/models/users.model";
import webhookModel from "../database/models/webhook.model";
import { GetConnectionWebHook } from "../services/bot/getConnectionWebhook";
import { logger } from "./logger";

export const reportWebhookError = async (): Promise<void> => {
  try {
    const allSessions = await sessionsModel.getAllSessions() as { success: boolean, data: any[] };
    logger.info("Sistema de controle de sessão rodando a cada 30 minutos");

    if (!allSessions.success) return;

    for (const session of allSessions.data) {
      try {
        const conn = await GetConnectionWebHook(session.session_name);
        const connect = await conn.connect();

        // Só age se estiver desconectado e o status não for "desconectado"
        if (connect.connect === false) {

          if (session.status !== "desconectado") {

            const webHookData = await webhookModel.read(session.user_id) as { success: boolean, data: any };

            if (!webHookData.data) continue;

            const { url } = webHookData.data;
            var userData : any = await usersModel.getById(session.user_id);
            var { data } = userData;
            


            const sendData = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                type: "REPORT_ERROR_DISCONNECT",
                message: "Seu Bot está desconectado, é provável que não seja possível fazer o envio de mensagens. Por favor, volte a conectar!",
                hora: new Date().toLocaleString('pt-BR'),
                email_user:data?.email,
                telefone:session.phone_number?.split(":")[0],
              }),
            });

            if (!sendData.ok) {
              logger.info(`Erro ao enviar mensagem ao cliente para sessão ${session.session_name}`);
              continue;
            }

            await sessionsModel.updateSession({ user_id: session.user_id, status: "desconectado" });

            console.log("whatsapDesconnected: ", session.user_id);
          }
        }

      } catch (sessionError) {
        logger.info(`Erro ao processar sessão ${session.session_name}: ${sessionError}`);
      }
    }

  } catch (error) {
    logger.info("Erro ao enviar a mensagem ao cliente: " + error);
  }
};
