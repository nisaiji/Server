import {config as conf} from 'dotenv';
conf();

const _config = {
    host: process.env.HOST,
    port: process.env.PORT,
    dbURL:process.env.MONGO_URL,
    accessTokenSecretKey:process.env.ACCESS_TOKEN_SECRET_KEY,
    refreshTokenSecretKey:process.env.REFRESH_TOKEN_SECRET_KEY

}

export const config =   Object.freeze(_config);    