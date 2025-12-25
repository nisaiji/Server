export function formatLog({level, message, context={}, error=null}){
  const log = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context
  }

  if(error){
    log.error = {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  }

  return log;
}
