import winston from 'winston';
import { formatLog } from '../format.js';
import { LogLevel } from '../levels.js';

const winstonLogger = winston.createLogger({
  level: LogLevel.INFO,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: LogLevel.ERROR }),
    new winston.transports.File({ filename: 'logs/app.log' })
  ],
});

class WinstonLogger {
  error(message, context = {}, error = null) {
    winstonLogger.log(formatLog({ level: LogLevel.ERROR, message, context, error }));
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
