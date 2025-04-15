import jwt from "jsonwebtoken";
import { AppEnv } from "../config/env";
function GenereteId() {
  var id = `whats_api_${Math.floor(Math.random() * 10000)}`;
  return id;
}
export { GenereteId }

function GenereteTokenNoExpiry(data: any) {
  const skey = AppEnv.secretKey;
  if (!skey) {
    throw new Error("Chave secreta não esta definida.");
  }
  return new Promise((resolve, reject) => {
    jwt.sign(data, skey, {}, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}
export { GenereteTokenNoExpiry }