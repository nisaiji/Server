import mongoose from "mongoose";
import dotenv from 'dotenv';
import { error } from "../utills/responseWrapper.js";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

export default async function connectDB(){
    try {
        await mongoose.connect(MONGO_URL);
        console.log("DB connected!");

        
    } catch (err) {
       console.log('error in db connection!');
       process.exit(1);
    }
}