import express from "express";
import adminRouter from "./admin.router.js";
import parentRouter from "./parent.router.js";
import studentRouter from "./student.router.js";
import teacherRouter from "./teacher.router.js";
import sectionRouter from "./section.router.js";

const router = express();

router.use("/admin", adminRouter);
router.use("/parent", parentRouter);
router.use("/teacher", teacherRouter);
router.use("/student", studentRouter);
router.use("/section", sectionRouter);

export default router;
