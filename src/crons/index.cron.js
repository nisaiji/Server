import invalidateGuestTeacherCron from "./deleteGuestTeacher.cron.js";

export function cronManager() {
  invalidateGuestTeacherCron.start();
}
