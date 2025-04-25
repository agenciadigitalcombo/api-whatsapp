export interface IMessage {
  id?: number;
  user_id: number;
  message: string;
  status?: "sent" | "pending" | "failed";
  created_at?: string;
}

export interface IUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  created_at?: string;
}

export interface ILog {
  id?: number;
  user_id: number;
  action: string;
  details?: string;
  created_at?: string;
}

export interface ISession {
  id?: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at?: string;
}

export interface IWebhook {
  id?: number;
  user_id: number;
  url: string;
  is_active: boolean;
  created_at?: string;
}


export interface CustomLinkPreview {
  url: string;
  title?: string;
  siteName?: string;
  description?: string;
  mediaType?: string;
  contentType?: string;
  images?: string[];
  videos?: string[];
  favicons?: string[];
  charset?: string;
}
