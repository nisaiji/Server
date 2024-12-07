import { CronJob } from 'cron';
import invalidateChangePasswordRequest from './jobs/invalidateChangePasswordRequest.job.js';
import invalidateGuestTeacherJob from './jobs/invalidateGuestTeacher.job.js';


const invalidationCronJob = new CronJob('0/10 * * * * *',  async() => {
  try {
   await invalidateGuestTeacherJob();
   await invalidateChangePasswordRequest();
} catch (error) {
  console.log(error.message)  
}
})

export default invalidationCronJob;
