import crypto from "node:crypto";
import { asyncLocalStorage } from "../utils/asyncContext.js";

export const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  const originalJson = res.json;
  res.json = function (body) {
    res.responseBody = body;
    return originalJson.call(this, body);
  };

  const originalSend = res.send;
  res.send = function (body) {
    if (!res.responseBody && body) {
      try {
        res.responseBody = typeof body === "string" ? JSON.parse(body) : body;
      } catch {
        res.responseBody = body;
      }
    }
    return originalSend.call(this, body);
  };

  asyncLocalStorage.run({ requestId }, () => {
    next();
  });
};
