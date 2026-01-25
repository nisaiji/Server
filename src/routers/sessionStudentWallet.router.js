import express from "express";
import { createSessionStudentWallet } from "../controllers/sessionStudentWallet.controller.js";

const sessionStudentWalletRouter = express.Router();

sessionStudentWalletRouter.post('/', createSessionStudentWallet);

export default sessionStudentWalletRouter; 