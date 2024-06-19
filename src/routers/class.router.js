import express from 'express';
import { deleteClassController, getClassListController, registerClassController } from '../controllers/class.controller.js';
import { adminAuthentication } from '../middlewares/authentication/admin.authentication.middleware.js';
import { classRegisterValidation } from '../middlewares/validation/class.validation.middleware.js';

const classRouter = express.Router();

classRouter.post("/register",adminAuthentication,classRegisterValidation, registerClassController);
classRouter.delete("/:classId",adminAuthentication, deleteClassController);
classRouter.get("/class-list",adminAuthentication,getClassListController);

export default classRouter; 