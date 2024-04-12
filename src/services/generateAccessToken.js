import Jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const secretKey = process.env.ACCESS_SECRET_KEY || "ThisIsASecretKeyForJWTToken";

export default function generateAccessToken(data){
    try {
        const token = Jwt.sign(data, secretKey,{expiresIn:"1y"});
        return token;
    } catch (error) {
        return error;
    }
}