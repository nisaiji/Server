import express from 'express';
import { dailyFeeCalculatorJobController, payFeeFromWalletJobController } from '../controllers/cron.controller.js';

const cronRouter = express.Router();

cronRouter.get('/fee-calculate', dailyFeeCalculatorJobController);
cronRouter.get('/pay-fee', payFeeFromWalletJobController)

export default cronRouter;
