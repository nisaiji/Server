import crypto from "node:crypto";
import { asyncLocalStorage } from "../utils/asyncContext.js";

export const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  asyncLocalStorage.run({ requestId }, () => {
    next();
  });
};
