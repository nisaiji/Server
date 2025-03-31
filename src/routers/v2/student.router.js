import express from "express";
import { adminAuthenticate } from "../../middlewares/authentication/admin.authentication.middleware.js";
import { searchStudentsController } from "../../controllers/v2/student.controller.js";

const studentRouter = express.Router();

studentRouter.get('/admin', adminAuthenticate, searchStudentsController)
export default studentRouter;
