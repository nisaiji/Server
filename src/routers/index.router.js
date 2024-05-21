import express from "express";
import adminRouter from "./admin.router.js";
import parentRouter from "./parent.router.js";
import studentRouter from "./student.router.js";
import teacherRouter from "./teacher.router.js";
import sectionRouter from "./section.router.js";
import attendanceRouter from "./attendance.router.js";
import holidayEventRouter from "./holidayEvent.router.js";
import classRouter from "./class.router.js";

const router = express();

router.use("/admin", adminRouter);
router.use("/parent", parentRouter);
router.use("/teacher", teacherRouter);
router.use("/student", studentRouter);
router.use("/class", classRouter);
router.use("/section", sectionRouter);
router.use("/attendance", attendanceRouter);
router.use("/holiday-event", holidayEventRouter);

export default router;