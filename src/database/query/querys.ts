export const createUsersQuery = (): string => {
  return `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user', 'viewer') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
};

export const createSessionsQuery = (): string => {
  return `
    CREATE TABLE IF NOT EXISTS whatsapp_sessions (
      id INT  PRIMARY KEY NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      session_name VARCHAR(100) UNIQUE NOT NULL,
      phone_number VARCHAR(100) NOT NULL,
      status ENUM('conectado', 'desconectado', 'pendente') DEFAULT 'pendente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
};

export const createMessagesQuery = (): string => {
  return `
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(244) NOT NULL,
      direction ENUM('sent', 'received') NOT NULL,
      phone_number VARCHAR(20) NOT NULL,
      message TEXT NOT NULL,
      status ENUM('pending', 'sent', 'failed', 'delivered', 'read') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
};

export const createWebhooksQuery = (): string => {
  return `
    CREATE TABLE IF NOT EXISTS webhooks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      url TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
};

export const createLogsQuery = (): string => {
  return `
    CREATE TABLE IF NOT EXISTS logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      session_id VARCHAR(255),
      action VARCHAR(255) NOT NULL,
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
};


// USERS
export const insertUserQuery = (): string => {
  return `
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?);
  `;
};

// MESSAGES
export const insertMessageQuery = (): string => {
  return `
    INSERT INTO messages (user_id, message, status)
    VALUES (?, ?, ?);
  `;
};

// LOGS
export const insertLogQuery = (): string => {
  return `
    INSERT INTO logs (action, description)
    VALUES (?, ?);
  `;
};

// SESSIONS
export const insertSessionQuery = (): string => {
  return `
    INSERT INTO sessions (user_id, session_id, active)
    VALUES (?, ?, ?);
  `;
};

// WEBHOOKS
export const insertWebhookQuery = (): string => {
  return `
    INSERT INTO webhooks (user_id, url, type)
    VALUES (?, ?, ?);
  `;
};

export const selectByEmail = (): string => {
  return `SELECT * FROM users WHERE email = ?`
}

export const selectWhatsappSession = (): string => {
  return `SELECT * FROM whatsapp_sessions WHERE session_name = ?`;
}


export const selectWhatsappSessionPhoneNumber = (): string => {
  return `SELECT * FROM whatsapp_sessions WHERE phone_number = ? ORDER BY id DESC`;
}

export const insertSession = (): string => {
  return `
    INSERT INTO whatsapp_sessions (user_id, session_name, phone_number, status)
    VALUES (?, ?, ?, ?)
  `;
}
