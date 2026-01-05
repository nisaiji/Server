import express from "express";

const paymentIndexRouter = express.Router();
paymentIndexRouter.use("/auth", (await import("./auth.router.js")).default);
paymentIndexRouter.use("/payment-link", (await import("./paymentLink.router.js")).default);
paymentIndexRouter.use("/payment-session", (await import("./paymentSession.router.js")).default);
paymentIndexRouter.use("/webhook", (await import("./webhook.router.js")).default);
paymentIndexRouter.use("/dashboard", (await import("./paymentAdminDashboard.router.js")).default);
paymentIndexRouter.use("/transactions", (await import("./paymentTransaction.router.js")).default);

export default paymentIndexRouter;
