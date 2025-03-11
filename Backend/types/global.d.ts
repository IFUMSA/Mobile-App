namespace NodeJS {
  interface ProcessEnv {
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    PORT: number;
    MONGODB_URL: string;
    GOOGLE_CLIENT_ID: string;
    SECRET_HASH: string;
    EMAIL_HOST: string;
    EMAIL_PORT: string;
    EMAIL_FROM: string;
    EMAIL_SECURE: string;
    EMAIL_USER: string;
    EMAIL_PASSWORD: string;
    FRONTEND_URL: string;
    APP_URL: string;
    SESSION_SECRET: string;
  }
}
