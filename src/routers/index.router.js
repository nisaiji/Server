import express from "express";
import schoolRouter from "./admin.router.js";
import parentRouter from "./parent.router.js";
import studentRouter from "./student.router.js";
import teacherRouter from "./teacher.router.js";

const router = express();

router.use("/school", schoolRouter);
router.use("/parent", parentRouter);
router.use("/teacher", teacherRouter);
router.use("/student",studentRouter);

export default router;
