import {invalidationCronJob} from "./index.jobs.js";
import { config } from "../config/config.js";


export function cronManager() {
  if(config.enableCron === "true"){
    invalidationCronJob.start();
  }
} 
