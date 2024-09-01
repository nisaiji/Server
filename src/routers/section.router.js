import express from "express";
import {deleteSectionController,getSectionController,registerSectionController, replaceTeacherController,} from "../controllers/section.controller.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";
import { deleteSectionAuthorization } from "../middlewares/authorization/deleteSection.authorization.middleware.js";
import { registerSectionValidation } from "../middlewares/validation/section.validation.middleware.js";

const sectionRouter = express.Router();

sectionRouter.post("/",adminAuthenticate,registerSectionValidation,registerSectionController);
sectionRouter.post("/replace-teacher",adminAuthenticate,replaceTeacherController);
sectionRouter.get("/:sectionId", adminAuthenticate, getSectionController);
sectionRouter.delete("/:sectionId", adminAuthenticate,deleteSectionAuthorization,deleteSectionController);

export default sectionRouter; 