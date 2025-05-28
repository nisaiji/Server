import express from "express";
import adminRouter from "./admin.router.js";
import parentRouter from "./parent.router.js";
import studentRouter from "./student.router.js";
import teacherRouter from "./teacher.router.js";
import sectionRouter from "./section.router.js";
import attendanceRouter from "./attendance.router.js";
import holidayRouter from "./holiday.router.js";
import classRouter from "./class.router.js";
import adminDashboardRouter from "./dashBoardAdmin.router.js";
import parentDashboardRouter from "./dashBoardParent.router.js";
import teacherDashboardRouter from "./dashBoardTeacher.router.js";
import changePasswordRouter from "./changePassword.router.js";
import superAdminRouter from "./superAdmin.router.js";
import leaveRouter from "./leave.router.js";
import guestTeacherRouter from './guestTeacher.router.js'
import customerSupportRouter from "./customerSupport.router.js";
import workDayRouter from "./workDay.router.js";
import v2Router from "./v2/index.router.js";
import announcementRouter from "./announcement.router.js";

const router = express();

router.use("/v2", v2Router);
router.use("/admin", adminRouter);
router.use("/parent", parentRouter);
router.use("/teacher", teacherRouter);
router.use("/student", studentRouter);
router.use("/class", classRouter);
router.use("/leave", leaveRouter);
router.use("/section", sectionRouter);
router.use("/change-password", changePasswordRouter);
router.use("/attendance", attendanceRouter);
router.use("/holiday-event", holidayRouter);
router.use("/admin-dashboard",adminDashboardRouter);
router.use("/parent-dashboard",parentDashboardRouter);
router.use("/teacher-dashboard",teacherDashboardRouter);
router.use('/super-admin', superAdminRouter);
router.use('/guest-teacher', guestTeacherRouter);
router.use('/customer-support', customerSupportRouter);
router.use('/workdays', workDayRouter);
router.use('/announcement', announcementRouter);

export default router;
