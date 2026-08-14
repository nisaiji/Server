import { CloudWatchLogs } from "@aws-sdk/client-cloudwatch-logs";
import winston from "winston";
import WinstonCloudWatch from "winston-cloudwatch";
import { config } from "../../config/config.js";
import { formatLog } from "../format.js";
import { LogLevel } from "../levels.js";

/** @type {import('winston').transport[]} */
const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: "logs/error.log",
    level: LogLevel.ERROR
  }),
  new winston.transports.File({ filename: "logs/app.log" })
];

if (config.cloudWatchEnabled && config.cloudWatchLogGroupName) {
  /** @type {Record<string, any>} */
  const cwOptions = {
    logGroupName: config.cloudWatchLogGroupName,
    logStreamName: config.cloudWatchLogStreamName,
    jsonMessage: true
  };

  const region = config.cloudWatchAwsRegion || config.awsRegion;

  if (config.cloudWatchAccessKeyId && config.cloudWatchSecretAccessKey) {
    cwOptions.cloudWatchLogs = new CloudWatchLogs({
      region,
      credentials: {
        accessKeyId: config.cloudWatchAccessKeyId,
        secretAccessKey: config.cloudWatchSecretAccessKey
      }
    });
  } else {
    console.warn(
      "[CloudWatch Logger Warning] Dedicated CloudWatch credentials (CLOUDWATCH_AWS_ACCESS_KEY_ID / CLOUDWATCH_AWS_SECRET_ACCESS_KEY) were not found in environment. Falling back to default AWS credentials."
    );
    cwOptions.awsRegion = region;
  }

  transports.push(new WinstonCloudWatch(cwOptions));
}

const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || LogLevel.INFO,
  format: winston.format.json(),
  transports
});

class WinstonLogger {
  error(message, context = {}, error = null) {
    winstonLogger.log(
      formatLog({ level: LogLevel.ERROR, message, context, error })
    );
  }

  warn(message, context = {}) {
    winstonLogger.log(formatLog({ level: LogLevel.WARN, message, context }));
  }

  info(message, context = {}) {
    winstonLogger.log(formatLog({ level: LogLevel.INFO, message, context }));
  }

  debug(message, context = {}) {
    winstonLogger.log(formatLog({ level: LogLevel.DEBUG, message, context }));
  }

  http(message, context = {}) {
    winstonLogger.log(formatLog({ level: LogLevel.HTTP, message, context }));
  }
}

export default new WinstonLogger();
