import express from "express";
import {
  cordinatorRegister,
  loginController
} from "../controllers/cordinator.controller.js";

const cordinatorRouter = express.Router();

cordinatorRouter.post("/register", cordinatorRegister);
cordinatorRouter.post("/login", loginController);

export default cordinatorRouter;
