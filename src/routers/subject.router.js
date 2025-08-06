import express from "express";
import {createSubjectController} from "../controllers/subject.controller.js";

const subjectRouter = express.Router();

subjectRouter.post("/", createSubjectController);

export default subjectRouter;
