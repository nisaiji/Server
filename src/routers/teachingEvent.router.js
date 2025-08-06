import express from "express";
import { createTeachingEventController } from "../controllers/teachingEvent.controller.js";

const teachingEvent = express.Router();
teachingEvent.post("/", createTeachingEventController);
export default teachingEvent;
