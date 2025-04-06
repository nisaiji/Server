import express from "express";
import parentRouter from "./parent.router.js";
import studentRouter from "./student.router.js";

const v2Router = express();

v2Router.use("/parent", parentRouter);
v2Router.use("/student", studentRouter);

export default v2Router;
