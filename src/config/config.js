import dotenv from "dotenv";

// check if NODE_ENV exists, else throw an error

export const SYS_ERR = {
  NODE_ENV_INVALID: 100,
  BOOTSTRAP_ERROR: 101,
  MONGO_CONN_FAILED: 103
};

if (typeof process.env.NODE_ENV === "undefined")
  process.exit(SYS_ERR.NODE_ENV_INVALID);
// configure the environment
dotenv.config({ path: `bin/.env.${process.env.NODE_ENV}` });

const _config = {
  environment: process.env.NODE_ENV,
  host: process.env.HOST,
  port: process.env.PORT,
  dbURL: process.env.MONGO_URL,

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
  zohoWebhookUrl: process.env.ZOHO_WEBHOOK_URL,
  isSandbox: process.env.ZOHO_IS_SANDBOX === "true",
  bypassToken: process.env.BYPASS_TOKEN,

  awsRegion: process.env.AWS_REGION || "ap-south-1",

  cloudWatchEnabled: process.env.CLOUDWATCH_ENABLED === "true",
  cloudWatchLogGroupName: process.env.CLOUDWATCH_LOG_GROUP_NAME,
  cloudWatchLogStreamName:
    process.env.CLOUDWATCH_LOG_STREAM_NAME ||
    `server-${process.env.NODE_ENV || "dev"}`,
  cloudWatchAccessKeyId: process.env.AWS_CLOUDWATCH_ACCESS_KEY,
  cloudWatchSecretAccessKey: process.env.AWS_CLOUDWATCH_SECRET_ACCESS_KEY,
  cloudWatchAwsRegion: process.env.CLOUDWATCH_AWS_REGION
};

export const config = Object.freeze(_config);
