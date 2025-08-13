import { CronJob } from 'cron';
import GuestTeacherStopJob from './jobs/guestTeacherStop.job.js';
import GuestTeacherStartJob from './jobs/guestTeacherStart.job.js';
import changePasswordRequestExpireJob from './jobs/changePasswordRequestExpire.job.js';
import SessionCreateJob from './jobs/sessionCreate.job.js';


const invalidationCronJob = new CronJob('0/10 * * * * *',  async() => {
  try {
   await GuestTeacherStopJob();
   await changePasswordRequestExpireJob();
   await GuestTeacherStartJob();
   await SessionCreateJob();
} catch (error) {
  console.log(error.message)
}
})

export default invalidationCronJob;
