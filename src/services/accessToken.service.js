import Jwt from "jsonwebtoken";
import { config } from "../config/config.js";


const secretKey = config.jwtSecret || "ThisIsASecretKeyForJWTToken";

export default function generateAccessToken(data){
    try {
        const token = Jwt.sign(data, secretKey,{expiresIn:"1y"});
        return token;
    } catch (error) {
        return error;
    }
}