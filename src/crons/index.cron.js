import invalidationCronJob from "./invalidate.cron.js";

export function cronManager() {
  invalidationCronJob.start();
}
