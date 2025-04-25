// sock.ev.on("messages.upsert", ({ messages }: { messages: WAMessage[] }) => {
//   for (const message of messages) {
//     const isGroup = message.key.remoteJid?.endsWith("@g.us");
//     const isStatus = message.key.remoteJid === "status@broadcast";
//     if (isGroup || isStatus) return;
//     // @ts-ignore
//     const formattedMessage: FormattedMessage | undefined = getMessage(message);
//     if (formattedMessage) {
//       MessageHandler(sock, formattedMessage);
//     }
//   }
// });