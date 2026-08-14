import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
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
  const cloudWatchClient = new CloudWatchLogsClient({
    region: config.awsRegion
  });

  transports.push(
    new WinstonCloudWatch({
      cloudWatchLogs: /** @type {any} */ (cloudWatchClient),
      logGroupName: config.cloudWatchLogGroupName,
      logStreamName: config.cloudWatchLogStreamName,
      jsonMessage: true
    })
  );
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
