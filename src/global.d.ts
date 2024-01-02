export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      GUILD_ID: string;
      CHANNEL_ID: string;
      BOT_ID: string;
      ALLOWED_USERS: string;
      DATABASE_PATH: string;
      TORRENT_PATH: string;
      PUBLIC_URL: string;
    }
  }
}
