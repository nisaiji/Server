import { CronJob } from 'cron';
import GuestTeacherStopJob from './jobs/guestTeacherStop.job.js';
import GuestTeacherStartJob from './jobs/guestTeacherStart.job.js';
import changePasswordRequestExpireJob from './jobs/changePasswordRequestExpire.job.js';
import SessionCreateJob from './jobs/sessionCreate.job.js';


// Guest Teacher Start/Stop Job - runs at 2:00 AM every day
const invalidationCronJob = new CronJob('0 0 2 * * *', async () => {
  try {
    await GuestTeacherStopJob();
    await changePasswordRequestExpireJob();
    await GuestTeacherStartJob();
    // await dailyFeeCalculatorJob();
    // await SessionCreateJob();
  } catch (error) {
    console.log(error.message);
  }
});

export { invalidationCronJob };

