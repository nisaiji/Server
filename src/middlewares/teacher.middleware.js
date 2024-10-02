import { error } from "../utills/responseWrapper.js";
import { StatusCodes } from "http-status-codes";

const IMAGE_SIZE_LIMIT = 1 * 1024 * 1024;

export async function validateImageSizeMiddleware(req, res, next){
 try {
  console.log({IMAGE_SIZE_LIMIT})
  console.log(Buffer.byteLength(req.body.photo, 'utf8'));
  if (Buffer.byteLength(req.body.photo, 'utf8') > IMAGE_SIZE_LIMIT) {
    return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Image size exceeded 1MB."));
  }
  next();
 } catch (err) {
  return res.status(500).send(error(500, err.message));
 }
};