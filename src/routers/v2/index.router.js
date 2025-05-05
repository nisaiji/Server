import express from "express";
import parentRouter from "./parent.router.js";
import studentRouter from "./student.router.js";
import attendanceRouter from "./attendance.router.js";
import adminRouter from "./admin.router.js";

const v2Router = express();

v2Router.use("/admin", adminRouter)
v2Router.use("/parent", parentRouter);
v2Router.use("/student", studentRouter);
v2Router.use("/attendance", attendanceRouter);

export default v2Router;
