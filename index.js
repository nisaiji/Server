import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { setupAxiosInterceptors } from "./src/config/axios.interceptor.js";
import { config } from "./src/config/config.js";
import connectDB from "./src/config/db.config.js";
import { cronManager } from "./src/crons/index.cron.js";
import logger from "./src/logger/index.js";
import { requestIdMiddleware } from "./src/middlewares/requestId.middleware.js";
import router from "./src/routers/index.router.js";
import swaggerDocs from "./swagger.js";
import helmet from "helmet";

setupAxiosInterceptors();
// import "./src/config/redis.config.js";
const PORT = Number(config.port) || 4000;

const app = express();
app.use(helmet);
app.use(requestIdMiddleware);
app.use(cors({ origin: "*" }));
app.use(express.json({ 
  limit: "5mb",
  verify: (req, res, buf) => {
    req['rawBody'] = buf.toString();
  }
 }));
app.use(express.static('public'));
app.use(cookieParser());
const sanitizePayload = (payload, seen = new WeakSet()) => {
  if (!payload || typeof payload !== "object") return payload;
  if (seen.has(payload)) return "[Circular]";

  if (payload instanceof Date || payload instanceof RegExp || Buffer.isBuffer(payload)) {
    return payload;
  }

  seen.add(payload);

  const clone = Array.isArray(payload) ? [] : {};
  const sensitiveKeys = [
    "password",
    "token",
    "accessToken",
    "refreshToken",
    "secret",
    "authorization"
  ];

  for (const key of Object.keys(payload)) {
    const value = payload[key];
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
      clone[key] = "***REDACTED***";
    } else if (typeof value === "object" && value !== null) {
      clone[key] = sanitizePayload(value, seen);
    } else {
      clone[key] = value;
    }
  }

  seen.delete(payload);
  return clone;
};

app.use(
  morgan(
    (tokens, req, res) => {
      const isDebug =
        (process.env.LOG_LEVEL || "debug").toLowerCase() === "debug";

      const payload = {
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: Number(tokens.status(req, res)),
        responseTimeMs: Number(tokens["response-time"](req, res)),
        contentLength: tokens.res(req, res, "content-length") || "0",
        ...(isDebug && req.body && Object.keys(req.body).length > 0 && {
          requestBody: sanitizePayload(req.body)
        }),
        ...(isDebug && res.responseBody && {
          responseBody: sanitizePayload(res.responseBody)
        })
      };

      return JSON.stringify(payload);
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


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/", router);
app.use((err, req, res, next) => {
  logger.error("Unhandled Request Error", { path: req.path, method: req.method }, err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});


app.get("/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date(),
    dbConnected,
  });
});

app.listen(PORT,() => {
  logger.info(`Server is running at ${PORT}`, { port: PORT });
  connectDB();
  cronManager();
});

