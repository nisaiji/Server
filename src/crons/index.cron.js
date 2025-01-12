import invalidationCronJob from "./invalidate.cron.js";
import { config } from "../config/config.js"


export function cronManager() {
  console.log("cron ", typeof config.enableCron)
  if(config.enableCron === "true"){
    console.log("inside if")
    invalidationCronJob.start();
  }
} 
