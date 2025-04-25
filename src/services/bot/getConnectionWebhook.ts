import makeWASocket, {
  Browsers,
  useMultiFileAuthState,
  ConnectionState,
} from "baileys";

const silentLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
  trace: () => {},
  fatal: () => {},
  child: () => silentLogger,
};

export const GetConnectionWebHook = async (id: string): Promise<{
  sock: any;
  connect: () => Promise<{ connect: boolean; qrcode?: string }>;
}> => {
  const { state, saveCreds } = await useMultiFileAuthState(`./auth/${id}`);

  let sock = makeWASocket({
    auth: state,
    browser: Browsers.appropriate("Desktop"),
    printQRInTerminal: false,
    logger: silentLogger as any, 
  });

  const connect = async (): Promise<{ connect: boolean; qrcode?: string }> => {
    return new Promise((resolve) => {
      let resolved = false;

      sock.ev.on("connection.update", async (update: Partial<ConnectionState>) => {
        const { connection, isOnline } = update;

        if (isOnline) {
          if (!resolved) {
            resolved = true;
            resolve({ connect: true });
          }
        }

        if (connection === "close") {
          if (!resolved) {
            resolved = true;
            resolve({ connect: false });
          }
        }

        if (connection === "open" && !resolved) {
          resolved = true;
          resolve({ connect: true });
        }
      });
    });
  };

  sock.ev.on("creds.update", saveCreds);
  return { sock, connect };
};
