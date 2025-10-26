import express from "express";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { createTagController, deleteTagController, getTagsController, getTagsWithInfoController, updateTagController } from "../controllers/tag.controller.js";
import { parentAuthenticate } from "../middlewares/authentication/parent.authentication.middleware.js";
import { adminAuthenticate } from "../middlewares/authentication/admin.authentication.middleware.js";

const tagRouter = express.Router();
tagRouter.post("/", teacherAuthenticate, createTagController);
tagRouter.post("/get-teacher", teacherAuthenticate, getTagsController);
tagRouter.post("/get-parent", parentAuthenticate, getTagsWithInfoController);
tagRouter.post("/get-admin", adminAuthenticate, getTagsWithInfoController);
tagRouter.post("/get-class-teacher", teacherAuthenticate, getTagsWithInfoController);
tagRouter.put("/teacher/:tagId", teacherAuthenticate, updateTagController);
tagRouter.delete("/teacher/:tagId", teacherAuthenticate, deleteTagController);
export default tagRouter;
