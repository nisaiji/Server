import { createCustomerSupportQueryController } from "../controllers/customerSupport.controller.js";
import { registerCustomerQueryValidation } from "../middlewares/validation/customerSupport.validation.middleware.js";
import express from "express"

const customerSupportRouter = express.Router();

customerSupportRouter.post("/query", registerCustomerQueryValidation, createCustomerSupportQueryController );

export default customerSupportRouter;