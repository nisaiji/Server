import express from "express";
import { createSessionController } from "../controllers/session.controller.js";

const sessionRouter = express.Router();

sessionRouter.post("/", createSessionController);

export default sessionRouter; 