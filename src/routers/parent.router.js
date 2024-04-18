import express from "express";
import {
  loginParentController,
  registerParentController
} from "../controllers/parent.controller.js";

const parentRouter = express.Router();

// todo: define routers related to parent

parentRouter.post("/register", registerParentController);
parentRouter.post("/login", loginParentController);
export default parentRouter;
