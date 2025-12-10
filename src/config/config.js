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
    sendGridEmail: process.env.SEND_GRID_EMAIL,
    msg91Url: process.env.MSG91_TOKEN_VALIDATE_URL,
    msg91AuthKey: process.env.MSG91_AUTH_KEY,
    zohoAccountUrl: process.env.ZOHO_ACCOUNT_URL,
    zohoPayUrl: process.env.ZOHO_PAY_ROOT_URL,
    zohoPaySandBoxUrl: process.env.ZOHO_PAY_SANDBOX_ROOT_URL,
    zohoRedirectUrl: process.env.ZOHO_REDIRECT_URL,
    zohoSandboxRedirectUrl: process.env.ZOHO_REDIRECT_URL,
    currency: 'INR',
    zohoWebhookAuthSecret: process.env.ZOHO_WEBHOOK_AUTH_SECRET,
    isSandbox: process.env.ZOHO_IS_SANDBOX === 'true'
}

export const config =   Object.freeze(_config);
