import express from "express";

import studentRouter from "./student.router.js";
const v3Router = express.Router();

v3Router.use("/student", studentRouter);

export default v3Router;
