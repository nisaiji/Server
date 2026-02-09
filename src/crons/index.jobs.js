import { CronJob } from 'cron';
import GuestTeacherStopJob from './jobs/guestTeacherStop.job.js';
import GuestTeacherStartJob from './jobs/guestTeacherStart.job.js';
import changePasswordRequestExpireJob from './jobs/changePasswordRequestExpire.job.js';
import SessionCreateJob from './jobs/sessionCreate.job.js';
import { payFeeFromWalletJob } from './jobs/dailyPayFeeFromWallet.job.js';
import { dailyFeeCalculatorJob } from './jobs/dailyFeeCalculator.job.js';
import { refundJob } from './jobs/dailyRefundProcess.job.js';


// Guest Teacher Start/Stop Job - runs at 2:00 AM every day
const invalidationCronJob = new CronJob('0 0 2 * * *', async () => {
  try {
    await GuestTeacherStopJob();
    await changePasswordRequestExpireJob();
    await GuestTeacherStartJob();
    // await dailyFeeCalculatorJob();
    // await SessionCreateJob();
  } catch (error) {
    console.log(error.message)
  }
})

// Daily Pay Fee From Wallet Job - runs at 12:00 AM (midnight)
const payFeeFromWalletCron = new CronJob('0 0 0 * * *', async () => {
  try {
    console.log('Starting Daily Pay Fee From Wallet Job at:', new Date());
    await payFeeFromWalletJob();
  } catch (error) {
    console.error('Error in payFeeFromWalletCron:', error.message);
  }
});

// Daily Refund Job - runs at 12:00 AM (midnight)
const refundCron = new CronJob('0 0 0 * * *', async () => {
  try {
    console.log('Starting Daily Refund cron at:', new Date());
    await refundJob();
  } catch (error) {
    console.error('Error in refund cron:', error.message);
  }
});

// Daily Fee Calculator Job - runs at 1:00 AM
const dailyFeeCalculatorCron = new CronJob('0 0 1 * * *', async () => {
  try {
    console.log('Starting Daily Fee Calculator Job at:', new Date());
    await dailyFeeCalculatorJob();
  } catch (error) {
    console.error('Error in dailyFeeCalculatorCron:', error.message);
  }
});


export { payFeeFromWalletCron, dailyFeeCalculatorCron, invalidationCronJob, refundCron };

