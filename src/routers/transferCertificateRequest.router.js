import express from "express";

import {
  applyTransferCertificateController,
  getChildrenTCRequestsController,
  approveParentConsentController,
  getAdminTCRequestsController
} from "../controllers/transferCertificateRequest.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { parentAuthenticate } from "../middlewares/authentication/v2/parent.authentication.middleware.js";
import { authorizeTeacherRoles } from "../middlewares/authorization/teacherRoles.authorization.middleware.js";

const transferCertificateRequestRouter = express.Router();

// Admin Routes
transferCertificateRequestRouter.post(
  "/admin/apply",
  adminAuthenticate,
  applyTransferCertificateController
);

// Parent Routes
transferCertificateRequestRouter.get(
  "/parent/children",
  parentAuthenticate,
  getChildrenTCRequestsController
);

transferCertificateRequestRouter.put(
  "/parent/consent/:requestId",
  parentAuthenticate,
  approveParentConsentController
);

// Admin Routes
transferCertificateRequestRouter.get("/admin", adminAuthenticate, getAdminTCRequestsController);

export default transferCertificateRequestRouter;
