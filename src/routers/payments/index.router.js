import express from "express";

const paymentIndexRouter = express.Router();
paymentIndexRouter.use("/auth", (await import("./auth.router.js")).default);
paymentIndexRouter.use("/session", (await import("./paymentSession.router.js")).default);

export default paymentIndexRouter;
