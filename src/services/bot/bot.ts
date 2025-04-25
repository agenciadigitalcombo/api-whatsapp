import makeWASocket, {
  Browsers,
  useMultiFileAuthState,
  ConnectionState,
} from "baileys";
import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";
import { logger } from "../../utils/logger";

export const initWASocket = async (id: string): Promise<{
  sock: any;
  connect: () => Promise<{ connect: boolean; qrcode?: string }>;
}> => {
  const { state, saveCreds } = await useMultiFileAuthState(`./auth/${id}`);

  let sock = makeWASocket({
    auth: state,
    browser: Browsers.appropriate("Desktop"),
    printQRInTerminal: false,
  });

  const connect = async (): Promise<{ connect: boolean; qrcode?: string }> => {
    return new Promise((resolve) => {
      let resolved = false;

      sock.ev.on("connection.update", async (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;
    
        if (qr && !resolved) {
          qrcode.generate(qr, { small: true });
          resolved = true;
          resolve({ connect: false, qrcode: qr });
          return;
        }

        if (connection === "close") {
          const reasonCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          logger.error(`Conexão fechada. Motivo: ${reasonCode}`);

          if (!resolved) {
            resolved = true;
            resolve({ connect: false });
          }
        }

        if (connection === "open" && !resolved) {
          logger.info("Bot conectado com sucesso.");
          logger.info("Sessão criada para:", sock.user?.id);
          resolved = true;
          resolve({ connect: true });
        }
      });
    });
  };
  sock.ev.on("creds.update", saveCreds);
  return { sock, connect };
};
