import express from "express";
import {
  applyTransferCertificateController,
  getChildrenTCRequestsController,
  approveParentConsentController,
  getAdminTCRequestsController,
} from "../controllers/transferCertificateRequest.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { parentAuthenticate } from "../middlewares/authentication/parent.authentication.middleware.js";
import { authorizeTeacherRoles } from "../middlewares/authorization/teacherRoles.authorization.middleware.js";

const transferCertificateRequestRouter = express.Router();

// Teacher Routes
transferCertificateRequestRouter.post(
  "/teacher/apply",
  teacherAuthenticate,
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
transferCertificateRequestRouter.get(
  "/admin",
  adminAuthenticate,
  getAdminTCRequestsController
);

export default transferCertificateRequestRouter;