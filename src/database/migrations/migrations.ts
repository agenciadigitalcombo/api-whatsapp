import { conn } from "../config/connect";
import { 
  createMessagesQuery, 
  createUsersQuery, 
  createLogsQuery, 
  createSessionsQuery, 
  createWebhooksQuery 
} from "../query/querys";

class UsersMigration {
  async createTable(): Promise<void> {
    const queries = [
      createUsersQuery(),
      createMessagesQuery(),
      createLogsQuery(),
      createSessionsQuery(),
      createWebhooksQuery()
    ];

    const queryPromises = queries.map((sql) => {
      return new Promise<void>((resolve, reject) => {
        conn.query(sql, (err) => {
          if (err) {
            console.error('Erro ao criar tabela:', err);
            return reject(err);
          }
          resolve();
        });
      });
    });

    await Promise.all(queryPromises);
    console.log('Todas as tabelas foram criadas com sucesso!');
  }
}

export default new UsersMigration();
