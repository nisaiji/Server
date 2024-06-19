import express from "express";
import {deleteSectionController,getAllSectionsController,getClassSectionsController,registerSectionController,} from "../controllers/section.controller.js";
import { adminAuthentication } from "../middlewares/authentication/admin.authentication.middleware.js";
import { deleteSectionAuthorization } from "../middlewares/authorization/deleteSection.authorization.middleware.js";
import { registerSectionValidation } from "../middlewares/validation/section.validation.middleware.js";
// import { adminAuthentication } from "../middlewares/admin.authentication.middleware.js";
// import { registerSectionValidation } from "../middlewares/section.validation.middleware.js";

const sectionRouter = express.Router();

sectionRouter.post("/register",adminAuthentication,registerSectionValidation,registerSectionController);
sectionRouter.get("/all", adminAuthentication, getAllSectionsController);
sectionRouter.get("/:classId", adminAuthentication, getClassSectionsController);
sectionRouter.delete("/:sectionId",adminAuthentication,deleteSectionAuthorization,deleteSectionController);

export default sectionRouter;