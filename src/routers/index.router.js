import express from 'express';
import schoolRouter from './school.router.js';
import parentRouter from './parent.router.js';
import cordinatorRouter from './cordinator.router.js';

const router =express();

router.use("/school",schoolRouter);
router.use("/parent",parentRouter);
router.use("/cordinator",cordinatorRouter);

export default router;