import {config as conf} from 'dotenv';
conf();

const _config = {
    port: process.env.PORT,
    dbURL:process.env.MONGO_URL,
    jwtSecret:process.env.JWT_SECRET,
}

export const config =   Object.freeze(_config);    