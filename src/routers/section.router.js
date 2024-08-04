import express from "express";
import {deleteSectionController,getAllSectionsController,getClassSectionsController,getSectionController,registerSectionController, replaceTeacherController,} from "../controllers/section.controller.js";
import { adminAuthentication } from "../middlewares/authentication/admin.authentication.middleware.js";
import { deleteSectionAuthorization } from "../middlewares/authorization/deleteSection.authorization.middleware.js";
import { registerSectionValidation } from "../middlewares/validation/section.validation.middleware.js";

const sectionRouter = express.Router();

sectionRouter.post("/register",adminAuthentication,registerSectionValidation,registerSectionController);
sectionRouter.post("/replace-teacher",adminAuthentication,replaceTeacherController);
sectionRouter.get("/all", adminAuthentication, getAllSectionsController);
sectionRouter.get("/:classId", adminAuthentication, getClassSectionsController);
sectionRouter.get("/section-info/:sectionId",adminAuthentication,getSectionController);
sectionRouter.delete("/:sectionId",adminAuthentication,deleteSectionAuthorization,deleteSectionController);
export default sectionRouter;