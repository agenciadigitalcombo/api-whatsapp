import { WASocket } from "baileys";
import { FormattedMessage } from "../utils/message";
const saudacoes = [
  'oi', 'ola', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e ai', 
  'salve', 'tudo bem?', 'como vai?', 'alo', 'fala', 'beleza?', 
  'oi, tudo certo?', 'e ai, beleza?', 'como e que ta?', 'como e que voce esta?', 
  'e ai, mano?', 'oi, tudo bom?', 'bom demais', 'Oi, moc', 'oi, moca', 
  'cheguei', 'olha ae', 'fala ai', 'tudo joia?', 'trank, trank?', 'na paz?', 
  'so na tranquilidade', 'e ai, cara', 'e ai, galera', 'tudo em cima?', 
  'oi meu chapa', 'oi meu consagrado', 'oi meu rei', 'oi meu povo', 'como ta ae?', 
  'suave', 'e ai, irmao?', 'salve, salve', 'beleza, mano?', 'ta tranquilo?', 
  'ta suave?', 'e ai, chefe?', 'salve galera', 'oi, quem fala e...', 'oi meu amor', 
  'oi, sumido(a)', 'oi, querido(a)', 'oi, camarada', 'ola, meu amigo(a)', 
  'opa, tudo bem?', 'oie', 'saudacoes', 'como e que esta a vida?', 'tamo junto', 
  'oi, meu povo', 'como vai voce?', 'e ai, tio', 'oi, querido', 'oi, minha gente'
];


const MessageHandler = async (bot: WASocket, message: FormattedMessage) => {
  if (message.content === 'Oi!') {
    await bot.sendMessage(message.key.remoteJid!, { text: 'Olá! Aqui quem fala é o bot!' });
  } else if (message.content && saudacoes.includes(message.content.toLocaleLowerCase())) {
    await bot.sendMessage(message.key.remoteJid!, { text: 'Olá! Como posso ajudar você?' });
  }
};

export default MessageHandler;
 