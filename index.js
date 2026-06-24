import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { config } from "./src/config/config.js";
import connectDB from "./src/config/db.config.js";
import { cronManager } from "./src/crons/index.cron.js";
import router from "./src/routers/index.router.js";
import swaggerDocs from "./swagger.js";
// import "./src/config/redis.config.js";
const PORT = config.port || 4000;

const app = express();
app.use(express.json({ 
  limit: "5mb",
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
 }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(morgan("common"));
app.use(
  cors({
    Credential: true,
    origin: "*"
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/", router);
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
  connectDB();
  cronManager();
});
