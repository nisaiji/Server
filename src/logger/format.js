import { getRequestId } from "../utils/asyncContext.js";

export function formatLog({ level, message, context = {}, error = null }) {
  const requestId = getRequestId();
  const log = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(requestId && { requestId }),
    ...context
  };

  if (error) {
    log.error = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return log;
}
