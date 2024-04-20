import mongoose from "mongoose";
import { config } from "./config.js";

const MONGO_URL = config.dbURL;

export default async function connectDB(){
    try {
        await mongoose.connect(MONGO_URL);
        console.log("DB connected!");

        
    } catch (err) {
       console.log('error in db connection!');
       process.exit(1);
    }
}