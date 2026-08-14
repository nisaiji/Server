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
import { setupAxiosInterceptors } from "./src/config/axios.interceptor.js";
import logger from "./src/logger/index.js";
import { requestIdMiddleware } from "./src/middlewares/requestId.middleware.js";

setupAxiosInterceptors();
// import "./src/config/redis.config.js";
const PORT = config.port || 4000;

const app = express();
app.use(requestIdMiddleware);
app.use(express.json({ 
  limit: "5mb",
  verify: (req, res, buf) => {
    req['rawBody'] = buf.toString();
  }
 }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(
  morgan(
    (tokens, req, res) => {
      return JSON.stringify({
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: Number(tokens.status(req, res)),
        responseTimeMs: Number(tokens["response-time"](req, res)),
        contentLength: tokens.res(req, res, "content-length") || "0"
      });
    },
    {
      stream: {
        write: (message) => {
          try {
            const httpDetails = JSON.parse(message);
            logger.http(
              `HTTP ${httpDetails.method} ${httpDetails.url}`,
              httpDetails
            );
          } catch {
            logger.http(message.trim());
          }
        }
      }
    }
  )
);

app.use(
  cors({
    origin: "*"
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/", router);
app.use((err, req, res, next) => {
  logger.error("Unhandled Request Error", { path: req.path, method: req.method }, err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  logger.info(`Server is running at ${PORT}`, { port: PORT });
  connectDB();
  cronManager();
});

