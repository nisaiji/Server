import {config as conf} from 'dotenv';
conf();

const _config = {
    host: process.env.HOST,
    port: process.env.PORT,
    dbURL:process.env.MONGO_URL,
    accessTokenSecretKey: process.env.ACCESS_TOKEN_SECRET_KEY,
    refreshTokenSecretKey: process.env.REFRESH_TOKEN_SECRET_KEY,
    enableCron: process.env.ENABLE_CRON,
    twilioAccountSID: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
    otpExpirationInMinutes: 2,
    sendGridApiKey: process.env.SEND_GRID_API_KEY,
    sendGridEmail: process.env.SEND_GRID_EMAIL
}

export const config =   Object.freeze(_config);    