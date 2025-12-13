import express from "express";
import { paymentAuthController, paymentRefreshTokenController, paymentRevokeRefreshTokenController, paymentTokenController } from "../../controllers/payments/paymentAuth.controller.js";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";

const authRouter = express.Router();

authRouter.get("/:schoolId", paymentAuthController);
authRouter.post("/token", adminAuthenticate, paymentTokenController);
authRouter.post("/refresh-token", adminAuthenticate, paymentRefreshTokenController);
authRouter.post("/revoke-token", adminAuthenticate, paymentRevokeRefreshTokenController);

export default authRouter;