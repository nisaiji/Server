import {dailyFeeCalculatorCron, invalidationCronJob, payFeeFromWalletCron} from "./index.jobs.js";
import { config } from "../config/config.js"


export function cronManager() {
  if(config.enableCron === "true"){
    invalidationCronJob.start();
    payFeeFromWalletCron.start();
    dailyFeeCalculatorCron.start();
  }
} 
