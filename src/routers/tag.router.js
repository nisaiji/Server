import express from "express";
import { teacherAuthenticate } from "../middlewares/authentication/teacher.authentication.middleware.js";
import { createTagController, deleteTagController, getTagsController, updateTagController } from "../controllers/tag.controller.js";

const tagRouter = express.Router();
tagRouter.post("/", teacherAuthenticate, createTagController);
tagRouter.post("/get-teacher", teacherAuthenticate, getTagsController);
tagRouter.put("/teacher/:tagId", teacherAuthenticate, updateTagController);
tagRouter.delete("/teacher/:tagId", teacherAuthenticate, deleteTagController);
export default tagRouter;
