import mongoose from "mongoose";
import { config } from "./config.js";
import logger from "../logger/index.js";

const MONGO_URL = config.dbURL;

export default async function connectDB() {
  try {
    mongoose.set("debug", true);
    await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 30000 });
    logger.info("Database connected successfully");
  } catch (err) {
    logger.error("Error connecting to database", {}, err);
    process.exit(1);
  }
}
