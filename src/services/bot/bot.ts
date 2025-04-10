import makeWASocket, {
  Browsers,
  useMultiFileAuthState,
  DisconnectReason,
  WAMessage,
  ConnectionState,
} from "baileys";
import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";
import { logger } from "../../utils/logger";
import { FormattedMessage, getMessage } from "../../utils/message";
import MessageHandler from "../../handlers/message";

export const initWASocket = async (id: number): Promise<{
  sock: any;
  connect: () => Promise<{ connect: boolean; qrcode?: string }>;
  sendMessages: (numero: string | number, mensagem: string) => Promise<void>;
}> => {
  const { state, saveCreds } = await useMultiFileAuthState(`./auth/_user${id}`);

  const sock = makeWASocket({
    auth: state,
    browser: Browsers.appropriate("Desktop"),
    printQRInTerminal: false,
  });

  const connect = async (): Promise<{ connect: boolean; qrcode?: string }> => {
    return new Promise((resolve) => {
      sock.ev.on("connection.update", (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;
        logger.info(`Socket Connection Update: ${connection || ""} ${lastDisconnect || ""}`);

        switch (connection) {
          case "close":
            logger.error("Conexão fechada");
            const shouldReconnect =
              (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
              initWASocket(id).catch((err) => logger.error("Erro ao reconectar:", err));
            }
            resolve({ connect: false });
            break;

          case "open":
            logger.info("Bot conectado com sucesso.");
            logger.info("Sessão criada para:", sock.user?.id);
            resolve({ connect: true });
            break;
        }

        if (qr) {
          qrcode.generate(qr, { small: true });
          resolve({ connect: false, qrcode: qr });
        }
      });
    });
  };

  const sendMessages = async (numero: string | number, mensagem: string): Promise<void> => {
    try {
      const jid = `${numero}@s.whatsapp.net`;
      await sock.sendMessage(jid, { text: mensagem });
    } catch (error) {
      logger.error(`Erro ao enviar mensagem para ${numero}:`, error);
    }
  };

  sock.ev.on("messages.upsert", ({ messages }: { messages: WAMessage[] }) => {
    for (const message of messages) {
      const isGroup = message.key.remoteJid?.endsWith("@g.us");
      const isStatus = message.key.remoteJid === "status@broadcast";
      if (isGroup || isStatus) return;
      // @ts-ignore
      const formattedMessage: FormattedMessage | undefined = getMessage(message);
      if (formattedMessage) {
        MessageHandler(sock, formattedMessage);
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return { sock, connect, sendMessages };
};
